'use client';

import { useState, type ReactNode } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, ErrorState, LoadingBlock, formatDateTime, getErrorMessage } from '@/components/atendimento/helpers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  PROPOSAL_STATUS_LABEL,
  formatCents,
  salesCopilotApi,
  type Proposal,
  type ProposalListParams,
  type ProposalStatus,
  type ProposalSummary,
} from '@/services/sales-copilot';
import { cn } from '@/lib/utils';
import { ProposalEditorDialog, PROPOSALS_QUERY_KEY, PROPOSAL_QUERY_KEY, formatValidUntil } from './ProposalEditorDialog';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { SendProposalDialog } from './SendProposalDialog';

/** Transicoes de status permitidas na lista (o servidor valida de novo). */
const NEXT_STATUSES: Record<ProposalStatus, ProposalStatus[]> = {
  DRAFT: [],
  SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED', 'DRAFT'],
  ACCEPTED: [],
  REJECTED: ['DRAFT'],
  EXPIRED: ['DRAFT'],
};

const STATUS_ACTION_LABEL: Record<ProposalStatus, string> = {
  DRAFT: 'Voltar a rascunho',
  SENT: 'Marcar como enviada',
  ACCEPTED: 'Marcar como aceita',
  REJECTED: 'Marcar como recusada',
  EXPIRED: 'Marcar como expirada',
};

const STATUS_ACTION_ICON: Record<ProposalStatus, LucideIcon> = {
  DRAFT: RotateCcw,
  SENT: Send,
  ACCEPTED: CheckCircle2,
  REJECTED: XCircle,
  EXPIRED: Hourglass,
};

export interface ProposalListProps {
  /** Filtra pelas propostas de um lead (aba do lead na gaveta). */
  leadId?: number;
  showLead?: boolean;
  search?: string;
  status?: ProposalStatus;
  /** Pagina controlada pelo pai; sem ela a lista controla a propria pagina. */
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  /** Chamado pelo botao do estado vazio. */
  onCreate?: () => void;
  className?: string;
}

export function ProposalList({
  leadId,
  showLead = false,
  search,
  status,
  page: pageProp,
  onPageChange,
  pageSize = 20,
  onCreate,
  className,
}: ProposalListProps) {
  const queryClient = useQueryClient();
  const [internalPage, setInternalPage] = useState(1);
  const page = pageProp ?? internalPage;
  const setPage = (next: number) => {
    if (onPageChange) onPageChange(next);
    else setInternalPage(next);
  };

  const [editing, setEditing] = useState<Proposal | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [sending, setSending] = useState<Proposal | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const trimmedSearch = search?.trim() || undefined;
  const params: ProposalListParams = { leadId, status, search: trimmedSearch, page, pageSize };

  const listQuery = useQuery({
    queryKey: [...PROPOSALS_QUERY_KEY, params],
    queryFn: () => salesCopilotApi.listProposals(params),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: PROPOSALS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEY });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: number; next: ProposalStatus }) => salesCopilotApi.setProposalStatus(id, next),
    onSuccess: (updated) => {
      toast.success(`Status alterado para ${PROPOSAL_STATUS_LABEL[updated.status]}.`);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível alterar o status.')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => salesCopilotApi.deleteProposal(id),
    onSuccess: () => {
      toast.success('Proposta excluída.');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Não foi possível excluir a proposta.')),
  });

  const loadProposal = async (id: number): Promise<Proposal | null> => {
    setOpeningId(id);
    try {
      return await queryClient.fetchQuery({
        queryKey: [...PROPOSAL_QUERY_KEY, id],
        queryFn: () => salesCopilotApi.getProposal(id),
        staleTime: 0,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível carregar a proposta.'));
      return null;
    } finally {
      setOpeningId(null);
    }
  };

  const handleEdit = async (item: ProposalSummary) => {
    const full = await loadProposal(item.id);
    if (full) {
      setEditing(full);
      setEditorOpen(true);
    }
  };

  const handleSend = async (item: ProposalSummary) => {
    const full = await loadProposal(item.id);
    if (full) {
      setSending(full);
      setSendOpen(true);
    }
  };

  const handlePrint = (item: ProposalSummary) => {
    window.open(`/admin/crm/propostas/${item.id}/imprimir`, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = (item: ProposalSummary) => {
    if (!window.confirm(`Excluir a proposta "${item.title}"? Essa ação não pode ser desfeita.`)) return;
    deleteMutation.mutate(item.id);
  };

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = Boolean(trimmedSearch || status);

  let content: ReactNode;
  if (listQuery.isPending) {
    content = <LoadingBlock rows={4} />;
  } else if (listQuery.isError) {
    content = (
      <ErrorState
        message={getErrorMessage(listQuery.error, 'Não foi possível carregar as propostas.')}
        onRetry={() => void listQuery.refetch()}
      />
    );
  } else if (items.length === 0) {
    content = (
      <EmptyState
        title={filtered ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta ainda'}
        description={
          filtered
            ? 'Ajuste a busca ou o status para ver outras propostas.'
            : 'Crie uma proposta para registrar itens, valores e condições comerciais.'
        }
      >
        {onCreate && !filtered && (
          <Button type="button" size="sm" onClick={onCreate} className="mt-2">
            <Plus aria-hidden className="mr-1.5 h-4 w-4" />
            Nova proposta
          </Button>
        )}
      </EmptyState>
    );
  } else {
    content = (
      <>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Título</TableHead>
                {showLead && <TableHead>Lead</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Enviada em</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const transitions = NEXT_STATUSES[item.status];
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{item.number ?? '-'}</TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="block truncate font-medium text-foreground">{item.title}</span>
                    </TableCell>
                    {showLead && (
                      <TableCell className="max-w-[200px]">
                        <span className="block truncate text-sm text-foreground">{item.lead.name}</span>
                        {item.lead.company && (
                          <span className="block truncate text-xs text-muted-foreground">{item.lead.company}</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <ProposalStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums whitespace-nowrap">
                      {formatCents(item.totalCents)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatValidUntil(item.validUntil)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(item.sentAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Ações da proposta ${item.number ?? item.title}`}
                            disabled={openingId === item.id}
                          >
                            <MoreHorizontal aria-hidden className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60">
                          <DropdownMenuItem onSelect={() => void handleEdit(item)}>
                            <Pencil aria-hidden className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => void handleSend(item)}>
                            <Send aria-hidden className="h-4 w-4" />
                            Enviar por e-mail
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handlePrint(item)}>
                            <Printer aria-hidden className="h-4 w-4" />
                            Imprimir / PDF
                          </DropdownMenuItem>
                          {transitions.length > 0 && <DropdownMenuSeparator />}
                          {transitions.map((next) => {
                            const Icon = STATUS_ACTION_ICON[next];
                            return (
                              <DropdownMenuItem
                                key={next}
                                disabled={statusMutation.isPending}
                                onSelect={() => statusMutation.mutate({ id: item.id, next })}
                              >
                                <Icon aria-hidden className="h-4 w-4" />
                                {STATUS_ACTION_LABEL[next]}
                              </DropdownMenuItem>
                            );
                          })}
                          {item.status === 'DRAFT' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-danger-foreground focus:text-danger-foreground"
                                disabled={deleteMutation.isPending}
                                onSelect={() => handleDelete(item)}
                              >
                                <Trash2 aria-hidden className="h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <nav
          aria-label="Paginação das propostas"
          className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-3 text-sm text-muted-foreground"
        >
          <span>
            {total} {total === 1 ? 'proposta' : 'propostas'} · página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || listQuery.isFetching}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || listQuery.isFetching}
              onClick={() => setPage(page + 1)}
            >
              Próxima
              <ChevronRight aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      </>
    );
  }

  return (
    <div className={cn('min-w-0 rounded-2xl bg-card shadow-md shadow-slate-200/60', className)}>
      <div className="p-2 md:p-3">{content}</div>

      {editing && (
        <ProposalEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          leadId={editing.lead.id}
          proposal={editing}
        />
      )}
      {sending && <SendProposalDialog open={sendOpen} onOpenChange={setSendOpen} proposal={sending} />}
    </div>
  );
}
