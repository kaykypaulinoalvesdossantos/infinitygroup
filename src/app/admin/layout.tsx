'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Skip auth check for login page
        if (pathname === '/login') {
            setIsAuthorized(true);
            return;
        }

        // Check if user is authenticated and is ADMIN
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.warn('⚠️ No user found, redirecting to login');
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        console.log('🔍 Checking admin access for user:', user);

        if (user.role !== 'admin') {
            console.error('❌ Access denied: User is not admin, redirecting to login');
            // Clear localStorage and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        console.log('✅ Admin access granted');
        setIsAuthorized(true);
    }, [pathname, router]);

    // Se for a página de login, renderiza sem layout
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Show nothing while checking authorization
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

    // Para todas as outras páginas, renderiza com sidebar
    return (
        <div className="flex h-screen overflow-hidden bg-[#F6F6F6]">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block">
                <AdminSidebar />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        />

                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
                        >
                            <div className="relative h-full">
                                <AdminSidebar />
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-5 w-5 text-[#1A1A1A]" />
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
