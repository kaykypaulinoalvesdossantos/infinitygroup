'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/components/atendimento/helpers';
import { crmLeadsApi } from '@/services/crm-leads';

export function LeadPdfButton({ leadId }: { leadId: number }) {
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      const [lead, appointments, { createLeadPdf }] = await Promise.all([
        crmLeadsApi.get(leadId),
        crmLeadsApi.listAppointments(leadId),
        import('./lead-pdf'),
      ]);
      const slug = lead.name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').slice(0, 48).replace(/^-|-$/g, '') || 'cliente';
      createLeadPdf(lead, appointments).save(`ficha-cliente-${lead.id}-${slug}.pdf`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível baixar a ficha em PDF.'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={downloading} onClick={download}>
      {downloading ? <Loader2 aria-hidden className="mr-1.5 h-4 w-4 animate-spin" /> : <Download aria-hidden className="mr-1.5 h-4 w-4" />}
      {downloading ? 'Gerando PDF…' : 'Baixar PDF'}
    </Button>
  );
}
