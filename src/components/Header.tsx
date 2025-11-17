'use client';

import { ThemeToggle } from './ThemeToggle';
import { useSidebar } from '@/contexts/SidebarContext';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const Header = () => {
  const { shouldShowSidebar } = useSidebar();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Solo mostrar cuando sidebar está visible (desktop o landscape)
  if (!shouldShowSidebar) {
    return null;
  }

  // Mientras no está montado, puedes usar un logo por defecto (ej: light)
  const logoSrc = !mounted
    ? '/logo.webp'
    : resolvedTheme === 'dark'
    ? '/logo-dark.webp'
    : '/logo.webp';

  return (
    <header className="border-border bg-card fixed top-0 right-0 left-0 z-50 h-[var(--header-height)] border-b">
      <div className="flex h-full w-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="relative h-22 w-22 flex items-center justify-center rounded-lg overflow-hidden">
            <Image
              src={logoSrc}
              alt="Entipedia Logo"
              width={140}
              height={140}
              priority
              className="object-contain"
            />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
