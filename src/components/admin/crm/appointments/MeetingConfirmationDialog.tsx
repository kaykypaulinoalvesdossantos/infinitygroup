'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Copy, ExternalLink, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DrawerLead } from '@/components/admin/crm/pipeline/drawer/types';
import { getStoredUser, type CrmAppointment } from '@/services/crm-leads';

interface MeetingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: CrmAppointment;
  lead: DrawerLead;
}

type Channel = 'WHATSAPP' | 'EMAIL';

const DEFAULT_TIMEZONE = 'America/Sao_Paulo';
const DATE_OPTIONS: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
const TIME_OPTIONS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

/** Formata no fuso do compromisso; cai no fuso padrao quando o nome do fuso for invalido. */
function formatInZone(iso: string, timeZone: string | null | undefined, options: Intl.DateTimeFormatOptions): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: timeZone || DEFAULT_TIMEZONE }).format(date);
  } catch {
    return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: DEFAULT_TIMEZONE }).format(date);
  }
}

function signerName(): string {
  return getStoredUser()?.name?.trim() || 'Equipe Infinity Groups';
}

function participantsOf(appointment: CrmAppointment): string[] {
  const names = [appointment.guestName, ...(appointment.attendees ?? [])]
    .map((item) => item?.trim() ?? '')
    .filter((item) => item.length > 0);
  return Array.from(new Set(names));
}

/** Linhas de detalhes do compromisso (data, horario, tema, objetivo, participantes, link). */
function detailLines(appointment: CrmAppointment): string[] {
  const zone = appointment.timezone;
  const lines = [
    `Data: ${formatInZone(appointment.startsAt, zone, DATE_OPTIONS)}`,
    `Horário: ${formatInZone(appointment.startsAt, zone, TIME_OPTIONS)} às ${formatInZone(appointment.endsAt, zone, TIME_OPTIONS)}`,
    `Tema: ${appointment.title}`,
  ];
  const objective = appointment.description?.trim();
  if (objective) lines.push(`Objetivo: ${objective}`);
  if (appointment.location?.trim()) lines.push(`Local: ${appointment.location.trim()}`);
  const participants = participantsOf(appointment);
  if (participants.length > 0) lines.push(`Participantes: ${participants.join(', ')}`);
  if (appointment.meetUrl) lines.push(`Link da reunião: ${appointment.meetUrl}`);
  return lines;
}

function greetingName(appointment: CrmAppointment, lead: DrawerLead): string {
  return appointment.guestName?.trim() || lead.name.trim();
}

export function buildWhatsAppText(appointment: CrmAppointment, lead: DrawerLead): string {
  return [
    `Olá, ${greetingName(appointment, lead)}!`,
    '',
    'Passando para confirmar nossa reunião:',
    '',
    ...detailLines(appointment),
    '',
    'Qualquer ajuste, é só me avisar.',
    '',
    'Atenciosamente,',
    signerName(),
    'Grupo Infinity',
  ].join('\n');
}

export function buildEmailText(appointment: CrmAppointment, lead: DrawerLead): string {
  const date = formatInZone(appointment.startsAt, appointment.timezone, DATE_OPTIONS);
  const time = formatInZone(appointment.startsAt, appointment.timezone, TIME_OPTIONS);
  return [
    `Assunto: Confirmação de reunião em ${date} às ${time}`,
    '',
    `Olá, ${greetingName(appointment, lead)}!`,
    '',
    'Confirmando nossa reunião:',
    '',
    ...detailLines(appointment),
    '',
    'Fico à disposição para qualquer ajuste.',
    '',
    'Atenciosamente,',
    signerName(),
    'Grupo Infinity',
  ].join('\n');
}

/** Numero no formato wa.me (55 + DDD + numero), sem duplicar o 55. Null quando faltam digitos. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.length >= 12 && digits.startsWith('55') ? digits : `55${digits}`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Sem permissao do navegador: usa o metodo alternativo abaixo.
    }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  document.body.removeChild(area);
  return copied;
}

export function MeetingConfirmationDialog({ open, onOpenChange, appointment, lead }: MeetingConfirmationDialogProps) {
  const textareaId = useId();
  const [channel, setChannel] = useState<Channel>('WHATSAPP');
  const [whatsappText, setWhatsappText] = useState(() => buildWhatsAppText(appointment, lead));
  const [emailText, setEmailText] = useState(() => buildEmailText(appointment, lead));
  const wasOpen = useRef(open);

  // Gera os textos de novo a cada abertura, sem apagar edicoes enquanto o dialogo esta aberto.
  useEffect(() => {
    if (open && !wasOpen.current) {
      setWhatsappText(buildWhatsAppText(appointment, lead));
      setEmailText(buildEmailText(appointment, lead));
      setChannel('WHATSAPP');
    }
    wasOpen.current = open;
  }, [open, appointment, lead]);

  const currentText = channel === 'WHATSAPP' ? whatsappText : emailText;
  const setCurrentText = channel === 'WHATSAPP' ? setWhatsappText : setEmailText;
  const number = whatsappNumber(lead.phone);
  const whatsappHref = number ? `https://wa.me/${number}?text=${encodeURIComponent(whatsappText)}` : null;

  const copy = async () => {
    const copied = await copyToClipboard(currentText);
    if (copied) toast.success(channel === 'WHATSAPP' ? 'Mensagem do WhatsApp copiada.' : 'Texto do e-mail copiado.');
    else toast.error('Não foi possível copiar. Selecione o texto e copie manualmente.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-link" aria-hidden />
            Mensagem de confirmação
          </DialogTitle>
          <DialogDescription>
            {lead.company || lead.name} · {formatInZone(appointment.startsAt, appointment.timezone, DATE_OPTIONS)} às{' '}
            {formatInZone(appointment.startsAt, appointment.timezone, TIME_OPTIONS)}. Você pode editar o texto antes de usar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Canal da mensagem">
          <Button
            type="button"
            size="sm"
            variant={channel === 'WHATSAPP' ? 'default' : 'outline'}
            aria-pressed={channel === 'WHATSAPP'}
            onClick={() => setChannel('WHATSAPP')}
          >
            <MessageCircle className="mr-1.5 h-4 w-4" aria-hidden />
            WhatsApp
          </Button>
          <Button
            type="button"
            size="sm"
            variant={channel === 'EMAIL' ? 'default' : 'outline'}
            aria-pressed={channel === 'EMAIL'}
            onClick={() => setChannel('EMAIL')}
          >
            <Mail className="mr-1.5 h-4 w-4" aria-hidden />
            E-mail
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor={textareaId}>{channel === 'WHATSAPP' ? 'Texto para WhatsApp' : 'Texto para e-mail (primeira linha é o assunto)'}</Label>
          <Textarea
            id={textareaId}
            rows={14}
            value={currentText}
            onChange={(event) => setCurrentText(event.target.value)}
            className="font-sans text-sm leading-relaxed"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => void copy()}>
            <Copy className="mr-2 h-4 w-4" aria-hidden />
            Copiar
          </Button>
          {channel === 'WHATSAPP' && whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'default' })}
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
              Abrir no WhatsApp
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
