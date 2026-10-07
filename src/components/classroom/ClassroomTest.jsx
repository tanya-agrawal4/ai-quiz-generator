import { useEffect, useState } from 'react'
import {
  GraduationCap,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import { createClassroomTest } from '../../services/classroomService'

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
      window.history.pushState({}, '', `/test-dashboard/${result.testId}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    } catch (err) {
      setError(err?.message || 'Failed to create test. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto p-2 sm:p-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
          </div>
          Synchronized Classroom Test
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
          Create a timed proctored test from your quiz library and share the code with students. All students start simultaneously when you click "Start".
        </p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm space-y-6 relative overflow-hidden">
        {/* Top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border-2 border-indigo-200 shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Create a New Test Session</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Select a quiz and define the duration in minutes. A 6-digit room code will be generated for your students to join.
          </p>
        </div>

        {quizzes?.length > 0 ? (
          <div className="space-y-4 pt-2">
            <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Select Quiz
              </span>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.questions?.length || 0} questions)
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Time Limit (Minutes)
              </span>
              <input
                type="number"
                min={1}
                max={180}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value) || 10)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </label>

            {error && (
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl p-3 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateTest}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GraduationCap className="h-4 w-4" />
              )}
              <span>Generate Test Room</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 text-xs font-semibold text-amber-800">
            No quizzes in your library yet. Create a quiz in the Quiz Creator first!
          </div>
        )}
      </div>
    </div>
  )
}
