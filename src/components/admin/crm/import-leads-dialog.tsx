'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { crmLeadsApi, type ImportRow, type TeamUser } from '@/services/crm-leads';
import { telephonyService, type DialerCampaign } from '@/services/telephony';
import { parseCsv } from '@/lib/csv';
import { cn } from '@/lib/utils';
import { errorMessage } from './format';

type FieldKey = keyof ImportRow;

const IMPORT_FIELDS: { key: FieldKey; label: string; required?: boolean; aliases: string[] }[] = [
    { key: 'name', label: 'Nome', required: true, aliases: ['nome', 'name'] },
    { key: 'company', label: 'Empresa', aliases: ['empresa', 'company'] },
    { key: 'email', label: 'E-mail', aliases: ['email', 'e-mail'] },
    { key: 'phone', label: 'Telefone', aliases: ['telefone', 'phone', 'celular'] },
    { key: 'phone2', label: 'Telefone 2', aliases: ['telefone2', 'phone2', 'celular2'] },
    { key: 'city', label: 'Cidade', aliases: ['cidade', 'city'] },
    { key: 'segment', label: 'Segmento', aliases: ['segmento', 'segment'] },
    { key: 'notes', label: 'Observações', aliases: ['observacoes', 'observacao', 'notes', 'obs'] },
];

const CHUNK_SIZE = 1000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const normalizeHeader = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

/** Sugere a coluna do arquivo para cada campo, pelo nome do cabecalho. */
function autoMap(headers: string[]): Record<FieldKey, string> {
    const normalized = headers.map(normalizeHeader);
    const result = {} as Record<FieldKey, string>;
    IMPORT_FIELDS.forEach((field) => {
        const aliases = [field.key.toLowerCase(), ...field.aliases].map(normalizeHeader);
        const index = normalized.findIndex((h) => aliases.includes(h));
        result[field.key] = index >= 0 ? String(index) : '';
    });
    return result;
}

interface ImportLeadsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isSupervisor: boolean;
    owners: TeamUser[];
    onImported: () => void;
}

interface ImportResult {
    created: number;
    campaignAssigned: number;
    skipped: number;
    errors: { row: number; reason: string }[];
}

export function ImportLeadsDialog({ open, onOpenChange, isSupervisor, owners, onImported }: ImportLeadsDialogProps) {
    const [fileName, setFileName] = useState('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [dataRows, setDataRows] = useState<string[][]>([]);
    const [mapping, setMapping] = useState<Record<FieldKey, string>>(() => autoMap([]));
    const [ownerId, setOwnerId] = useState('none');
    const [campaignId, setCampaignId] = useState('none');
    const [campaigns, setCampaigns] = useState<DialerCampaign[]>([]);
    const [reading, setReading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [readError, setReadError] = useState('');
    const [result, setResult] = useState<ImportResult | null>(null);

    useEffect(() => {
        if (!open) return;
        let active = true;
        telephonyService.listCampaigns(true)
            .then((items) => { if (active) setCampaigns(items); })
            .catch(() => { if (active) setCampaigns([]); });
        return () => { active = false; };
    }, [open]);

    const reset = () => {
        setFileName('');
        setHeaders([]);
        setDataRows([]);
        setMapping(autoMap([]));
        setOwnerId('none');
        setCampaignId('none');
        setReading(false);
        setImporting(false);
        setProgress(0);
        setReadError('');
        setResult(null);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next && importing) return;
        if (!next) reset();
        onOpenChange(next);
    };

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        setReadError('');
        setResult(null);
        if (file.size > MAX_FILE_BYTES) {
            setReadError('O arquivo passa de 5 MB. Divida em partes menores.');
            return;
        }
        setReading(true);
        try {
            const rows = parseCsv(await file.text());
            if (rows.length < 2) {
                setReadError('O arquivo precisa ter um cabeçalho e pelo menos uma linha de dados.');
                setHeaders([]);
                setDataRows([]);
                return;
            }
            const [head, ...body] = rows;
            setFileName(file.name);
            setHeaders(head);
            setDataRows(body);
            setMapping(autoMap(head));
        } catch {
            setReadError('Não foi possível ler o arquivo. Verifique se é um CSV válido.');
        } finally {
            setReading(false);
        }
    };

    const buildImportRows = (rows: string[][]): ImportRow[] =>
        rows.map((cells) => {
            const row: Partial<Record<FieldKey, string>> = {};
            IMPORT_FIELDS.forEach((field) => {
                const idx = mapping[field.key];
                if (idx === '') return;
                const value = (cells[Number(idx)] ?? '').trim();
                if (value) row[field.key] = value;
            });
            return row as ImportRow;
        });

    const mappedRows = buildImportRows(dataRows);
    const withoutName = mappedRows.filter((r) => !r.name).length;
    const nameMapped = mapping.name !== '';
    const previewFields = IMPORT_FIELDS.filter((f) => mapping[f.key] !== '');

    const handleImport = async () => {
        if (!nameMapped || mappedRows.length === 0) return;
        setImporting(true);
        setProgress(0);
        setResult(null);
        const total: ImportResult = { created: 0, campaignAssigned: 0, skipped: 0, errors: [] };
        try {
            for (let start = 0; start < mappedRows.length; start += CHUNK_SIZE) {
                const chunk = mappedRows.slice(start, start + CHUNK_SIZE);
                const res = await crmLeadsApi.import({
                    rows: chunk,
                    source: 'IMPORT',
                    ...(isSupervisor && ownerId !== 'none' ? { ownerId: Number(ownerId) } : {}),
                    ...(campaignId !== 'none' ? { campaignId: Number(campaignId) } : {}),
                });
                total.created += res.created;
                total.campaignAssigned += res.campaignAssigned;
                total.skipped += res.skipped;
                total.errors.push(...res.errors.map((e) => ({ row: e.row + start, reason: e.reason })));
                setProgress(Math.min(100, Math.round(((start + chunk.length) / mappedRows.length) * 100)));
            }
            setResult(total);
            if (total.created > 0) {
                toast.success(`${total.created} lead(s) importado(s).`);
                onImported();
            }
        } catch (err) {
            setResult(total.created || total.skipped ? total : null);
            toast.error(errorMessage(err, 'Falha na importação. Tente novamente.'));
        } finally {
            setImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Importar leads (CSV)</DialogTitle>
                    <DialogDescription>
                        Use cabeçalhos como nome, empresa, e-mail, telefone, cidade. O separador pode ser ponto e vírgula ou vírgula.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="csv-file" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Arquivo CSV
                        </Label>
                        <label
                            htmlFor="csv-file"
                            className={cn(
                                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-colors hover:border-[#0076FF] hover:bg-blue-50/40',
                                importing && 'pointer-events-none opacity-60',
                            )}
                        >
                            {reading ? <Loader2 className="h-6 w-6 animate-spin text-[#0076FF]" /> : <FileUp className="h-6 w-6 text-[#0076FF]" />}
                            <span className="text-sm font-medium text-slate-700">{fileName || 'Clique para escolher um arquivo .csv'}</span>
                            {fileName && <span className="text-xs text-slate-500">Clique de novo para trocar o arquivo</span>}
                        </label>
                        <input
                            id="csv-file"
                            type="file"
                            accept=".csv,text/csv"
                            className="sr-only"
                            disabled={importing}
                            onChange={(e) => {
                                handleFile(e.target.files?.[0]);
                                e.target.value = '';
                            }}
                        />
                        {readError && (
                            <Alert variant="destructive" role="alert">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{readError}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {headers.length > 0 && (
                        <>
                            <section className="space-y-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">Mapeamento de colunas</h3>
                                    <p className="text-xs text-slate-500">
                                        {dataRows.length} linha(s) encontradas. Mapeie as colunas e, se desejar, vincule a importação a uma campanha.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {IMPORT_FIELDS.map((field) => (
                                        <div key={field.key} className="space-y-1.5">
                                            <Label htmlFor={`map-${field.key}`} className="text-xs font-medium text-slate-600">
                                                {field.label}
                                                {field.required && <span className="text-red-500"> *</span>}
                                            </Label>
                                            <Select
                                                value={mapping[field.key] === '' ? 'none' : mapping[field.key]}
                                                onValueChange={(v) => setMapping((m) => ({ ...m, [field.key]: v === 'none' ? '' : v }))}
                                                disabled={importing}
                                            >
                                                <SelectTrigger id={`map-${field.key}`} className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Não importar</SelectItem>
                                                    {headers.map((h, i) => (
                                                        <SelectItem key={`${h}-${i}`} value={String(i)}>
                                                            {h || `Coluna ${i + 1}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                                {!nameMapped && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>O campo Nome precisa estar mapeado para importar.</AlertDescription>
                                    </Alert>
                                )}
                            </section>

                            <section className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    Prévia <span className="font-normal text-slate-500">(primeiras 10 linhas)</span>
                                </h3>
                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {previewFields.map((f) => (
                                                    <TableHead key={f.key} className="whitespace-nowrap text-xs">
                                                        {f.label}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mappedRows.slice(0, 10).map((row, i) => (
                                                <TableRow key={i}>
                                                    {previewFields.map((f) => (
                                                        <TableCell key={f.key} className={cn('max-w-[180px] truncate text-sm', !row[f.key] && f.key === 'name' && 'text-red-500')}>
                                                            {row[f.key] || (f.key === 'name' ? 'sem nome' : '—')}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {withoutName > 0 && (
                                    <p className="text-xs text-amber-600">{withoutName} linha(s) sem nome serão ignoradas.</p>
                                )}
                            </section>

                            {isSupervisor && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="import-owner" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Responsável pelos leads
                                    </Label>
                                    <Select value={ownerId} onValueChange={setOwnerId} disabled={importing}>
                                        <SelectTrigger id="import-owner" className="w-full sm:w-80">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Sem responsável</SelectItem>
                                            {owners.map((o) => (
                                                <SelectItem key={o.id} value={String(o.id)}>
                                                    {o.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="import-campaign" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Campanha de destino (opcional)
                                </Label>
                                <Select value={campaignId} onValueChange={setCampaignId} disabled={importing}>
                                    <SelectTrigger id="import-campaign" className="w-full sm:w-96">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Importar somente para o CRM</SelectItem>
                                        {campaigns.map((campaign) => (
                                            <SelectItem key={campaign.id} value={String(campaign.id)}>
                                                {campaign.name} · {campaign.product}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {campaignId !== 'none' && (
                                    <p className="text-xs text-slate-500">Contatos já cadastrados serão reaproveitados e vinculados à campanha sem duplicar o lead.</p>
                                )}
                            </div>

                            {importing && (
                                <div className="space-y-2">
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full bg-[#0076FF] transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-xs text-slate-500">Importando... {progress}%</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="border-transparent bg-emerald-100 text-emerald-800">
                                            <CheckCircle2 className="h-3 w-3" /> {result.created} criado(s)
                                        </Badge>
                                        {campaignId !== 'none' && <Badge variant="secondary">{result.campaignAssigned} vinculado(s) à campanha</Badge>}
                                        <Badge variant="secondary">{result.skipped} ignorado(s)</Badge>
                                        <Badge variant="outline">{result.errors.length} erro(s)</Badge>
                                    </div>
                                    {result.errors.length > 0 && (
                                        <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600">
                                            {result.errors.map((e, i) => (
                                                <li key={`${e.row}-${i}`}>
                                                    Linha {e.row}: {e.reason}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={importing}>
                                    {result ? 'Fechar' : 'Cancelar'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleImport}
                                    disabled={importing || !nameMapped || mappedRows.length === 0}
                                    className="bg-[#0076FF] text-white hover:bg-[#0060D0]"
                                >
                                    {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Importar {mappedRows.length} linha(s)
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
