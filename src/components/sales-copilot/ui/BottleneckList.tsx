'use client';

import { MoreVertical } from 'lucide-react';
import {
  BOTTLENECKS,
  LEVEL,
  LEVEL_NAMES,
  removeBottleneck,
  setBottleneck,
  type DiagnosisData,
  type EvidenceLevel,
} from '@/components/sales-copilot/engine';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEVEL_DOT_CLASS } from './copilot-format';

const EDITABLE_LEVELS: EvidenceLevel[] = ['hypothesis', 'reported', 'confirmed'];

/** Gargalos do diagnostico em tempo real, com nivel de evidencia, edicao e remocao. */
export function BottleneckList({
  state,
  dispatch,
}: {
  state: DiagnosisData;
  dispatch: (next: DiagnosisData) => void;
}) {
  const entries = Object.entries(state.bottlenecks).sort((a, b) => LEVEL[b[1].level] - LEVEL[a[1].level]);
  const available = BOTTLENECKS.filter((area) => !(area in state.bottlenecks));

  return (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
          Nenhum gargalo identificado até agora.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map(([area, entry]) => (
            <li key={area} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${LEVEL_DOT_CLASS[entry.level]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{area}</p>
                <p className="text-xs text-slate-500">{LEVEL_NAMES[entry.level]}</p>
                {entry.evidence && <p className="mt-1 text-sm text-slate-700">{entry.evidence}</p>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Opções do gargalo ${area}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Nível de evidência</DropdownMenuLabel>
                  {EDITABLE_LEVELS.map((level) => (
                    <DropdownMenuItem
                      key={level}
                      disabled={level === entry.level}
                      onSelect={() => dispatch(setBottleneck(state, area, level, entry.evidence))}
                    >
                      {LEVEL_NAMES[level]}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onSelect={() => dispatch(removeBottleneck(state, area))}
                  >
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 && (
        <Select
          value=""
          onValueChange={(area) => dispatch(setBottleneck(state, area, 'hypothesis', ''))}
        >
          <SelectTrigger aria-label="Adicionar dor" className="w-full bg-white">
            <SelectValue placeholder="Adicionar dor" />
          </SelectTrigger>
          <SelectContent>
            {available.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
