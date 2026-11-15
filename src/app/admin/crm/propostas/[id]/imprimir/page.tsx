'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import { ErrorState, getErrorMessage } from '@/components/atendimento/helpers';
import { PipelineQueryProvider } from '@/components/admin/crm/pipeline/providers/PipelineQueryProvider';
import { PROPOSAL_QUERY_KEY } from '@/components/admin/crm/proposals/ProposalEditorDialog';
import { ProposalDocument } from '@/components/admin/crm/proposals/ProposalDocument';
import { Button } from '@/components/ui/button';
import { salesCopilotApi } from '@/services/sales-copilot';

/** Esconde o painel administrativo na impressao e deixa so o documento em A4. */
const PRINT_CSS = `
@media print {
  body * { visibility: hidden; }
  #print-root, #print-root * { visibility: visible; }
  #print-root { position: absolute; inset: 0; overflow: visible; }
  .no-print { display: none !important; }
  @page { size: A4; margin: 14mm; }
}
`;

interface ProposalPrintPageProps {
  params: { id: string };
}

export default function ProposalPrintPage({ params }: ProposalPrintPageProps) {
  return (
    <PipelineQueryProvider>
      <ProposalPrintContent idParam={params.id} />
    </PipelineQueryProvider>
  );
}

function ProposalPrintContent({ idParam }: { idParam: string }) {
  const id = Number(idParam);
  const validId = Number.isInteger(id) && id > 0;

  const proposalQuery = useQuery({
    queryKey: [...PROPOSAL_QUERY_KEY, id],
    queryFn: () => salesCopilotApi.getProposal(id),
    enabled: validId,
  });

  let body: ReactNode;
  if (!validId) {
    body = <ErrorState message="Proposta inválida." />;
  } else if (proposalQuery.isPending) {
    body = (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" aria-busy="true">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Carregando proposta...
      </div>
    );
  } else if (proposalQuery.isError) {
    body = (
      <ErrorState
        message={getErrorMessage(proposalQuery.error, 'Não foi possível carregar a proposta.')}
        onRetry={() => void proposalQuery.refetch()}
      />
    );
  } else {
    body = <ProposalDocument proposal={proposalQuery.data} />;
  }

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div id="print-root" className="fixed inset-0 z-[100] overflow-auto bg-white">
        <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <Button asChild variant="outline">
            <Link href="/admin/crm/propostas">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button
            type="button"
            onClick={() => window.print()}
            disabled={!proposalQuery.data}
          >
            <Printer aria-hidden className="h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>
        </div>
        <div className="px-4 py-6 print:p-0">{body}</div>
      </div>
    </>
  );
}
