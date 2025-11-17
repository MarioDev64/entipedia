'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

interface MainContentProps {
  children: ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed, shouldShowSidebar, shouldShowBottomNav } = useSidebar();

  return (
    <main
      className={cn(
        'transition-all duration-300 ease-in-out',
        // Mobile portrait: padding for mobile header at top and bottom nav at bottom
        shouldShowBottomNav && 'px-4 pt-14 pb-20',
        // Desktop/Landscape: padding for desktop header and sidebar
        shouldShowSidebar && 'mt-[var(--header-height)] p-8',
        // Lateral margin when sidebar is visible
        shouldShowSidebar &&
          (isCollapsed
            ? 'ml-[var(--sidebar-collapsed-width)]'
            : 'ml-[var(--sidebar-width)]')
      )}
    >
      {children}
    </main>
  );
}
