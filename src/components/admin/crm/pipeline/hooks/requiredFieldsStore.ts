'use client';

import { useSyncExternalStore } from 'react';
import type { PipelineLead } from '@/services/crm-pipeline';
import type { RequiredFieldValues } from './requiredFields';

/** Pedido de preenchimento de campos antes de mover (RequiredFieldsDialog). */
export interface RequiredFieldsRequest {
  lead: PipelineLead;
  fields: string[];
  stageName: string;
  onConfirm: (values: RequiredFieldValues) => void;
}

let current: RequiredFieldsRequest | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => current;

export function requestRequiredFields(request: RequiredFieldsRequest) {
  current = request;
  emit();
}

export function clearRequiredFields() {
  current = null;
  emit();
}

/** Pedido atual (ou null). Lido pelo dialogo montado na pagina. */
export function useRequiredFieldsRequest() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
