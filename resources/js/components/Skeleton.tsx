import { cn, Panel } from './ui';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-800/60', className)} />;
}

export function DashboardSkeleton({ variant = 'default' }: { variant?: 'default' | 'table' | 'classes' }) {
  return (
    <div className="min-h-screen space-y-8 bg-[rgb(2,7,23)] p-6 md:p-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Panel>
        <div className="mb-5 flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className={variant === 'classes' ? 'grid gap-3 lg:grid-cols-2' : 'space-y-3'}>
          {Array.from({ length: variant === 'table' ? 7 : 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      </Panel>
    </div>
  );
}
