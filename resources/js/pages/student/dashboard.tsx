import { Head, Link } from '@inertiajs/react';

export default function StudentDashboard() {
    return (
        <>
            <Head title="Student Dashboard" />
            <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Student Dashboard</p>
                    <h1 className="mt-3 text-3xl font-black">Welcome, student.</h1>
                    <p className="mt-3 text-slate-300">
                        This area will show assigned quizzes, deadlines, and your progress over time.
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
