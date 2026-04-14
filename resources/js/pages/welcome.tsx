import { Head } from '@inertiajs/react';
import LoginForm from '@/components/auth/LoginForm';

export default function Welcome() {
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

                    <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/85 p-8 shadow-2xl backdrop-blur-xl">
                        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-cyan-400/30 blur-2xl" />
                        <div className="absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-amber-400/30 blur-2xl" />

                        <div className="relative">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">EducAI Platform</p>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Welcome back.</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Log in to access your dashboard and start working with your classes.
                            </p>

                            <div className="mt-6">
                                <LoginForm />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
