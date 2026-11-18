'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfinityTelephony, type NativeUpdateState, type PluginListenerHandle } from '@/lib/native-telephony';
import { RAMAL_APP_DOWNLOAD_URL, RAMAL_APP_FILE_NAME, RAMAL_APP_VERSION } from '@/lib/ramal-app';
import { cn } from '@/lib/utils';

/** Compara versoes "1.2.3" numericamente. Negativo se a < b, 0 se iguais, positivo se a > b. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const pb = b.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

export function RamalUpdateCard({
  appVersion,
  updatePermissionRequired,
  onOpenUpdateSettings,
}: {
  appVersion: string;
  updatePermissionRequired?: boolean;
  onOpenUpdateSettings: () => void;
}) {
  const [state, setState] = useState<NativeUpdateState | null>(null);
  /** null = ainda verificando; false = app antigo, sem atualizacao pela tela. */
  const [supported, setSupported] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    let disposed = false;
    let handle: PluginListenerHandle | null = null;

    InfinityTelephony.getUpdateState()
      .then((s) => {
        if (disposed) return;
        setState(s);
        setSupported(true);
      })
      .catch(() => {
        if (!disposed) setSupported(false);
      });

    InfinityTelephony.addListener('updateState', (s) => {
      if (!disposed) setState(s);
    })
      .then((h) => {
        if (disposed) void h.remove();
        else handle = h;
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      void handle?.remove();
    };
  }, []);

  const phase = state?.phase ?? 'idle';
  const progress = Math.max(0, Math.min(100, Math.round(state?.progress ?? 0)));
  const outdated = !!appVersion && compareVersions(appVersion, RAMAL_APP_VERSION) < 0;
  const busy = requesting || phase === 'checking' || phase === 'downloading' || phase === 'installing';
  const showProgress = phase === 'checking' || phase === 'downloading' || phase === 'installing';
  const needsPermission = phase === 'permission' || !!updatePermissionRequired;

  const handleCheck = async () => {
    setRequesting(true);
    try {
      setState(await InfinityTelephony.checkForUpdate());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível procurar atualização.');
    } finally {
      setRequesting(false);
    }
  };

  // App antigo: nao atualiza pela tela. So aparece se houver versao nova para baixar manualmente.
  if (supported === false) {
    if (!outdated) return null;
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Atualização do app</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Versão instalada: <span className="font-semibold text-foreground">{appVersion}</span></p>
            <p>Nova versão disponível: <span className="font-semibold text-foreground">{RAMAL_APP_VERSION}</span></p>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta versão do app não atualiza pela tela. Baixe a versão {RAMAL_APP_VERSION} uma vez:
          </p>
          <Button asChild className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl">
            <a href={RAMAL_APP_DOWNLOAD_URL} download={RAMAL_APP_FILE_NAME}>
              <Download className="mr-2 h-4 w-4 shrink-0" />
              Baixar versão {RAMAL_APP_VERSION}
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Atualização do app</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Versão instalada: <span className="font-semibold text-foreground">{appVersion || '—'}</span></p>
          {outdated && (
            <p>Nova versão disponível: <span className="font-semibold text-foreground">{RAMAL_APP_VERSION}</span></p>
          )}
        </div>

        {showProgress && (
          <div className="space-y-2">
            {phase === 'downloading' && (
              <p className="text-2xl font-bold tabular-nums text-foreground">{progress}%</p>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full bg-primary transition-all', phase === 'checking' && 'animate-pulse')}
                style={{ width: phase === 'checking' ? '30%' : `${progress}%` }}
              />
            </div>
            {state?.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
          </div>
        )}

        {phase === 'ready' && (
          <StatusLine tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>
            {state?.message || 'Atualização pronta. Será instalada quando o celular estiver livre.'}
          </StatusLine>
        )}

        {phase === 'idle' && state?.message && (
          <p className="text-sm text-muted-foreground">{state.message}</p>
        )}

        {phase === 'uptodate' && (
          <StatusLine tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>
            Você já está na versão mais nova.
          </StatusLine>
        )}

        {phase === 'error' && (
          <StatusLine tone="danger" icon={<AlertTriangle className="h-4 w-4" />}>
            {state?.message || 'Não foi possível atualizar o app.'}
          </StatusLine>
        )}

        {needsPermission && (
          <div className="space-y-3 rounded-xl bg-muted p-3">
            <StatusLine tone="warning" icon={<AlertTriangle className="h-4 w-4" />}>
              {(phase === 'permission' && state?.message) || 'Permita as atualizações do Ramal nas configurações do Android.'}
            </StatusLine>
            <Button variant="outline" className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl" onClick={onOpenUpdateSettings}>
              Permitir atualizações do Ramal
            </Button>
          </div>
        )}

        <Button
          className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl"
          disabled={busy}
          onClick={() => void handleCheck()}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4 shrink-0', busy && 'animate-spin')} />
          {outdated ? 'Atualizar agora' : 'Procurar atualização'}
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusLine({
  tone,
  icon,
  children,
}: {
  tone: 'success' | 'warning' | 'danger';
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 text-sm',
        tone === 'success' && 'text-success-foreground',
        tone === 'warning' && 'text-warning-foreground',
        tone === 'danger' && 'text-danger-foreground',
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
