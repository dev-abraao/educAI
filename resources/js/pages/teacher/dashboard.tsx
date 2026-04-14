import { Head, Link } from '@inertiajs/react';

export default function TeacherDashboard() {
    return (
        <>
            <Head title="Teacher Dashboard" />
            <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Teacher Dashboard</p>
                    <h1 className="mt-3 text-3xl font-black">Welcome, teacher.</h1>
                    <p className="mt-3 text-slate-300">
                        This space is ready for quiz creation, assignment management, and class performance analytics.
                    </p>

                    <div className="mt-8">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
