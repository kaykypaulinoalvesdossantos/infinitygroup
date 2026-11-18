'use client';

import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Circle, Info, MinusCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { NativeTelephonyApi } from '@/hooks/ramal/useNativeTelephony';
import type { DeviceMode, TelephonyDevice } from '@/services/telephony';

type StepState = 'done' | 'todo' | 'blocked' | 'skipped';

interface PhoneSetupWizardProps {
  native: NativeTelephonyApi;
  device: TelephonyDevice | null;
  /** chamado depois de conectar/desconectar o celular, para o painel recarregar o aparelho */
  onChanged?: () => void;
  className?: string;
}

const MODE_OPTIONS: { value: DeviceMode; title: string; description: string }[] = [
  {
    value: 'FULL',
    title: 'App como telefone padrão',
    description: 'Recomendado: registra atendida e não atendida automaticamente.',
  },
  {
    value: 'LITE',
    title: 'Usar o discador do celular',
    description: 'Você confirma o resultado de cada ligação.',
  },
];

function relativeTime(iso: string | null): string {
  if (!iso) return 'nunca';
  const diffMs = Date.now() - Date.parse(iso);
  if (Number.isNaN(diffMs)) return 'nunca';
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'agora há pouco';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return new Date(iso).toLocaleDateString('pt-BR');
}

export function PhoneSetupWizard({ native, device, onChanged, className }: PhoneSetupWizardProps) {
  const { status, available } = native;

  const deviceRegistered = !!device && !device.revokedAt;
  const deviceOnline = deviceRegistered && !!device?.connected;

  const mode = status.mode;
  const permissionsOk = status.permissions.callPhone && status.permissions.notifications;
  const dialerOk = status.isDefaultDialer;
  const hasSim = status.simAccounts.length > 0;
  const simChosen = status.simAccounts.length === 1 || !!status.selectedSimId;
  const localReady = available && permissionsOk && hasSim && simChosen && (mode === 'LITE' || dialerOk);

  const connect = async () => {
    await native.connectThisPhone(mode);
    onChanged?.();
  };
  const disconnect = async () => {
    await native.disconnectThisPhone();
    onChanged?.();
  };

  const steps: { title: string; state: StepState; body: ReactNode }[] = [
    {
      title: 'Este celular',
      state: available ? 'done' : 'blocked',
      body: available ? (
        <p className="text-sm text-muted-foreground">Aparelho Android com o app Infinity Ramal.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          A discagem pelo celular só funciona no app Android Infinity Ramal. Neste navegador você acompanha a fila e
          registra resultados, mas as ligações são feitas no aparelho.
        </p>
      ),
    },
    {
      title: 'Modo de discagem',
      state: 'done',
      body: (
        <div className="grid gap-2">
          {MODE_OPTIONS.map((option) => {
            const selected = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={!available}
                aria-pressed={selected}
                onClick={() => void native.setMode(option.value)}
                className={cn(
                  'min-h-[3.25rem] rounded-xl border p-3 text-left transition-colors disabled:opacity-60',
                  selected ? 'border-primary bg-info' : 'border-border bg-card hover:bg-muted',
                )}
              >
                <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Permissões de ligação e notificação',
      state: permissionsOk ? 'done' : available ? 'todo' : 'blocked',
      body: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Permite iniciar ligações e mostrar o andamento da fila na notificação.
          </p>
          {!permissionsOk && (
            <Button className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl" disabled={!available} onClick={() => void native.requestPermissions()}>
              Conceder permissões
            </Button>
          )}
        </div>
      ),
    },
    {
      title: 'Telefone padrão',
      state: mode === 'LITE' ? 'skipped' : dialerOk ? 'done' : available ? 'todo' : 'blocked',
      body:
        mode === 'LITE' ? (
          <p className="text-sm text-muted-foreground">Não é necessário no modo Discador do celular.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Suas ligações pessoais continuam funcionando normalmente pelo aparelho.
            </p>
            {!dialerOk && (
              <Button className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl" disabled={!available} onClick={() => void native.requestDefaultDialer()}>
                Definir como telefone padrão
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              disabled={!available}
              onClick={() => void native.openDefaultApps()}
            >
              Abrir configurações do Android
            </Button>
          </div>
        ),
    },
    {
      title: 'Chip da ligação',
      state: !hasSim ? 'blocked' : simChosen ? 'done' : 'todo',
      body: !hasSim ? (
        <p className="text-sm text-muted-foreground">Nenhum chip encontrado neste aparelho.</p>
      ) : status.simAccounts.length === 1 ? (
        <p className="text-sm text-muted-foreground">Chip: {status.simAccounts[0].label}</p>
      ) : (
        <Select value={status.selectedSimId ?? undefined} onValueChange={(id) => void native.selectSim(id)}>
          <SelectTrigger className="h-12 w-full rounded-xl" disabled={!available}>
            <SelectValue placeholder="Escolha o chip" />
          </SelectTrigger>
          <SelectContent>
            {status.simAccounts.map((sim) => (
              <SelectItem key={sim.id} value={sim.id}>
                {sim.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      title: 'Conectar ao painel',
      state: deviceOnline && device?.ready ? 'done' : 'todo',
      body: (
        <div className="space-y-3">
          {deviceRegistered && device ? (
            <div className="rounded-xl bg-muted p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 font-medium text-foreground">{device.model || 'Celular Android'}</span>
                <Badge variant={deviceOnline ? 'default' : 'secondary'} className="shrink-0">{deviceOnline ? 'Online' : 'Offline'}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {device.simLabel ? `Chip: ${device.simLabel} · ` : ''}Modo{' '}
                {device.mode === 'FULL' ? 'telefone padrão' : 'discador do celular'} · visto{' '}
                {relativeTime(device.lastSeenAt)}
              </p>
              {!deviceOnline && (
                <p className="mt-2 text-xs text-warning-foreground">Sem resposta do celular. Abra o app para reconectar.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Este celular ainda não está conectado ao painel.</p>
          )}

          {!deviceRegistered && (
            <>
              <Button className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl" disabled={!localReady} onClick={() => void connect()}>
                <Smartphone className="mr-2 h-4 w-4 shrink-0" />
                Conectar este celular
              </Button>
              {!localReady && (
                <p className="text-xs text-muted-foreground">Conclua os passos acima para conectar.</p>
              )}
            </>
          )}
          {deviceRegistered && (
            <Button
              variant="outline"
              className="h-auto min-h-12 w-full whitespace-normal py-2 text-center leading-tight rounded-xl text-danger-foreground hover:text-danger-foreground"
              onClick={() => void disconnect()}
            >
              Desconectar este celular
            </Button>
          )}
        </div>
      ),
    },
  ];

  const doneCount = steps.filter((s) => s.state === 'done' || s.state === 'skipped').length;

  return (
    <Card className={cn('border-border', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="min-w-0 flex-1 text-base">Configurar celular</CardTitle>
          <Badge variant="outline" className="shrink-0">
            {doneCount}/{steps.length}
          </Badge>
        </div>
        <CardDescription>
          {deviceOnline && device?.ready
            ? 'Celular pronto para discar.'
            : 'Siga os passos para usar este celular como ramal da Infinity Groups.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 rounded-xl bg-info p-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-link" />
          <p className="min-w-0 flex-1">Suas ligações pessoais não são registradas no sistema.</p>
        </div>

        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepIcon state={step.state} />
              {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-muted" />}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <p
                className={cn(
                  'mb-2 text-sm font-semibold',
                  step.state === 'blocked' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {index + 1}. {step.title}
              </p>
              {step.body}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <CheckCircle2 className="h-5 w-5 shrink-0 text-success-foreground" />;
  if (state === 'blocked') return <AlertCircle className="h-5 w-5 shrink-0 text-danger-foreground" />;
  if (state === 'skipped') return <MinusCircle className="h-5 w-5 shrink-0 text-muted-foreground/80" />;
  return <Circle className="h-5 w-5 shrink-0 text-link" />;
}
