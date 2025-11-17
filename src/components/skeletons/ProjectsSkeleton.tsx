'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export function ProjectsSkeleton() {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        'grid gap-6 transition-all duration-300',
        'grid-cols-1 md:grid-cols-2',
        isCollapsed
          ? 'lg:grid-cols-4 xl:grid-cols-5'
          : 'lg:grid-cols-3 xl:grid-cols-4'
      )}
    >
      {[1, 2, 3, 4].map((column) => (
        <div key={column} className="flex flex-col">
          {/* Column Header */}
          <div className="bg-muted mb-4 flex items-center justify-between rounded-lg px-4 py-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>

          {/* Project Cards */}
          <div className="flex flex-1 flex-col gap-3 rounded-lg p-2">
            {[1, 2, 3].map((card) => (
              <div
                key={card}
                className="border-border bg-card rounded-lg border p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-3 h-4 w-2/3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
