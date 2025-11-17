'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

const navItems = [
  { title: 'Projects', icon: LayoutGrid, path: '/projects' },
  { title: 'Clients', icon: Users, path: '/clients' },
  { title: 'Files', icon: FolderOpen, path: '/files' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { shouldShowBottomNav } = useSidebar();

  useEffect(() => {
    // Detect keyboard visibility using visualViewport
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        // If viewport height is significantly less than window height, keyboard is visible
        setIsKeyboardVisible(windowHeight - viewportHeight > 150);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  // Only render if it should be shown
  if (!shouldShowBottomNav) {
    return null;
  }

  return (
    <nav
      className={cn(
        'border-border bg-card/95 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-sm transition-transform duration-200',
        isKeyboardVisible && 'translate-y-full'
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-3 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                'text-muted-foreground hover:text-foreground',
                isActive && 'text-primary font-semibold'
              )}
            >
              <item.icon
                className={cn('h-5 w-5', isActive && 'text-primary')}
              />
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
