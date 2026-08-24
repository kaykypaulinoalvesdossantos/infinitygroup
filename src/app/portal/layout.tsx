'use client';

import { PortalSidebar } from '@/components/portal/sidebar';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Check if user is authenticated and is CLIENT
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.warn('⚠️ No user found, redirecting to login');
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        console.log('🔍 Checking portal access for user:', user);

        const role = user.role?.toUpperCase();
        if (role !== 'CLIENTE') {
            console.error('❌ Access denied: User is not client, redirecting to login');
            // Clear localStorage and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        console.log('✅ Portal access granted');

        // Check if password change is required
        if (user.mustChangePassword && window.location.pathname !== '/portal/primeiro-acesso') {
            console.log('🔄 First access required, forcing redirect to password change');
            router.push('/portal/primeiro-acesso');
            return;
        }

        setIsAuthorized(true);
    }, [router]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileMenuOpen]);

    // Show loading while checking authorization
    if (!isAuthorized) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F6F6F6]">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#0076FF]"></div>
                    <p className="text-sm text-slate-500">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] min-w-0 overflow-hidden bg-[#F6F6F6]">
            <aside className="hidden shrink-0 md:block">
                <PortalSidebar />
            </aside>

            {mobileMenuOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Fechar menu do portal"
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 max-w-[88vw] md:hidden">
                        <PortalSidebar />
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Fechar menu"
                            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </aside>
                </>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0076FF]">Infinity</p>
                        <p className="text-sm font-bold text-slate-900">Portal do Cliente</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Abrir menu do portal"
                        aria-expanded={mobileMenuOpen}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </header>
                <main className="min-w-0 flex-1 overflow-y-auto overflow-x-clip">
                    {children}
                </main>
            </div>
        </div>
    );
}
