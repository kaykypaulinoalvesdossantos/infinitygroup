'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import {
  FACT_FIELDS,
  formatFactValue,
  temperatureLabel,
  toLeadInfo,
} from '@/components/sales-copilot/ui/copilot-format';
import {
  LEVEL_NAMES,
  LEVEL,
  buildBrief,
  buildScript,
  formatMoney,
  formatNumber,
  getCalc,
  normalizeDiagnosis,
  qualityClass,
  type DiagnosisData,
  type Script,
  type ScriptOverrides,
} from '@/components/sales-copilot/engine';
import { Button } from '@/components/ui/button';
import { LeadPdfButton } from '@/components/admin/crm/LeadPdfButton';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, formatDateTime, getErrorMessage } from '@/components/atendimento/helpers';
import { crmLeadsApi, LEAD_SOURCES, type CrmLeadDetail } from '@/services/crm-leads';
import { salesCopilotApi, type DiagnosisResponse } from '@/services/sales-copilot';

const ACTIVITY_LABEL: Record<CrmLeadDetail['activities'][number]['type'], string> = {
  CALL: 'Ligação',
  NOTE: 'Nota',
  STATUS: 'Status',
  APPOINTMENT: 'Agenda',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  TASK: 'Tarefa',
};

const PRINT_CSS =
  '@media print { body * { visibility: hidden } #print-root, #print-root * { visibility: visible } #print-root { position: absolute; inset: 0; overflow: visible } .no-print { display: none !important } @page { size: A4; margin: 14mm } }';

interface FichaData {
  lead: CrmLeadDetail;
  diagnosis: DiagnosisResponse | null;
  state: DiagnosisData | null;
  script: Script;
}

async function loadFicha(id: number): Promise<FichaData> {
  const [lead, diagnosis, scriptResponse] = await Promise.all([
    crmLeadsApi.get(id),
    salesCopilotApi.getDiagnosis(id).catch(() => null),
    salesCopilotApi.getScript<ScriptOverrides>().catch(() => ({ data: null, updatedAt: null })),
  ]);
  return {
    lead,
    diagnosis,
    state: diagnosis ? normalizeDiagnosis(diagnosis.data) : null,
    script: buildScript(scriptResponse.data),
  };
}

export default function FichaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const leadId = Number(params.id);
  const validId = Number.isInteger(leadId) && leadId > 0;
  const [data, setData] = useState<FichaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(validId);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    setLoading(true);
    setError(null);
    loadFicha(leadId)
      .then((result) => {
        if (!active) return;
        setData(result);
        setGeneratedAt(new Date());
      })
      .catch((err: unknown) => {
        if (active) setError(getErrorMessage(err, 'Não foi possível carregar a ficha do lead.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [leadId, validId, reloadToken]);

  const toolbar = (
    <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/95 px-6 py-3 backdrop-blur">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push('/admin/crm/leads');
        }}
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Voltar
      </Button>
      <div className="flex flex-wrap gap-2">
        {data && <LeadPdfButton key={leadId} leadId={leadId} />}
        <Button type="button" size="sm" onClick={() => window.print()} disabled={!data}>
          <Printer aria-hidden className="h-4 w-4" />
          Imprimir diagnóstico
        </Button>
      </div>
    </div>
  );

  if (!validId) {
    return (
      <div className="p-6">
        <ErrorState message="Lead inválido." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6" aria-busy="true">
        <p role="status" className="text-sm text-muted-foreground">
          Carregando ficha…
        </p>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <ErrorState
          message={error ?? 'Não foi possível carregar a ficha do lead.'}
          onRetry={() => setReloadToken((token) => token + 1)}
        />
      </div>
    );
  }

  const { lead, state, script, diagnosis } = data;
  const calc = state ? getCalc(state.facts) : null;
  const briefing = state ? buildBrief(state, toLeadInfo(lead), script) : null;
  const sourceLabel = LEAD_SOURCES.find((item) => item.id === lead.source)?.label ?? lead.source;
  const activities = [...lead.activities]
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 15);
  const bottlenecks = state
    ? Object.entries(state.bottlenecks).sort((a, b) => LEVEL[b[1].level] - LEVEL[a[1].level])
    : [];
  const classification = state ? qualityClass(state) : null;
  const temperature = (lead as CrmLeadDetail & { temperature?: string | null }).temperature;

  return (
    <div id="print-root" className="fixed inset-0 z-[100] overflow-auto bg-card">
      <style>{PRINT_CSS}</style>
      {toolbar}

      <main className="mx-auto max-w-[760px] space-y-6 px-6 py-8 text-foreground">
        <header className="space-y-1 border-b border-input pb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Ficha do lead</p>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">{lead.company || 'Empresa não informada'}</p>
          {generatedAt && <p className="text-xs text-muted-foreground">Gerada em {formatDateTime(generatedAt.toISOString())}</p>}
        </header>

        <Section title="Dados do lead">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Field label="Responsável" value={lead.owner?.name} />
            <Field label="Etapa" value={lead.funnelStage?.name ?? lead.status} />
            <Field label="Temperatura" value={temperatureLabel(temperature)} />
            <Field label="Origem" value={sourceLabel} />
            <Field label="Segmento" value={lead.segment} />
            <Field label="Cidade" value={lead.city} />
            <Field label="E-mail" value={lead.email} />
            <Field label="Telefone" value={lead.phone} />
            <Field label="Telefone 2" value={lead.phone2} />
            <Field label="Valor" value={lead.value != null ? formatMoney(lead.value) : null} />
            <Field label="Próxima ação" value={lead.nextActionAt ? formatDateTime(lead.nextActionAt) : null} />
            <Field label="Última ligação" value={lead.lastCall ? formatDateTime(lead.lastCall.createdAt) : null} />
          </dl>
          {lead.notes && (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Observações</p>
              <p className="whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </Section>

        <Section title="Diagnóstico">
          {!state ? (
            <p className="text-sm text-muted-foreground">Diagnóstico indisponível.</p>
          ) : (
            <div className="space-y-5 text-sm">
              <p className="text-xs text-muted-foreground">
                Status: {state.status}
                {diagnosis?.updatedAt && ` · Atualizado em ${formatDateTime(diagnosis.updatedAt)}`}
                {diagnosis?.updatedBy && ` por ${diagnosis.updatedBy.name}`}
              </p>

              <div className="space-y-2">
                <p className="font-semibold">Gargalos</p>
                {bottlenecks.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum gargalo identificado.</p>
                ) : (
                  <ul className="space-y-2">
                    {bottlenecks.map(([area, entry]) => (
                      <li key={area}>
                        <span className="font-medium">{area}</span>
                        <span className="text-muted-foreground"> · {LEVEL_NAMES[entry.level]}</span>
                        {entry.evidence && <span className="block text-foreground">{entry.evidence}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-semibold">
                  Qualificação{classification ? `: ${classification.label}` : ''}
                </p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <Field label="Prioridade" value={state.quality.priority} />
                  <Field label="Autoridade" value={state.quality.authority} />
                  <Field label="Prazo" value={state.quality.timing} />
                  <Field label="Orçamento" value={state.quality.budget} />
                  <Field label="Impacto" value={state.quality.impact} />
                  <Field label="Resultado desejado" value={state.quality.desiredOutcome} />
                  <Field label="Próximo passo autorizado" value={state.quality.nextStep} />
                  <Field label="Retorno / follow-up" value={state.quality.followUp} />
                </dl>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Indicadores</p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {FACT_FIELDS.map((field) => (
                    <Field key={field.key} label={field.label} value={formatFactValue(field.kind, state.facts[field.key])} />
                  ))}
                </dl>
                {calc && (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-2">
                    <Field label="Conversão" value={calc.conversion != null ? `${formatNumber(calc.conversion, 2)}%` : null} />
                    <Field label="Vendas estimadas" value={formatNumber(calc.sales)} />
                    <Field label="Não convertidos" value={formatNumber(calc.unconverted)} />
                    <Field label="Receita estimada" value={formatMoney(calc.revenue)} />
                  </dl>
                )}
              </div>

              {state.notes && (
                <div className="space-y-1">
                  <p className="font-semibold">Notas do diagnóstico</p>
                  <p className="whitespace-pre-wrap">{state.notes}</p>
                </div>
              )}
            </div>
          )}
        </Section>

        {briefing && (
          <Section title="Briefing">
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4 font-sans text-xs leading-relaxed text-foreground">
              {briefing}
            </pre>
          </Section>
        )}

        <Section title="Últimas atividades">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
          ) : (
            <ul className="divide-y divide-slate-200 text-sm">
              {activities.map((activity) => (
                <li key={activity.id} className="grid grid-cols-[9rem_6rem_1fr] gap-3 py-2">
                  <span className="tabular-nums text-muted-foreground">{formatDateTime(activity.occurredAt)}</span>
                  <span className="font-medium">{ACTIVITY_LABEL[activity.type]}</span>
                  <span className="min-w-0 break-words text-foreground">{activity.summary || '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <footer className="border-t border-input pt-3 text-xs text-muted-foreground">
          Ficha gerada a partir dos dados do CRM. Valores não informados aparecem como “—”.
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 break-inside-avoid">
      <h2 className="border-b border-border pb-1 text-sm font-bold uppercase tracking-wider text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{value || '—'}</dd>
    </div>
  );
}

