import { Activity, Clock3 } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Panel } from './ui';

export type ActivityLogItem = {
  id: number;
  event: string;
  description: string;
  actor: { id: number; name: string; role: string } | null;
  created_at: string;
  metadata?: Record<string, unknown>;
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));

  if (minutes < 60) {
    return `ha ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `ha ${hours} h`;
  }

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ActivityLogCard({ logs }: { logs: ActivityLogItem[] }) {
  return (
    <Panel>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Atividades</p>
          <h2 className="mt-2 text-xl font-black text-white">Log recente</h2>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2 text-indigo-300">
          <Activity className="h-5 w-5" />
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          compact
          title="Nenhuma atividade recente"
          description="As acoes importantes do sistema aparecerao aqui quando forem registradas."
          icon={<Clock3 className="h-5 w-5" />}
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
              <p className="text-sm font-medium text-slate-200">{log.description}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{log.actor?.name ?? 'Sistema'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>{formatRelativeDate(log.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
