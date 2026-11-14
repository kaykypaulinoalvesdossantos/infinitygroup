'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState, LoadingBlock, PageHeader, Pill, SectionCard, getErrorMessage } from '@/components/atendimento/helpers';
import { usePolling } from '@/hooks/use-polling';
import { crmLeadsApi } from '@/services/crm-leads';
import { integrationSettings, type IntegrationStatus } from '@/services/integration-settings';
import { WhatsAppChannelsPanel } from '@/components/admin/crm/whatsapp-channels-panel';
import { integrations, type IntegrationKey } from '../integrations';

export default function IntegrationPage({ params }: { params: { provider: string } }) {
  const key = Object.keys(integrations).find((item) => item === params.provider) as IntegrationKey | undefined;
  if (!key) notFound();
  return <IntegrationSettingsPage key={key} provider={key} />;
}

function IntegrationSettingsPage({ provider }: { provider: IntegrationKey }) {
  const integration = integrations[provider];
  const [initial, setInitial] = useState<IntegrationStatus>();
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);

  useEffect(() => {
    let active = true;
    void integrationSettings.get(provider).then((data) => {
      if (active) { setInitial(data); setError(''); }
    }).catch((err: unknown) => {
      if (active) setError(getErrorMessage(err, 'Não foi possível carregar a configuração.'));
    });
    return () => { active = false; };
  }, [provider, retry]);

  return <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
    <Link href="/admin/configuracoes" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-blue-700 hover:underline">
      <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Configurações
    </Link>
    <PageHeader title={integration.title} description={integration.description} />
    {error && <ErrorState message={error} onRetry={() => setRetry(retry + 1)} />}
    {!initial && !error && <LoadingBlock rows={3} />}
    {initial && <IntegrationForm provider={provider} initial={initial} onSave={() => setSavedVersion((version) => version + 1)} />}
    {provider === 'google-calendar' && <GoogleAccount savedVersion={savedVersion} />}
    {provider === 'evolution' && <WhatsAppChannelsPanel />}
  </main>;
}

function IntegrationForm({ provider, initial, onSave }: { provider: IntegrationKey; initial: IntegrationStatus; onSave: () => void }) {
  const integration = integrations[provider];
  const [saved, setSaved] = useState(initial);
  const [settings, setSettings] = useState(initial.settings);
  const [secret, setSecret] = useState('');
  const [working, setWorking] = useState<'save' | 'test' | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>();
  const dirty = !!secret || integration.fields.some(({ key }) => (settings[key] ?? '') !== (saved.settings[key] ?? ''));

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking('save');
    setNotice(undefined);
    try {
      const data = await integrationSettings.save(provider, settings, secret);
      setSaved(data);
      setSettings(data.settings);
      setSecret('');
      setNotice({ text: 'Configuração salva.' });
      onSave();
    } catch (error) {
      setNotice({ text: getErrorMessage(error, 'Não foi possível salvar a configuração.'), error: true });
    } finally { setWorking(null); }
  }

  async function test() {
    setWorking('test');
    setNotice(undefined);
    try {
      const result = await integrationSettings.test(provider);
      setNotice({ text: result.message, error: !result.connected });
    } catch (error) {
      setNotice({ text: getErrorMessage(error, 'Não foi possível verificar a conexão.'), error: true });
    } finally { setWorking(null); }
  }

  return <SectionCard title="Dados da conexão" action={<Pill tone={saved.configured ? 'green' : 'slate'}>{saved.configured ? 'Configurada' : 'Pendente'}</Pill>}>
    {saved.configured && <p className="text-sm text-slate-600">{saved.source === 'panel' ? 'Configuração do painel.' : 'Configuração carregada do ambiente do backend.'}</p>}
    <form onSubmit={(event) => void save(event)} className="space-y-5">
      <fieldset disabled={working !== null} className="grid gap-4 sm:grid-cols-2">
        {integration.fields.map((field) => (
          <div key={field.key} className={`space-y-2 ${field.key === 'url' || field.key === 'redirectUri' ? 'sm:col-span-2' : ''}`}>
            <Label htmlFor={`integration-${field.key}`}>{field.label}</Label>
            <Input id={`integration-${field.key}`} className="min-h-11 rounded-lg border-slate-300" value={settings[field.key] ?? ''}
              type={'type' in field ? field.type : 'text'} required={!(('optional' in field) && field.optional)}
              placeholder={'placeholder' in field ? field.placeholder : undefined} maxLength={1000}
              onChange={(event) => { setNotice(undefined); setSettings((current) => ({ ...current, [field.key]: event.target.value })); }} />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="integration-secret">{integration.secretLabel}</Label>
          <Input id="integration-secret" className="min-h-11 rounded-lg border-slate-300" type="password" autoComplete="new-password"
            maxLength={4000} value={secret} required={!saved.hasSecret}
            onChange={(event) => { setNotice(undefined); setSecret(event.target.value); }} />
          {saved.hasSecret && <p className="text-xs text-slate-600">Deixe em branco para manter a credencial salva.</p>}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="min-h-11 rounded-lg bg-[#0076FF] text-white hover:bg-blue-700" disabled={!dirty || !!working}>
          {working === 'save' ? 'Salvando…' : 'Salvar configuração'}
        </Button>
        {provider !== 'google-calendar' && <Button type="button" variant="outline" className="min-h-11 rounded-lg border-slate-300"
          disabled={!saved.configured || dirty || !!working} onClick={() => void test()}>
          {working === 'test' ? 'Verificando…' : 'Testar conexão'}
        </Button>}
      </div>
      {notice && <p role={notice.error ? 'alert' : 'status'} className={`text-sm ${notice.error ? 'text-red-700' : 'text-green-700'}`}>{notice.text}</p>}
    </form>
  </SectionCard>;
}

function GoogleAccount({ savedVersion }: { savedVersion: number }) {
  const status = usePolling(crmLeadsApi.googleCalendarStatus, 20000, [savedVersion]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [callback, setCallback] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    setCallback(url.searchParams.get('calendar'));
  }, []);

  async function connect() {
    setBusy(true);
    setError('');
    try {
      const result = await crmLeadsApi.connectGoogleCalendar('settings');
      window.location.assign(result.authorizationUrl);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível iniciar a autorização Google.'));
      setBusy(false);
    }
  }

  return <SectionCard title="Sua conta Google">
    {status.error && <ErrorState message={status.error} onRetry={() => void status.refresh()} />}
    {callback === 'failed' && <p role="alert" className="text-sm text-red-700">A autorização não foi concluída. Confira o cliente OAuth e tente novamente.</p>}
    {status.data?.connected && <p className="break-words text-sm text-slate-700">Conta conectada{status.data.email ? ` · ${status.data.email}` : ''}</p>}
    {status.data?.reconnectRequired && <p className="text-sm text-amber-800">A conta precisa ser autorizada novamente.</p>}
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" className="min-h-11 rounded-lg border-slate-300" disabled={busy || !status.data?.configured} onClick={() => void connect()}>
        <ExternalLink aria-hidden="true" className="h-4 w-4" /> {status.data?.connected ? 'Reconectar Google Agenda' : 'Conectar Google Agenda'}
      </Button>
      <Button variant="ghost" onClick={() => void status.refresh()}>Atualizar status</Button>
    </div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </SectionCard>;
}
