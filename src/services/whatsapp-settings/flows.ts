import { apiRequest } from '@/services/api';
import type { WaFlowGraph, WaFlowNodeType, WaFlowRun, WaFlowVersion } from './types';

/** Fluxos humanos. Contrato: wa-v2/CONTRACT.md (API /crm-leads/whatsapp/flows). */

const BASE = '/crm-leads/whatsapp/flows';

export interface FlowSimulationStep {
  node?: string;
  nodeId?: string;
  type?: WaFlowNodeType;
  label?: string;
  decision?: string;
  message?: string;
}

function normalizeSteps(response: unknown): FlowSimulationStep[] {
  if (Array.isArray(response)) return response as FlowSimulationStep[];
  if (response && typeof response === 'object' && Array.isArray((response as { steps?: unknown }).steps)) {
    return (response as { steps: FlowSimulationStep[] }).steps;
  }
  return [];
}

export const flowsApi = {
  list: async (): Promise<WaFlowVersion[]> => (await apiRequest(BASE)) ?? [],

  create: (input: { name: string; graph: WaFlowGraph }): Promise<WaFlowVersion> =>
    apiRequest(BASE, { method: 'POST', body: JSON.stringify(input) }),

  publish: (id: number): Promise<WaFlowVersion> => apiRequest(`${BASE}/${id}/publish`, { method: 'POST' }),

  simulate: async (input: { graph: WaFlowGraph; answers?: Record<string, string> }): Promise<FlowSimulationStep[]> =>
    normalizeSteps(await apiRequest(`${BASE}/simulate`, { method: 'POST', body: JSON.stringify(input) })),

  startRun: (input: { conversationId: number; versionId: number }): Promise<WaFlowRun> =>
    apiRequest(`${BASE}/runs`, { method: 'POST', body: JSON.stringify(input) }),

  listRuns: async (conversationId: number): Promise<WaFlowRun[]> =>
    (await apiRequest(`${BASE}/runs?conversationId=${encodeURIComponent(String(conversationId))}`)) ?? [],

  advance: (runId: number, decision?: string): Promise<WaFlowRun> =>
    apiRequest(`${BASE}/runs/${runId}/advance`, {
      method: 'POST',
      body: JSON.stringify(decision ? { decision } : {}),
    }),

  cancel: (runId: number): Promise<WaFlowRun> => apiRequest(`${BASE}/runs/${runId}/cancel`, { method: 'POST' }),
};
