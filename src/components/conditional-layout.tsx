'use client';

import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Check if the current path is an admin, portal, or login route
    const isAdminRoute = pathname?.startsWith('/admin');
    const isPortalRoute = pathname?.startsWith('/portal');
    const isLoginRoute = pathname === '/login';
    const isConceptRoute = pathname?.startsWith('/conceito');
    const isContentIntelligenceRoute = pathname?.startsWith('/content-intelligence');

    // For admin, portal, and login routes, render without navbar and footer
    if (isAdminRoute || isPortalRoute || isLoginRoute || isConceptRoute || isContentIntelligenceRoute) {
        return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
    }

    // For public routes, render with navbar and footer
    return (
        <MotionConfig reducedMotion="user">
            <div className="public-site flex flex-col min-h-screen">
                <Navbar />
                <div className="min-w-0 flex-grow">{children}</div>
                <Footer />
            </div>
        </MotionConfig>
    );
}
