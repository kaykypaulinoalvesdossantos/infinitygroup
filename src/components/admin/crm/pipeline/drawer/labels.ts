import type { CrmAppointment, CrmLeadActivity } from '@/services/crm-leads';

export type ActivityFilter = 'ALL' | CrmLeadActivity['type'];

export const ACTIVITY_FILTERS: Array<{ value: ActivityFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CALL', label: 'Ligações' },
  { value: 'NOTE', label: 'Notas' },
  { value: 'STATUS', label: 'Etapas' },
  { value: 'APPOINTMENT', label: 'Agenda' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'E-mails' },
  { value: 'TASK', label: 'Pendências' },
];

/** Rotulos de tipo de atividade (mesmos de lead-dialogs: TASK = Pendencia). */
export const ACTIVITY_TITLE: Record<CrmLeadActivity['type'], string> = {
  CALL: 'Ligação',
  NOTE: 'Nota',
  STATUS: 'Mudança de etapa',
  APPOINTMENT: 'Compromisso',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  TASK: 'Pendência',
};

/** Rotulos de outcome copiados de ActivityItem (lead-dialogs.tsx). */
export const OUTCOME_LABEL: Record<string, string> = {
  PENDING: 'Enviando',
  SENT: 'Enviada',
  FAILED: 'Falhou',
  DIALING: 'Iniciada',
  RINGING: 'Chamando',
  ACTIVE: 'Em andamento',
  ENDING: 'Encerrando',
  UNKNOWN: 'Status não confirmado',
  NO_ANSWER: 'Não atendida',
  REJECTED: 'Recusada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Concluída',
  DISCONNECTED: 'Desconectada',
  CHAT_OPENED: 'Conversa aberta',
  OPT_IN: 'Autorização registrada',
  OPT_OUT: 'Contato bloqueado',
  UNBLOCKED: 'Contato desbloqueado',
  SCHEDULED: 'Agendado',
  RESCHEDULED: 'Reagendado',
  UPDATED: 'Compromisso atualizado',
};

export const DIRECTION_LABEL: Record<string, string> = {
  OUTBOUND: 'Saída',
  INBOUND: 'Entrada',
};

export const APPOINTMENT_STATUS_LABEL: Record<CrmAppointment['status'], string> = {
  SCHEDULED: 'Agendado',
  COMPLETED: 'Realizado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
};

export const GOOGLE_SYNC_LABEL: Record<CrmAppointment['googleSyncStatus'], string> = {
  SYNCED: 'Sincronizado',
  FAILED: 'Falhou',
  PENDING: 'Pendente',
  NOT_CONNECTED: 'Desconectado',
};
