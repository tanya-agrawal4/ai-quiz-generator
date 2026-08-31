import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Loader2,
  Users,
  BookOpen,
  Timer,
  Send,
  Hash,
  User,
} from 'lucide-react'
import {
  subscribeToTest,
  submitStudentResult,
} from '../../services/classroomService'
import FormattedText from '../common/FormattedText'

// ─── Countdown Bar ────────────────────────────────────────────────────────────
function CountdownBar({ remaining, total }) {
  const pct = total > 0 ? Math.max(0, (remaining / total) * 100) : 0
  const isUrgent = remaining <= 60
  const isCritical = remaining <= 15

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={`h-4 w-4 ${isUrgent ? 'text-danger' : 'text-accent'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-subtle">Time Remaining</span>
        </div>
        <span
          className={`font-mono text-lg font-extrabold tracking-wider ${
            isCritical ? 'text-danger animate-pulse' : isUrgent ? 'text-amber-600' : 'text-ink'
          }`}
        >
          {mm}:{ss}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-danger' : isUrgent ? 'bg-amber-500' : 'bg-accent'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Question Nav Dots ────────────────────────────────────────────────────────
function QuestionDots({ total, current, answers }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answers[i] !== undefined
        const isCurrent = i === current
        return (
          <span
            key={i}
            className={[
              'h-2.5 w-2.5 rounded-full transition-all duration-200',
              isCurrent
                ? 'bg-accent scale-125 ring-2 ring-accent/30'
                : isAnswered
                  ? 'bg-emerald-500'
                  : 'bg-slate-200',
            ].join(' ')}
            title={`Q${i + 1}${isAnswered ? ' ✓' : ''}`}
          />
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttemptTest({ testId, onExit }) {
  // Stage: 'onboarding' | 'test' | 'submitted'
  const [stage, setStage] = useState('onboarding')
  const [studentName, setStudentName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Test data from Firestore (real-time)
  const [testData, setTestData] = useState(null)
  const [fetchingTest, setFetchingTest] = useState(true)

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [finalScore, setFinalScore] = useState(null)

  // Refs
  const unsubRef = useRef(null)
  const hasSubmittedRef = useRef(false)

  // ─── Subscribe to Test Document on Mount ────────────────────────────────
  useEffect(() => {
    if (!testId) {
      setFetchingTest(false)
      setError('No test ID provided.')
      return undefined
    }

    setFetchingTest(true)
    const unsub = subscribeToTest(testId, (data, err) => {
      setFetchingTest(false)
      if (err) {
        setError(err)
        return
      }
      if (!data) {
        setError(`Test "${testId}" not found. Please check the link.`)
        return
      }
      setTestData(data)
      setError('')
    })

    unsubRef.current = unsub
    return () => {
      if (unsubRef.current) {
        unsubRef.current()
      }
    }
  }, [testId])

  // ─── Countdown Timer ───────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'test' || !testData?.startTime) {
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

        // Auto-submit when time runs out
        if (left <= 0 && !hasSubmittedRef.current) {
          handleSubmit(true)
        }
      } catch {
        setRemainingSeconds(null)
      }
    }

    calcRemaining()
    const interval = setInterval(calcRemaining, 1000)
    return () => clearInterval(interval)
  }, [stage, testData?.startTime, testData?.timeLimit]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit when teacher ends test
  useEffect(() => {
    if (testData?.status === 'completed' && stage === 'test' && !hasSubmittedRef.current) {
      handleSubmit(true)
    }
  }, [testData?.status, stage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleStartTest = (e) => {
    e?.preventDefault()
    setError('')

    if (!studentName.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!rollNumber.trim()) {
      setError('Please enter your roll number.')
      return
    }

    setStage('test')
  }

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (hasSubmittedRef.current || isSubmitting) return
    hasSubmittedRef.current = true
    setIsSubmitting(true)
    setError('')

    try {
      const questions = testData?.quiz?.questions || []
      let score = 0

      questions.forEach((q) => {
        const userAns = answers[q.id]
        const isCorrect =
          q?.questionType === 'SHORT_ANSWER'
            ? String(userAns || '').trim().toLowerCase() === String(q?.correctAnswer || '').trim().toLowerCase()
            : userAns === q.correctIndex
        if (isCorrect) score += 1
      })

      await submitStudentResult(testId, {
        studentName: studentName.trim(),
        rollNumber: rollNumber.trim(),
        score,
        totalQuestions: questions.length,
      })

      setFinalScore({ score, total: questions.length })
      setStage('submitted')
    } catch (err) {
      console.error('[AttemptTest] Submit error:', err)
      if (!isAutoSubmit) {
        setError(err?.message || 'Failed to submit. Please try again.')
        hasSubmittedRef.current = false
      } else {
        // On auto-submit failure, still show results locally
        const questions = testData?.quiz?.questions || []
        let score = 0
        questions.forEach((q) => {
          const userAns = answers[q.id]
          const isCorrect =
            q?.questionType === 'SHORT_ANSWER'
              ? String(userAns || '').trim().toLowerCase() === String(q?.correctAnswer || '').trim().toLowerCase()
              : userAns === q.correctIndex
          if (isCorrect) score += 1
        })
        setFinalScore({ score, total: questions.length })
        setStage('submitted')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [testData, answers, testId, studentName, rollNumber, isSubmitting])

  // ─── RENDER: Loading ───────────────────────────────────────────────────

  if (fetchingTest) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-muted text-ink gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-subtle font-medium">Loading test…</p>
      </div>
    )
  }

  // ─── RENDER: Error (no test data) ──────────────────────────────────────

  if (!testData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-danger">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink">Test Not Found</h2>
            <p className="text-sm text-subtle">{error || 'The test you are looking for does not exist.'}</p>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── RENDER: Test Completed (by teacher, before student started) ───────

  if (testData?.status === 'completed' && stage === 'onboarding') {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-xl space-y-6 text-center animate-in fade-in duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-subtle">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-ink">Test Has Ended</h2>
            <p className="text-sm text-subtle">
              This test ("{testData?.quizTitle || 'Classroom Test'}") has already been completed by the teacher.
            </p>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── RENDER: Onboarding Form ───────────────────────────────────────────

  if (stage === 'onboarding') {
    const questionsCount = testData?.quiz?.questions?.length || 0

    return (
      <div className="min-h-svh flex items-center justify-center p-4 md:p-8 bg-muted">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 md:p-10 shadow-2xl space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <BookOpen className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              {testData?.quizTitle || 'Classroom Test'}
            </h1>
            <p className="text-sm text-subtle">
              Enter your details to begin the test.
            </p>
          </div>

          {/* Test Info */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted p-4 border border-border text-center">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Questions</p>
              <p className="text-xl font-extrabold text-ink">{questionsCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Duration</p>
              <p className="text-xl font-extrabold text-ink">{testData?.timeLimit || '?'} min</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Status</p>
              <p className={`text-sm font-bold ${testData?.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {testData?.status === 'active' ? '● Live' : '◉ Waiting'}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Onboarding Form */}
          <form onSubmit={handleStartTest} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Your Name <span className="text-danger">*</span>
              </span>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-3.5 text-base font-medium text-ink outline-none ring-accent/20 focus:ring-4 shadow-sm"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                Roll Number <span className="text-danger">*</span>
              </span>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2024CS001"
                  className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-3.5 text-base font-medium text-ink outline-none ring-accent/20 focus:ring-4 shadow-sm"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || !studentName.trim() || !rollNumber.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-indigo-600 active:scale-[0.98] transition disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Users className="h-5 w-5" />
              )}
              <span>Start Test</span>
            </button>
          </form>

          {/* Exit Link */}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="w-full text-center text-xs font-medium text-subtle hover:text-ink transition"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── RENDER: Test Stage ────────────────────────────────────────────────

  if (stage === 'test') {
    const questions = testData?.quiz?.questions || []
    const currentQ = questions[currentIndex]
    const totalSeconds = (testData?.timeLimit || 10) * 60
    const answeredCount = Object.keys(answers).length

    if (!currentQ) {
      return (
        <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto" />
            <p className="text-sm text-subtle">Loading questions…</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-svh bg-muted p-4 md:p-8 flex justify-center text-left">
        <div className="w-full max-w-4xl space-y-5">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent uppercase tracking-wide">
                  {studentName}
                </span>
                <span className="text-xs text-subtle">· {rollNumber}</span>
                <span className="text-xs text-subtle">· {testData?.quizTitle || 'Test'}</span>
              </div>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <QuestionDots
                total={questions.length}
                current={currentIndex}
                answers={answers}
              />
              <span className="text-xs font-semibold text-subtle bg-muted border border-border rounded-lg px-2.5 py-1">
                {answeredCount}/{questions.length}
              </span>
            </div>
          </div>

          {/* Countdown Bar */}
          {remainingSeconds != null && (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <CountdownBar remaining={remainingSeconds} total={totalSeconds} />
            </div>
          )}

          {/* Question Card */}
          <section className="rounded-3xl border border-border bg-surface p-7 md:p-8 shadow-sm space-y-6">
            <div className="text-lg md:text-xl font-semibold leading-8 text-ink">
              <FormattedText>{currentQ?.prompt || ''}</FormattedText>
            </div>

            <div className="mt-4">
              {currentQ?.questionType === 'SHORT_ANSWER' ? (
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Your Answer
                  </span>
                  <input
                    type="text"
                    value={answers[currentQ?.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="Type your answer here..."
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-base outline-none ring-accent/20 focus:ring-4 font-medium text-ink shadow-sm transition"
                  />
                </label>
              ) : (
                <div className="grid gap-3">
                  {(currentQ?.options || []).map((opt, idx) => {
                    const selected = answers[currentQ?.id] === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                        className={[
                          'flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm transition-all duration-200 shadow-sm',
                          selected
                            ? 'border-accent bg-accent-soft text-accent font-semibold ring-2 ring-accent/20 scale-[1.01]'
                            : 'border-border bg-muted/60 text-ink hover:border-slate-300 hover:bg-surface',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition',
                            selected
                              ? 'border-accent bg-accent text-white'
                              : 'border-border bg-surface text-ink',
                          ].join(' ')}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1">
                          <FormattedText>{opt}</FormattedText>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-muted transition disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 active:scale-[0.98] transition"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Submitting…' : 'Submit Test'}</span>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── RENDER: Submitted Stage ───────────────────────────────────────────

  if (stage === 'submitted') {
    const score = finalScore?.score ?? 0
    const total = finalScore?.total ?? 0
    const pct = total > 0 ? Math.round((score / total) * 100) : 0

    return (
      <div className="min-h-svh p-6 md:p-10 bg-muted flex items-center justify-center text-center">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-8 md:p-10 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Trophy */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Trophy className="h-10 w-10" />
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test Submitted Successfully
            </span>
            <h1 className="text-3xl font-extrabold text-ink">{testData?.quizTitle || 'Classroom Test'}</h1>
            <p className="text-sm text-subtle">
              <span className="font-bold text-ink">{studentName}</span> · {rollNumber} · Submitted
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-muted p-5 border border-border text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Score</p>
              <p className="text-3xl font-extrabold text-ink">{score}/{total}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Accuracy</p>
              <p className={`text-3xl font-extrabold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-danger'}`}>
                {pct}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Answered</p>
              <p className="text-3xl font-extrabold text-accent">{Object.keys(answers).length}/{total}</p>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`rounded-2xl p-4 border text-sm font-medium ${
            pct >= 80
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : pct >= 50
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-red-50 border-red-200 text-danger'
          }`}>
            {pct >= 80
              ? '🎉 Excellent work! Outstanding performance!'
              : pct >= 50
                ? '👍 Good effort! Keep practicing to improve.'
                : '📚 Keep studying — you\'ll do better next time!'}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 active:scale-[0.98] transition"
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
