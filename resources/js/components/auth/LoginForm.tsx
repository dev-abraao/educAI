import { useForm } from '@inertiajs/react';
import { login } from '@/routes/auth';

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginForm() {
    const { data, setData, post, processing, errors, reset } = useForm<LoginFormData>({
        email: '',
        password: '',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(login.url(), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                </label>
                <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2"
                    placeholder="teacher@school.edu"
                    required
                />
                {errors.email && <p className="mt-1 text-sm font-medium text-rose-600">{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password
                </label>
                <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2"
                    placeholder="Your password"
                    minLength={8}
                    required
                />
                {errors.password && <p className="mt-1 text-sm font-medium text-rose-600">{errors.password}</p>}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {processing ? 'Logging in...' : 'Log in'}
            </button>
        </form>
    );
}
