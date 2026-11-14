'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatDateTime, getErrorMessage } from '@/components/atendimento/helpers';
import { crmLeadsApi, getStoredUser, LEAD_STATUSES, type CrmLeadDetail } from '@/services/crm-leads';
import { telephonyService, type PhoneCall } from '@/services/telephony';

export const CALL_NOTE_MAX = 1000;

const noteKey = (call: PhoneCall) => `ramal:call-note:v1:${getStoredUser()?.id ?? call.userId}:${call.id}`;

export function readCallDraft(call: PhoneCall) {
  try { return localStorage.getItem(noteKey(call))?.slice(0, CALL_NOTE_MAX); } catch { return undefined; }
}

export function clearCallDraft(call: PhoneCall) {
  try { localStorage.removeItem(noteKey(call)); } catch { /* Storage may be disabled. */ }
}

function useCallNote(call: PhoneCall) {
  const [note, setNote] = useState(() => readCallDraft(call) ?? call.dispositionDraft?.note ?? call.dispositionNote ?? '');

  function changeNote(value: string) {
    setNote(value);
    try { localStorage.setItem(noteKey(call), value); } catch { /* Keep the current field usable. */ }
  }

  return { note, changeNote };
}

export function CallLeadContext({ call }: { call: PhoneCall }) {
  const { note, changeNote } = useCallNote(call);
  const [lead, setLead] = useState<CrmLeadDetail>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [sync, setSync] = useState<'saving' | 'saved' | 'error' | null>(null);
  const leadId = call.leadId;

  useEffect(() => {
    if (!leadId) return;
    let active = true;
    void crmLeadsApi.get(leadId)
      .then((detail) => { if (active) { setLead(detail); setError(''); } })
      .catch((err: unknown) => { if (active) setError(getErrorMessage(err, 'Não foi possível carregar a ficha.')); });
    return () => { active = false; };
  }, [leadId, retry]);

  return <section aria-labelledby="call-lead-title" className="space-y-3 border-t border-slate-200 pt-4">
    <h3 id="call-lead-title" className="text-sm font-semibold text-slate-900">Ficha em atendimento</h3>
    {leadId && !lead && !error && <p role="status" className="text-sm text-slate-600">Carregando ficha…</p>}
    {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-red-700">
      <span>{error}</span><Button size="sm" variant="outline" onClick={() => setRetry(retry + 1)}>Tentar novamente</Button>
    </div>}
    {lead && <>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        {[
          ['Empresa', lead.company], ['Etapa', LEAD_STATUSES.find((item) => item.id === lead.status)?.title],
          ['Cidade', lead.city], ['Segmento', lead.segment], ['E-mail', lead.email],
          ['Próxima ação', lead.nextActionAt ? formatDateTime(lead.nextActionAt) : null],
        ].map(([label, value]) => value && <div key={label} className="min-w-0">
          <dt className="text-xs text-slate-600">{label}</dt><dd className="break-words font-medium">{value}</dd>
        </div>)}
      </dl>
      {lead.notes && <p className="whitespace-pre-wrap break-words text-sm text-slate-700">{lead.notes}</p>}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Atividades recentes</summary>
        {lead.activities.length ? <ul className="mt-2 space-y-2 text-slate-700">
          {lead.activities.slice(0, 4).map((activity) => <li key={activity.id} className="break-words">
            <time dateTime={activity.occurredAt} className="mr-2 text-xs text-slate-600">{formatDateTime(activity.occurredAt)}</time>
            {activity.summary ?? activity.outcome ?? activity.type}
          </li>)}
        </ul> : <p className="mt-2 text-slate-600">Sem atividades registradas.</p>}
      </details>
    </>}
    <div className="space-y-2">
      <Label htmlFor="active-call-note">Rascunho desta ligação</Label>
      <Textarea id="active-call-note" value={note} maxLength={CALL_NOTE_MAX}
        onChange={(event) => { changeNote(event.target.value); setSync(null); }} placeholder="Anote o que vai entrar no resultado da ligação." />
      <Button type="button" size="sm" variant="outline" disabled={sync === 'saving'} onClick={async () => {
        setSync('saving');
        try {
          const latest = await telephonyService.getCall(call.id);
          await telephonyService.updateDispositionDraft(call.id, { expectedVersion: latest.dispositionDraftVersion, note });
          setSync('saved');
        } catch { setSync('error'); }
      }}>Sincronizar rascunho</Button>
      {sync === 'saved' && <p role="status" className="text-xs text-green-700">Rascunho sincronizado.</p>}
      {sync === 'error' && <p role="alert" className="text-xs text-amber-800">O rascunho está salvo neste dispositivo. Tente sincronizar novamente.</p>}
    </div>
  </section>;
}
