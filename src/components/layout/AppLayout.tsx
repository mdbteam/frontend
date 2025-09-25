// src/components/layout/AppLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';

import { AppNavbar } from './Navbar';
import { AppFooter } from './AppFooter';

interface AppLayoutProps {
    readonly children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-100">
            <AppNavbar />
            <main className="flex-grow">{children}</main>
            <AppFooter />
        </div>
    );
}