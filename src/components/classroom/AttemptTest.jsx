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
  ShieldCheck,
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
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-indigo-600'}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Time Remaining</span>
        </div>
        <span
          className={`font-mono text-base font-extrabold tracking-wider ${
            isCritical ? 'text-red-600 animate-pulse' : isUrgent ? 'text-amber-600' : 'text-slate-900'
          }`}
        >
          {mm}:{ss}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-red-600' : isUrgent ? 'bg-amber-500' : 'bg-indigo-600'
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
              'h-2.5 w-2.5 rounded-full transition-all duration-150',
              isCurrent
                ? 'bg-indigo-600 scale-125 ring-2 ring-indigo-200'
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

export default function AttemptTest({ testId, onExit }) {
  const [stage, setStage] = useState('onboarding')
  const [studentName, setStudentName] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [testData, setTestData] = useState(null)
  const [fetchingTest, setFetchingTest] = useState(true)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [finalScore, setFinalScore] = useState(null)

  const unsubRef = useRef(null)
  const hasSubmittedRef = useRef(false)

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

  useEffect(() => {
    if (testData?.status === 'completed' && stage === 'test' && !hasSubmittedRef.current) {
      handleSubmit(true)
    }
  }, [testData?.status, stage]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!roomCode.trim()) {
      setError('Please enter the Room Code.')
      return
    }
    if (roomCode.trim() !== String(testId).trim()) {
      setError('Invalid Room Code. Please check with your teacher and try again.')
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

  if (fetchingTest) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center bg-white text-slate-900 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Loading test room…</p>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xs space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Test Not Found</h2>
            <p className="text-xs text-slate-500">{error || 'The test you are looking for does not exist.'}</p>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  if (testData?.status === 'completed' && stage === 'onboarding') {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-200">
            <Clock className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Test Has Ended</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This test ("{testData?.quizTitle || 'Classroom Test'}") has already been concluded by the instructor.
            </p>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
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
      <div className="min-h-svh flex items-center justify-center p-4 md:p-8 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 md:p-10 shadow-xs space-y-6 text-left">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <BookOpen className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {testData?.quizTitle || 'Classroom Test'}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your student details to register your session and begin the test.
            </p>
          </div>

          {/* Test Info */}
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/70 p-4 border border-slate-200 text-center">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Questions</p>
              <p className="text-lg font-extrabold text-slate-900">{questionsCount}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration</p>
              <p className="text-lg font-extrabold text-slate-900">{testData?.timeLimit || '?'} min</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</p>
              <p className={`text-xs font-bold ${testData?.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {testData?.status === 'active' ? '● Live' : '◉ Waiting'}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50/80 border border-red-200 rounded-xl p-3 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Onboarding Form */}
          <form onSubmit={handleStartTest} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Your Full Name <span className="text-red-600">*</span>
              </span>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Roll Number / ID <span className="text-red-600">*</span>
              </span>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 2024CS001"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Room Code <span className="text-red-600">*</span>
              </span>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-mono font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-xs tracking-widest transition-all"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading || !studentName.trim() || !rollNumber.trim() || roomCode.length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              <span>Start Assessment</span>
            </button>
          </form>

          {/* Exit Link */}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
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
        <div className="min-h-svh flex items-center justify-center p-6 bg-white">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading questions…</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-svh bg-white p-4 md:p-8 flex justify-center text-left">
        <div className="w-full max-w-4xl space-y-5">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                  {studentName}
                </span>
                <span className="text-xs text-slate-400">· {rollNumber}</span>
                <span className="text-xs text-slate-400">· {testData?.quizTitle || 'Test'}</span>
              </div>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">
                Question {currentIndex + 1} of {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <QuestionDots
                total={questions.length}
                current={currentIndex}
                answers={answers}
              />
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                {answeredCount}/{questions.length}
              </span>
            </div>
          </div>

          {/* Countdown Bar */}
          {remainingSeconds != null && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <CountdownBar remaining={remainingSeconds} total={totalSeconds} />
            </div>
          )}

          {/* Question Card */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-7 md:p-8 shadow-xs space-y-6">
            <div className="text-lg md:text-xl font-bold leading-relaxed text-slate-900">
              <FormattedText>{currentQ?.prompt || ''}</FormattedText>
            </div>

            <div className="mt-4">
              {currentQ?.questionType === 'SHORT_ANSWER' ? (
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Your Answer
                  </span>
                  <input
                    type="text"
                    value={answers[currentQ?.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="Type your answer here..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 shadow-xs transition-all"
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
                          'flex items-center gap-3.5 rounded-xl border px-5 py-4 text-left text-sm transition-all duration-150 shadow-xs',
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                            selected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700',
                          ].join(' ')}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1 font-medium">
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
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
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

          {error && (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50/80 border border-red-200 rounded-xl p-3 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
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
      <div className="min-h-svh p-6 md:p-10 bg-white flex items-center justify-center text-center">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-8 md:p-10 shadow-xs space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 shadow-xs">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test Submitted Successfully
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{testData?.quizTitle || 'Classroom Test'}</h1>
            <p className="text-xs text-slate-500">
              <span className="font-bold text-slate-900">{studentName}</span> · {rollNumber} · Submitted
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/70 p-5 border border-slate-200 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{score}/{total}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accuracy</p>
              <p className={`mt-1 text-2xl font-extrabold ${pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {pct}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Answered</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-600">{Object.keys(answers).length}/{total}</p>
            </div>
          </div>

          <div className={`rounded-xl p-3.5 border text-xs font-semibold ${
            pct >= 80
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : pct >= 50
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {pct >= 80
              ? '🎉 Excellent work! Outstanding test score!'
              : pct >= 50
                ? '👍 Good effort! Keep practicing to improve.'
                : '📚 Keep studying — you\'ll do better next time!'}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all"
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
