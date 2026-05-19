import { Link } from '@inertiajs/react';

type PaginationLink = {
  url: string | null;
  label: string;
  active: boolean;
};

type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
  total?: number;
};

export type PaginatedData<T> = {
  data: T[];
  links: PaginationLink[];
  meta?: PaginationMeta;
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
  total?: number;
};

type PaginatorProps<T> = {
  pagination: PaginatedData<T>;
};

const decodeLabel = (label: string) =>
  label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»');

export function Paginator<T>({ pagination }: PaginatorProps<T>) {
  const meta = pagination.meta ?? {
    current_page: pagination.current_page,
    last_page: pagination.last_page,
    from: pagination.from,
    to: pagination.to,
    total: pagination.total,
  };
  const links = pagination.links ?? [];
  const lastPage = meta.last_page ?? 1;

  if (links.length === 0 || lastPage <= 1) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
      <div>
        {meta.total !== undefined && meta.from !== undefined && meta.to !== undefined
          ? `Mostrando ${meta.from}-${meta.to} de ${meta.total}`
          : `Pagina ${meta.current_page ?? 1} de ${lastPage}`}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link, index) => {
          const label = decodeLabel(link.label);
          const className = link.active
            ? 'rounded-lg border border-indigo-500/60 bg-indigo-500/10 px-3 py-1 text-indigo-200'
            : link.url
              ? 'rounded-lg border border-slate-800 px-3 py-1 text-slate-300 hover:border-indigo-500/40 hover:text-indigo-200'
              : 'rounded-lg border border-slate-900 px-3 py-1 text-slate-600';

          return link.url ? (
            <Link key={`${label}-${index}`} href={link.url} className={className}>
              {label}
            </Link>
          ) : (
            <span key={`${label}-${index}`} className={className}>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
