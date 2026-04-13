import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Welcome() {
    const [mode, setMode] = useState<'login' | 'register'>('login');

    return (
        <>
            <Head title="EducAI" />
            <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/35 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-amber-400/25 blur-3xl" />
                    <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                </div>

                <div className="relative mx-auto flex min-h-[85vh] w-full max-w-6xl items-center justify-center gap-10">
                    <section className="hidden max-w-xl lg:block">
                        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">EducAI</p>
                        <h2 className="mt-5 text-5xl font-black leading-tight text-white">
                            Build better quizzes.
                            <br />
                            Teach with confidence.
                        </h2>
                        <p className="mt-5 text-lg text-slate-300">
                            EducAI helps teachers create focused assessments, monitor student progress, and adapt content
                            faster.
                        </p>
                    </section>

                    <AuthShell mode={mode} onModeChange={setMode}>
                        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
                    </AuthShell>
                </div>
            </main>
        </>
    );
}
