'use client';

import { useEffect, useState } from 'react';
import { CalendarPlus, Loader2, Link2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { crmLeadsApi, type CrmAppointment, type CrmLead } from '@/services/crm-leads';

function localDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function iso(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function AppointmentDialog({
  lead,
  open,
  onOpenChange,
  onSaved,
  appointment,
}: {
  lead: CrmLead;
  appointment?: CrmAppointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (appointment: CrmAppointment) => void;
}) {
  const appointmentId = appointment?.id;
  const appointmentStart = appointment?.startsAt;
  const appointmentEnd = appointment?.endsAt;
  const appointmentTitle = appointment?.title;
  const appointmentDescription = appointment?.description;
  const appointmentLocation = appointment?.location;
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [calendar, setCalendar] = useState<{ configured: boolean; connected: boolean; email: string | null; reconnectRequired: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const isEditing = Boolean(appointmentId);
    const start = appointmentStart ? new Date(appointmentStart) : new Date(Date.now() + 60 * 60_000);
    if (!isEditing) start.setSeconds(0, 0);
    const end = appointmentEnd ? new Date(appointmentEnd) : new Date(start.getTime() + 30 * 60_000);
    setStartsAt(localDateTime(start));
    setEndsAt(localDateTime(end));
    setTitle(appointmentTitle ?? `Reunião com ${lead.name}`.slice(0, 200));
    setDescription(appointmentDescription ?? '');
    setLocation(appointmentLocation ?? '');
    setError('');
    crmLeadsApi.googleCalendarStatus().then(setCalendar).catch(() => setCalendar(null));
  }, [appointmentDescription, appointmentEnd, appointmentId, appointmentLocation, appointmentStart, appointmentTitle, lead.name, open]);

  const connectCalendar = async () => {
    setConnecting(true);
    try {
      const result = await crmLeadsApi.connectGoogleCalendar();
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar a conexão Google.');
      setConnecting(false);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const startIso = iso(startsAt);
    const endIso = iso(endsAt);
    if (!startIso || !endIso || new Date(endIso) <= new Date(startIso)) {
      setError('Confira a data e o horário do compromisso.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body = {
        title: title.trim(),
        startsAt: startIso,
        endsAt: endIso,
        description: description.trim() || null,
        location: location.trim() || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
      };
      const saved = appointment
        ? await crmLeadsApi.updateAppointment(appointment.id, { ...body, expectedVersion: appointment.version })
        : await crmLeadsApi.createAppointment(lead.id, {
            ...body,
            description: body.description || undefined,
            location: body.location || undefined,
          });
      onSaved(saved);
      onOpenChange(false);
      toast.success(saved.googleSyncStatus === 'SYNCED' ? 'Compromisso salvo e sincronizado com Google Calendar.' : 'Compromisso salvo no CRM.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o compromisso.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarPlus className="h-5 w-5 text-[#0076FF]" /> {appointment ? 'Editar compromisso' : 'Agendar compromisso'}</DialogTitle>
          <DialogDescription>O evento ficará vinculado ao lead {lead.name} e será sincronizado com a conta Google conectada.</DialogDescription>
        </DialogHeader>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Link2 className="h-4 w-4" />Google Calendar</p>
            <p className="truncate text-xs text-slate-500">
              {calendar?.connected ? `Conectado: ${calendar.email || 'conta Google'}` : calendar?.configured === false ? 'A integração precisa ser configurada no servidor.' : 'Não conectado; o compromisso será salvo no CRM.'}
            </p>
          </div>
          {!calendar?.connected && calendar?.configured !== false && (
            <Button type="button" variant="outline" size="sm" onClick={() => void connectCalendar()} disabled={connecting}>
              {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Conectar
            </Button>
          )}
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="appointment-title">Título</Label>
            <Input id="appointment-title" maxLength={200} required value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="appointment-start">Início</Label><Input id="appointment-start" type="datetime-local" required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="appointment-end">Fim</Label><Input id="appointment-end" type="datetime-local" required value={endsAt} onChange={(event) => setEndsAt(event.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="appointment-location">Local ou link</Label><Input id="appointment-location" maxLength={500} placeholder="Endereço ou link da reunião" value={location} onChange={(event) => setLocation(event.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="appointment-description">Pauta / observações</Label><Textarea id="appointment-description" maxLength={5000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancelar</Button>
            <Button type="submit" disabled={busy || !title.trim()}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{appointment ? 'Salvar alterações' : 'Salvar compromisso'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
