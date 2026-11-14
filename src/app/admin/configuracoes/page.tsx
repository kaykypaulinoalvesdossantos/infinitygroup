'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, Mail, MessageCircle, Phone, Settings, Users, Workflow } from 'lucide-react';
import { ErrorState, PageHeader, Pill } from '@/components/atendimento/helpers';
import { usePolling } from '@/hooks/use-polling';
import { integrationSettings } from '@/services/integration-settings';
import { integrations, type IntegrationKey } from './integrations';

const icons = { evolution: MessageCircle, wacalls: Phone, email: Mail, 'google-calendar': CalendarDays };
const integrationKeys = Object.keys(integrations) as IntegrationKey[];

export default function SettingsPage() {
  const status = usePolling(integrationSettings.list, 60000);

  return <main className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
    <PageHeader title="Configurações" icon={<Settings aria-hidden="true" className="h-7 w-7 text-[#0076FF]" />} />
    <section aria-labelledby="integration-heading" className="space-y-3">
      <h2 id="integration-heading" className="text-lg font-semibold text-slate-900">Integrações</h2>
      {status.error && <ErrorState message={status.error} onRetry={() => void status.refresh()} />}
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {integrationKeys.map((key) => {
          const Icon = icons[key];
          const current = status.data?.find((item) => item.provider === key);
          return <li key={key}>
            <Link href={`/admin/configuracoes/${key}`} className="flex min-h-20 flex-wrap items-center gap-3 rounded-lg p-4 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0076FF] sm:flex-nowrap sm:gap-4">
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0076FF]" />
              <span className="min-w-[9rem] flex-1">
                <span className="block font-semibold text-slate-900">{integrations[key].title}</span>
                <span className="block text-sm text-slate-600">{integrations[key].description}</span>
              </span>
              {current && <Pill tone={current.configured ? 'green' : 'slate'}>{current.configured ? 'Configurada' : 'Pendente'}</Pill>}
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
            </Link>
          </li>;
        })}
      </ul>
    </section>
    <section aria-labelledby="system-heading" className="space-y-3">
      <h2 id="system-heading" className="text-lg font-semibold text-slate-900">Sistema</h2>
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {[
          { title: 'Ramal e campanhas', description: 'Gerencie aparelhos Android, campanhas e regras de discagem.', href: '/admin/atendimento/configuracoes', icon: Phone },
          { title: 'Equipe e acessos', description: 'Gerencie vendedores, supervisores e permissões.', href: '/admin/equipe', icon: Users },
          { title: 'Funil comercial', description: 'Configure etapas, ordem e campos obrigatórios dos leads.', href: '/admin/crm/pipelines', icon: Workflow },
        ].map(({ title, description, href, icon: Icon }) => <li key={href}>
          <Link href={href} className="flex min-h-20 items-center gap-3 rounded-lg p-4 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0076FF] sm:gap-4">
            <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#0076FF]" />
            <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-900">{title}</span><span className="block text-sm text-slate-600">{description}</span></span>
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" />
          </Link>
        </li>)}
      </ul>
    </section>
  </main>;
}
