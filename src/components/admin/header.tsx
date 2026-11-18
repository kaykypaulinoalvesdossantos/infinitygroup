'use client';

import { Menu } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';

interface AdminHeaderProps {
    onMenuClick?: () => void;
    title?: string;
}

export function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">

            <button
                type="button"
                onClick={onMenuClick}
                aria-label="Abrir menu administrativo"
                className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
            >
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Page Title */}
            {title && (
                <h1 className="hidden text-xl font-bold text-foreground sm:block">
                    {title}
                </h1>
            )}

            <ThemeSwitcher className="ml-auto" />
        </header>
    );
}
