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
    UserCog,
    MessagesSquare,
    BriefcaseBusiness,
    Workflow,
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
        title: 'Oportunidades',
        href: '/admin/crm/oportunidades',
        icon: BriefcaseBusiness,
    },
    {
        title: 'Pipelines',
        href: '/admin/crm/pipelines',
        icon: Workflow,
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
        title: 'Supervisão',
        href: '/admin/atendimento/supervisao',
        icon: MonitorPlay,
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
        <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-slate-200 px-6">
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
                        <h2 className="text-lg font-bold text-[#1A1A1A]">Infinity</h2>
                        <p className="text-xs text-[#64748B]">Admin Panel</p>
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
                                    ? 'bg-[#0076FF] text-white shadow-lg shadow-blue-500/30'
                                    : 'text-[#64748B] hover:bg-[#F6F6F6] hover:text-[#1A1A1A]'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-slate-200 p-4 space-y-2">
                <DownloadRamalAppButton variant="sidebar" />
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
            </div>
        </div>
    );
}
