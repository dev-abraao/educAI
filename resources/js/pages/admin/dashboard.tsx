import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type ManagedRole = 'teacher' | 'student';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: ManagedRole;
    created_at: string;
};

type AdminDashboardProps = {
    users: ManagedUser[];
    filters: {
        role: string;
    };
    roles: ManagedRole[];
};

type StoreUserFormData = {
    name: string;
    email: string;
    role: ManagedRole;
    password: string;
    password_confirmation: string;
};

type UpdateUserFormData = {
    name: string;
    email: string;
    role: ManagedRole;
    password: string;
    password_confirmation: string;
};

export default function AdminDashboard() {
    const { users, filters, roles } = usePage<AdminDashboardProps>().props;
    const [editingUserId, setEditingUserId] = useState<number | null>(null);

    const storeForm = useForm<StoreUserFormData>({
        name: '',
        email: '',
        role: 'teacher',
        password: '',
        password_confirmation: '',
    });

    const updateForm = useForm<UpdateUserFormData>({
        name: '',
        email: '',
        role: 'teacher',
        password: '',
        password_confirmation: '',
    });

    const usersByRole = useMemo(() => {
        return {
            teacher: users.filter((user) => user.role === 'teacher').length,
            student: users.filter((user) => user.role === 'student').length,
        };
    }, [users]);

    const onFilterChange = (role: string) => {
        router.get(
            '/admin/dashboard',
            { role: role || undefined },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const submitStore = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        storeForm.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                storeForm.reset();
                storeForm.setData('role', 'teacher');
            },
        });
    };

    const startEditing = (user: ManagedUser) => {
        setEditingUserId(user.id);
        updateForm.clearErrors();
        updateForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: '',
            password_confirmation: '',
        });
    };

    const cancelEditing = () => {
        setEditingUserId(null);
        updateForm.reset();
    };

    const submitUpdate = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (editingUserId === null) {
            return;
        }

        updateForm.put(`/admin/users/${editingUserId}`, {
            preserveScroll: true,
            onSuccess: () => {
                cancelEditing();
            },
        });
    };

    const deleteUser = (userId: number) => {
        if (!window.confirm('Delete this user?')) {
            return;
        }

        router.delete(`/admin/users/${userId}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Admin Dashboard" />
            <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-8">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_1.9fr]">
                    <section className="rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Admin</p>
                        <h1 className="mt-3 text-2xl font-black">Register Users</h1>
                        <p className="mt-2 text-sm text-slate-300">Create teacher and student accounts from here.</p>

                        <form onSubmit={submitStore} className="mt-6 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-200" htmlFor="name">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    value={storeForm.data.name}
                                    onChange={(event) => storeForm.setData('name', event.target.value)}
                                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500 focus:ring-2"
                                    required
                                />
                                {storeForm.errors.name && (
                                    <p className="mt-1 text-sm font-medium text-rose-400">{storeForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-200" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={storeForm.data.email}
                                    onChange={(event) => storeForm.setData('email', event.target.value)}
                                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500 focus:ring-2"
                                    required
                                />
                                {storeForm.errors.email && (
                                    <p className="mt-1 text-sm font-medium text-rose-400">{storeForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-200" htmlFor="role">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={storeForm.data.role}
                                    onChange={(event) => storeForm.setData('role', event.target.value as ManagedRole)}
                                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500 focus:ring-2"
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                {storeForm.errors.role && (
                                    <p className="mt-1 text-sm font-medium text-rose-400">{storeForm.errors.role}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-200" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={storeForm.data.password}
                                    onChange={(event) => storeForm.setData('password', event.target.value)}
                                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500 focus:ring-2"
                                    required
                                />
                                {storeForm.errors.password && (
                                    <p className="mt-1 text-sm font-medium text-rose-400">{storeForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label
                                    className="mb-1.5 block text-sm font-semibold text-slate-200"
                                    htmlFor="password_confirmation"
                                >
                                    Confirm password
                                </label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={storeForm.data.password_confirmation}
                                    onChange={(event) => storeForm.setData('password_confirmation', event.target.value)}
                                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500 focus:ring-2"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={storeForm.processing}
                                className="w-full rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {storeForm.processing ? 'Creating...' : 'Create user'}
                            </button>
                        </form>
                    </section>

                    <section className="rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Users</p>
                                <h2 className="mt-2 text-2xl font-black">Manage Accounts</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filters.role ?? ''}
                                    onChange={(event) => onFilterChange(event.target.value)}
                                    className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                                >
                                    <option value="">All roles</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                            <span className="rounded-lg bg-slate-800 px-3 py-1">Teachers: {usersByRole.teacher}</span>
                            <span className="rounded-lg bg-slate-800 px-3 py-1">Students: {usersByRole.student}</span>
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400">
                                        <th className="py-3 pr-3">Name</th>
                                        <th className="py-3 pr-3">Email</th>
                                        <th className="py-3 pr-3">Role</th>
                                        <th className="py-3 pr-3">Created</th>
                                        <th className="py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-800 align-top">
                                            <td className="py-3 pr-3">{user.name}</td>
                                            <td className="py-3 pr-3">{user.email}</td>
                                            <td className="py-3 pr-3 capitalize">{user.role}</td>
                                            <td className="py-3 pr-3">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(user)}
                                                        className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteUser(user.id)}
                                                        className="rounded-lg border border-rose-500/50 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-slate-400">
                                                No users found for this filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {editingUserId !== null && (
                            <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                                <h3 className="text-lg font-bold">Edit user</h3>
                                <form onSubmit={submitUpdate} className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <input
                                        value={updateForm.data.name}
                                        onChange={(event) => updateForm.setData('name', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="Name"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={updateForm.data.email}
                                        onChange={(event) => updateForm.setData('email', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="Email"
                                        required
                                    />
                                    <select
                                        value={updateForm.data.role}
                                        onChange={(event) => updateForm.setData('role', event.target.value as ManagedRole)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="password"
                                        value={updateForm.data.password}
                                        onChange={(event) => updateForm.setData('password', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="New password (optional)"
                                    />
                                    <input
                                        type="password"
                                        value={updateForm.data.password_confirmation}
                                        onChange={(event) => updateForm.setData('password_confirmation', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="Confirm new password"
                                    />

                                    <div className="sm:col-span-2 flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={updateForm.processing}
                                            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-70"
                                        >
                                            Save changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {(updateForm.errors.name ||
                                        updateForm.errors.email ||
                                        updateForm.errors.role ||
                                        updateForm.errors.password) && (
                                        <div className="sm:col-span-2 text-sm text-rose-400">
                                            {updateForm.errors.name ||
                                                updateForm.errors.email ||
                                                updateForm.errors.role ||
                                                updateForm.errors.password}
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

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
                    </section>
                </div>
            </main>
        </>
    );
}
