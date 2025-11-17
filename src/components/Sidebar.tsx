'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, FolderOpen, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePrefetchProjects } from '@/hooks/useProjects';
import { usePrefetchClients } from '@/hooks/useClients';
import { usePrefetchFiles } from '@/hooks/useFiles';

const navItems = [
  {
    title: 'Projects',
    icon: LayoutGrid,
    path: '/projects',
    prefetch: 'projects',
  },
  { title: 'Clients', icon: Users, path: '/clients', prefetch: 'clients' },
  { title: 'Files', icon: FolderOpen, path: '/files', prefetch: 'files' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, shouldShowSidebar } = useSidebar();
  const isMobile = useIsMobile();

  // Prefetch hooks
  const prefetchProjects = usePrefetchProjects();
  const prefetchClients = usePrefetchClients();
  const prefetchFiles = usePrefetchFiles();

  // Don't render sidebar in mobile portrait
  if (!shouldShowSidebar) {
    return null;
  }

  const handlePrefetch = (prefetchType: string) => {
    if (prefetchType === 'projects') {
      prefetchProjects();
    }
    // Clients y Files se agregarán después
  };

  return (
    <aside
      className={cn(
        'border-border bg-card fixed top-[var(--header-height)] left-0 z-40 h-[calc(100vh-var(--header-height))] border-r transition-all duration-300 ease-in-out',
        isCollapsed
          ? 'w-[var(--sidebar-collapsed-width)]'
          : 'w-[var(--sidebar-width)]'
      )}
    >
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              onMouseEnter={() => handlePrefetch(item.prefetch)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'text-muted-foreground hover:bg-muted hover:text-foreground',
                isActive && 'bg-accent/10 text-foreground font-semibold',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button - Only show in desktop or landscape tablet */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'border-border bg-card hover:bg-accent absolute top-1/2 -right-3 z-50 h-6 w-6 -translate-y-1/2 rounded-full border shadow-md transition-transform duration-300',
            isCollapsed && 'rotate-180'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </aside>
  );
};
