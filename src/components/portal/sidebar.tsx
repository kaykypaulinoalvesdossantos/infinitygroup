'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    CreditCard,
    FileText,
    User,
    LogOut,
    HelpCircle,
    Package,
    Shield,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navigation = [
    {
        title: 'Dashboard',
        href: '/portal/dashboard',
        icon: Home,
    },
    {
        title: 'Assinaturas',
        href: '/portal/assinaturas',
        icon: Package,
    },
    {
        title: 'Faturas',
        href: '/portal/faturas',
        icon: FileText,
    },
    {
        title: 'Meu Perfil',
        href: '/portal/perfil',
        icon: User,
    },
];

export function PortalSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Error parsing user', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('json-server-user');
        router.push('/login');
    };

    return (
        <div className="flex h-full w-[280px] flex-col bg-white border-r border-[#F1F5F9] shadow-inner relative z-50">
            {/* Logo Section */}
            <div className="flex h-24 items-center px-8">
                <Link href="/portal/dashboard" className="flex items-center gap-4 group">
                    <div className="p-2.5 bg-gradient-to-br from-[#0076FF] to-[#0060D0] rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <img
                            src="/images/logo-Infinity/logo-sem-escrita.svg"
                            alt="Infinity"
                            className="h-7 w-7 brightness-0 invert"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight leading-none">Infinity</h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0076FF] opacity-80">Portal</span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-3">
                <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] px-4 mb-6 opacity-60">Menu Principal</p>
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={cn(
                                'flex items-center justify-between rounded-[1.25rem] px-5 py-4 transition-all duration-300 group',
                                isActive
                                    ? 'bg-gradient-to-r from-[#0076FF] to-[#0060D0] text-white shadow-xl shadow-blue-500/30 font-black'
                                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1A1A1A] font-bold'
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-[#0076FF]")} />
                                <span className="text-sm tracking-tight">{item.title}</span>
                            </div>
                            {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section - Premium Card */}
            <div className="p-6 space-y-6">
                <div className="bg-[#F8FAFC] p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Shield className="h-16 w-16 text-[#0076FF]" />
                    </div>
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest opacity-60">Logado agora</span>
                        <p className="text-sm font-black text-[#1A1A1A] truncate max-w-full leading-tight">
                            {user?.name || 'Carregando...'}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Link
                        href="https://wa.me/5511945332464"
                        target="_blank"
                        className="flex items-center gap-3 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0076FF] transition-all"
                    >
                        <HelpCircle className="h-4 w-4" />
                        Precisa de Ajuda?
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut className="h-4 w-4" />
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
}
