'use client';

import { PortalSidebar } from '@/components/portal/sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

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

        if (user.role !== 'client') {
            console.error('❌ Access denied: User is not client, redirecting to login');
            // Clear localStorage and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        console.log('✅ Portal access granted');
        setIsAuthorized(true);
    }, [router]);

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
        <div className="flex h-screen bg-[#F6F6F6]">
            <PortalSidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
