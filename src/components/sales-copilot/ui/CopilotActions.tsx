'use client';

import { FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { buildBrief, type DiagnosisData, type Script } from '@/components/sales-copilot/engine';
import { Button } from '@/components/ui/button';
import { toLeadInfo } from './copilot-format';
import type { CopilotLead } from './types';

/** Acoes finais: copia o briefing e abre a ficha imprimivel do lead em nova aba. */
export function CopilotActions({
  lead,
  state,
  script,
}: {
  lead: CopilotLead;
  state: DiagnosisData;
  script: Script;
}) {
  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(buildBrief(state, toLeadInfo(lead), script));
      toast.success('Briefing copiado.');
    } catch {
      toast.error('Não foi possível copiar o briefing.');
    }
  }

  function openFicha() {
    window.open(`/admin/crm/leads/${lead.id}/ficha`, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
      <Button type="button" variant="outline" size="sm" onClick={() => void copyBrief()}>
        <Copy aria-hidden className="h-3.5 w-3.5" />
        Copiar briefing
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={openFicha}>
        <FileText aria-hidden className="h-3.5 w-3.5" />
        Ficha em PDF
      </Button>
    </div>
  );
}
