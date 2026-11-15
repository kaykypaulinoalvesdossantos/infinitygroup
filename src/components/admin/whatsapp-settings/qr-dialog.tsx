'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getErrorMessage, formatPhone } from '@/components/atendimento/helpers';
import { channelsApi } from '@/services/whatsapp-settings/channels';
import type { WaChannel, WaQrResult } from '@/services/whatsapp-settings/types';

const STATE_INTERVAL_MS = 5000;
const QR_INTERVAL_WITHOUT_CODE_MS = 5000;
const QR_INTERVAL_WITH_CODE_MS = 25000;

export function QrDialog({
  channel,
  open,
  onOpenChange,
  onConnected,
}: {
  channel: WaChannel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}) {
  const channelId = channel.id;
  const channelName = channel.name;
  const [qr, setQr] = useState<WaQrResult | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrFetching, setQrFetching] = useState(false);
  const doneRef = useRef(false);
  const mountedRef = useRef(true);
  const onConnectedRef = useRef(onConnected);
  const onOpenChangeRef = useRef(onOpenChange);
  const requestRef = useRef(0);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onOpenChangeRef.current = onOpenChange;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const hasQrCode = Boolean(qr?.qrCode);

  const fetchQr = useCallback(async () => {
    const requestId = ++requestRef.current;
    setQrFetching(true);
    try {
      const data = await channelsApi.qr(channelId);
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setQr(data);
      setQrError(null);
    } catch (err) {
      if (!mountedRef.current || requestId !== requestRef.current) return;
      setQrError(getErrorMessage(err, 'Não foi possível carregar o QR Code.'));
    } finally {
      if (mountedRef.current && requestId === requestRef.current) setQrFetching(false);
    }
  }, [channelId]);

  // Reinicia o estado ao abrir e busca o QR imediatamente.
  useEffect(() => {
    if (!open) return;
    doneRef.current = false;
    setQr(null);
    setQrError(null);
    void fetchQr();
  }, [open, fetchQr]);

  // Polling do QR: 5 s sem código, 25 s depois que ele existe.
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) void fetchQr();
    }, hasQrCode ? QR_INTERVAL_WITH_CODE_MS : QR_INTERVAL_WITHOUT_CODE_MS);
    return () => window.clearInterval(timer);
  }, [open, hasQrCode, fetchQr]);

  // Polling do estado de conexão: detecta quando o celular foi pareado.
  useEffect(() => {
    if (!open) return;
    const check = async () => {
      if (document.hidden || doneRef.current) return;
      try {
        const state = await channelsApi.state(channelId);
        if (doneRef.current || !mountedRef.current) return;
        if (state.status === 'CONNECTED' || state.connected) {
          doneRef.current = true;
          const phone = state.phoneNumber ? formatPhone(state.phoneNumber) : null;
          toast.success(phone ? `WhatsApp conectado · ${phone}` : 'WhatsApp conectado');
          onOpenChangeRef.current(false);
          onConnectedRef.current();
        }
      } catch {
        // Falhas pontuais de estado não interrompem o QR; a próxima tentativa roda em 5 s.
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), STATE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [open, channelId]);

  const showQr = Boolean(qr?.qrCode?.startsWith('data:image/'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Conectar WhatsApp</DialogTitle>
          <DialogDescription>
            No celular, abra Dispositivos conectados e leia este QR Code para vincular {channelName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4">
          {showQr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr?.qrCode ?? undefined}
              width={256}
              height={256}
              alt="QR Code para conectar o canal WhatsApp"
              className="h-64 w-64 object-contain"
            />
          ) : qrError ? (
            <div className="space-y-3 text-center">
              <p role="alert" className="text-sm text-slate-600">
                Não foi possível carregar o QR Code agora.
              </p>
              <Button type="button" variant="outline" className="min-h-11" disabled={qrFetching} onClick={() => void fetchQr()}>
                {qrFetching ? 'Tentando…' : 'Tentar novamente'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-600" role="status">
              Preparando o QR Code…
            </p>
          )}
        </div>

        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>No celular, abra o WhatsApp.</li>
          <li>Toque em Dispositivos conectados e depois em Conectar dispositivo.</li>
          <li>Aponte a câmera para este QR Code.</li>
        </ol>
        <p className="text-center text-xs text-slate-500">O código é atualizado automaticamente enquanto esta janela estiver aberta.</p>

        <DialogFooter>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
