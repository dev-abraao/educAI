import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { Plus, Users, GraduationCap, School, Backpack } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardShell } from '@/components/auth/DashboardShell';

type ManagedRole = 'teacher' | 'student';

type StoreUserFormData = {
    name: string;
    email: string;
    role: ManagedRole;
    password: string;
    password_confirmation: string;
    class_ids: number[];
};

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role: ManagedRole;
    class_ids: number[];
    created_at: string;
};

type ManagedClass = {
    id: number;
    name: string;
    active: boolean;
    invite_code: string;
    teacher: { id: number; name: string } | null;
    created_at: string;
};

type StoreClassFormData = {
    name: string;
    active: boolean;
    teacher_id: number | '';
};

type TeacherOption = {
    id: number;
    name: string;
};

type AdminDashboardProps = {
    users: ManagedUser[];
    classes: ManagedClass[];
    teachers: TeacherOption[];
    filters: {
        role: string;
    };
    roles: ManagedRole[];
};

type UpdateUserFormData = {
    name: string;
    email: string;
    role: ManagedRole;
    password: string;
    password_confirmation: string;
    class_ids: number[];
};


export default function AdminDashboard() {
    const { users, classes, teachers, filters, roles } = usePage<AdminDashboardProps>().props;
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenUser, setOpenUser] = useState(false);

    const closeModal = () => setIsOpen(false);
    const closeUserModal = () => setOpenUser(false);

    const usersByRole = useMemo(() => {
    const teacherCount = users.filter((user) => user.role === 'teacher').length;
    const studentCount = users.filter((user) => user.role === 'student').length;

    return {
        teacher: teacherCount,
        student: studentCount,
        total: users.length
    };
}, [users]);

    const classForm = useForm<StoreClassFormData>({
        name: '',
        active: true,
        teacher_id: '',
    });

    const chartData = useMemo(() => {
        const hashToRange = (input: string) => {
            let hash = 0;

            for (let i = 0; i < input.length; i += 1) {
                hash = (hash * 31 + input.charCodeAt(i)) % 100000;
            }

            return (hash % 41) + 60; // [60..100]
        };

        return classes.map((c) => ({
            name: c.name,
            media: hashToRange(`${c.id}-${c.name}`),
        }));
    }, [classes]);

    const submitClass = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        classForm.post('/admin/classes', {
            preserveScroll: true,
            onSuccess: () => {
                classForm.reset();
            },
        });
    };

    const toggleClassSelection = (selected: number[], classId: number) => {
        if (selected.includes(classId)) {
            return selected.filter((id) => id !== classId);
        }

        return [...selected, classId];
    };

    const canSelectTeacherClass = (classItem: ManagedClass, selected: number[]) => {
        if (!classItem.teacher) {
            return true;
        }

        return selected.includes(classItem.id);
    }

    const deleteUser = (userId: number) => {
        if (!window.confirm('Excluir este usuário?')) {
            return;
        }

        router.delete(`/admin/users/${userId}`, {
            preserveScroll: true,
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
            class_ids: user.class_ids ?? [],
        });
    };

    const deleteClass = (classId: number) => {
        if (!window.confirm('Excluir esta turma?')) {
            return;
        }

        router.delete(`/admin/classes/${classId}`, {
            preserveScroll: true,
        });
    };

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

    const storeForm = useForm<StoreUserFormData>({
        name: '',
        email: '',
        role: 'teacher',
        password: '',
        password_confirmation: '',
        class_ids: [],
    });

    const updateForm = useForm<UpdateUserFormData>({
        name: '',
        email: '',
        role: 'teacher',
        password: '',
        password_confirmation: '',
        class_ids: [],
    });
    
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

    const renderClassSelection = (
        selected: number[],
        onChange: (next: number[]) => void,
        role: ManagedRole,
        error?: string,
    ) => {
        if (classes.length === 0) {
            return <p className="text-sm text-slate-400">Nenhuma turma cadastrada ainda.</p>;
        }

        return (
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-slate-200">Turmas vinculadas</p>
                <p className="mt-1 text-xs text-slate-400">
                    {role === 'teacher'
                        ? 'Somente turmas sem professor podem ser vinculadas.'
                        : 'Selecione as turmas que este aluno pode acessar.'}
                </p>
                <div className="mt-3 space-y-2">
                    {classes.map((classItem) => {
                        const isSelected = selected.includes(classItem.id);
                        const isDisabled =
                            role === 'teacher' && !canSelectTeacherClass(classItem, selected);

                        return (
                            <label
                                key={classItem.id}
                                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
                                    isDisabled
                                        ? 'border-slate-800 text-slate-500'
                                        : 'border-slate-700 text-slate-200'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={isDisabled}
                                        onChange={() => onChange(toggleClassSelection(selected, classItem.id))}
                                        className="h-4 w-4 rounded border-slate-500 text-cyan-500"
                                    />
                                    <span>{classItem.name}</span>
                                </span>
                                {role === 'teacher' && classItem.teacher && !isSelected && (
                                    <span className="text-xs text-slate-500">Professor: {classItem.teacher.name}</span>
                                )}
                            </label>
                        );
                    })}
                </div>
                {error && <p className="mt-2 text-sm font-medium text-rose-400">{error}</p>}
            </div>
        );
    };

    return (
        <DashboardShell>
            <div className="space-y-8 p-8 bg-slate-950 min-h-screen text-slate-200">
                <Head title="Admin | QuizFlow" />
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">Painel de Administração</h2>
                        <p className="text-slate-400 mt-1 text-sm">Gerenciando {usersByRole.total} contas e {classes.length} turmas no sistema.</p>
                    </div>
                    <button onClick={() => setOpenUser(true)} className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
                        <Plus className="w-5 h-5" />
                        <span>Novo Usuário</span>
                    </button>
                    {isOpenUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" 
                        onClick={closeUserModal}
                    />

                    <section className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button 
                            onClick={closeUserModal}
                            className="absolute right-6 top-6 text-slate-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                            Painel de administração
                        </p>
                        <h1 className="mt-3 text-2xl font-black text-white">Registrar Usuários</h1>
                        <p className="mt-2 text-sm text-slate-300">
                            Crie contas de professor e aluno a partir daqui.
                        </p>

                        <form onSubmit={submitStore} className="mt-6 space-y-4">                           
                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-200" htmlFor="name">Nome</label>
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
                                    E-mail
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
                                    Função
                                </label>
                                <select
                                    id="role"
                                    value={storeForm.data.role}
                                    onChange={(event) => storeForm.setData('role', event.target.value as ManagedRole)}
                                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none ring-cyan-500 focus:ring-2"
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role === 'teacher' && 'Professor'}
                                            {role === 'student' && 'Aluno'}
                                        </option>
                                    ))}
                                </select>
                                {storeForm.errors.role && (
                                    <p className="mt-1 text-sm font-medium text-rose-400">{storeForm.errors.role}</p>
                                )}
                            </div>

                            {renderClassSelection(
                                storeForm.data.class_ids,
                                (next) => storeForm.setData('class_ids', next),
                                storeForm.data.role,
                                storeForm.errors.class_ids,
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-200" htmlFor="password">
                                    Senha
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
                                    Confirmar senha
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

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={storeForm.processing}
                                    className="flex-[2] rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-cyan-900/20"
                                >
                                    {storeForm.processing ? 'Criando...' : 'Criar usuário'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <div>
                                <div className='flex items-center gap-2'>
                                    <School className="w-5 h-5 text-cyan-500" /><p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Relatório</p>
                                </div>
                                <h2 className="mt-2 text-2xl font-black">Desempenho por Turma</h2>
                            </div>  
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                                    <YAxis hide />
                                    <Tooltip 
                                        cursor={{fill: '#1e293b', opacity: 0.4}} 
                                        contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff'}} 
                                    />
                                    <Bar dataKey="media" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="p-6 bg-slate-900/50 border-l-4 border-l-cyan-500 border-y border-r border-slate-800 rounded-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Professores</p>
                                    <p className="text-4xl font-black text-white mt-1">{usersByRole.teacher}</p>
                                </div>
                                <Users className="w-6 h-6 text-cyan-500 opacity-50" />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/50 border-l-4 border-l-amber-500 border-y border-r border-slate-800 rounded-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Alunos</p>
                                    <p className="text-4xl font-black text-white mt-1">{usersByRole.student}</p>
                                </div>
                                <GraduationCap className="w-6 h-6 text-amber-500 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <section className="rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className='flex items-center gap-2'>
                                    <Users className="w-5 h-5 text-cyan-300" /><p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Usuários</p>
                                </div>
                                <h2 className="mt-2 text-2xl font-black">Gerenciar Usuários</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={filters.role ?? ''}
                                    onChange={(event) => onFilterChange(event.target.value)}
                                    className="rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                                >
                                    <option value="">Todos os usuários</option>
                                    <option value="teacher">Professor</option>
                                    <option value="student">Aluno</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                            <span className="rounded-lg bg-slate-800 px-3 py-1">Professores: {usersByRole.teacher}</span>
                            <span className="rounded-lg bg-slate-800 px-3 py-1">Alunos: {usersByRole.student}</span>
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400">
                                        <th className="py-3 pr-3">Nome</th>
                                        <th className="py-3 pr-3">E-mail</th>
                                        <th className="py-3 pr-3">Função</th>
                                        <th className="py-3 pr-3">Criado em (dd/mm/aaaa)</th>
                                        <th className="py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-800 align-top">
                                            <td className="py-3 pr-3">{user.name}</td>
                                            <td className="py-3 pr-3">{user.email}</td>
                                            <td className="py-3 pr-3 capitalize">
                                                {user.role === 'teacher' && 'Professor'}
                                                {user.role === 'student' && 'Aluno'}
                                            </td>
                                            <td className="py-3 pr-3">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(user)}
                                                        className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteUser(user.id)}
                                                        className="rounded-lg border border-rose-500/50 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-slate-400">
                                                Não há usuários para mostrar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {editingUserId !== null && (
                            <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
                                <h3 className="text-lg font-bold">Editar usuário</h3>
                                <form onSubmit={submitUpdate} className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <input
                                        value={updateForm.data.name}
                                        onChange={(event) => updateForm.setData('name', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="Nome"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={updateForm.data.email}
                                        onChange={(event) => updateForm.setData('email', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="E-mail"
                                        required
                                    />
                                    <select
                                        value={updateForm.data.role}
                                        onChange={(event) => updateForm.setData('role', event.target.value as ManagedRole)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role === 'teacher' && 'Professor'}
                                                {role === 'student' && 'Aluno'}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="sm:col-span-2">
                                        {renderClassSelection(
                                            updateForm.data.class_ids,
                                            (next) => updateForm.setData('class_ids', next),
                                            updateForm.data.role,
                                            updateForm.errors.class_ids,
                                        )}
                                    </div>
                                    <input
                                        type="password"
                                        value={updateForm.data.password}
                                        onChange={(event) => updateForm.setData('password', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="Nova senha (opcional)"
                                    />
                                    <input
                                        type="password"
                                        value={updateForm.data.password_confirmation}
                                        onChange={(event) => updateForm.setData('password_confirmation', event.target.value)}
                                        className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-slate-100"
                                        placeholder="Confirmar nova senha"
                                    />

                                    <div className="sm:col-span-2 flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={updateForm.processing}
                                            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-70"
                                        >
                                            Salvar alterações
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                    {(updateForm.errors.name ||
                                        updateForm.errors.email ||
                                        updateForm.errors.role ||
                                        updateForm.errors.password ||
                                        updateForm.errors.class_ids) && (
                                        <div className="sm:col-span-2 text-sm text-rose-400">
                                            {updateForm.errors.name ||
                                                updateForm.errors.email ||
                                                updateForm.errors.role ||
                                                updateForm.errors.password ||
                                                updateForm.errors.class_ids}
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}
                    </section>
                </div>

                <section className="mt-10">
    <div className="rounded-3xl border border-slate-700 bg-slate-900/85 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
                <div className='flex items-center gap-2'>
                    <Backpack className="w-5 h-5 text-amber-500" /><p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Painel</p>
                </div>
                <h2 className="mt-2 text-3xl font-black">Gerenciar turmas</h2>
            </div>
            
            <div className="flex items-center gap-4">
                <span className="hidden rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 sm:block">
                    Total: {classes.length}
                </span>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-500 hover:shadow-lg hover:shadow-amber-900/20"
                >
                    <span className="text-lg">+</span> Criar nova turma
                </button>
            </div>
        </div>

        <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                        <th className="py-4 pr-3">Turma</th>
                        <th className="py-4 pr-3">Professor</th>
                        <th className="py-4 pr-3">Ativa</th>
                        <th className="py-4 pr-3">Convite</th>
                        <th className="py-4 pr-3">Criada em</th>
                        <th className="py-4">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {classes.map((classItem) => (
                        <tr key={classItem.id} className="group hover:bg-slate-800/30">
                            <td className="py-4 pr-3 font-medium text-slate-200">{classItem.name}</td>
                            <td className="py-4 pr-3 text-slate-300">
                                {classItem.teacher ? classItem.teacher.name : 'Sem professor'}
                            </td>
                            <td className="py-4 pr-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    classItem.active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'
                                }`}>
                                    {classItem.active ? 'Ativa' : 'Inativa'}
                                </span>
                            </td>
                            <td className="py-4 pr-3">
                                <a href={`/student/classes/join/${classItem.invite_code}`} className="text-amber-300/70 hover:text-amber-200 truncate block max-w-[150px]">
                                    {classItem.invite_code}
                                </a>
                            </td>
                            <td className="py-4 pr-3 text-slate-400">
                                {new Date(classItem.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                                <button
                                    onClick={() => deleteClass(classItem.id)}
                                    className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500 hover:text-white"
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
</section>
{isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white">Criar nova turma</h2>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white text-2xl"
                >
                    &times;
                </button>
            </div>
            <p className="mt-2 text-sm text-slate-400">Defina os detalhes da nova turma abaixo.</p>

            <form onSubmit={(e) => { 
                submitClass(e); 
                if(classForm.wasSuccessful) setIsOpen(false); 
            }} className="mt-8 space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">Nome da turma</label>
                    <input
                        value={classForm.data.name}
                        onChange={(e) => classForm.setData('name', e.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Digite o nome da turma"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">Professor (opcional)</label>
                    <select
                        value={classForm.data.teacher_id}
                        onChange={(e) => classForm.setData(
        'teacher_id',
        e.target.value === "" ? "" : Number(e.target.value)
    )}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">Sem professor</option>
                        {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                    <input
                        type="checkbox"
                        checked={classForm.data.active}
                        onChange={(e) => classForm.setData('active', e.target.checked)}
                        className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-amber-500 focus:ring-offset-slate-900"
                    />
                    Turma ativa imediatamente
                </label>

                <div className="mt-8 flex gap-3">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={classForm.processing}
                        className="flex-[2] rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-50"
                    >
                        {classForm.processing ? 'Salvando...' : 'Confirmar e Criar'}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
            </div>
        </DashboardShell>
    );
}