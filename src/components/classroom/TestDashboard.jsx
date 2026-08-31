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
  Hash,
} from 'lucide-react'
import {
  startClassroomTest,
  endClassroomTest,
  subscribeToTest,
  subscribeToStudents,
  subscribeToSubmissions,
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
export default function TestDashboard({ testId, onExit }) {
  const [testData, setTestData] = useState(null)
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(null)

  // Subscribe to test document
  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToTest(testId, (data, err) => {
      if (err) {
        setError(err)
        return
      }
      setTestData(data)
      setError('')
    })
    return () => unsub()
  }, [testId])

  // Subscribe to students subcollection
  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToStudents(testId, (list) => {
      setStudents(list || [])
    })
    return () => unsub()
  }, [testId])

  // Subscribe to submissions subcollection (real-time leaderboard)
  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToSubmissions(testId, (list) => {
      setSubmissions(list || [])
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

  // ─── Handlers ──────────────────────────────────────────────────────────

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

  const handleEndTest = useCallback(async () => {
    if (!testId) return
    try {
      await endClassroomTest(testId)
    } catch (err) {
      console.error('[TestDashboard] End test error:', err)
    }
  }, [testId])

  const copyCode = () => {
    navigator.clipboard.writeText(testId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/attempt/${testId}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Computed Values ───────────────────────────────────────────────────

  const isWaiting = testData?.status === 'waiting'
  const isActive = testData?.status === 'active'
  const isCompleted = testData?.status === 'completed'
  const shareUrl = `${window.location.origin}/attempt/${testId}`
  const totalSeconds = (testData?.timeLimit || 10) * 60
  const medals = ['🏆', '🥈', '🥉']

  // ─── Loading State ─────────────────────────────────────────────────────

  if (!testData && !error) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-muted text-ink gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-subtle font-medium">Loading test dashboard…</p>
      </div>
    )
  }

  // ─── Error State ───────────────────────────────────────────────────────

  if (error && !testData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-danger">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink">Test Not Found</h2>
            <p className="text-sm text-subtle">{error}</p>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── RENDER ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-svh bg-muted p-4 md:p-8 flex justify-center text-left">
      <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-300">

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-lg border border-border bg-surface p-2 text-subtle hover:bg-muted hover:text-ink transition"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/20 uppercase tracking-wide">
                Teacher Control Room
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCompleted
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : isActive
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {isCompleted ? '✓ Completed' : isActive ? '● Live' : '◉ Waiting'}
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

        {/* Time Limit Info */}
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-surface border border-border p-5 shadow-sm text-center">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Time Limit</p>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4 text-accent" />
              <p className="text-xl font-extrabold text-ink">{testData?.timeLimit || 10} min</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Questions</p>
            <p className="text-xl font-extrabold text-ink">{testData?.quiz?.questions?.length || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Submissions</p>
            <p className="text-xl font-extrabold text-accent">{submissions.length}</p>
          </div>
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

        {/* Students in Lobby */}
        {!isCompleted && (
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
        )}

        {/* Action Buttons */}
        {!isCompleted && (
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
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-red-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                <Square className="h-5 w-5 fill-current" />
                <span>End Test Now</span>
              </button>
            )}
          </div>
        )}

        {/* ─── Real-time Leaderboard Table ──────────────────────────────── */}
        <div className="rounded-3xl border border-border bg-surface p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink font-bold text-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Live Leaderboard</span>
            </div>
            <span className="text-xs font-semibold text-subtle bg-muted border border-border rounded-lg px-2.5 py-1">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Stats Row */}
          {submissions.length > 0 && (
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted p-4 border border-border text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Highest</p>
                <p className="text-xl font-extrabold text-emerald-600">
                  {submissions.length > 0
                    ? Math.round(((submissions[0]?.score || 0) / (submissions[0]?.totalQuestions || 1)) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Average</p>
                <p className="text-xl font-extrabold text-accent">
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
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Lowest</p>
                <p className="text-xl font-extrabold text-amber-600">
                  {submissions.length > 0
                    ? Math.round(
                        ((submissions[submissions.length - 1]?.score || 0) /
                          (submissions[submissions.length - 1]?.totalQuestions || 1)) *
                          100
                      )
                    : 0}%
                </p>
              </div>
            </div>
          )}

          {/* Table */}
          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-subtle w-12">#</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-subtle">Name</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-subtle">Roll No.</th>
                    <th className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-subtle text-right">Score</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-subtle text-right">%</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, idx) => {
                    const pct = (s?.totalQuestions || 0) > 0
                      ? Math.round(((s?.score || 0) / s.totalQuestions) * 100)
                      : 0
                    const isTopThree = idx < 3
                    return (
                      <tr
                        key={idx}
                        className={[
                          'border-b border-border/50 transition animate-in fade-in slide-in-from-bottom-1 duration-300',
                          idx === 0 ? 'bg-amber-50/50' : idx === 1 ? 'bg-slate-50/30' : idx === 2 ? 'bg-orange-50/20' : '',
                        ].join(' ')}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="py-3.5 pr-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border font-bold text-xs text-ink">
                            {isTopThree ? medals[idx] : idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-semibold text-ink">
                          {s?.studentName || 'Student'}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-xs text-subtle">
                          {s?.rollNumber || '—'}
                        </td>
                        <td className="py-3.5 pr-4 text-right">
                          <span className="font-mono font-extrabold text-accent">
                            {s?.score ?? 0}/{s?.totalQuestions ?? 0}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                            pct >= 80
                              ? 'bg-emerald-100 text-emerald-700'
                              : pct >= 50
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-danger'
                          }`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border">
                <Trophy className="h-7 w-7 text-subtle" />
              </div>
              <p className="text-sm text-subtle">No submissions received yet.</p>
              <p className="text-xs text-subtle">
                Student results will appear here in real-time as they complete the test.
              </p>
            </div>
          )}
        </div>

        {/* Completed Banner */}
        {isCompleted && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-4 animate-in fade-in duration-500">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-ink">Test Completed!</h2>
              <p className="text-sm text-subtle">
                {submissions.length} student{submissions.length !== 1 ? 's' : ''} submitted their answers.
              </p>
            </div>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 active:scale-[0.98] transition"
              >
                <Sparkles className="h-4 w-4" />
                Create New Test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
