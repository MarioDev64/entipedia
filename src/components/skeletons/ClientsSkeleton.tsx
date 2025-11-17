import { Skeleton } from '@/components/ui/skeleton';

export function ClientsSkeleton() {
  return (
    <div className="border-border bg-card rounded-lg border shadow-sm">
      <div className="p-4">
        {/* Table Header */}
        <div className="border-border mb-4 grid grid-cols-6 gap-4 border-b pb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Table Rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
          <div
            key={row}
            className="border-border grid grid-cols-6 gap-4 border-b py-4 last:border-0"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
