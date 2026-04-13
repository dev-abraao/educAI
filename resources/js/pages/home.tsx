import { Head, Link, usePage } from '@inertiajs/react';
import { logout } from '@/routes/auth';
import type { Auth } from '@/types';

type HomePageProps = {
    auth: Auth;
};

export default function Home() {
    const { auth } = usePage<HomePageProps>().props;
    const userName = auth.user?.name ?? 'Teacher';

    return (
        <>
            <Head title="Home" />
            <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
                <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">EducAI</p>
                    <h1 className="mt-3 text-3xl font-black">Hello, {userName}.</h1>
                    <p className="mt-3 text-slate-300">
                        Your teacher dashboard starts here. Next we can build quiz creation, assignment, and grading flows.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                        >
                            Create your first quiz
                        </button>

                        <Link
                            href={logout.url()}
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
