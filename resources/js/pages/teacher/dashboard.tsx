import { DashboardShell } from "../../components/auth/DashboardShell";

const cn = (...classes: (string | boolean | undefined | null)[]) => 
  classes.filter(Boolean).join(' ');

const mockQuizzes = [
  { id: 1, title: 'Matemática Básica', target: '6º Ano A', status: 'active' },
  { id: 2, title: 'História do Brasil', target: '7º Ano B', status: 'completed' },
  { id: 3, title: 'Geografia Física', target: '6º Ano C', status: 'active' },
];

const mockQuestions = [
  { id: 1, category: 'Lógica', difficulty: 'Fácil', text: 'Quanto é 2+2?' },
  { id: 2, category: 'História', difficulty: 'Média', text: 'Quem descobriu o Brasil?' },
];

function TeacherDashboard() {
  return (
    <DashboardShell>
      <div className="space-y-8 p-6 bg-[rgb(2,7,23)] min-h-screen font-sans">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
            <p className="text-slate-400 mt-1">Gerencie suas avaliações e turmas.</p>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-lg shadow-indigo-900/20">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Criar Novo Quiz
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="text-slate-400 text-sm font-medium mb-1">Quizzes Ativos</div>
            <div className="text-3xl font-bold text-white">3</div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="text-slate-400 text-sm font-medium mb-1">Taxa de Conclusão Média</div>
            <div className="text-3xl font-bold text-emerald-400">85%</div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="text-slate-400 text-sm font-medium mb-1">Questões no Banco</div>
            <div className="text-3xl font-bold text-white">142</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-4">Quizzes Recentes</h3>
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Turma Alvo</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mockQuizzes.map(q => (
                    <tr key={q.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{q.title}</td>
                      <td className="px-6 py-4 text-slate-400">{q.target}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                          q.status === 'completed' 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        )}>
                          {q.status === 'completed' ? 'Finalizado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">Ver Relatório</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Banco de Questões Rápido
          </h3>
          <div className="space-y-3">
            {mockQuestions.map(mq => (
              <div key={mq.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-sm flex justify-between items-center hover:bg-slate-800/40 transition-colors backdrop-blur-sm">
                <div>
                  <span className="inline-block bg-slate-800 border border-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded uppercase font-bold mb-2">
                    {mq.category} • {mq.difficulty}
                  </span>
                  <div className="font-medium text-slate-200">{mq.text}</div>
                </div>
                <button className="border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}

export default TeacherDashboard;