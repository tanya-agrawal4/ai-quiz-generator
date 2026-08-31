import { useEffect, useState } from 'react'
import {
  GraduationCap,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import { createClassroomTest } from '../../services/classroomService'

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClassroomTest() {
  const quizzes = useQuizStore((state) => state.quizzes)
  const userProfile = useQuizStore((state) => state.userProfile)

  const [selectedQuizId, setSelectedQuizId] = useState(quizzes?.[0]?.id || '')
  const [timeLimit, setTimeLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync selectedQuizId when quizzes load
  useEffect(() => {
    if (quizzes?.length > 0 && !selectedQuizId) {
      setSelectedQuizId(quizzes[0].id)
    }
  }, [quizzes, selectedQuizId])

  // ─── Handler ──────────────────────────────────────────────────────────

  const handleCreateTest = async () => {
    setError('')
    const quiz = quizzes?.find((q) => q.id === selectedQuizId) || quizzes?.[0]
    if (!quiz) {
      setError('Please select or create a quiz first.')
      return
    }
    if (timeLimit < 1 || timeLimit > 180) {
      setError('Time limit must be between 1 and 180 minutes.')
      return
    }

    setLoading(true)
    try {
      const result = await createClassroomTest(quiz, timeLimit, userProfile)
      // Redirect teacher to the dedicated dashboard
      window.history.pushState({}, '', `/test-dashboard/${result.testId}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch (err) {
      setError(err?.message || 'Failed to create test. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ─── RENDER ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-accent" />
          Synchronized Classroom Test
        </h1>
        <p className="mt-2 text-subtle">
          Create a timed test from your quiz library and share the code with students. All students start simultaneously when you click "Start".
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Create a New Test</h2>
          <p className="text-sm text-subtle">
            Select a quiz and set the duration. A shareable 6-digit code will be generated for your students.
          </p>
        </div>

        {quizzes?.length > 0 ? (
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Select Quiz
              </span>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/20 transition"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.questions?.length || 0} questions)
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Time Limit (minutes)
              </span>
              <input
                type="number"
                min={1}
                max={180}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value) || 10)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-accent/20 transition"
              />
            </label>

            {error && (
              <div className="flex items-center gap-2 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateTest}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
              <span>Generate Test</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-muted p-4 text-xs text-subtle">
            No quizzes in library yet. Create a quiz in Quiz Creator first!
          </div>
        )}
      </div>
    </div>
  )
}
