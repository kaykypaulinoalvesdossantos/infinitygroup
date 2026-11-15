'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GoalEditorDialog } from '@/components/admin/crm/goals/GoalEditorDialog';
import { GoalProgressCard } from '@/components/admin/crm/goals/GoalProgressCard';
import { getStoredUser, isSupervisorRole } from '@/services/crm-leads';
import {
  currentMonth,
  formatCents,
  salesCopilotApi,
  type Goal,
  type GoalsResponse,
} from '@/services/sales-copilot';

interface EditorTarget {
  userId: number | null;
  userName: string;
  goal: Goal | null;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function countCell(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : value.toLocaleString('pt-BR');
}

export default function MetasPage() {
  const [supervisor, setSupervisor] = useState(false);
  const [monthInput, setMonthInput] = useState<string>(() => currentMonth());
  const month = monthInput || currentMonth();
  const [goals, setGoals] = useState<GoalsResponse | null>(null);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedSeller, setSelectedSeller] = useState<{ userId: number; name: string } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<EditorTarget>({ userId: null, userName: 'Equipe', goal: null });

  useEffect(() => {
    setSupervisor(isSupervisorRole(getStoredUser()?.role));
  }, []);

  const reload = useCallback(() => setReloadToken((current) => current + 1), []);

  useEffect(() => {
    if (!supervisor) return;
    let active = true;
    setLoadingGoals(true);
    setGoalsError(null);
    salesCopilotApi
      .listGoals(month)
      .then((data) => {
        if (active) setGoals(data);
      })
      .catch((err: unknown) => {
        if (active) setGoalsError(errorMessage(err, 'Não foi possível carregar as metas da equipe.'));
      })
      .finally(() => {
        if (active) setLoadingGoals(false);
      });
    return () => {
      active = false;
    };
  }, [month, supervisor, reloadToken]);

  const openEditor = (target: EditorTarget) => {
    setEditor(target);
    setEditorOpen(true);
  };

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-link">CRM · Copiloto de vendas</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Target className="h-6 w-6 text-link" aria-hidden />
            Metas comerciais
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe o realizado do mês frente às metas definidas.</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="goals-month">Mês de referência</Label>
          <Input
            id="goals-month"
            type="month"
            className="w-44 bg-card"
            value={monthInput}
            onChange={(event) => setMonthInput(event.target.value)}
          />
        </div>
      </header>

      {supervisor ? (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            <GoalProgressCard key={`team-${month}-${reloadToken}`} month={month} userId="team" />
            {selectedSeller ? (
              <GoalProgressCard
                key={`seller-${selectedSeller.userId}-${month}-${reloadToken}`}
                month={month}
                userId={selectedSeller.userId}
              />
            ) : (
              <Card className="rounded-2xl border-0 bg-card shadow-md shadow-slate-200/60">
                <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/80" aria-hidden />
                  <p className="font-medium text-foreground">Nenhum vendedor selecionado</p>
                  <p className="text-sm text-muted-foreground">Clique no nome de um vendedor na tabela para ver o progresso dele.</p>
                </CardContent>
              </Card>
            )}
          </section>

          <Card className="rounded-2xl border-0 bg-card shadow-md shadow-slate-200/60">
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Metas por vendedor</h2>
                  <p className="text-sm text-muted-foreground">Valores definidos para o mês. Em branco significa sem meta.</p>
                </div>
                <Button variant="outline" onClick={() => openEditor({ userId: null, userName: 'Equipe', goal: goals?.team ?? null })} disabled={loadingGoals}>
                  Meta da equipe
                </Button>
              </div>

              {loadingGoals && !goals ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-link" aria-label="Carregando metas" />
                </div>
              ) : goalsError && !goals ? (
                <div role="alert" className="flex flex-col items-center gap-2 rounded-xl border border-danger-border bg-danger p-4 text-center">
                  <AlertTriangle className="h-5 w-5 text-danger-foreground" aria-hidden />
                  <p className="text-sm text-danger-foreground">{goalsError}</p>
                  <Button variant="outline" size="sm" onClick={reload}>
                    Tentar novamente
                  </Button>
                </div>
              ) : !goals || goals.users.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nenhum vendedor ativo encontrado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendedor</TableHead>
                        <TableHead className="text-right">Ligações</TableHead>
                        <TableHead className="text-right">Atendidas</TableHead>
                        <TableHead className="text-right">Reuniões</TableHead>
                        <TableHead className="text-right">Propostas</TableHead>
                        <TableHead className="text-right">Vendas</TableHead>
                        <TableHead className="text-right">Receita</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {goals.users.map((item) => {
                        const isSelected = selectedSeller?.userId === item.userId;
                        return (
                          <TableRow key={item.userId} data-state={isSelected ? 'selected' : undefined}>
                            <TableCell className="min-w-36">
                              <button
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setSelectedSeller({ userId: item.userId, name: item.name })}
                                className={`text-left font-medium underline-offset-4 hover:underline ${isSelected ? 'text-link' : 'text-foreground'}`}
                              >
                                {item.name}
                              </button>
                              {!item.goal && <p className="text-xs text-muted-foreground">Sem meta</p>}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{countCell(item.goal?.callsTarget)}</TableCell>
                            <TableCell className="text-right tabular-nums">{countCell(item.goal?.connectedTarget)}</TableCell>
                            <TableCell className="text-right tabular-nums">{countCell(item.goal?.meetingsTarget)}</TableCell>
                            <TableCell className="text-right tabular-nums">{countCell(item.goal?.proposalsTarget)}</TableCell>
                            <TableCell className="text-right tabular-nums">{countCell(item.goal?.wonTarget)}</TableCell>
                            <TableCell className="whitespace-nowrap text-right tabular-nums">
                              {item.goal?.revenueTargetCents === null || item.goal?.revenueTargetCents === undefined
                                ? '—'
                                : formatCents(item.goal.revenueTargetCents)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor({ userId: item.userId, userName: item.name, goal: item.goal })}
                              >
                                Definir meta
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <GoalEditorDialog
            open={editorOpen}
            onOpenChange={setEditorOpen}
            month={month}
            userId={editor.userId}
            userName={editor.userName}
            goal={editor.goal}
            onSaved={reload}
          />
        </>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <GoalProgressCard key={`mine-${month}-${reloadToken}`} month={month} />
          <GoalProgressCard key={`team-${month}-${reloadToken}`} month={month} userId="team" />
        </section>
      )}
    </main>
  );
}
