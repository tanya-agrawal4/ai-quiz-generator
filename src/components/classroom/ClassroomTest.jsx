import { useEffect, useState, useCallback } from 'react'
import {
  GraduationCap,
  Copy,
  Check,
  Play,
  Users,
  Trophy,
  Clock,
  AlertCircle,
  Link2,
  Loader2,
  Square,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Hash,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import {
  createClassroomTest,
  startClassroomTest,
  endClassroomTest,
  subscribeToTest,
  subscribeToStudents,
  fetchSubmissions,
} from '../../services/classroomService'

// ─── Animated Countdown Ring ──────────────────────────────────────────────────
function CountdownRing({ remaining, total }) {
  const percent = total > 0 ? Math.max(0, remaining / total) : 0
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - percent * circumference
  const isUrgent = remaining <= 60

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="relative flex h-40 w-40 items-center justify-center mx-auto">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke="#e5e7eb" strokeWidth="8"
        />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={isUrgent ? '#dc2626' : '#4f46e5'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`text-3xl font-mono font-extrabold tracking-wider ${isUrgent ? 'text-danger animate-pulse' : 'text-ink'}`}>
          {mm}:{ss}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mt-1">remaining</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClassroomTest() {
  const quizzes = useQuizStore((state) => state.quizzes)
  const userProfile = useQuizStore((state) => state.userProfile)

  // Stage: 'setup' | 'control' | 'leaderboard'
  const [stage, setStage] = useState('setup')
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes?.[0]?.id || '')
  const [timeLimit, setTimeLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Active test state
  const [testId, setTestId] = useState('')
  const [testData, setTestData] = useState(null)
  const [students, setStudents] = useState([])
  const [copied, setCopied] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [remainingSeconds, setRemainingSeconds] = useState(null)

  // Sync selectedQuizId when quizzes load
  useEffect(() => {
    if (quizzes?.length > 0 && !selectedQuizId) {
      setSelectedQuizId(quizzes[0].id)
    }
  }, [quizzes, selectedQuizId])

  // Subscribe to test document when testId is set
  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToTest(testId, (data, err) => {
      if (err) {
        setError(err)
        return
      }
      setTestData(data)
      setError('')

      // Auto-transition to leaderboard when completed
      if (data?.status === 'completed' && stage !== 'leaderboard') {
        loadLeaderboard()
      }
    })
    return () => unsub()
  }, [testId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to students subcollection
  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToStudents(testId, (list) => {
      setStudents(list || [])
    })
    return () => unsub()
  }, [testId])

  // Countdown timer for active tests
  useEffect(() => {
    if (testData?.status !== 'active' || !testData?.startTime) {
      setRemainingSeconds(null)
      return undefined
    }

    const calcRemaining = () => {
      try {
        const startMs = testData.startTime?.toDate
          ? testData.startTime.toDate().getTime()
          : new Date(testData.startTime).getTime()
        const endMs = startMs + (testData.timeLimit || 10) * 60 * 1000
        const left = Math.max(0, Math.floor((endMs - Date.now()) / 1000))
        setRemainingSeconds(left)

        if (left <= 0) {
          handleEndTest()
        }
      } catch {
        setRemainingSeconds(null)
      }
    }

    calcRemaining()
    const interval = setInterval(calcRemaining, 1000)
    return () => clearInterval(interval)
  }, [testData?.status, testData?.startTime, testData?.timeLimit]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadLeaderboard = useCallback(async () => {
    if (!testId) return
    try {
      const results = await fetchSubmissions(testId)
      setSubmissions(results)
      setStage('leaderboard')
    } catch (err) {
      console.error('[ClassroomTest] Leaderboard fetch error:', err)
    }
  }, [testId])

  // ─── Handlers ──────────────────────────────────────────────────────────

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
      setTestId(result.testId)
      setStage('control')
    } catch (err) {
      setError(err?.message || 'Failed to create test. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTest = async () => {
    if (!testId) return
    setLoading(true)
    setError('')
    try {
      await startClassroomTest(testId)
    } catch (err) {
      setError(err?.message || 'Failed to start test.')
    } finally {
      setLoading(false)
    }
  }

  const handleEndTest = async () => {
    if (!testId) return
    try {
      await endClassroomTest(testId)
      await loadLeaderboard()
    } catch (err) {
      console.error('[ClassroomTest] End test error:', err)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(testId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/test/${testId}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetToSetup = () => {
    setStage('setup')
    setTestId('')
    setTestData(null)
    setStudents([])
    setSubmissions([])
    setError('')
    setRemainingSeconds(null)
  }

  // ─── RENDER: Setup Stage ───────────────────────────────────────────────

  if (stage === 'setup') {
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

  // ─── RENDER: Control Room Stage ────────────────────────────────────────

  if (stage === 'control') {
    const isWaiting = testData?.status === 'waiting'
    const isActive = testData?.status === 'active'
    const shareUrl = `${window.location.origin}/test/${testId}`
    const totalSeconds = (testData?.timeLimit || 10) * 60

    return (
      <div className="space-y-6 text-left max-w-4xl mx-auto animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/20 uppercase tracking-wide">
                Teacher Control Room
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                {isActive ? '● Live' : '◉ Waiting'}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {testData?.quizTitle || 'Classroom Test'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Large Test Code Display */}
            <button
              type="button"
              onClick={copyCode}
              className="group rounded-2xl bg-muted border border-border px-5 py-3 text-center hover:border-accent/30 transition cursor-pointer"
              title="Click to copy test code"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Test Code</p>
              <p className="text-2xl font-mono font-extrabold tracking-[0.25em] text-accent group-hover:scale-105 transition-transform">
                {testId}
              </p>
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl border border-border bg-surface p-3 text-subtle hover:bg-muted hover:text-accent transition"
              title="Copy share link"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Share Link Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-accent-soft/40 p-4">
          <Link2 className="h-5 w-5 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-accent">Share this link with students:</p>
            <p className="text-sm font-mono text-ink truncate">{shareUrl}</p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 transition shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Timer - Animated Ring */}
        {isActive && remainingSeconds != null && (
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
            <CountdownRing remaining={remainingSeconds} total={totalSeconds} />
          </div>
        )}

        {/* Students List */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink font-bold text-lg">
              <Users className="h-5 w-5 text-accent" />
              <span>Students in Lobby ({students.length})</span>
            </div>
            {isWaiting && (
              <span className="text-xs text-subtle animate-pulse">Waiting for students to join…</span>
            )}
          </div>

          {students.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {students.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border px-3.5 py-2 text-xs font-medium text-ink animate-in fade-in slide-in-from-bottom-1 duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {s?.studentName || 'Student'}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">No students have joined yet. Share the code or link above.</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isWaiting && (
            <button
              type="button"
              onClick={handleStartTest}
              disabled={loading || students.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-600 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
              <span>Start Test for All Students</span>
            </button>
          )}

          {isActive && (
            <button
              type="button"
              onClick={handleEndTest}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-red-700 active:scale-[0.98] transition"
            >
              <Square className="h-5 w-5 fill-current" />
              <span>End Test Now</span>
            </button>
          )}

          {isActive && (
            <button
              type="button"
              onClick={loadLeaderboard}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-6 py-4 text-sm font-semibold text-ink hover:bg-muted transition"
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>View Leaderboard</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── RENDER: Leaderboard Stage ─────────────────────────────────────────

  if (stage === 'leaderboard') {
    // Podium medals for top 3
    const medals = ['🏆', '🥈', '🥉']

    return (
      <div className="space-y-6 text-left max-w-3xl mx-auto animate-in fade-in duration-300">
        <div className="rounded-3xl border border-border bg-surface p-10 shadow-sm space-y-8">
          {/* Trophy Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Trophy className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-ink">Test Completed!</h2>
              <p className="text-subtle text-sm">
                {testData?.quizTitle || 'Classroom Test'} · {submissions.length} submission(s)
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted p-4 border border-border text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Students</p>
              <p className="text-2xl font-extrabold text-ink">{students.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Submissions</p>
              <p className="text-2xl font-extrabold text-accent">{submissions.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Avg Score</p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {submissions.length > 0
                  ? Math.round(
                      submissions.reduce((sum, s) => {
                        const pct = (s?.totalQuestions || 0) > 0
                          ? ((s?.score || 0) / s.totalQuestions) * 100
                          : 0
                        return sum + pct
                      }, 0) / submissions.length
                    )
                  : 0}%
              </p>
            </div>
          </div>

          {/* Leaderboard Table */}
          {submissions.length > 0 ? (
            <div className="space-y-3 text-left">
              {submissions.map((s, idx) => {
                const pct = (s?.totalQuestions || 0) > 0
                  ? Math.round(((s?.score || 0) / s.totalQuestions) * 100)
                  : 0
                const isTopThree = idx < 3
                return (
                  <div
                    key={idx}
                    className={[
                      'flex items-center justify-between rounded-2xl border p-4 transition',
                      idx === 0
                        ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                        : idx === 1
                          ? 'border-slate-300 bg-slate-50/50'
                          : idx === 2
                            ? 'border-orange-200 bg-orange-50/30'
                            : 'border-border bg-muted',
                    ].join(' ')}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border font-bold text-sm text-ink">
                        {isTopThree ? medals[idx] : `#${idx + 1}`}
                      </span>
                      <div>
                        <p className="font-bold text-ink">{s?.studentName || 'Student'}</p>
                        {isTopThree && (
                          <p className="text-[10px] text-subtle font-medium">
                            {idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : '3rd Place'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-extrabold text-lg text-accent">
                        {s?.score ?? 0}/{s?.totalQuestions ?? 0}
                      </span>
                      <span className="ml-2 text-xs text-subtle">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-subtle text-center">No submissions received yet.</p>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={loadLeaderboard}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-ink hover:bg-muted transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Results
            </button>
            <button
              type="button"
              onClick={resetToSetup}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 active:scale-[0.98] transition"
            >
              <Sparkles className="h-4 w-4" />
              Create New Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
