'use client';

import { ThemeToggle } from './ThemeToggle';
import { useSidebar } from '@/contexts/SidebarContext';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function MobileHeader() {
  const { shouldShowBottomNav } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Solo mostrar cuando el bottom nav está visible (mobile portrait)
  if (!shouldShowBottomNav) {
    return null;
  }

  const logoSrc = !mounted
    ? '/logo.webp'
    : resolvedTheme === 'dark'
    ? '/logo-dark.webp'
    : '/logo.webp';

  return (
    <header className="border-border bg-card fixed top-0 right-0 left-0 z-50 h-14 border-b">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative h-22 w-22 flex items-center justify-center rounded-lg overflow-hidden">
            <Image
              src={logoSrc}
              alt="Entipedia Logo"
              width={120}
              height={120}
              priority
              className="object-contain"
            />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
