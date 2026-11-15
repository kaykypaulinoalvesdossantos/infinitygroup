'use client';

import { CalendarPlus, Pencil, RefreshCw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { crmLeadsApi, type CrmAppointment } from '@/services/crm-leads';
import { Button } from '@/components/ui/button';
import { errorMessage, formatDateTime } from '@/components/admin/crm/format';
import { pipelineKeys } from '../../queryKeys';
import { APPOINTMENT_STATUS_LABEL, GOOGLE_SYNC_LABEL } from '../labels';
import { Section } from '../parts';
import { appointmentsKey, type DrawerLead } from '../types';

interface AgendaTabProps {
  lead: DrawerLead;
  appointments: CrmAppointment[];
  onEditAppointment: (appointment?: CrmAppointment) => void;
}

/** Compromissos do lead, com as mesmas acoes da gaveta antiga (editar, realizado, cancelar, sincronizar). */
export function AgendaTab({ lead, appointments, onEditAppointment }: AgendaTabProps) {
  const queryClient = useQueryClient();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: appointmentsKey(lead.id) });
    void queryClient.invalidateQueries({ queryKey: pipelineKeys.lead(lead.id) });
    void queryClient.invalidateQueries({ queryKey: pipelineKeys.columns() });
  };

  const syncMutation = useMutation({
    mutationFn: (appointmentId: number) => crmLeadsApi.syncAppointment(appointmentId),
    onSuccess: (updated) => {
      refresh();
      toast.success(
        updated.googleSyncStatus === 'SYNCED'
          ? 'Compromisso sincronizado.'
          : 'Não foi possível sincronizar; confira a conexão Google.',
      );
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível sincronizar o compromisso.')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, version }: { id: number; status: CrmAppointment['status']; version?: number }) =>
      crmLeadsApi.updateAppointmentStatus(id, status, version),
    onSuccess: (_updated, vars) => {
      refresh();
      toast.success(vars.status === 'CANCELLED' ? 'Compromisso cancelado.' : 'Compromisso atualizado.');
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível atualizar o compromisso.')),
  });

  return (
    <Section
      title="Compromissos"
      action={
        <Button type="button" size="sm" variant="outline" onClick={() => onEditAppointment(undefined)}>
          <CalendarPlus aria-hidden className="mr-1.5 h-4 w-4" />
          Novo
        </Button>
      }
    >
      {appointments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nenhum compromisso agendado.
        </p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="rounded-xl border border-[hsl(var(--card-border))] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{appointment.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDateTime(appointment.startsAt)} –{' '}
                    {new Date(appointment.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {APPOINTMENT_STATUS_LABEL[appointment.status]} · Google: {GOOGLE_SYNC_LABEL[appointment.googleSyncStatus]}
                  </p>
                </div>
                {appointment.googleSyncStatus !== 'SYNCED' && appointment.status !== 'CANCELLED' && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Sincronizar com Google"
                    title="Sincronizar com Google"
                    disabled={syncMutation.isPending}
                    onClick={() => syncMutation.mutate(appointment.id)}
                  >
                    <RefreshCw aria-hidden className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {appointment.status === 'SCHEDULED' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => onEditAppointment(appointment)}>
                    <Pencil aria-hidden className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: appointment.id, status: 'COMPLETED', version: appointment.version })}
                  >
                    Marcar realizado
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: appointment.id, status: 'CANCELLED', version: appointment.version })}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
