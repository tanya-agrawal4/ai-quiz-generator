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
import { BookOpen, Target, TrendingUp } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm text-left">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-subtle">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-2 text-sm text-subtle">{hint}</p>
    </div>
  )
}

export default function Dashboard() {
  const quizzes = useQuizStore((state) => state.quizzes)
  const attempts = useQuizStore((state) => state.attempts)
  const startQuiz = useQuizStore((state) => state.startQuiz)
  const openReview = useQuizStore((state) => state.openReview)
  
  // Real dynamic user state pull kiya taaki middle me bada sa show ho sake
  const user = useQuizStore((state) => state.userProfile)

  const stats = useMemo(
    () => useQuizStore.getState().getDashboardStats(),
    [quizzes, attempts],
  )

  return (
    <div className="space-y-8 p-6 text-left">
      {/* Middle Content View me Bada Dynamic Welcome Message Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Welcome, {user?.name || 'Tanya'}! 👋
        </h1>
        <p className="mt-2 text-base text-subtle">
          Here is your custom AI quiz generator analytics overview for today.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total Quizzes"
          value={stats.totalQuizzes}
          hint="Created or imported assessments"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${stats.averageScore}%`}
          hint="Across all completed attempts"
        />
        <StatCard
          icon={Target}
          label="Attempts"
          value={stats.totalAttempts}
          hint="Finished quiz sessions"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Score Trend</h2>
          <p className="mt-1 text-sm text-subtle">Recent attempt performance</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Topic Performance</h2>
          <p className="mt-1 text-sm text-subtle">Average score by topic</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topicData}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="topic" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Bar dataKey="average" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Lists Section */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Quiz Library</h2>
          <div className="mt-4 space-y-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3"
              >
                <div>
                  <p className="font-medium text-ink">{quiz.title}</p>
                  <p className="text-sm text-subtle">
                    {quiz.topic} · {quiz.questions.length} questions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startQuiz(quiz.id)}
                  className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Recent Attempts</h2>
          <div className="mt-4 space-y-3">
            {attempts.slice(0, 5).map((attempt) => {
              const quiz = quizzes.find((item) => item.id === attempt.quizId)
              const percent = Math.round((attempt.score / attempt.total) * 100)
              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">{quiz?.title || 'Quiz'}</p>
                    <p className="text-sm text-subtle">
                      {percent}% · {new Date(attempt.completedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReview(attempt.id)}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-muted transition"
                  >
                    Review
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}