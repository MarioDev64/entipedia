'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { useState, useEffect } from 'react';

export function FilesSkeleton() {
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a simple skeleton without dynamic classes during SSR
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="border-border bg-card rounded-lg border p-4"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 flex-shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // After mounting, use dynamic classes based on sidebar state
  return (
    <div
      className={cn(
        'grid gap-4 transition-all duration-300',
        'grid-cols-1 sm:grid-cols-2',
        isCollapsed
          ? 'lg:grid-cols-4 xl:grid-cols-5'
          : 'lg:grid-cols-3 xl:grid-cols-4'
      )}
    >
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="border-border bg-card rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 flex-shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <div className="mt-2 flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
