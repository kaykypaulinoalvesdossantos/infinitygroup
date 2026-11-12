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
        <p className="text-sm text-slate-600">Aparelho Android com o app Infinity Ramal.</p>
      ) : (
        <p className="text-sm text-slate-600">
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
                  selected ? 'border-[#0076FF] bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50',
                )}
              >
                <span className="block text-sm font-semibold text-slate-900">{option.title}</span>
                <span className="block text-xs text-slate-600">{option.description}</span>
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
          <p className="text-sm text-slate-600">
            Permite iniciar ligações e mostrar o andamento da fila na notificação.
          </p>
          {!permissionsOk && (
            <Button className="h-12 w-full rounded-xl" disabled={!available} onClick={() => void native.requestPermissions()}>
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
          <p className="text-sm text-slate-600">Não é necessário no modo Discador do celular.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Suas ligações pessoais continuam funcionando normalmente pelo aparelho.
            </p>
            {!dialerOk && (
              <Button className="h-12 w-full rounded-xl" disabled={!available} onClick={() => void native.requestDefaultDialer()}>
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
        <p className="text-sm text-slate-600">Nenhum chip encontrado neste aparelho.</p>
      ) : status.simAccounts.length === 1 ? (
        <p className="text-sm text-slate-600">Chip: {status.simAccounts[0].label}</p>
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
            <div className="rounded-xl bg-slate-100 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">{device.model || 'Celular Android'}</span>
                <Badge variant={deviceOnline ? 'default' : 'secondary'}>{deviceOnline ? 'Online' : 'Offline'}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {device.simLabel ? `Chip: ${device.simLabel} · ` : ''}Modo{' '}
                {device.mode === 'FULL' ? 'telefone padrão' : 'discador do celular'} · visto{' '}
                {relativeTime(device.lastSeenAt)}
              </p>
              {!deviceOnline && (
                <p className="mt-2 text-xs text-amber-700">Sem resposta do celular. Abra o app para reconectar.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Este celular ainda não está conectado ao painel.</p>
          )}

          {!deviceRegistered && (
            <>
              <Button className="h-12 w-full rounded-xl" disabled={!localReady} onClick={() => void connect()}>
                <Smartphone className="mr-2 h-4 w-4" />
                Conectar este celular
              </Button>
              {!localReady && (
                <p className="text-xs text-slate-500">Conclua os passos acima para conectar.</p>
              )}
            </>
          )}
          {deviceRegistered && (
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl text-red-600 hover:text-red-700"
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
    <Card className={cn('border-slate-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Configurar celular</CardTitle>
          <Badge variant="outline">
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
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0076FF]" />
          <p>Suas ligações pessoais não são registradas no sistema.</p>
        </div>

        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepIcon state={step.state} />
              {index < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className="min-w-0 flex-1 pb-3">
              <p
                className={cn(
                  'mb-2 text-sm font-semibold',
                  step.state === 'blocked' ? 'text-slate-500' : 'text-slate-900',
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
  if (state === 'done') return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />;
  if (state === 'blocked') return <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />;
  if (state === 'skipped') return <MinusCircle className="h-5 w-5 shrink-0 text-slate-400" />;
  return <Circle className="h-5 w-5 shrink-0 text-[#0076FF]" />;
}
