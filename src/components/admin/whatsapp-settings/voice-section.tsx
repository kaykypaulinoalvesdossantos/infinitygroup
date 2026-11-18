'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Loader2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getErrorMessage } from '@/components/atendimento/helpers';
import { voiceApi, voiceReadinessLabels } from '@/services/whatsapp-settings/voice';
import type { VoiceCapacity, VoicePairing, WaChannel } from '@/services/whatsapp-settings/types';

const PRIMARY = 'hsl(var(--primary))';
const PAIRING_POLL_MS = 3000;
const CAPACITY_REFRESH_MS = 10000;
const MIN_CAPACITY = 1;
const MAX_CAPACITY = 32;

export function VoiceSection({ channel }: { channel?: WaChannel }) {
  if (!channel) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Selecione um canal para configurar as chamadas.
      </div>
    );
  }
  if (channel.status !== 'CONNECTED') {
    return (
      <div className="rounded-xl border border-warning-border bg-warning px-4 py-4 text-sm text-warning-foreground">
        Conecte o WhatsApp de mensagens deste canal antes de configurar as chamadas.
      </div>
    );
  }
  return <VoiceContent channelId={channel.id} />;
}

function VoiceContent({ channelId }: { channelId: number }) {
  return (
    <div className="space-y-4">
      <PairingCard channelId={channelId} />
      <CapacityCard channelId={channelId} />
    </div>
  );
}

function PairingCard({ channelId }: { channelId: number }) {
  const [pairing, setPairing] = useState<VoicePairing | null>(null);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const ready = pairing?.ready === true;

  // Consulta o pareamento a cada 3 s até ficar pronto; para ao confirmar.
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      try {
        const data = await voiceApi.pairing(channelId);
        if (cancelled) return;
        setPairing(data);
        setPairingError(null);
        if (data.ready) return;
      } catch (error) {
        if (cancelled) return;
        setPairingError(getErrorMessage(error, 'Não foi possível consultar a voz.'));
      }
      if (!cancelled) timer = window.setTimeout(() => void tick(), PAIRING_POLL_MS);
    };

    void tick();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [channelId, reloadKey]);

  const prepare = async () => {
    setPreparing(true);
    try {
      if (pairing?.state === 'pending') await voiceApi.reconcile(channelId);
      else if (pairing?.sessionCreated) await voiceApi.renew(channelId);
      else await voiceApi.pair(channelId);
      toast.success('Sessão preparada. Leia o QR com o WhatsApp deste canal.');
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          'Não foi possível preparar a voz. Atualize o status antes de tentar novamente.',
        ),
      );
    } finally {
      setPreparing(false);
    }
  };

  const canPrepare = !pairing?.sessionCreated || ['pending', 'missing', 'logged_out'].includes(pairing?.state ?? '');
  const buttonLabel =
    pairing?.state === 'pending'
      ? 'Recuperar sessão de voz'
      : pairing?.sessionCreated
        ? 'Gerar novo QR de voz'
        : 'Gerar QR de voz';

  let body: ReactNode;
  if (pairingError && !pairing) {
    body = (
      <div role="alert" className="space-y-2 text-sm text-foreground">
        <p>{pairingError}</p>
        <Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
          Tentar novamente
        </Button>
      </div>
    );
  } else if (!pairing) {
    body = (
      <p role="status" className="text-sm text-muted-foreground">
        Consultando a conexão de voz…
      </p>
    );
  } else if (ready) {
    body = (
      <p role="status" className="rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground">
        Voz conectada com o número deste canal. Você já pode realizar o teste de ligação.
      </p>
    );
  } else {
    body = (
      <div className="space-y-3">
        <p role="status" className="text-sm text-foreground">
          {pairing.state === 'qr'
            ? 'Leia o QR abaixo. O status será confirmado automaticamente.'
            : voiceReadinessLabels[pairing.reason] ?? voiceReadinessLabels.PAIRING_REQUIRED}
        </p>
        {pairing.qrCode?.startsWith('data:image') ? (
          <img
            src={pairing.qrCode}
            alt="QR para conectar as chamadas WhatsApp"
            width={256}
            height={256}
            className="mx-auto h-auto w-full max-w-64 rounded-lg bg-white p-2 shadow-sm ring-1 ring-border"
          />
        ) : pairing.state === 'qr' ? (
          <p className="text-sm text-muted-foreground">Preparando o código atualizado…</p>
        ) : null}
        {canPrepare && (
          <Button
            disabled={preparing}
            onClick={() => void prepare()}
            className="w-full rounded-xl text-primary-foreground sm:w-auto"
            style={{ backgroundColor: PRIMARY }}
          >
            {preparing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
            {buttonLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="rounded-xl border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Pareamento de voz</CardTitle>
        <CardDescription>
          No celular, abra WhatsApp → Dispositivos conectados → Conectar dispositivo. Use o mesmo número já conectado às
          mensagens deste canal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{body}</CardContent>
    </Card>
  );
}

function CapacityCard({ channelId }: { channelId: number }) {
  const [capacity, setCapacity] = useState<VoiceCapacity | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCapacity = useCallback(async () => {
    try {
      const data = await voiceApi.capacity(channelId);
      setCapacity(data);
      setCapacityError(null);
    } catch (error) {
      setCapacityError(getErrorMessage(error, 'Não foi possível carregar a capacidade de voz.'));
    }
  }, [channelId]);

  useEffect(() => {
    void loadCapacity();
    const timer = window.setInterval(() => {
      if (!document.hidden) void loadCapacity();
    }, CAPACITY_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadCapacity]);

  // Sincroniza o campo com o valor salvo quando ele muda no servidor.
  const configured = capacity?.configured;
  useEffect(() => {
    if (configured !== undefined) setDraft(String(configured));
  }, [configured]);

  const parsedDraft = Number(draft);
  const draftValid =
    draft.trim() !== '' && Number.isInteger(parsedDraft) && parsedDraft >= MIN_CAPACITY && parsedDraft <= MAX_CAPACITY;
  const verified = capacity?.verified ?? 0;
  const canEnable = capacity?.readinessReason === 'VOICE_DISABLED' && verified > 0;
  const voiceEnabled = capacity?.voiceEnabled === true;

  const applySettings = async (body: Parameters<typeof voiceApi.updateSettings>[1], successMessage: string) => {
    setSaving(true);
    try {
      const next = await voiceApi.updateSettings(channelId, body);
      setCapacity(next);
      setCapacityError(null);
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Não foi possível salvar as configurações de voz.'));
    } finally {
      setSaving(false);
    }
  };

  const saveCapacity = () => {
    if (!draftValid) return;
    void applySettings({ voiceCapacity: parsedDraft }, 'Capacidade de chamadas salva.');
  };

  const confirmTest = () => {
    if (!draftValid) return;
    void applySettings({ voiceVerifiedCapacity: parsedDraft }, 'Teste de ligação confirmado.');
  };

  const toggleEnabled = (checked: boolean) => {
    void applySettings(
      { voiceEnabled: checked },
      checked ? 'Chamadas liberadas neste canal.' : 'Chamadas desligadas neste canal.',
    );
  };

  const stats: { label: string; value: number | undefined }[] = [
    { label: 'Configurada', value: capacity?.configured },
    { label: 'Verificada', value: capacity?.verified },
    { label: 'Efetiva', value: capacity?.effective },
    { label: 'Em uso', value: capacity?.occupied },
    { label: 'Disponível', value: capacity?.available },
  ];

  return (
    <Card className="rounded-xl border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base text-foreground">Capacidade e liberação</CardTitle>
        <CardDescription>Defina quantas chamadas simultâneas este canal pode atender.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {capacityError && !capacity ? (
          <div role="alert" className="space-y-2 text-sm text-foreground">
            <p>{capacityError}</p>
            <Button variant="outline" onClick={() => void loadCapacity()}>
              Tentar novamente
            </Button>
          </div>
        ) : !capacity ? (
          <p role="status" className="text-sm text-muted-foreground">
            Carregando capacidade…
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-muted/50 px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                  <dd className="text-lg font-semibold text-foreground">{stat.value ?? '—'}</dd>
                </div>
              ))}
            </dl>

            <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
              {voiceReadinessLabels[capacity.readinessReason] ?? voiceReadinessLabels.PAIRING_REQUIRED}
            </p>

            <div className="space-y-2">
              <Label htmlFor={`voice-capacity-${channelId}`} className="text-foreground">
                Chamadas simultâneas
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id={`voice-capacity-${channelId}`}
                  type="number"
                  inputMode="numeric"
                  min={MIN_CAPACITY}
                  max={MAX_CAPACITY}
                  step={1}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-invalid={draft !== '' && !draftValid}
                  className="rounded-xl sm:max-w-32"
                  disabled={saving}
                />
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={saving || !draftValid || parsedDraft === capacity.configured}
                  onClick={saveCapacity}
                >
                  Salvar capacidade
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Valor entre {MIN_CAPACITY} e {MAX_CAPACITY}.</p>
            </div>

            <div className="space-y-2 rounded-xl border border-border p-3">
              <h3 className="text-sm font-semibold text-foreground">Teste de ligação</h3>
              <p className="text-sm text-muted-foreground">
                Faça uma ligação de teste pela caixa de entrada do WhatsApp para um celular de teste. Confirme que o áudio
                funciona nos dois sentidos (quem liga e quem atende) antes de confirmar.
              </p>
              {verified > 0 && (
                <p className="text-sm font-medium" style={{ color: PRIMARY }}>
                  Teste confirmado para {verified} {verified === 1 ? 'chamada' : 'chamadas'} simultânea(s).
                </p>
              )}
              <Button
                className="w-full rounded-xl text-primary-foreground sm:w-auto"
                style={{ backgroundColor: PRIMARY }}
                disabled={saving || !draftValid}
                onClick={confirmTest}
              >
                Confirmar teste (áudio OK)
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
              <div className="space-y-1">
                <Label htmlFor={`voice-enabled-${channelId}`} className="text-sm font-semibold text-foreground">
                  Liberar chamadas neste canal
                </Label>
                <p className="text-xs text-muted-foreground">
                  {canEnable || voiceEnabled
                    ? 'Ative para permitir chamadas por este canal.'
                    : 'Disponível depois que a voz estiver conectada e o teste de ligação for confirmado.'}
                </p>
              </div>
              <Switch
                id={`voice-enabled-${channelId}`}
                checked={voiceEnabled}
                disabled={saving || (!voiceEnabled && !canEnable)}
                onCheckedChange={toggleEnabled}
                aria-label="Liberar chamadas neste canal"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
