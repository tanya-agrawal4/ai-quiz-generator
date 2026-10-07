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
          stroke="#e2e8f0" strokeWidth="8"
        />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={isUrgent ? '#ef4444' : '#4f46e5'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className={`text-3xl font-mono font-extrabold tracking-wider ${isUrgent ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
          {mm}:{ss}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">remaining</p>
      </div>
    </div>
  )
}

export default function TestDashboard({ testId, onExit }) {
  const [testData, setTestData] = useState(null)
  const [students, setStudents] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(null)

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

  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToStudents(testId, (list) => {
      setStudents(list || [])
    })
    return () => unsub()
  }, [testId])

  useEffect(() => {
    if (!testId) return undefined
    const unsub = subscribeToSubmissions(testId, (list) => {
      setSubmissions(list || [])
    })
    return () => unsub()
  }, [testId])

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

  const isWaiting = testData?.status === 'waiting'
  const isActive = testData?.status === 'active'
  const isCompleted = testData?.status === 'completed'
  const shareUrl = `${window.location.origin}/attempt/${testId}`
  const totalSeconds = (testData?.timeLimit || 10) * 60
  const medals = ['🏆', '🥈', '🥉']

  if (!testData && !error) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-white text-slate-900 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading test control dashboard…</p>
      </div>
    )
  }

  if (error && !testData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xs space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Test Not Found</h2>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-white p-4 md:p-8 flex justify-center text-left">
      <div className="w-full max-w-4xl space-y-6">

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          {/* Indigo top accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />
          <div>
            <div className="flex items-center gap-2.5">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-xl border-2 border-slate-200 bg-white p-2 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 shadow-xs transition-all"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border-2 border-indigo-200 uppercase tracking-wide">
                Teacher Control Room
              </span>
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-slate-100 text-slate-700 border-2 border-slate-200'
                  : isActive
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-2 border-amber-200'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  isCompleted ? 'bg-slate-500' : isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`} />
                {isCompleted ? 'Completed' : isActive ? 'Live' : 'Waiting'}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {testData?.quizTitle || 'Classroom Test'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Large Test Code Display */}
            <button
              type="button"
              onClick={copyCode}
              className="group rounded-2xl bg-indigo-50 border-2 border-indigo-200 px-5 py-3 text-center hover:border-indigo-400 hover:bg-indigo-100/60 shadow-xs transition-all cursor-pointer"
              title="Click to copy test code"
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Test Code</p>
              <p className="text-2xl font-mono font-extrabold tracking-[0.25em] text-indigo-700 group-hover:scale-105 transition-transform">
                {testId}
              </p>
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl border-2 border-slate-200 bg-white p-3 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 shadow-xs transition-all"
              title="Copy share link"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Share Link Banner */}
        <div className="flex items-center gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 border border-indigo-200">
            <Link2 className="h-4.5 w-4.5 text-indigo-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wider text-indigo-800">Share with students</p>
            <p className="text-xs font-mono font-semibold text-slate-900 truncate mt-0.5">{shareUrl}</p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Time Limit Info */}
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white border-2 border-slate-200 p-5 shadow-sm text-center divide-x-2 divide-slate-100">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Time Limit</p>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-600" />
              <p className="text-xl font-extrabold text-indigo-700">{testData?.timeLimit || 10} min</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Questions</p>
            <p className="text-xl font-extrabold text-slate-900">{testData?.quiz?.questions?.length || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Submissions</p>
            <p className="text-xl font-extrabold text-emerald-600">{submissions.length}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50/80 border border-red-200 rounded-xl p-3 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Timer - Animated Ring */}
        {isActive && remainingSeconds != null && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs">
            <CountdownRing remaining={remainingSeconds} total={totalSeconds} />
          </div>
        )}

        {/* Students in Lobby */}
        {!isCompleted && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <span>Students in Lobby</span>
                <span className="ml-1 text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2">
                  {students.length}
                </span>
              </div>
              {isWaiting && (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg animate-pulse font-semibold">Waiting for students…</span>
              )}
            </div>

            {students.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {students.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-xl bg-white border-2 border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-xs hover:border-emerald-300 transition-colors"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {s?.studentName || 'Student'}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No students in room yet. Share the code or link above.</p>
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
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current" />
                )}
                <span>Start Test for All Students</span>
              </button>
            )}

            {isActive && (
              <button
                type="button"
                onClick={handleEndTest}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-rose-200 hover:from-rose-700 hover:to-rose-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>End Test Now</span>
              </button>
            )}
          </div>
        )}

        {/* ─── Real-time Leaderboard Table ──────────────────────────────── */}
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <span>Live Leaderboard</span>
            </div>
            <span className="text-xs font-black text-slate-700 bg-slate-100 border-2 border-slate-200 rounded-lg px-2.5 py-1">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Stats Row */}
          {submissions.length > 0 && (
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/80 p-4 border-2 border-slate-200 text-center divide-x-2 divide-slate-200">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Highest Score</p>
                <p className="mt-0.5 text-xl font-extrabold text-emerald-600">
                  {submissions.length > 0
                    ? Math.round(((submissions[0]?.score || 0) / (submissions[0]?.totalQuestions || 1)) * 100)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Class Average</p>
                <p className="mt-0.5 text-xl font-extrabold text-indigo-600">
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
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Lowest Score</p>
                <p className="mt-0.5 text-xl font-extrabold text-amber-600">
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
                  <tr className="border-b-2 border-slate-200">
                    <th className="pb-3 pr-4 text-[10px] font-black uppercase tracking-wider text-slate-500 w-12">#</th>
                    <th className="pb-3 pr-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Name</th>
                    <th className="pb-3 pr-4 text-[10px] font-black uppercase tracking-wider text-slate-500">Roll No.</th>
                    <th className="pb-3 pr-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Score</th>
                    <th className="pb-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">%</th>
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
                          'border-b-2 border-slate-100 transition-colors',
                          idx === 0 ? 'bg-amber-50/40' : idx === 1 ? 'bg-slate-50/60' : idx === 2 ? 'bg-orange-50/30' : '',
                        ].join(' ')}
                      >
                        <td className="py-3 pr-4">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border-2 border-slate-200 font-bold text-xs text-slate-900 shadow-xs">
                            {isTopThree ? medals[idx] : idx + 1}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold text-slate-900 text-xs sm:text-sm">
                          {s?.studentName || 'Student'}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-slate-500">
                          {s?.rollNumber || '—'}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className="font-mono font-extrabold text-indigo-700 text-xs sm:text-sm">
                            {s?.score ?? 0}/{s?.totalQuestions ?? 0}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                            pct >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                              : pct >= 50
                                ? 'bg-amber-50 text-amber-700 border-2 border-amber-200'
                                : 'bg-red-50 text-red-700 border-2 border-red-200'
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
            <div className="text-center py-8 space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-500">
                <Trophy className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No submissions recorded yet</p>
              <p className="text-[11px] text-slate-500">
                Student results will stream here in real-time as they complete the test.
              </p>
            </div>
          )}
        </div>

        {/* Completed Banner */}
        {isCompleted && (
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400" />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 border-2 border-emerald-200 text-emerald-600 shadow-sm">
              <Check className="h-7 w-7" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-extrabold text-slate-900">Test Completed</h2>
              <p className="text-xs text-slate-600 font-medium">
                {submissions.length} student{submissions.length !== 1 ? 's' : ''} submitted their answers.
              </p>
            </div>
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
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
