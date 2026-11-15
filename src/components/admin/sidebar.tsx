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
    Mail,
    Target,
    Headset,
    MonitorPlay,
    PhoneCall,
    Settings,
    UserCog,
    MessagesSquare,
    CalendarDays,
    ListTodo,
    BarChart3,
    FileSignature,
    Trophy,
    Package,
    ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BILLING_ENABLED } from '@/lib/features';
import { canAccessAdminPath } from '@/lib/admin-access';
import { DownloadRamalAppButton } from '@/components/ramal/DownloadRamalAppButton';
import { getStoredUser } from '@/services/crm-leads';

const navigation = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: Home,
    },
    {
        title: 'Clientes',
        href: '/admin/clientes',
        icon: Users,
    },
    {
        title: 'Contratos',
        href: '/admin/contratos',
        icon: FileText,
    },
    ...(BILLING_ENABLED ? [{
        title: 'Faturas',
        href: '/admin/faturas',
        icon: DollarSign,
    }] : []),
    {
        title: 'Leads',
        href: '/admin/crm/leads',
        icon: Target,
    },
    {
        title: 'Relatórios',
        href: '/admin/crm/relatorios',
        icon: BarChart3,
    },
    {
        title: 'Propostas',
        href: '/admin/crm/propostas',
        icon: FileSignature,
    },
    {
        title: 'Metas',
        href: '/admin/crm/metas',
        icon: Trophy,
    },
    {
        title: 'Ofertas',
        href: '/admin/crm/ofertas',
        icon: Package,
    },
    {
        title: 'Roteiro de ligação',
        href: '/admin/crm/roteiro',
        icon: ScrollText,
    },
    {
        title: 'Atendimento',
        href: '/admin/atendimento',
        icon: Headset,
    },
    {
        title: 'WhatsApp',
        href: '/admin/atendimento/whatsapp',
        icon: MessagesSquare,
    },
    {
        title: 'Agenda',
        href: '/admin/atendimento/agenda',
        icon: CalendarDays,
    },
    {
        title: 'Pendências',
        href: '/admin/atendimento/pendencias',
        icon: ListTodo,
    },
    {
        title: 'Supervisão',
        href: '/admin/atendimento/supervisao',
        icon: MonitorPlay,
    },
    {
        title: 'Configurações',
        href: '/admin/configuracoes',
        icon: Settings,
    },
    {
        title: 'Ramal e campanhas',
        href: '/admin/atendimento/configuracoes',
        icon: PhoneCall,
    },
    {
        title: 'Equipe',
        href: '/admin/equipe',
        icon: UserCog,
    },
    {
        title: 'Notificações',
        href: '/admin/notificacoes',
        icon: Mail,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const role = getStoredUser()?.role;

    return (
        <div className="flex h-full w-64 flex-col bg-card border-r border-border">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-border px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <Image
                        src="/images/logo-Infinity/infinity-symbol.webp"
                        alt="Infinity"
                        width={355}
                        height={128}
                        sizes="90px"
                        className="h-8 w-auto"
                    />
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Infinity</h2>
                        <p className="text-xs text-muted-foreground">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navigation.filter((item) => canAccessAdminPath(role, item.href)).map((item) => {
                    // Ativo so o item mais especifico (ex.: Supervisao nao acende Atendimento junto)
                    const matches = (href: string) => pathname === href || pathname.startsWith(href + '/');
                    const isActive =
                        matches(item.href) &&
                        !navigation.some((other) => other.href.length > item.href.length && matches(other.href));
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-blue-500/30'
                                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-border p-4 space-y-2">
                <DownloadRamalAppButton variant="sidebar" />
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
