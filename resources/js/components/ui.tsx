import type { ReactNode } from 'react';

export const cn = (...classes: (string | boolean | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen space-y-8 bg-[rgb(2,7,23)] p-6 text-slate-200 md:p-8', className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm backdrop-blur-sm', className)}>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  accent = 'text-white',
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-sm font-medium text-slate-400">{label}</div>
          <div className={cn('text-3xl font-bold', accent)}>{value}</div>
        </div>
        {icon && <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-slate-400">{icon}</div>}
      </div>
    </div>
  );
}

const badgeVariants: Record<string, string> = {
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  slate: 'border-slate-700 bg-slate-800/70 text-slate-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

export function StatusBadge({
  children,
  variant = 'slate',
}: {
  children: ReactNode;
  variant?: keyof typeof badgeVariants;
}) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', badgeVariants[variant])}>
      {children}
    </span>
  );
}
