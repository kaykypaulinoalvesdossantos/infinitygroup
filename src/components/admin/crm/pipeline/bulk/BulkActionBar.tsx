'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Archive, ChevronDown, Download, Loader2, Tag, UserRound, X, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/components/admin/crm/format';
import type { TeamUser } from '@/services/crm-leads';
import { pipelineApi, type LeadFilters, type PipelineStage } from '@/services/crm-pipeline';
import type { useBulkSelection } from '../hooks/useBulkSelection';
import { useHotkeys } from '../hooks/useHotkeys';
import { useLostReasons, useTags } from '../hooks/usePipelineData';
import { useMotionSafe } from '../motion';
import { useBulkActions } from './useBulkActions';
import { BulkLostDialog } from './BulkLostDialog';

type Selection = ReturnType<typeof useBulkSelection>;

interface BulkActionBarProps {
  selection: Selection;
  /** Filtros atuais da visao (usados no escopo de coluna e na exportacao). */
  filters: LeadFilters;
  stages: PipelineStage[];
  /** Total de leads por etapa com os filtros atuais (resolve a contagem do escopo de coluna). */
  stageTotals: Record<string, number>;
  isSupervisor: boolean;
  owners: TeamUser[];
  /** Falso quando ha drawer ou outro dialogo aberto: Escape nao limpa a selecao nesse caso. */
  escapeEnabled: boolean;
}

const actionButton = 'h-8 bg-[hsl(var(--card-bg))] text-slate-700 dark:text-slate-200';

function MobileGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function MobileItem({ onClick, children, tone }: { onClick: () => void; children: React.ReactNode; tone?: 'danger' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand))] dark:hover:bg-slate-800',
        tone === 'danger' && 'text-[hsl(var(--urgent))]',
      )}
    >
      {children}
    </button>
  );
}

/** Barra flutuante no rodape com as acoes em massa. Aparece quando ha selecao. */
export function BulkActionBar({ selection, filters, stages, stageTotals, isSupervisor, owners, escapeEnabled }: BulkActionBarProps) {
  const { bulkBar } = useMotionSafe();
  const { hasSelection } = selection;
  const count = selection.count(stageTotals);
  const actions = useBulkActions(selection, filters, stages);
  const tagsQuery = useTags();
  const lostReasons = useLostReasons(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /** Fecha a folha do celular e executa a acao. */
  const runMobile = (action: () => unknown) => {
    setMobileOpen(false);
    void action();
  };

  const dialogOpen = lostOpen || archiveOpen;
  useHotkeys(
    {
      Escape: () => selection.clear(),
    },
    hasSelection && escapeEnabled && !dialogOpen,
  );

  const openStages = stages.filter((s) => s.type === 'OPEN');
  const lostStage = stages.find((s) => s.type === 'LOST');
  const scopeStage = selection.scope ? stages.find((s) => s.id === selection.scope?.stageId) : undefined;
  const scopeTotal = selection.scope ? stageTotals[selection.scope.stageId] ?? 0 : 0;
  const excluded = selection.scope?.excludedIds.length ?? 0;
  const disabled = actions.busy || count === 0;
  const tags = tagsQuery.data ?? [];

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

  const confirmArchive = async () => {
    setArchiveOpen(false);
    await actions.archive();
  };

  return (
    <>
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            key="bulk-bar"
            variants={bulkBar}
            initial="hidden"
            animate="show"
            exit="exit"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center md:bottom-4 md:px-3"
          >
            <div
              role="toolbar"
              aria-label="Ações em massa"
              className="pointer-events-auto flex w-full max-w-full flex-wrap items-center gap-2 border-t border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-xl md:w-auto md:rounded-2xl md:border md:py-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 pr-1 md:flex-none" aria-live="polite">
                <span className="rounded-full bg-[hsl(var(--brand))] px-2 py-0.5 text-xs font-semibold tabular-nums text-white">{count}</span>
                <span className="min-w-0 truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                  {selection.scope && scopeStage
                    ? `Todos os ${scopeTotal} de ${scopeStage.name}${excluded ? ` · ${excluded} desmarcado(s)` : ''}`
                    : 'selecionado(s)'}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className={cn(actionButton, 'h-10 md:hidden')}
                disabled={disabled}
                onClick={() => setMobileOpen(true)}
              >
                Ações
                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
              </Button>

              <div className="hidden flex-wrap items-center gap-1.5 md:flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className={actionButton} disabled={disabled} aria-label="Mover para uma etapa">
                      <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Mover para
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {openStages.map((stage) => (
                      <DropdownMenuItem key={stage.id} onSelect={() => actions.moveTo(stage)}>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden="true" />
                        {stage.name}
                      </DropdownMenuItem>
                    ))}
                    {lostStage && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setLostOpen(true)}>
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: lostStage.color }} aria-hidden="true" />
                          {lostStage.name}…
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {isSupervisor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className={actionButton} disabled={disabled} aria-label="Trocar responsável">
                        <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                        Responsável
                        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="max-h-72 w-56 overflow-y-auto">
                      {owners.length === 0 && <DropdownMenuLabel className="font-normal text-slate-500">Nenhum vendedor ativo.</DropdownMenuLabel>}
                      {owners.map((owner) => (
                        <DropdownMenuItem key={owner.id} onSelect={() => actions.assign(owner.id, owner.name)}>
                          {owner.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className={actionButton} disabled={disabled} aria-label="Adicionar ou remover etiqueta">
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                      Etiqueta
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="max-h-72 w-60 overflow-y-auto">
                    {tags.length === 0 && <DropdownMenuLabel className="font-normal text-slate-500">Nenhuma etiqueta cadastrada.</DropdownMenuLabel>}
                    {tags.length > 0 && <DropdownMenuLabel>Adicionar</DropdownMenuLabel>}
                    {tags.map((tag) => (
                      <DropdownMenuItem key={`add-${tag.id}`} onSelect={() => actions.tagging(tag.id, tag.name, true)}>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                        {tag.name}
                      </DropdownMenuItem>
                    ))}
                    {tags.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Remover</DropdownMenuLabel>
                        {tags.map((tag) => (
                          <DropdownMenuItem key={`remove-${tag.id}`} onSelect={() => actions.tagging(tag.id, tag.name, false)}>
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                            {tag.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button type="button" variant="outline" size="sm" className={actionButton} disabled={disabled} onClick={() => setArchiveOpen(true)}>
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                  Arquivar
                </Button>

                {isSupervisor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={actionButton}
                    disabled={exporting}
                    onClick={handleExport}
                    title="O arquivo traz os leads que correspondem aos filtros atuais"
                  >
                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
                    Exportar filtrados
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 dark:text-slate-400"
                onClick={() => selection.clear()}
                aria-label="Limpar seleção"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celular: as mesmas acoes em uma folha inferior */}
      <Sheet open={mobileOpen && hasSelection} onOpenChange={setMobileOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[80dvh] gap-4 overflow-y-auto rounded-t-[20px] border-[hsl(var(--card-border))] bg-[hsl(var(--card-bg))] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:max-w-none"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="pr-10 text-base">{count} selecionado(s)</SheetTitle>
            <SheetDescription>Escolha uma ação para todos os selecionados.</SheetDescription>
          </SheetHeader>

          <MobileGroup label="Mover para">
            {openStages.map((stage) => (
              <MobileItem key={stage.id} onClick={() => runMobile(() => actions.moveTo(stage))}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden="true" />
                {stage.name}
              </MobileItem>
            ))}
            {lostStage && (
              <MobileItem onClick={() => runMobile(() => setLostOpen(true))}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: lostStage.color }} aria-hidden="true" />
                {lostStage.name}…
              </MobileItem>
            )}
          </MobileGroup>

          {isSupervisor && (
            <MobileGroup label="Responsável">
              {owners.length === 0 && <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Nenhum vendedor ativo.</p>}
              {owners.map((owner) => (
                <MobileItem key={owner.id} onClick={() => runMobile(() => actions.assign(owner.id, owner.name))}>
                  {owner.name}
                </MobileItem>
              ))}
            </MobileGroup>
          )}

          <MobileGroup label="Etiquetas">
            {tags.length === 0 && <p className="px-1 text-sm text-slate-500 dark:text-slate-400">Nenhuma etiqueta cadastrada.</p>}
            {tags.map((tag) => (
              <MobileItem key={tag.id} onClick={() => runMobile(() => actions.tagging(tag.id, tag.name, true))}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                Adicionar {tag.name}
              </MobileItem>
            ))}
            {tags.map((tag) => (
              <MobileItem key={`rm-${tag.id}`} onClick={() => runMobile(() => actions.tagging(tag.id, tag.name, false))}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} aria-hidden="true" />
                Remover {tag.name}
              </MobileItem>
            ))}
          </MobileGroup>

          <MobileGroup label="Outras">
            <MobileItem onClick={() => runMobile(() => setArchiveOpen(true))} tone="danger">
              <Archive className="h-4 w-4" aria-hidden="true" />
              Arquivar
            </MobileItem>
            {isSupervisor && (
              <MobileItem onClick={() => runMobile(handleExport)}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Exportar filtrados
              </MobileItem>
            )}
          </MobileGroup>
        </SheetContent>
      </Sheet>

      <BulkLostDialog
        open={lostOpen}
        count={count}
        reasons={(lostReasons.data ?? []).filter((r) => r.active)}
        reasonsLoading={lostReasons.isPending}
        busy={actions.busy}
        onCancel={() => setLostOpen(false)}
        onConfirm={async (outcome) => {
          if (!lostStage) return;
          setLostOpen(false);
          await actions.moveTo(lostStage, { lostReasonId: outcome.lostReasonId, lostNote: outcome.lostNote });
        }}
      />

      <Dialog open={archiveOpen} onOpenChange={(next) => !next && !actions.busy && setArchiveOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Arquivar {count} lead(s)?</DialogTitle>
            <DialogDescription>Os leads selecionados saem do funil e das listas. Confirme para continuar.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setArchiveOpen(false)} disabled={actions.busy}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmArchive} disabled={actions.busy} className={cn(actions.busy && 'opacity-80')}>
              {actions.busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Arquivar leads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
