'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    FileText,
    DollarSign,
    LogOut,
    Target,
    Headset,
    MonitorPlay,
    Settings,
    MessagesSquare,
    CalendarDays,
    ListTodo,
    FileSignature,
    Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BILLING_ENABLED } from '@/lib/features';
import { canAccessAdminPath, defaultAdminPath } from '@/lib/admin-access';
import { getStoredUser } from '@/services/crm-leads';

const navigation = [
    {
        title: 'Gestão',
        items: [
            { title: 'Visão geral', href: '/admin/dashboard', icon: Home },
            { title: 'Clientes', href: '/admin/clientes', icon: Users },
            { title: 'Contratos', href: '/admin/contratos', icon: FileText },
            ...(BILLING_ENABLED ? [{ title: 'Faturas', href: '/admin/faturas', icon: DollarSign }] : []),
        ],
    },
    {
        title: 'Comercial',
        items: [
            { title: 'Pipeline de vendas', href: '/admin/crm/leads', icon: Target },
            { title: 'Propostas', href: '/admin/crm/propostas', icon: FileSignature },
            { title: 'Metas', href: '/admin/crm/metas', icon: Trophy },
        ],
    },
    {
        title: 'Atendimento',
        items: [
            { title: 'Minha fila', href: '/admin/atendimento', icon: Headset },
            { title: 'WhatsApp', href: '/admin/atendimento/whatsapp', icon: MessagesSquare },
            { title: 'Agenda', href: '/admin/atendimento/agenda', icon: CalendarDays },
            { title: 'Pendências', href: '/admin/atendimento/pendencias', icon: ListTodo },
            { title: 'Supervisão', href: '/admin/atendimento/supervisao', icon: MonitorPlay },
        ],
    },
    {
        title: 'Administração',
        items: [{ title: 'Configurações', href: '/admin/configuracoes', icon: Settings }],
    },
];

const navRoutes = navigation.flatMap(({ items }) => items.map(({ href }) => href));

function navigationPath(pathname: string) {
    if (pathname === '/admin/crm/ofertas') return '/admin/crm/propostas';
    if (pathname === '/admin/crm/relatorios') return '/admin/crm/leads';
    if (pathname === '/admin/atendimento/relatorios') return '/admin/atendimento/supervisao';
    if (pathname === '/admin/crm/roteiro' || pathname === '/admin/crm/pipelines'
        || pathname === '/admin/atendimento/configuracoes' || pathname === '/admin/equipe'
        || pathname === '/admin/notificacoes') return '/admin/configuracoes';
    return pathname;
}

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();
    const role = getStoredUser()?.role;
    const currentPath = navigationPath(pathname);
    const activeHref = navRoutes
        .filter((href) => currentPath === href || currentPath.startsWith(href + '/'))
        .sort((a, b) => b.length - a.length)[0];

    return (
        <div className="flex h-full w-60 flex-col border-r border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
                <Link href={defaultAdminPath(role)} onClick={onNavigate} className="flex items-center gap-2">
                    <Image
                        src="/images/logo-Infinity/infinity-symbol.webp"
                        alt=""
                        width={355}
                        height={128}
                        sizes="67px"
                        className="h-6 w-auto shrink-0 dark:invert"
                    />
                    <span className="whitespace-nowrap text-sm font-semibold text-foreground">Infinity Groups</span>
                </Link>
            </div>

            <nav aria-label="Menu administrativo" className="flex-1 space-y-4 overflow-y-auto p-3">
                {navigation.map(({ title, items }) => {
                    const visibleItems = items.filter(({ href }) => canAccessAdminPath(role, href));
                    if (!visibleItems.length) return null;

                    return (
                        <div key={title}>
                            <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">{title}</p>
                            <ul className="space-y-0.5">
                                {visibleItems.map(({ title: label, href, icon: Icon }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            onClick={onNavigate}
                                            aria-current={activeHref === href ? 'location' : undefined}
                                            className={cn(
                                                'flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                                                activeHref === href
                                                    ? 'bg-info font-semibold text-info-foreground'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                            )}
                                        >
                                            <Icon aria-hidden className="h-4 w-4 shrink-0" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-border p-3">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-danger-foreground hover:bg-danger transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
            </div>
        </div>
    );
}
