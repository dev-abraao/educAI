import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
  icon,
  compact = false,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/50 text-center text-slate-400 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-500">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
