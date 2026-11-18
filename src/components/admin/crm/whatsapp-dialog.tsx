'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, PhoneCall, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { playCallFeedback } from '@/lib/call-feedback-audio';
import { encodePcm, decodePcm } from '@/lib/whatsapp-pcm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { crmLeadsApi, getStoredUser, type CrmAppointment, type CrmLead, type CrmLeadActivity, type CrmMessageTemplate, type CrmWhatsAppChannel } from '@/services/crm-leads';
import { voiceApi, voiceReadinessLabels } from '@/services/whatsapp-settings/voice';
import { WhatsAppTemplatePicker, type WhatsAppTemplateReference } from '@/components/admin/crm/whatsapp-template-picker';
import { telephonyService, type PhoneCall as RamalCall } from '@/services/telephony';
import { formatPhone } from '@/components/admin/crm/format';

type CallStatus = 'IDLE' | 'CONNECTING' | 'DIALING' | 'RINGING' | 'ACTIVE' | 'RECONNECTING' | 'ENDING' | 'ENDED';

const liveCallStatuses = new Set<CallStatus>(['DIALING', 'RINGING', 'ACTIVE', 'RECONNECTING', 'ENDING']);

const terminalCallStatuses = new Set([
  'COMPLETED',
  'VOICEMAIL',
  'NO_ANSWER',
  'REJECTED',
  'FAILED',
  'CANCELLED',
  'DISCONNECTED',
]);

function callStatus(activity: CrmLeadActivity) {
  const value = activity.metadata?.callStatus ?? activity.outcome ?? '';
  return String(value).toUpperCase();
}

function callStatusMessage(status: string, leadName: string) {
  switch (status) {
    case 'DIALING':
      return 'Discando. Aguardando confirmação do WhatsApp…';
    case 'RINGING':
      return `Chamando ${leadName} pelo WhatsApp…`;
    case 'ACTIVE':
      return `Em ligação com ${leadName}.`;
    case 'RECONNECTING':
      return 'Reconectando a ligação…';
    case 'ENDING':
      return 'Encerrando a ligação…';
    case 'NO_ANSWER':
      return 'O contato não atendeu.';
    case 'VOICEMAIL':
      return 'A ligação caiu na caixa postal.';
    case 'REJECTED':
      return 'O contato recusou a ligação.';
    case 'FAILED':
      return 'A ligação falhou.';
    case 'DISCONNECTED':
      return 'A ligação foi desconectada.';
    case 'CANCELLED':
      return 'Ligação cancelada.';
    case 'COMPLETED':
      return 'Ligação encerrada.';
    default:
      return 'Aguardando estado da ligação…';
  }
}

async function openMicrophone() {
  let timer = 0;
  let expired = false;
  const request = navigator.mediaDevices.getUserMedia({ audio: true }).then((microphone) => {
    if (expired) microphone.getTracks().forEach((track) => track.stop());
    return microphone;
  });
  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timer = window.setTimeout(() => {
          expired = true;
          reject(new Error('O microfone ficou aguardando permissão. Autorize no navegador e tente novamente.'));
        }, 25000);
      }),
    ]);
  } finally {
    window.clearTimeout(timer);
  }
}

export function WhatsAppDialog({
  lead,
  preferredChannelId,
  preferredConversationId,
  preferredRecipientPhone,
  fallbackCall,
  autoStartCall = false,
  callOnly = false,
  open,
  onOpenChange,
  onActivity,
}: {
  lead: CrmLead;
  preferredChannelId?: number | null;
  preferredConversationId?: number;
  preferredRecipientPhone?: string | null;
  fallbackCall?: RamalCall;
  autoStartCall?: boolean;
  callOnly?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivity: (activity: CrmLeadActivity) => void;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [callState, setCallState] = useState<CallStatus>('IDLE');
  const [callMessage, setCallMessage] = useState('');
  const [activityId, setActivityId] = useState<number | null>(null);
  const [statusUnavailable, setStatusUnavailable] = useState(false);
  const [callFailed, setCallFailed] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [channels, setChannels] = useState<CrmWhatsAppChannel[]>([]);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [voiceChannelId, setVoiceChannelId] = useState<number | null>(null);
  const [voiceUnavailableReason, setVoiceUnavailableReason] = useState('');
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [messageTemplates, setMessageTemplates] = useState<CrmMessageTemplate[]>([]);
  const [appointments, setAppointments] = useState<CrmAppointment[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CrmMessageTemplate | null>(null);
  const sendOperation = useRef<{ key: string; id: string } | null>(null);
  const peer = useRef<RTCPeerConnection | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const activityCallback = useRef(onActivity);
  const lastStatus = useRef('');
  const autoStartAttemptedForLead = useRef<number | null>(null);
  const callAttempt = useRef(0);
  const startCallRef = useRef<() => void>(() => undefined);
  const cancelRequested = useRef(false);
  const startRequestStarted = useRef(false);
  const activityIdRef = useRef<number | null>(null);
  const hangupRequests = useRef(new Map<number, Promise<CrmLeadActivity>>());
  const recipientPhone = fallbackCall?.phone ?? preferredRecipientPhone;
  const fallbackResult = fallbackCall?.disposition;
  const canRedialByPhone = fallbackResult === 'NO_ANSWER' || fallbackResult === 'VOICEMAIL';

  useEffect(() => { activityCallback.current = onActivity; }, [onActivity]);

  useEffect(() => {
    if (!open) return;
    sendOperation.current = null;
    let active = true;
    setMessage(`Olá ${lead.name.split(' ')[0]}, aqui é do Infinity Groups. Conforme nossa conversa, estou enviando esta mensagem para continuarmos o atendimento.`);
    setSelectedTemplate(null);
    setChannelsLoading(true);
    setVoiceChannelId(null);
    setVoiceUnavailableReason('');
    void crmLeadsApi.listWhatsAppChannels()
      .then(async (items) => {
        if (!active) return;
        setChannels(items);
        const connected = items.filter((item) => item.status === 'CONNECTED');
        const preferred = connected.find((item) => preferredChannelId != null && item.id === preferredChannelId);
        setChannelId((preferred ?? connected.find((item) => item.isDefault) ?? connected[0])?.id ?? null);
        const candidateIds = connected.flatMap((item) =>
          item.id !== null &&
          (!preferredConversationId || item.id === preferredChannelId) ? [item.id] : [],
        );
        const capacity = await Promise.allSettled(candidateIds.map((id) => voiceApi.capacity(id)));
        const readyIndex = capacity.findIndex((result) =>
          result.status === 'fulfilled' && result.value.readinessReason === 'READY' && result.value.available > 0,
        );
        if (!active) return;
        setVoiceChannelId(candidateIds[readyIndex] ?? null);
        if (readyIndex < 0) {
          const result = capacity[0];
          if (!result) {
            setVoiceUnavailableReason('O canal de WhatsApp da ligação está desconectado.');
          } else if (result.status === 'rejected') {
            setVoiceUnavailableReason('Não foi possível consultar a linha de voz. Feche e abra a ligação para tentar novamente.');
          } else {
            const reason = result.value.readinessReason;
            setVoiceUnavailableReason(reason === 'READY'
              ? 'Todas as linhas deste canal estão ocupadas. Tente novamente em instantes.'
              : voiceReadinessLabels[reason]);
          }
        }
      })
      .catch((error) => {
        if (!active) return;
        setChannels([]);
        setChannelId(null);
        setVoiceUnavailableReason('Não foi possível consultar os canais de voz. Feche e abra a ligação para tentar novamente.');
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os números conectados.');
      })
      .finally(() => { if (active) setChannelsLoading(false); });
    return () => { active = false; };
  }, [lead.name, open, preferredChannelId, preferredConversationId]);

  useEffect(() => {
    if (!open || callOnly) return;
    let active = true;
    void Promise.all([
      crmLeadsApi.listMessageTemplates({ channel: 'WHATSAPP' }).catch(() => []),
      crmLeadsApi.listAppointments(lead.id).catch(() => []),
    ]).then(([templates, leadAppointments]) => {
      if (!active) return;
      setMessageTemplates(templates);
      setAppointments(leadAppointments);
    });
    return () => { active = false; };
  }, [callOnly, lead.id, open]);

  const connectedChannels = channels.filter((item) => item.status === 'CONNECTED');
  const selectedChannel = connectedChannels.find((item) => item.id === channelId) ?? null;
  const availableTemplates = messageTemplates.filter((template) =>
    !template.productInterest || lead.productInterests.includes(template.productInterest),
  );
  const upcomingAppointment = appointments
    .filter((appointment) => appointment.status === 'SCHEDULED' && new Date(appointment.startsAt).getTime() >= Date.now())
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())[0] ?? null;

  function releaseAudio() {
    if (peer.current) peer.current.onconnectionstatechange = null;
    peer.current?.close();
    peer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    if (audioContext.current) {
      audioContext.current.onstatechange = null;
      void audioContext.current.close();
    }
    audioContext.current = null;
    if (audio.current) audio.current.srcObject = null;
  }

  function requestHangup(id: number) {
    const current = hangupRequests.current.get(id);
    if (current) return current;
    const request = crmLeadsApi.hangupWhatsAppCall(id)
      .then((activity) => {
        activityCallback.current(activity);
        return activity;
      })
      .catch((error: unknown) => {
        hangupRequests.current.delete(id);
        throw error;
      });
    hangupRequests.current.set(id, request);
    return request;
  }

  useEffect(() => () => releaseAudio(), []);

  useEffect(() => {
    if (!open || audioPaused || statusUnavailable || !audioContext.current) return;
    if (callState === 'DIALING') return playCallFeedback(audioContext.current, 'dialing');
    if (callState === 'RINGING') return playCallFeedback(audioContext.current, 'ringing');
    if (callState === 'ACTIVE') return playCallFeedback(audioContext.current, 'connected');
  }, [audioPaused, callState, open, statusUnavailable]);

  useEffect(() => {
    if (!open || !activityId || !liveCallStatuses.has(callState)) return;
    let cancelled = false;
    let checking = false;
    let failures = 0;
    const check = async () => {
      if (cancelled || checking) return;
      checking = true;
      try {
        const activity = await crmLeadsApi.whatsappCallStatus(activityId);
        if (cancelled) return;
        const status = callStatus(activity);
        failures = 0;
        setStatusUnavailable(false);
        if (callState === 'ENDING' && !terminalCallStatuses.has(status)) return;
        if (lastStatus.current !== status) {
          lastStatus.current = status;
          activityCallback.current(activity);
        }
        setCallMessage(callStatusMessage(status, lead.name));
        if (terminalCallStatuses.has(status)) {
          releaseAudio();
          setCallFailed(status === 'FAILED' || status === 'DISCONNECTED');
          setCallState('ENDED');
          setBusy(false);
          if (autoStartCall && !canRedialByPhone) onOpenChange(false);
        } else if (liveCallStatuses.has(status as CallStatus)) {
          setCallState(status as CallStatus);
        }
      } catch {
        if (!cancelled && ++failures >= 2) setStatusUnavailable(true);
      } finally {
        checking = false;
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activityId, autoStartCall, callState, canRedialByPhone, lead.name, onOpenChange, open]);

  const startCall = async () => {
    if (voiceChannelId === null || busy || callState === 'CONNECTING' || liveCallStatuses.has(callState)) return;
    const attemptId = ++callAttempt.current;
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast.error('A ligação pelo WhatsApp precisa ser aberta em HTTPS para acessar o microfone.');
      if (autoStartCall && !canRedialByPhone) onOpenChange(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Este navegador não permite acessar o microfone.');
      if (autoStartCall && !canRedialByPhone) onOpenChange(false);
      return;
    }

    setBusy(true);
    setCallState('CONNECTING');
    setCallMessage('Preparando o áudio. Autorize o microfone se o navegador pedir.');
    setActivityId(null);
    activityIdRef.current = null;
    cancelRequested.current = false;
    startRequestStarted.current = false;
    setStatusUnavailable(false);
    setCallFailed(false);
    lastStatus.current = '';
    let startedActivityId: number | null = null;
    try {
      const context = new AudioContext({ sampleRate: 16000 });
      audioContext.current = context;
      if (context.sampleRate !== 16000) throw new Error('Navegador não suporta áudio a 16 kHz.');
      setAudioPaused(context.state !== 'running');
      context.onstatechange = () => setAudioPaused(context.state !== 'running');
      void context.resume().catch(() => undefined);
      const microphone = await openMicrophone();
      if (attemptId !== callAttempt.current || cancelRequested.current || audioContext.current !== context) {
        microphone.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = microphone;
      await Promise.all([
        context.audioWorklet.addModule('/worklets/inbox-capture.js'),
        context.audioWorklet.addModule('/worklets/inbox-playback.js'),
      ]);
      if (attemptId !== callAttempt.current || cancelRequested.current) return;

      const connection = new RTCPeerConnection({ iceServers: [] });
      peer.current = connection;
      const dataChannel = connection.createDataChannel('pcm', { ordered: true });
      dataChannel.binaryType = 'arraybuffer';
      const capture = new AudioWorkletNode(context, 'inbox-capture');
      const playback = new AudioWorkletNode(context, 'inbox-playback');
      const destination = context.createMediaStreamDestination();
      context.createMediaStreamSource(stream.current).connect(capture);
      capture.connect(context.destination);
      capture.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (dataChannel.readyState === 'open' && dataChannel.bufferedAmount < 64000) {
          dataChannel.send(encodePcm(event.data));
        }
      };
      playback.connect(destination);
      dataChannel.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        if (event.data instanceof ArrayBuffer && event.data.byteLength <= 64000) {
          playback.port.postMessage(decodePcm(event.data));
        }
      };
      if (audio.current) {
        audio.current.srcObject = destination.stream;
        void audio.current.play().catch(() => setAudioPaused(true));
      }
      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'failed') {
          setCallMessage('A conexão de áudio falhou.');
        }
      };
      await connection.setLocalDescription(await connection.createOffer());
      await new Promise<void>((resolve, reject) => {
        if (connection.iceGatheringState === 'complete') return resolve();
        const timer = window.setTimeout(() => {
          connection.removeEventListener('icegatheringstatechange', check);
          reject(new Error('Tempo de negociação de áudio excedido.'));
        }, 10000);
        function check() {
          if (connection.iceGatheringState === 'complete') {
            window.clearTimeout(timer);
            connection.removeEventListener('icegatheringstatechange', check);
            resolve();
          }
        }
        connection.addEventListener('icegatheringstatechange', check);
      });
      if (attemptId !== callAttempt.current || cancelRequested.current) return;

      setCallState('DIALING');
      setCallMessage(callStatusMessage('DIALING', lead.name));
      startRequestStarted.current = true;
      const prepared = preferredConversationId
        ? await crmLeadsApi.startWhatsAppThreadCall(preferredConversationId)
        : await crmLeadsApi.startWhatsAppCall(lead.id, voiceChannelId, recipientPhone, fallbackCall?.id);
      startRequestStarted.current = false;
      startedActivityId = prepared.activity.id;
      activityIdRef.current = prepared.activity.id;
      setActivityId(prepared.activity.id);
      lastStatus.current = callStatus(prepared.activity);
      activityCallback.current(prepared.activity);
      if (cancelRequested.current) {
        setCallState('ENDING');
        setCallMessage('Cancelando a ligação…');
        await requestHangup(prepared.activity.id);
        return;
      }
      setCallState('RINGING');
      setCallMessage(callStatusMessage('RINGING', lead.name));
      const offer = connection.localDescription?.sdp;
      if (!offer) throw new Error('Oferta de áudio indisponível.');
      const response = await crmLeadsApi.whatsappCallWebrtc(prepared.activity.id, offer);
      if (peer.current !== connection) return;
      await connection.setRemoteDescription({ type: 'answer', sdp: response.sdpAnswer });
    } catch (err) {
      if (attemptId !== callAttempt.current) return;
      releaseAudio();
      if (cancelRequested.current) {
        setCallFailed(false);
        if (startedActivityId) {
          setCallState('ENDING');
          setCallMessage('Cancelando a ligação…');
          try {
            await requestHangup(startedActivityId);
          } catch (hangupError) {
            cancelRequested.current = false;
            setCallFailed(true);
            setCallState('DIALING');
            const message = hangupError instanceof Error ? hangupError.message : 'Não foi possível cancelar a ligação.';
            setCallMessage(message);
            toast.error(message);
          }
        } else {
          setCallState('ENDED');
          setCallMessage('Discagem cancelada.');
        }
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível iniciar a ligação pelo WhatsApp.';
      setCallFailed(true);
      setCallMessage(errorMessage);
      toast.error(errorMessage);
      if (startedActivityId) {
        setCallState('ENDING');
        void crmLeadsApi.hangupWhatsAppCall(startedActivityId).catch(() => undefined);
      } else if (autoStartCall && !canRedialByPhone) {
        onOpenChange(false);
      } else {
        setCallState('ENDED');
      }
    } finally {
      if (attemptId === callAttempt.current) {
        startRequestStarted.current = false;
        if (cancelRequested.current && !activityIdRef.current) {
          setCallState('ENDED');
          setCallMessage('Discagem cancelada.');
        }
        setBusy(false);
      }
    }
  };

  startCallRef.current = () => void startCall();

  useEffect(() => {
    if (!open) {
      autoStartAttemptedForLead.current = null;
      return;
    }
    if (
      !autoStartCall ||
      channelsLoading ||
      autoStartAttemptedForLead.current === lead.id
    ) return;

    autoStartAttemptedForLead.current = lead.id;
    if (voiceChannelId === null) {
      const message = 'Nenhuma linha de voz do WhatsApp está disponível agora.';
      if (canRedialByPhone) {
        setCallMessage(message);
        setCallState('ENDED');
      } else {
        toast.error(message);
        onOpenChange(false);
      }
      return;
    }
    startCallRef.current();
  }, [autoStartCall, canRedialByPhone, channelsLoading, lead.id, onOpenChange, open, voiceChannelId]);

  const endCall = async () => {
    if (callState === 'ENDING' || cancelRequested.current) return;
    const previousState = callState;
    const previousMessage = callMessage;
    cancelRequested.current = true;
    releaseAudio();
    setCallState('ENDING');
    const id = activityIdRef.current;
    if (!id) {
      if (!startRequestStarted.current) {
        setCallState('ENDED');
        setCallMessage('Discagem cancelada.');
        setCallFailed(false);
        setBusy(false);
      } else {
        setCallMessage('Cancelando a discagem…');
      }
      return;
    }
    const ownsBusy = !busy;
    if (ownsBusy) setBusy(true);
    setCallMessage('Encerrando a ligação…');
    try {
      await requestHangup(id);
      setCallState('ENDING');
      setCallMessage('Encerrando a ligação…');
    } catch (err) {
      cancelRequested.current = false;
      setCallState(previousState);
      setCallMessage(previousMessage);
      toast.error(err instanceof Error ? err.message : 'Não foi possível encerrar a ligação.');
    } finally {
      if (ownsBusy) setBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || busy) return;
    setBusy(true);
    try {
      const templateReference: WhatsAppTemplateReference | undefined = selectedTemplate
        ? { templateId: selectedTemplate.id, templateVersion: selectedTemplate.version }
        : undefined;
      const text = message.trim();
      const operationKey = JSON.stringify([lead.id, channelId, text, templateReference]);
      if (sendOperation.current?.key !== operationKey) {
        sendOperation.current = { key: operationKey, id: crypto.randomUUID() };
      }
      const result = await crmLeadsApi.sendWhatsApp(lead.id, text, channelId, templateReference, sendOperation.current.id);
      onActivity(result.activity);
      if (result.activity.outcome === 'PENDING') {
        toast.info('O envio ainda está em confirmação. Confira o histórico antes de repetir.');
        return;
      }
      if (result.activity.outcome !== 'SENT') {
        toast.error('O envio não foi confirmado. Confira o histórico da conversa.');
        return;
      }
      sendOperation.current = null;
      setSelectedTemplate(null);
      onOpenChange(false);
      toast.success('Mensagem enviada pelo Evolution.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem pela Evolution.');
    } finally {
      setBusy(false);
    }
  };

  const calling = callState === 'CONNECTING' || liveCallStatuses.has(callState);
  const preparing = callState === 'CONNECTING' || (callState === 'DIALING' && !activityId);
  const redialByPhone = async () => {
    const result = fallbackCall?.disposition;
    if (!fallbackCall || busy || calling || (result !== 'NO_ANSWER' && result !== 'VOICEMAIL')) return;
    setBusy(true);
    try {
      await telephonyService.setDisposition(fallbackCall.id, { result, redialPhone: true });
      toast.success('Rediscagem enviada para o celular.');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível rediscar pelo telefone.');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && busy && !calling) return;
    if (!nextOpen && calling) {
      toast.error('Encerre a ligação antes de fechar esta janela.');
      return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="grid-cols-[minmax(0,1fr)] [overflow-wrap:anywhere] sm:max-w-lg">
        <audio ref={audio} autoPlay aria-label="Áudio da chamada" className="hidden" />
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 leading-tight"><MessageCircle className="h-5 w-5 shrink-0 text-success-foreground" /><span>WhatsApp · {lead.name}</span></DialogTitle>
          <DialogDescription>{callOnly
            ? (recipientPhone ? `Ligação para ${formatPhone(recipientPhone)}` : 'Ligação pelo WhatsApp')
            : 'Mensagens são enviadas pela Evolution. Ligações usam a sessão WaCalls separada. Nenhuma operação passa pela API oficial da Meta.'}</DialogDescription>
        </DialogHeader>
        {fallbackCall && (
          <p className="text-sm text-muted-foreground">
            Tentativa anterior pelo chip · {fallbackResult === 'VOICEMAIL' ? 'Caixa postal' : fallbackCall.status === 'FAILED' ? 'Falha de discagem' : 'Sem atendimento'}
          </p>
        )}
        {!callOnly && <div className="space-y-2">
          <Label htmlFor="whatsapp-channel">Remetente da mensagem</Label>
          <select
            id="whatsapp-channel"
            value={channelId === null ? '' : String(channelId)}
            onChange={(event) => setChannelId(event.target.value ? Number(event.target.value) : null)}
            disabled={channelsLoading || calling || connectedChannels.length === 0}
            className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
          >
            {connectedChannels.length === 0 ? (
              <option value="">Nenhum número conectado</option>
            ) : connectedChannels.map((channel) => (
              <option key={channel.id ?? 'legacy'} value={channel.id === null ? '' : String(channel.id)}>
                {channel.name}{channel.phoneNumber ? ` · +${channel.phoneNumber}` : ''}{channel.isDefault ? ' · padrão' : ''}
              </option>
            ))}
          </select>
          {connectedChannels.length === 0 && (
            <p className="text-xs text-warning-foreground">Um administrador precisa conectar um número em Atendimento → Configurações → WhatsApp.</p>
          )}
        </div>}
        {channelsLoading && callOnly && (
          <p role="status" className="text-sm text-muted-foreground">Verificando a linha de voz…</p>
        )}
        {!channelsLoading && voiceChannelId === null && callState === 'IDLE' && voiceUnavailableReason && (
          <p role="status" className="text-sm text-warning-foreground">{voiceUnavailableReason}</p>
        )}
        {!callOnly && <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="whatsapp-message">Mensagem</Label>
            <WhatsAppTemplatePicker
              lead={lead}
              templates={availableTemplates}
              contact={null}
              appointment={upcomingAppointment}
              salesperson={getStoredUser()?.name}
              recipientPhone={preferredRecipientPhone}
              disabled={busy || calling}
              onApply={(template, text) => {
                setSelectedTemplate(template);
                setMessage(text);
              }}
            />
          </div>
          <Textarea id="whatsapp-message" rows={5} maxLength={3000} value={message} onChange={(event) => setMessage(event.target.value)} />
          {selectedTemplate && <p className="text-xs text-muted-foreground">Mensagem pronta aplicada: {selectedTemplate.name} · versão {selectedTemplate.version}. Revise o texto antes de enviar.</p>}
        </div>}
        {callState !== 'IDLE' && (
          <div className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${callFailed || statusUnavailable ? 'border-warning-border bg-warning text-warning-foreground' : callState === 'ACTIVE' || callState === 'RINGING' ? 'border-success-border bg-success text-success-foreground' : 'border-border bg-muted text-foreground'}`} role="status">
            {(preparing || callState === 'RECONNECTING' || callState === 'ENDING') && (
              <Loader2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 motion-safe:animate-spin" />
            )}
            {statusUnavailable && callState !== 'ENDING' ? 'Sem atualização do WhatsApp. Reconectando ao serviço de voz…' : callMessage}
          </div>
        )}
        {audioPaused && ['CONNECTING', 'DIALING', 'RINGING', 'ACTIVE'].includes(callState) && (
          <Button type="button" variant="outline" className="justify-self-start" onClick={() => {
            void Promise.all([audioContext.current?.resume(), audio.current?.srcObject ? audio.current.play() : undefined])
              .then(() => setAudioPaused(false))
              .catch(() => toast.error('O navegador bloqueou a reprodução de áudio.'));
          }}>Ativar som</Button>
        )}
        {fallbackCall?.whatsappFallbackPaused && !calling && (
          <p className="text-xs text-muted-foreground">A fila será retomada ao concluir ou ao rediscar por telefone.</p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy || calling}>{fallbackCall ? 'Concluir' : 'Fechar'}</Button>
          {preparing ? (
            <>
              <Button type="button" variant="outline" disabled>
                {callState === 'DIALING' ? 'Discando…' : 'Preparando áudio…'}
              </Button>
              <Button type="button" variant="destructive" onClick={() => void endCall()}>
                <PhoneOff className="mr-2 h-4 w-4" />Cancelar discagem
              </Button>
            </>
          ) : calling ? (
            <Button type="button" variant="destructive" onClick={() => void endCall()} disabled={callState === 'ENDING'}>
              <PhoneOff className="mr-2 h-4 w-4" />{callState === 'ENDING' ? (activityId ? 'Encerrando…' : 'Cancelando…') : (activityId ? 'Encerrar ligação' : 'Cancelar discagem')}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => void startCall()} disabled={busy || channelsLoading || voiceChannelId === null} className="border-success-border text-success-foreground hover:bg-success">
              <PhoneCall className="mr-2 h-4 w-4" />
              {callState === 'ENDED' ? 'Rediscar pelo WhatsApp' : 'Ligar pelo WhatsApp'}
            </Button>
          )}
          {canRedialByPhone && !calling && (
            <Button type="button" variant="outline" onClick={() => void redialByPhone()} disabled={busy}>
              <PhoneCall className="mr-2 h-4 w-4" />Rediscar por telefone
            </Button>
          )}
          {!callOnly && <Button type="button" onClick={() => void sendMessage()} disabled={busy || !message.trim() || calling || !selectedChannel}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
            Enviar mensagem
          </Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
