'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Upload,
    Loader2,
    FileText,
    User,
    Package,
    AlertCircle,
    CheckCircle2,
    X,
} from 'lucide-react';
import { clientsService } from '@/services/crud';
import { apiRequest } from '@/services/api';
import { authService } from '@/services/auth';

export default function NovoContratoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [clients, setClients] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
            return;
        }

        loadClients();
    }, [router]);

    const loadClients = async () => {
        try {
            setLoadingData(true);
            const data = await clientsService.getAll();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
            setError('Erro ao carregar clientes');
        } finally {
            setLoadingData(false);
        }
    };

    const handleClientChange = async (clientId: string) => {
        setSelectedClientId(clientId);
        setSelectedSubscriptionId('');
        setSubscriptions([]);

        if (!clientId) return;

        try {
            const client = await clientsService.getById(Number(clientId));
            setSubscriptions(client.subscriptions || []);
        } catch (error) {
            console.error('Error loading subscriptions:', error);
            setError('Erro ao carregar assinaturas');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (file.type !== 'application/pdf') {
            setError('Apenas arquivos PDF são permitidos');
            return;
        }

        // Validar tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('O arquivo deve ter no máximo 10MB');
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!selectedClientId || !selectedSubscriptionId || !selectedFile) {
                setError('Preencha todos os campos obrigatórios');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('subscriptionId', selectedSubscriptionId);

            await apiRequest('/contract-files/upload', {
                method: 'POST',
                body: formData,
            });

            setSuccess(true);

            // Redirecionar após 1.5s
            setTimeout(() => {
                router.push('/admin/contratos');
            }, 1500);
        } catch (error: any) {
            console.error('Error uploading contract:', error);
            setError(error.message || 'Erro ao enviar contrato');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(cents / 100);
    };

    const getBillingTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            fixed: 'Fixo',
            per_user: 'Por Usuário',
            per_quantity: 'Por Quantidade',
            one_time: 'Pagamento Único',
            hybrid: 'Híbrido',
        };
        return labels[type] || type;
    };

    if (loadingData) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100/50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-[#0076FF]" />
                    <p className="text-[#64748B] font-medium">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100/50 min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-white border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm mt-1"
                        onClick={() => router.push('/admin/contratos')}
                    >
                        <ArrowLeft className="h-5 w-5 text-[#64748B]" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A]">Novo Contrato</h1>
                        <p className="text-[#64748B] text-lg mt-1">
                            Anexe um contrato à assinatura de um cliente
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-emerald-900">Contrato enviado com sucesso!</p>
                            <p className="text-sm text-emerald-700">Redirecionando...</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-red-900 font-medium flex-1">{error}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setError(null)}
                            className="text-red-600 hover:bg-red-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cliente */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <User className="h-5 w-5 text-[#0076FF]" />
                                Selecione o Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="client" className="text-sm font-semibold text-[#1A1A1A]">
                                    Cliente <span className="text-red-500">*</span>
                                </Label>
                                <Select value={selectedClientId} onValueChange={handleClientChange}>
                                    <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20">
                                        <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={String(client.id)}>
                                                {client.name} ({client.type === 'pf' ? 'PF' : 'PJ'})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assinatura */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <Package className="h-5 w-5 text-[#0076FF]" />
                                Selecione a Assinatura
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="subscription" className="text-sm font-semibold text-[#1A1A1A]">
                                    Assinatura / Produto <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedSubscriptionId}
                                    onValueChange={setSelectedSubscriptionId}
                                    disabled={!selectedClientId || subscriptions.length === 0}
                                >
                                    <SelectTrigger className="h-12 border-2 border-slate-200 rounded-xl focus:border-[#0076FF] focus:ring-2 focus:ring-[#0076FF]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <SelectValue placeholder="Selecione uma assinatura" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subscriptions.map((sub) => (
                                            <SelectItem key={sub.id} value={String(sub.id)}>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{sub.productName}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {getBillingTypeLabel(sub.billingType)} - {formatCurrency(sub.monthlyFeeCents)}/mês - {sub.status}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedClientId && subscriptions.length === 0 && (
                                    <p className="text-sm text-orange-600 flex items-center gap-1.5">
                                        <AlertCircle className="h-4 w-4" />
                                        Este cliente não possui assinaturas cadastradas
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload de Arquivo */}
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                            <CardTitle className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#0076FF]" />
                                Arquivo do Contrato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <Label htmlFor="file" className="text-sm font-semibold text-[#1A1A1A]">
                                    Arquivo PDF <span className="text-red-500">*</span>
                                </Label>

                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#0076FF] hover:bg-blue-50/50 transition-all">
                                    <input
                                        id="file"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="file"
                                        className="cursor-pointer flex flex-col items-center gap-3"
                                    >
                                        <div className="p-3 bg-blue-50 rounded-full">
                                            <Upload className="h-8 w-8 text-[#0076FF]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#1A1A1A] mb-1">
                                                Clique para selecionar o arquivo
                                            </p>
                                            <p className="text-sm text-[#64748B]">
                                                Apenas arquivos PDF até 10MB
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {selectedFile && (
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-[#0076FF]" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-[#1A1A1A]">{selectedFile.name}</p>
                                            <p className="text-sm text-[#64748B]">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-red-600 hover:bg-red-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 px-6 rounded-xl border-2 border-slate-200 hover:bg-slate-50 font-semibold"
                            onClick={() => router.push('/admin/contratos')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedClientId || !selectedSubscriptionId || !selectedFile}
                            className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 font-semibold min-w-[180px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Enviar Contrato
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
