'use client';

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPhone } from '@/components/atendimento/helpers';
import { useCommitDraft } from '@/components/sales-copilot/hooks/useCommitDraft';
import type { DiagnosisData } from '@/components/sales-copilot/engine';
import { withProfileField } from './copilot-format';
import type { CopilotLead } from './types';

function ReadOnlyRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 [overflow-wrap:anywhere]">{value || '—'}</dd>
    </div>
  );
}

function ProfileInput({
  label,
  saved,
  onCommit,
  placeholder,
}: {
  label: string;
  saved: string;
  onCommit: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  const { draft, setDraft, onBlur } = useCommitDraft(saved, onCommit);
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-slate-600">
        {label}
      </Label>
      <Input
        id={id}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={onBlur}
        className="h-8 bg-white text-sm"
      />
    </div>
  );
}

/** Dados do prospect (vindos do CRM, somente leitura) e cargo / CRM usado (editaveis no diagnostico). */
export function LeadInfoCard({
  lead,
  state,
  dispatch,
}: {
  lead: CopilotLead;
  state: DiagnosisData;
  dispatch: (next: DiagnosisData) => void;
}) {
  return (
    <section aria-labelledby="copilot-lead-title" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h2 id="copilot-lead-title" className="text-sm font-semibold text-slate-900">
        Dados do prospect
      </h2>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
        <ReadOnlyRow label="Nome" value={lead.name} />
        <ReadOnlyRow label="Empresa" value={lead.company} />
        <ReadOnlyRow label="Segmento" value={lead.segment} />
        <ReadOnlyRow label="Telefone" value={formatPhone(lead.phone)} />
        <div className="col-span-2">
          <ReadOnlyRow label="E-mail" value={lead.email} />
        </div>
      </dl>
      <div className="grid gap-3 border-t border-slate-100 pt-3">
        <ProfileInput
          label="Cargo"
          saved={state.profile.role}
          placeholder="Ex.: diretor comercial"
          onCommit={(value) => dispatch(withProfileField(state, 'role', value))}
        />
        <ProfileInput
          label="CRM usado"
          saved={state.profile.crm}
          placeholder="Ex.: RD Station"
          onCommit={(value) => dispatch(withProfileField(state, 'crm', value))}
        />
      </div>
    </section>
  );
}
