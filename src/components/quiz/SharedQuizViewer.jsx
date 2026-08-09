import { useEffect, useState } from 'react'
import {
  ShieldAlert,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Timer,
  Sparkles,
  Trophy,
  Loader2,
} from 'lucide-react'
import { fetchSharedQuiz } from '../../services/shareService'
import FormattedText from '../common/FormattedText'

export default function SharedQuizViewer({ docId, onBackToApp }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quizData, setQuizData] = useState(null)

  // Quiz Taking Session State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isFinished, setIsFinished] = useState(false)
  const [violations, setViolations] = useState([])
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!docId) return

    setLoading(true)
    setError('')
    fetchSharedQuiz(docId)
      .then((data) => {
        setQuizData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Unable to load shared quiz.')
        setLoading(false)
      })
  }, [docId])

  // Timer Effect
  useEffect(() => {
    if (loading || !quizData || isFinished) return undefined
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [loading, quizData, isFinished])

  // Strict Mode Anti-Cheat Monitoring
  useEffect(() => {
    if (!quizData || quizData.mode !== 'strict' || isFinished) return undefined

    const handleVisibility = () => {
      if (document.hidden) {
        setViolations((prev) => [
          ...prev,
          { at: new Date().toISOString(), detail: 'Tab switched / window hidden' },
        ])
      }
    }

    const handleContextMenu = (e) => {
      e.preventDefault()
      setViolations((prev) => [
        ...prev,
        { at: new Date().toISOString(), detail: 'Right click context menu blocked' },
      ])
    }

    document.addEventListener('visibilitychange', handleVisibility)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [quizData, isFinished])

  if (loading) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center p-6 text-center bg-muted">
        <div className="rounded-3xl border border-border bg-surface p-10 shadow-xl space-y-4 max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
          <h2 className="text-xl font-bold text-ink">Loading Shared Quiz...</h2>
          <p className="text-sm text-subtle">Fetching questions & settings from Firestore database.</p>
        </div>
      </div>
    )
  }

  if (error || !quizData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
        <div className="rounded-3xl border border-red-200 bg-surface p-10 shadow-xl text-center space-y-4 max-w-md w-full">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-danger">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Quiz Not Found</h2>
          <p className="text-sm text-subtle">{error || 'The shared quiz link may be invalid or expired.'}</p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              Go to Quiz Forge App
            </button>
          )}
        </div>
      </div>
    )
  }

  const currentQ = quizData.questions[currentIndex]
  const isStrict = quizData.mode === 'strict'
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  // Calculate score when finished
  const calculateResults = () => {
    let score = 0
    quizData.questions.forEach((q) => {
      const userAns = answers[q.id]
      const isCorrect =
        q.questionType === 'SHORT_ANSWER'
          ? String(userAns || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase()
          : userAns === q.correctIndex
      if (isCorrect) score += 1
    })
    return { score, total: quizData.questions.length }
  }

  if (isFinished) {
    const { score, total } = calculateResults()
    const percent = Math.round((score / total) * 100)

    return (
      <div className="min-h-svh p-6 md:p-10 bg-muted flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-accent">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Quiz Completed
            </span>
            <h1 className="text-3xl font-bold text-ink">{quizData.title}</h1>
            <p className="text-sm text-subtle">
              Created by {quizData.creatorName} · {isStrict ? 'Strict Exam' : 'Casual Challenge'} Mode
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-muted p-5 border border-border text-center">
            <div>
              <p className="text-xs text-subtle font-medium">Score</p>
              <p className="text-3xl font-extrabold text-ink">{score} / {total}</p>
            </div>
            <div>
              <p className="text-xs text-subtle font-medium">Accuracy</p>
              <p className="text-3xl font-extrabold text-accent">{percent}%</p>
            </div>
            <div>
              <p className="text-xs text-subtle font-medium">Time Spent</p>
              <p className="text-3xl font-extrabold text-ink">{minutes}:{seconds}</p>
            </div>
          </div>

          {isStrict && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-left">
              <span className="font-bold text-accent">Strict Anti-Cheat Report: </span>
              {violations.length === 0 ? (
                <span className="text-emerald-700 font-semibold">Clean submission! No violations logged.</span>
              ) : (
                <span className="text-danger font-semibold">{violations.length} violation(s) logged during session.</span>
              )}
            </div>
          )}

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              <span>Explore AI Quiz Forge</span>
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-muted p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-6 text-left">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              {isStrict ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-accent">
                  <ShieldAlert className="h-3.5 w-3.5" /> Exam Mode (Strict)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Gamepad2 className="h-3.5 w-3.5" /> Challenge Mode (Casual)
                </span>
              )}
              <span className="text-xs text-subtle">By {quizData.creatorName}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">{quizData.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-mono font-semibold text-ink shadow-sm">
              <Timer className="h-4 w-4 text-accent" />
              {minutes}:{seconds}
            </div>
            <div className="text-xs font-semibold text-subtle">
              Question {currentIndex + 1} of {quizData.questions.length}
            </div>
          </div>
        </div>

        {/* Question Section */}
        {currentQ && (
          <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
            <div className="text-xl font-semibold leading-8 text-ink">
              <FormattedText>{currentQ.prompt}</FormattedText>
            </div>

            <div className="mt-6">
              {currentQ.questionType === 'SHORT_ANSWER' ? (
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Your Answer
                  </span>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="Type your answer here..."
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm outline-none ring-accent/20 focus:ring-4 font-medium text-ink"
                  />
                </label>
              ) : (
                <div className="grid gap-3">
                  {currentQ.options.map((opt, idx) => {
                    const selected = answers[currentQ.id] === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [currentQ.id]: idx })}
                        className={[
                          'flex items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm transition',
                          selected
                            ? 'border-accent bg-accent-soft text-accent font-semibold'
                            : 'border-border bg-muted text-ink hover:border-slate-300 hover:bg-surface',
                        ].join(' ')}
                      >
                        <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold">
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
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {currentIndex < quizData.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsFinished(true)}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
