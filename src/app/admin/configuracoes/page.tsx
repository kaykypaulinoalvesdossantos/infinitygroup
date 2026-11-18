'use client';

import Link from 'next/link';
import { Bell, CalendarDays, ChevronRight, Mail, MessageCircle, Package, Phone, ScrollText, Settings, Users, Workflow } from 'lucide-react';
import { ErrorState, PageHeader, Pill } from '@/components/atendimento/helpers';
import { usePolling } from '@/hooks/use-polling';
import { integrationSettings } from '@/services/integration-settings';
import { integrations, type IntegrationKey } from './integrations';

const icons = { email: Mail, 'google-calendar': CalendarDays };
const integrationKeys = Object.keys(integrations) as IntegrationKey[];

const settingsGroups = [
  {
    id: 'settings-crm',
    title: 'CRM e atendimento',
    items: [
      { title: 'Funil comercial', description: 'Configure as etapas e os campos obrigatórios dos leads.', href: '/admin/crm/pipelines', icon: Workflow },
      { title: 'Catálogo de ofertas', description: 'Cadastre itens e preços sugeridos para usar nas propostas.', href: '/admin/crm/ofertas', icon: Package },
      { title: 'Ramal e campanhas', description: 'Gerencie aparelhos Android, campanhas e regras de discagem.', href: '/admin/atendimento/configuracoes', icon: Phone },
      { title: 'Roteiro do copiloto', description: 'Edite as falas e os objetivos exibidos ao vendedor durante as ligações.', href: '/admin/crm/roteiro', icon: ScrollText },
    ],
  },
  {
    id: 'settings-management',
    title: 'Administração',
    items: [
      { title: 'Equipe e acessos', description: 'Gerencie vendedores, supervisores e permissões.', href: '/admin/equipe', icon: Users },
      { title: 'Notificações', description: 'Organize e envie comunicados aos clientes.', href: '/admin/notificacoes', icon: Bell },
    ],
  },
];

export default function SettingsPage() {
  const status = usePolling(integrationSettings.list, 60000);

  return <div className="admin-page max-w-6xl">
    <PageHeader title="Configurações" icon={<Settings aria-hidden="true" className="h-7 w-7 text-link" />} />
    <section aria-labelledby="integration-heading" className="space-y-3">
      <h2 id="integration-heading" className="text-lg font-semibold text-foreground">Integrações</h2>
      {status.error && <ErrorState message={status.error} onRetry={() => void status.refresh()} />}
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        <li>
          <Link href="/admin/configuracoes/whatsapp" className="flex min-h-20 flex-wrap items-center gap-3 rounded-lg p-4 hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:flex-nowrap sm:gap-4">
            <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-link" />
            <span className="min-w-[9rem] flex-1">
              <span className="block font-semibold text-foreground">WhatsApp</span>
              <span className="block text-sm text-muted-foreground">Conecte números por QR Code, configure chamadas, filas e atendimento.</span>
            </span>
            <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
        {integrationKeys.map((key) => {
          const Icon = icons[key];
          const current = status.data?.find((item) => item.provider === key);
          return <li key={key}>
            <Link href={`/admin/configuracoes/${key}`} className="flex min-h-20 flex-wrap items-center gap-3 rounded-lg p-4 hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:flex-nowrap sm:gap-4">
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-link" />
              <span className="min-w-[9rem] flex-1">
                <span className="block font-semibold text-foreground">{integrations[key].title}</span>
                <span className="block text-sm text-muted-foreground">{integrations[key].description}</span>
              </span>
              {current && <Pill tone={current.configured ? 'green' : 'slate'}>{current.configured ? 'Configurada' : 'Pendente'}</Pill>}
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>;
        })}
      </ul>
    </section>
    {settingsGroups.map(({ id, title, items }) => (
      <section key={id} aria-labelledby={id} className="space-y-3">
        <h2 id={id} className="text-lg font-semibold text-foreground">{title}</h2>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map(({ title: label, description, href, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex min-h-16 items-center gap-3 rounded-lg p-4 hover:bg-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:gap-4">
                <Icon aria-hidden className="h-5 w-5 shrink-0 text-link" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{label}</span>
                  <span className="block text-sm text-muted-foreground">{description}</span>
                </span>
                <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>;
}
