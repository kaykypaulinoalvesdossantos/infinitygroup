'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BarChart3, ChevronDown, Download, FileUp, ListChecks, Loader2, MoreHorizontal, Settings, Tags, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { errorMessage } from '@/components/admin/crm/format';
import { pipelineApi, type LeadFilters } from '@/services/crm-pipeline';

interface PipelineActionsProps {
  isSupervisor: boolean;
  /** Filtros da visao atual; a exportacao usa exatamente esses. */
  filters: LeadFilters;
  onOpenTags: () => void;
  onOpenLostReasons: () => void;
  onImport: () => void;
  /** 'inline': botoes do desktop. 'menu': um botao "Mais ações" (celular). */
  variant?: 'inline' | 'menu';
}

/** Acoes do cabecalho: importar, exportar (supervisor), relatorios e menu Configurar (supervisor). */
export function PipelineActions({ isSupervisor, filters, onOpenTags, onOpenLostReasons, onImport, variant = 'inline' }: PipelineActionsProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await pipelineApi.exportCsv(filters);
    } catch (err) {
      toast.error(errorMessage(err, 'Não foi possível exportar os leads.'));
    } finally {
      setExporting(false);
    }
  };

  if (variant === 'menu') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="icon" className="h-10 w-10 bg-[hsl(var(--card-bg))]" aria-label="Mais ações do funil">
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuItem onSelect={onImport}>
            <FileUp className="h-4 w-4" aria-hidden="true" />
            Importar CSV
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/crm/relatorios">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Relatórios
            </Link>
          </DropdownMenuItem>
          {isSupervisor && (
            <>
              <DropdownMenuItem onSelect={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/crm/pipelines">
                  <Workflow className="h-4 w-4" aria-hidden="true" />
                  Etapas do funil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onOpenTags}>
                <Tags className="h-4 w-4" aria-hidden="true" />
                Etiquetas
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onOpenLostReasons}>
                <ListChecks className="h-4 w-4" aria-hidden="true" />
                Motivos de perda
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isSupervisor && (
        <Button type="button" variant="outline" onClick={handleExport} disabled={exporting} className="bg-[hsl(var(--card-bg))]">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
          Exportar CSV
        </Button>
      )}

      <Button type="button" variant="outline" asChild className="bg-[hsl(var(--card-bg))]">
        <Link href="/admin/crm/relatorios">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Relatórios
        </Link>
      </Button>

      {isSupervisor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="bg-[hsl(var(--card-bg))]" aria-label="Configurar funil">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Configurar
              <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/admin/crm/pipelines">
                <Workflow className="h-4 w-4" aria-hidden="true" />
                Etapas do funil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenTags}>
              <Tags className="h-4 w-4" aria-hidden="true" />
              Etiquetas
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenLostReasons}>
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Motivos de perda
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
