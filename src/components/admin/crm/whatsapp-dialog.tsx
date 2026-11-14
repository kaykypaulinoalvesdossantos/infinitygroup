'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, PhoneCall, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { encodePcm, decodePcm } from '@/lib/whatsapp-pcm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { crmLeadsApi, type CrmLead, type CrmLeadActivity, type CrmWhatsAppChannel } from '@/services/crm-leads';

type CallStatus = 'IDLE' | 'CONNECTING' | 'RINGING' | 'ACTIVE' | 'ENDING' | 'ENDED';

const terminalCallStatuses = new Set([
  'COMPLETED',
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
    case 'RINGING':
      return `Chamando ${leadName} pelo WhatsApp…`;
    case 'ACTIVE':
      return `Em ligação com ${leadName}.`;
    case 'ENDING':
      return 'Encerrando a ligação…';
    case 'NO_ANSWER':
      return 'O contato não atendeu.';
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

export function WhatsAppDialog({
  lead,
  preferredChannelId,
  preferredConversationId,
  autoStartCall = false,
  callOnly = false,
  open,
  onOpenChange,
  onActivity,
  onCallTerminal,
}: {
  lead: CrmLead;
  preferredChannelId?: number | null;
  preferredConversationId?: number;
  autoStartCall?: boolean;
  callOnly?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivity: (activity: CrmLeadActivity) => void;
  onCallTerminal?: (activity: CrmLeadActivity) => void;
}) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [callState, setCallState] = useState<CallStatus>('IDLE');
  const [callMessage, setCallMessage] = useState('');
  const [activityId, setActivityId] = useState<number | null>(null);
  const [channels, setChannels] = useState<CrmWhatsAppChannel[]>([]);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const peer = useRef<RTCPeerConnection | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const autoStartAttemptedForLead = useRef<number | null>(null);
  const terminalNotified = useRef(false);
  const startCallRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (open) {
      setMessage(`Olá ${lead.name.split(' ')[0]}, aqui é do Infinity Groups. Conforme nossa conversa, estou enviando esta mensagem para continuarmos o atendimento.`);
      setChannelsLoading(true);
      void crmLeadsApi.listWhatsAppChannels()
        .then((items) => {
          setChannels(items);
          const ready = items.filter((item) => item.status === 'CONNECTED');
          const preferred = preferredChannelId === null || preferredChannelId === undefined
            ? undefined
            : ready.find((item) => item.id === preferredChannelId);
          setChannelId((preferred ?? ready.find((item) => item.isDefault) ?? ready[0])?.id ?? null);
        })
        .catch((error) => {
          setChannels([]);
          setChannelId(null);
          toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os números conectados.');
        })
        .finally(() => setChannelsLoading(false));
    }
  }, [lead.name, open, preferredChannelId]);

  const connectedChannels = channels.filter((item) => item.status === 'CONNECTED');
  const selectedChannel = connectedChannels.find((item) => item.id === channelId) ?? null;
  const hasSelectedChannel = selectedChannel !== null;
  const selectedChannelVoiceSessionConfigured = selectedChannel?.voiceSessionConfigured ?? false;

  function releaseAudio() {
    if (peer.current) peer.current.onconnectionstatechange = null;
    peer.current?.close();
    peer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void audioContext.current?.close();
    audioContext.current = null;
    if (audio.current) audio.current.srcObject = null;
  }

  useEffect(() => () => releaseAudio(), []);

  useEffect(() => {
    if (!open || !activityId || !['RINGING', 'ACTIVE', 'ENDING'].includes(callState)) return;
    let cancelled = false;
    let checking = false;
    const check = async () => {
      if (cancelled || checking) return;
      checking = true;
      try {
        const activity = await crmLeadsApi.whatsappCallStatus(activityId);
        if (cancelled) return;
        onActivity(activity);
        const status = callStatus(activity);
        setCallMessage(callStatusMessage(status, lead.name));
        if (terminalCallStatuses.has(status)) {
          releaseAudio();
          setCallState('ENDED');
          if (!terminalNotified.current) {
            terminalNotified.current = true;
            onCallTerminal?.(activity);
          }
        } else if (status === 'ACTIVE') {
          setCallState('ACTIVE');
        } else if (status === 'ENDING') {
          setCallState('ENDING');
        } else if (['DIALING', 'RINGING'].includes(status)) {
          setCallState('RINGING');
        }
      } catch {
        // Keep the current call visible while the provider history is briefly unavailable.
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
  }, [activityId, callState, lead.name, onActivity, onCallTerminal, open]);

  const startCall = async () => {
    if (busy || ['CONNECTING', 'RINGING', 'ACTIVE', 'ENDING'].includes(callState)) return;
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      toast.error('A ligação pelo WhatsApp precisa ser aberta em HTTPS para acessar o microfone.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Este navegador não permite acessar o microfone.');
      return;
    }

    setBusy(true);
    setCallState('CONNECTING');
    setCallMessage('Conectando à sessão WaCalls…');
    setActivityId(null);
    terminalNotified.current = false;
    let startedActivityId: number | null = null;
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext.current = new AudioContext({ sampleRate: 16000 });
      const context = audioContext.current;
      if (context.sampleRate !== 16000) throw new Error('Navegador não suporta áudio a 16 kHz.');
      await Promise.all([
        context.audioWorklet.addModule('/worklets/inbox-capture.js'),
        context.audioWorklet.addModule('/worklets/inbox-playback.js'),
      ]);
      await context.resume();

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
        await audio.current.play().catch(() => toast.info('Autorize a reprodução de áudio no navegador.'));
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

      const prepared = preferredConversationId
        ? await crmLeadsApi.startWhatsAppThreadCall(preferredConversationId)
        : await crmLeadsApi.startWhatsAppCall(lead.id, channelId);
      startedActivityId = prepared.activity.id;
      setActivityId(prepared.activity.id);
      onActivity(prepared.activity);
      setCallState('RINGING');
      setCallMessage(`Chamando ${lead.name} pelo WhatsApp…`);
      const offer = connection.localDescription?.sdp;
      if (!offer) throw new Error('Oferta de áudio indisponível.');
      const response = await crmLeadsApi.whatsappCallWebrtc(prepared.activity.id, offer);
      await connection.setRemoteDescription({ type: 'answer', sdp: response.sdpAnswer });
    } catch (err) {
      releaseAudio();
      const errorMessage = err instanceof Error ? err.message : 'Não foi possível iniciar a ligação pelo WhatsApp.';
      setCallMessage(errorMessage);
      toast.error(errorMessage);
      if (startedActivityId) {
        setCallState('ENDING');
        void crmLeadsApi.hangupWhatsAppCall(startedActivityId).catch(() => undefined);
      } else setCallState('ENDED');
    } finally {
      setBusy(false);
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
      !hasSelectedChannel ||
      autoStartAttemptedForLead.current === lead.id
    ) return;

    autoStartAttemptedForLead.current = lead.id;
    if (!selectedChannelVoiceSessionConfigured) {
      setCallState('ENDED');
      setCallMessage('Vincule uma sessão WaCalls a este número para ligar pelo WhatsApp.');
      return;
    }
    startCallRef.current();
  }, [autoStartCall, channelsLoading, hasSelectedChannel, lead.id, open, selectedChannelVoiceSessionConfigured]);

  const endCall = async () => {
    if (!activityId || busy) return;
    setBusy(true);
    try {
      const activity = await crmLeadsApi.hangupWhatsAppCall(activityId);
      onActivity(activity);
      setCallState('ENDING');
      setCallMessage('Encerrando a ligação…');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível encerrar a ligação.');
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || busy) return;
    setBusy(true);
    try {
      const result = await crmLeadsApi.sendWhatsApp(lead.id, message.trim(), channelId);
      onActivity(result.activity);
      onOpenChange(false);
      toast.success('Mensagem enviada pelo Evolution.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem pela Evolution.');
    } finally {
      setBusy(false);
    }
  };

  const calling = ['CONNECTING', 'RINGING', 'ACTIVE', 'ENDING'].includes(callState);
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && calling) {
      toast.error('Encerre a ligação antes de fechar esta janela.');
      return;
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <audio ref={audio} autoPlay aria-label="Áudio da chamada" className="hidden" />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-emerald-600" />WhatsApp · {lead.name}</DialogTitle>
          <DialogDescription>{callOnly
            ? 'Tentativa de ligação pelo WhatsApp usando a sessão WaCalls vinculada ao número selecionado.'
            : 'Mensagens são enviadas pela Evolution. Ligações usam a sessão WaCalls separada. Nenhuma operação passa pela API oficial da Meta.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="whatsapp-channel">Número remetente</Label>
          <select
            id="whatsapp-channel"
            value={channelId === null ? '' : String(channelId)}
            onChange={(event) => setChannelId(event.target.value ? Number(event.target.value) : null)}
            disabled={channelsLoading || calling || connectedChannels.length === 0}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
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
            <p className="text-xs text-amber-700">Um administrador precisa conectar um número em Atendimento → Configurações → WhatsApp.</p>
          )}
        </div>
        {!callOnly && <div className="space-y-2">
          <Label htmlFor="whatsapp-message">Mensagem</Label>
          <Textarea id="whatsapp-message" rows={5} maxLength={3000} value={message} onChange={(event) => setMessage(event.target.value)} />
        </div>}
        {callState !== 'IDLE' && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900" role="status" aria-live="polite">
            {callMessage}
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={busy || calling}>Fechar</Button>
          {callState === 'CONNECTING' ? (
            <Button type="button" variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />Conectando…
            </Button>
          ) : calling ? (
            <Button type="button" variant="destructive" onClick={() => void endCall()} disabled={busy || callState === 'ENDING'}>
              <PhoneOff className="mr-2 h-4 w-4" />Encerrar ligação
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => void startCall()} disabled={busy || !selectedChannel || !selectedChannel.voiceSessionConfigured} className="border-green-200 text-green-700 hover:bg-green-50">
              <PhoneCall className="mr-2 h-4 w-4" />
              {callState === 'ENDED' ? 'Ligar novamente' : 'Ligar pelo WhatsApp'}
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
