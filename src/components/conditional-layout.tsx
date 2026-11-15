'use client';

import { usePathname } from 'next/navigation';
import { MotionConfig } from 'framer-motion';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';

const systemRoutes = new Set([
    'admin',
    'portal',
    'login',
    'client',
    'content-intelligence',
    'ramal',
]);

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const routeSegment = pathname?.split('/').filter(Boolean)[0];
    const usesSystemTheme = routeSegment ? systemRoutes.has(routeSegment) : false;
    const isStandaloneRoute = usesSystemTheme || routeSegment === 'conceito' || routeSegment === 'conceito-evolucao';

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            forcedTheme={usesSystemTheme ? undefined : 'light'}
        >
            <MotionConfig reducedMotion="user">
                {isStandaloneRoute ? children : (
                    <div className="public-site flex flex-col min-h-screen bg-card text-foreground">
                        <Navbar />
                        <div className="min-w-0 flex-grow">{children}</div>
                        <Footer />
                    </div>
                )}
            </MotionConfig>
        </ThemeProvider>
    );
}
