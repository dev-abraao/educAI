import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { cn } from "@/components/ui";

function SidebarItem({ icon, label, active, href, collapsed }: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  href: string,
  collapsed?: boolean,
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center",
        active
          ? "bg-indigo-600/20 text-indigo-400"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
      )}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      <span className={cn("whitespace-nowrap transition-all duration-200", collapsed && "w-0 overflow-hidden opacity-0")}>
        {label}
      </span>
    </Link>
  );
}

const roleLabels: { [key: string]: string } = {
  student: "Aluno",
  teacher: "Professor",
  admin: "Administrador"
};


export function DashboardShell({ children }: { children: React.ReactNode }) {
  const url = usePage().url;
  const { flash, auth } = usePage().props as any;
  const role = auth.user.role;
  const classes = Array.isArray(auth.classes) ? auth.classes : [];
  const [isCollapsed, setIsCollapsed] = useState(() => (
    typeof window !== 'undefined' &&
    window.localStorage.getItem('educai-shell-collapsed') === 'true'
  ));

  const toggleShell = () => {
    setIsCollapsed((current) => {
      const next = !current;
        window.localStorage.setItem('educai-shell-collapsed', String(next));

      return next;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[rgb(2,7,23)] font-sans text-slate-200">
      <aside
        className={cn(
          "w-full bg-[#030b1c] border-r border-slate-800 flex flex-col shadow-xl z-10 transition-[width] duration-200 ease-out",
          isCollapsed ? "md:w-20" : "md:w-64",
        )}
      >
        <button
          type="button"
          onClick={toggleShell}
          className={cn(
            "p-4 border-b border-slate-800 flex items-center gap-3 text-left transition-colors hover:bg-slate-900/50",
            isCollapsed && "md:justify-center",
          )}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-900/20">
            <img
              src="/Icon.png"
              alt="Logo"
              className="w-7 h-7 object-contain invert brightness-0"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          <div className={cn("transition-all duration-200", isCollapsed && "md:w-0 md:overflow-hidden md:opacity-0")}>
            <div className="font-bold text-white leading-tight">EducAI</div>
            <div className="text-xs text-indigo-400 font-medium">{roleLabels[role]}</div>
          </div>
        </button>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {role === 'student' && (
             <>
               <h1 className={cn("mx-auto x-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600", isCollapsed && "md:hidden")}>
                 Minhas Turmas
               </h1>
               {classes.length === 0 ? (
                 <p className={cn("px-3 text-xs text-slate-500", isCollapsed && "md:hidden")}>Nenhuma turma cadastrada.</p>
               ) : (
                 <ul className="space-y-2">
                   {classes.map((classItem: { id: number; name: string }) => (
                     <li key={classItem.id}>
                       <Link
                         href={`/student/dashboard#class-${classItem.id}`}
                         className="group flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-950/20 px-4 py-2 text-base font-semibold text-blue-200 transition-all hover:border-blue-400/60 hover:bg-blue-900/30 hover:text-blue-100"
                       >
                         <span className={cn(isCollapsed && "md:sr-only")}>{classItem.name}</span>
                         <span>{isCollapsed ? classItem.name.slice(0, 1).toUpperCase() : '→'}</span>
                       </Link>
                     </li>
                   ))}
                 </ul>
               )}
             </>
          )}
          {role === 'admin' && (
             <>
               <SidebarItem
                 label="Gerenciar"
                 active
                 href="/admin/dashboard"
                 collapsed={isCollapsed}
                 icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
               />
             </>
          )}
          {role === 'teacher' && (
             <>
               <SidebarItem
                 label="Quizzes"
                 active={url === '/teacher/dashboard'}
                 href="/teacher/dashboard"
                 collapsed={isCollapsed}
                 icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
               />
               <SidebarItem
                 label="Gerenciar Turmas"
                 active={url === '/teacher/classes'}
                 href="/teacher/classes"
                 collapsed={isCollapsed}
                 icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>}
               />

             </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-3 transition-colors gap-2", isCollapsed && "md:justify-center")}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <Link
              href="/logout"
              method="post"
              as="button"
              className={cn("w-full flex cursor-pointer items-center py-2.5 text-sm font-medium transition-colors text-left", isCollapsed && "md:sr-only")}
            >
              Sair
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-[rgb(2,7,23)] overflow-y-auto scroll-smooth">
        {flash.error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {flash.error}
          </div>
        )}
        {flash.status && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {flash.status}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
