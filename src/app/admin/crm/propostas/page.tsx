'use client';

import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FileText, Plus, Search } from 'lucide-react';
import { ErrorState, LoadingBlock, PageHeader, getErrorMessage } from '@/components/atendimento/helpers';
import { PipelineQueryProvider } from '@/components/admin/crm/pipeline/providers/PipelineQueryProvider';
import { ProposalEditorDialog, SELECT_CLASS } from '@/components/admin/crm/proposals/ProposalEditorDialog';
import { ProposalList } from '@/components/admin/crm/proposals/ProposalList';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { crmLeadsApi, type CrmLead } from '@/services/crm-leads';
import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from '@/services/sales-copilot';

const STATUS_OPTIONS = Object.keys(PROPOSAL_STATUS_LABEL) as ProposalStatus[];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function PropostasPage() {
  return (
    <PipelineQueryProvider>
      <ProposalsPageContent />
    </PipelineQueryProvider>
  );
}

function ProposalsPageContent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = useState<ProposalStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const debouncedLeadSearch = useDebouncedValue(leadSearch.trim(), 300);
  const [pickedLead, setPickedLead] = useState<CrmLead | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const leadsQuery = useQuery({
    queryKey: ['crm-sales', 'lead-picker', debouncedLeadSearch],
    queryFn: () => crmLeadsApi.list({ search: debouncedLeadSearch || undefined, pageSize: 10 }),
    enabled: pickerOpen,
    placeholderData: keepPreviousData,
  });
  const leads = leadsQuery.data?.items ?? [];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as ProposalStatus | 'ALL');
    setPage(1);
  };

  const openPicker = () => {
    setLeadSearch('');
    setPickerOpen(true);
  };

  const chooseLead = (lead: CrmLead) => {
    setPickedLead(lead);
    setPickerOpen(false);
    setEditorOpen(true);
  };

  return (
    <div className="min-h-full space-y-6 p-4 md:p-8">
      <PageHeader
        title="Propostas"
        description="Propostas comerciais por lead, com envio por e-mail e versão para impressão ou PDF."
        icon={<FileText aria-hidden className="h-7 w-7 text-[#0076FF]" />}
        actions={
          <Button type="button" onClick={openPicker}>
            <Plus aria-hidden className="mr-1.5 h-4 w-4" />
            Nova proposta
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1 space-y-1.5">
          <Label htmlFor="proposal-search">Buscar</Label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="proposal-search"
              type="search"
              className="pl-9"
              placeholder="Número, título, lead ou empresa"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="w-full space-y-1.5 sm:w-56">
          <Label htmlFor="proposal-status">Status</Label>
          <select
            id="proposal-status"
            className={SELECT_CLASS}
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            <option value="ALL">Todos os status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PROPOSAL_STATUS_LABEL[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ProposalList
        showLead
        search={debouncedSearch}
        status={status === 'ALL' ? undefined : status}
        page={page}
        onPageChange={setPage}
        pageSize={20}
        onCreate={openPicker}
      />

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Escolha o lead</DialogTitle>
            <DialogDescription>A nova proposta será criada para o lead selecionado.</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="proposal-lead-search">Buscar lead</Label>
            <Input
              id="proposal-lead-search"
              type="search"
              placeholder="Nome, empresa ou e-mail"
              value={leadSearch}
              onChange={(event) => setLeadSearch(event.target.value)}
            />
          </div>

          <div aria-live="polite">
            {leadsQuery.isPending ? (
              <LoadingBlock rows={3} />
            ) : leadsQuery.isError ? (
              <ErrorState
                message={getErrorMessage(leadsQuery.error, 'Não foi possível buscar os leads.')}
                onRetry={() => void leadsQuery.refetch()}
              />
            ) : leads.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                Nenhum lead encontrado.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {leads.map((lead) => (
                  <li key={lead.id}>
                    <button
                      type="button"
                      onClick={() => chooseLead(lead)}
                      className="flex w-full min-w-0 flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                    >
                      <span className="max-w-full truncate text-sm font-medium text-slate-800">{lead.name}</span>
                      <span className="max-w-full truncate text-xs text-slate-500">
                        {[lead.company, lead.email].filter(Boolean).join(' · ') || 'Sem empresa ou e-mail'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {pickedLead && (
        <ProposalEditorDialog open={editorOpen} onOpenChange={setEditorOpen} leadId={pickedLead.id} />
      )}
    </div>
  );
}
