'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Undo2 } from 'lucide-react';
import {
  STAGES,
  choose,
  currentChoices,
  currentGoal,
  currentSpeech,
  currentStep,
  goToStage,
  primaryBottleneck,
  registerObjection,
  setNotes,
  submitFreeText,
  summaryText,
  type DiagnosisData,
  type Effect,
  type Script,
  type SpeechContext,
} from '@/components/sales-copilot/engine';
import type { CopilotSaveState } from '@/components/sales-copilot/hooks/useSalesCopilot';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill } from '@/components/atendimento/helpers';
import { describeFactsFound, LEVEL_TONE } from './copilot-format';
import { ChoiceList } from './ChoiceList';
import { ConflictBanner, SaveIndicator } from './SaveIndicator';
import { ObjectionPicker } from './ObjectionPicker';
import { FreeReplyForm } from './FreeReplyForm';
import { NotesField } from './NotesField';
import { SpeechCard } from './SpeechCard';
import { LeadInfoCard } from './LeadInfoCard';
import { StageList } from './StageList';
import { DiagnosisSidebar } from './DiagnosisSidebar';
import { FactsForm } from './FactsForm';
import { FunnelSimulator } from './FunnelSimulator';
import { DiagnosisSummary } from './DiagnosisSummary';
import { TemperatureSuggestion } from './TemperatureSuggestion';
import { CopilotActions } from './CopilotActions';
import type { CopilotLead, CopilotVariant } from './types';

export interface CopilotWorkspaceProps {
  lead: CopilotLead;
  variant: CopilotVariant;
  state: DiagnosisData;
  script: Script;
  seller: string | null;
  dispatch: (next: DiagnosisData) => void;
  undo: () => void;
  canUndo: boolean;
  saveState: CopilotSaveState;
  savedAt: Date | null;
  reload: () => void;
  onRequestMeeting?: () => void;
  onLeadUpdated?: () => void;
}

/** Efeito de avancar para uma etapa terminal ou para a reuniao (para respostas livres). */
function effectOfNode(node: string): Effect {
  if (node === 'meeting') return 'open-meeting';
  if (node.startsWith('end_')) return 'call-ended';
  return null;
}

/** Tela de trabalho do copiloto, ja com diagnostico e roteiro carregados. */
export function CopilotWorkspace({
  lead,
  variant,
  state,
  script,
  seller,
  dispatch,
  undo,
  canUndo,
  saveState,
  savedAt,
  reload,
  onRequestMeeting,
  onLeadUpdated,
}: CopilotWorkspaceProps) {
  const ctx: SpeechContext = {
    nome: lead.name,
    empresa: lead.company ?? null,
    segmento: lead.segment ?? null,
    vendedor: seller,
  };
  const speech = currentSpeech(state, script, ctx);
  const goal = currentGoal(state, script, ctx);
  const choices = currentChoices(state, script, ctx);
  const primary = primaryBottleneck(state);

  function notifyEffect(effect: Effect) {
    if (effect === 'open-meeting') {
      toast('Agende a reunião na aba Agenda do lead', {
        action: { label: 'Abrir agenda', onClick: () => onRequestMeeting?.() },
      });
    } else if (effect === 'call-ended') {
      toast('Ligação encerrada no roteiro. Registre o resultado da ligação.');
    }
  }

  function handleChoose(index: number) {
    if (index < 0 || index >= choices.length) return;
    const result = choose(state, index, script, new Date());
    dispatch(result.state);
    notifyEffect(result.effect);
  }

  function handleObjection(name: string) {
    dispatch(registerObjection(state, name, new Date()));
  }

  function handleFreeText(text: string) {
    const result = submitFreeText(state, text, new Date());
    dispatch(result.state);
    const described = describeFactsFound(result.factsFound);
    toast.success(described ? `Identificado: ${described}` : 'Resposta registrada.');
    if (result.state.node !== state.node) notifyEffect(effectOfNode(result.state.node));
  }

  async function copySpeech() {
    try {
      await navigator.clipboard.writeText(speech);
      toast.success('Fala copiada.');
    } catch {
      toast.error('Não foi possível copiar a fala. Selecione o texto manualmente.');
    }
  }

  // Teclas 1 a 9 disparam as opcoes, exceto quando o foco esta num campo ou ha um dialogo aberto.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!/^[1-9]$/.test(event.key)) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return;
      }
      if (document.querySelector('[role="dialog"]')) return;
      const index = Number(event.key) - 1;
      if (index >= choices.length) return;
      event.preventDefault();
      handleChoose(index);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const statusBlock = (
    <div className="space-y-3">
      {saveState === 'conflict' && <ConflictBanner onReload={reload} />}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm leading-relaxed text-slate-800">{summaryText(state)}</p>
          <div className="flex flex-wrap items-center gap-2">
            {primary ? (
              <Pill tone={LEVEL_TONE[primary[1].level]}>{primary[0]}</Pill>
            ) : (
              <Pill tone="slate">Sem gargalo identificado</Pill>
            )}
            <span className="text-xs text-slate-500">
              Etapa {state.stage + 1} de {STAGES.length}
            </span>
          </div>
        </div>
        <SaveIndicator saveState={saveState} savedAt={savedAt} className="shrink-0" />
      </div>
    </div>
  );

  const callBlock = (
    <div className="space-y-5">
      <SpeechCard
        step={currentStep(state)}
        speech={speech}
        goal={goal}
        lastAnswer={state.lastAnswer}
        onCopy={() => void copySpeech()}
      />
      <ChoiceList choices={choices} onChoose={handleChoose} />
      <div className="flex flex-wrap items-center gap-2">
        <ObjectionPicker names={script.objectionNames} onSelect={handleObjection} />
        <Button type="button" variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
          <Undo2 aria-hidden className="h-3.5 w-3.5" />
          Voltar
        </Button>
      </div>
      <FreeReplyForm onSubmit={handleFreeText} />
      <NotesField notes={state.notes} onCommit={(value) => dispatch(setNotes(state, value))} />
    </div>
  );

  const diagnosisTabs = (
    <Tabs defaultValue="diagnostico">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
        <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        <TabsTrigger value="simulador">Simulador</TabsTrigger>
      </TabsList>
      <TabsContent value="diagnostico" className="pt-4">
        <DiagnosisSidebar lead={lead} state={state} dispatch={dispatch} onLeadUpdated={onLeadUpdated} />
      </TabsContent>
      <TabsContent value="indicadores" className="pt-4">
        <FactsForm state={state} dispatch={dispatch} />
      </TabsContent>
      {/* Montada sempre para o simulador manter os valores ao trocar de aba. */}
      <TabsContent value="simulador" forceMount className="pt-4 data-[state=inactive]:hidden">
        <FunnelSimulator key={lead.id} facts={state.facts} />
      </TabsContent>
    </Tabs>
  );

  const leadAndStages = (
    <>
      <LeadInfoCard lead={lead} state={state} dispatch={dispatch} />
      <StageList state={state} onGoToStage={(index) => dispatch(goToStage(state, index))} />
    </>
  );

  if (variant === 'call') {
    return (
      <section aria-label="Copiloto de vendas" className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <div className="order-2 min-w-0 space-y-4 lg:order-1">{leadAndStages}</div>
        <div className="order-1 min-w-0 space-y-5 lg:order-2">
          {statusBlock}
          {callBlock}
          <CopilotActions lead={lead} state={state} script={script} />
        </div>
        <div className="order-3 min-w-0 lg:order-3">{diagnosisTabs}</div>
      </section>
    );
  }

  if (variant === 'drawer') {
    return (
      <section aria-label="Copiloto de vendas" className="space-y-6">
        {statusBlock}
        {callBlock}
        <CopilotActions lead={lead} state={state} script={script} />
        {diagnosisTabs}
        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">Dados do prospect e etapas</summary>
          <div className="mt-4 space-y-4">{leadAndStages}</div>
        </details>
      </section>
    );
  }

  // compact: celular (/ramal). Resumo do diagnostico recolhido.
  return (
    <section aria-label="Copiloto de vendas" className="space-y-4">
      {statusBlock}
      {callBlock}
      <CopilotActions lead={lead} state={state} script={script} />
      <details className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-900">Ver diagnóstico</summary>
        <div className="mt-4 space-y-5">
          <DiagnosisSummary state={state} />
          <TemperatureSuggestion lead={lead} state={state} onLeadUpdated={onLeadUpdated} />
          <StageList state={state} onGoToStage={(index) => dispatch(goToStage(state, index))} />
        </div>
      </details>
    </section>
  );
}
