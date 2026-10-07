import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { BookOpen, Play, Target, TrendingUp } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  iconColor,
  iconBg,
  borderColor,
  topBorder,
  pillText,
  pillColor,
  pillBg,
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-all text-left ${borderColor} ${topBorder}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-2xs ${iconBg} ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${pillBg} ${pillColor}`}>
          {pillText}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 font-mono">{value}</p>
      <p className="mt-2 text-xs text-slate-500 font-medium">{hint}</p>
    </div>
  )
}

export default function Dashboard() {
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated)
  const quizzes = useQuizStore((state) => state.quizzes)
  const attempts = useQuizStore((state) => state.attempts)
  const startQuiz = useQuizStore((state) => state.startQuiz)
  const openReview = useQuizStore((state) => state.openReview)
  
  const user = useQuizStore((state) => state.userProfile)

  const stats = useMemo(
    () => useQuizStore.getState().getDashboardStats(),
    [quizzes, attempts],
  )

  if (!isAuthenticated || !user) {
    return null
  }

  const displayName = user.name || user.email || 'User'

  return (
    <div className="space-y-8 p-2 sm:p-4 lg:p-6 text-left">
      {/* Dynamic Welcome Message Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Welcome, {displayName}! 👋
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Here is your custom AI quiz generator analytics overview for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Workspace</span>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total Quizzes"
          value={stats.totalQuizzes}
          hint="Created or imported assessments"
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 border border-indigo-200"
          borderColor="border-2 border-indigo-100"
          topBorder="border-t-4 border-t-indigo-600"
          pillText="Assessments"
          pillColor="text-indigo-700"
          pillBg="bg-indigo-50 border border-indigo-200"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.averageScore}%`}
          hint="Across all completed attempts"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border border-emerald-200"
          borderColor="border-2 border-emerald-100"
          topBorder="border-t-4 border-t-emerald-500"
          pillText="Accuracy"
          pillColor="text-emerald-700"
          pillBg="bg-emerald-50 border border-emerald-200"
        />
        <StatCard
          icon={Target}
          label="Attempts"
          value={stats.totalAttempts}
          hint="Finished quiz sessions"
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50 border border-cyan-200"
          borderColor="border-2 border-cyan-100"
          topBorder="border-t-4 border-t-cyan-500"
          pillText="Sessions"
          pillColor="text-cyan-700"
          pillBg="bg-cyan-50 border border-cyan-200"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border-2 border-indigo-100/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Score Trend</h2>
              <p className="text-xs text-slate-500 font-medium">Recent attempt performance trajectory</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              Trajectory
            </span>
          </div>

          <div className="mt-6 h-72">
            {stats.chartData && stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                      fontSize: 12,
                      color: '#0f172a',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-indigo-50/20 rounded-xl border-2 border-dashed border-indigo-200/60">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No score history yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 font-medium">Complete your first quiz session to start plotting score trajectories.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-cyan-100/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Topic Performance</h2>
              <p className="text-xs text-slate-500 font-medium">Average score breakdown by topic</p>
            </div>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full">
              Breakdown
            </span>
          </div>

          <div className="mt-6 h-72">
            {stats.topicData && stats.topicData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topicData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: 12,
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
                      fontSize: 12,
                      color: '#0f172a',
                    }}
                  />
                  <Bar dataKey="average" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-cyan-50/20 rounded-xl border-2 border-dashed border-cyan-200/60">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mb-2">
                  <Target className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No topic data logged</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 font-medium">Your proficiency breakdown across topics will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Lists Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border-2 border-indigo-100/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Quiz Library</h2>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 font-mono">
              {quizzes.length} available
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:border-indigo-300 hover:shadow-xs transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{quiz.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      #{quiz.topic}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                      {quiz.questions.length} questions
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startQuiz(quiz.id)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <span>Start</span>
                  <Play className="h-3 w-3 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-cyan-100/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Recent Attempts</h2>
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 font-mono">
              {attempts.length} logged
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {attempts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">No quiz attempts logged yet.</p>
            ) : (
              attempts.slice(0, 5).map((attempt) => {
                const quiz = quizzes.find((item) => item.id === attempt.quizId)
                const percent = Math.round((attempt.score / attempt.total) * 100)
                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:border-cyan-300 hover:shadow-xs transition-all"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{quiz?.title || 'Quiz'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-mono font-black px-2 py-0.5 rounded-md border ${
                            percent >= 70
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : percent >= 50
                              ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {percent}%
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openReview(attempt.id)}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 active:scale-[0.98] transition-all"
                    >
                      Review
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}