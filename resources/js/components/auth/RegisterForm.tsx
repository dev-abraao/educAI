import { useForm } from '@inertiajs/react';
import { register } from '@/routes/auth';

type RegisterFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function RegisterForm() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(register.url(), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Full name
                </label>
                <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    value={data.name}
                    onChange={(event) => setData('name', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2"
                    placeholder="Ana Silva"
                    required
                />
                {errors.name && <p className="mt-1 text-sm font-medium text-rose-600">{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                </label>
                <input
                    id="register-email"
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
                <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password
                </label>
                <input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2"
                    placeholder="Create a strong password"
                    required
                />
                {errors.password && <p className="mt-1 text-sm font-medium text-rose-600">{errors.password}</p>}
            </div>

            <div>
                <label htmlFor="register-password-confirmation" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Confirm password
                </label>
                <input
                    id="register-password-confirmation"
                    type="password"
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-cyan-500 transition focus:ring-2"
                    placeholder="Repeat your password"
                    required
                />
                {errors.password_confirmation && (
                    <p className="mt-1 text-sm font-medium text-rose-600">{errors.password_confirmation}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={processing}
                className="cursor-pointer w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
                {processing ? 'Creating account...' : 'Create account'}
            </button>
        </form>
    );
}
