import type { ReactNode } from 'react';

type AuthMode = 'login' | 'register';

type AuthShellProps = {
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
    children: ReactNode;
};

export default function AuthShell({ mode, onModeChange, children }: AuthShellProps) {
    const isLogin = mode === 'login';

    return (
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-cyan-400/30 blur-2xl" />
            <div className="absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-amber-400/30 blur-2xl" />

            <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">EducAI Platform</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                    {isLogin ? 'Welcome back, teacher.' : 'Create your EducAI account.'}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    {isLogin
                        ? 'Log in to build quizzes and track student performance in one place.'
                        : 'Sign up to start creating smart quizzes for your students.'}
                </p>

                <div className="mt-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => onModeChange('login')}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        } cursor-pointer`}
                    >
                        Log in
                    </button>
                    <button
                        type="button"
                        onClick={() => onModeChange('register')}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            !isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        } cursor-pointer`}
                    >
                        Register
                    </button>
                </div>

                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}
