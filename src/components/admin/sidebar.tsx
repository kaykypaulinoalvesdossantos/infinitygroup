'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    FileText,
    DollarSign,
    LogOut,
    Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    {
        title: 'Faturas',
        href: '/admin/faturas',
        icon: DollarSign,
    },
    {
        title: 'Notificações',
        href: '/admin/notificacoes',
        icon: Mail,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
            {/* Logo */}
            <div className="flex h-20 items-center border-b border-slate-200 px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <img
                        src="/images/logo-Infinity/logo-sem-escrita.svg"
                        alt="Infinity"
                        className="h-10 w-auto"
                    />
                    <div>
                        <h2 className="text-lg font-bold text-[#1A1A1A]">Infinity</h2>
                        <p className="text-xs text-[#64748B]">Admin Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
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
