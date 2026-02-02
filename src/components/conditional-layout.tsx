'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if the current path is an admin, portal, or login route
    const isAdminRoute = pathname?.startsWith('/admin');
    const isPortalRoute = pathname?.startsWith('/portal');
    const isLoginRoute = pathname === '/login';

    // For admin, portal, and login routes, render without navbar and footer
    if (isAdminRoute || isPortalRoute || isLoginRoute) {
        return <>{children}</>;
    }

    // For public routes, render with navbar and footer
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">{children}</div>
            <Footer />
        </div>
    );
}
