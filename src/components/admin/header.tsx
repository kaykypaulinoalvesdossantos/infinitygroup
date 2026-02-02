'use client';

import { Menu, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
    onMenuClick?: () => void;
    title?: string;
}

export function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">

            {/* Page Title */}
            {title && (
                <h1 className="text-xl font-bold text-[#1A1A1A] hidden sm:block">
                    {title}
                </h1>
            )}

        </header>
    );
}
