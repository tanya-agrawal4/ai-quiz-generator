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
      <div className="min-h-svh flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 shadow-sm space-y-4 max-w-md w-full">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Loading Shared Quiz...</h2>
          <p className="text-xs text-slate-500 font-medium">Fetching questions & settings from Firestore database.</p>
        </div>
      </div>
    )
  }

  if (error || !quizData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-white">
        <div className="rounded-2xl border-2 border-red-200 bg-white p-10 shadow-sm text-center space-y-4 max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border-2 border-red-200">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Quiz Not Found</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{error || 'The shared quiz link may be invalid or expired.'}</p>
          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
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
      <div className="min-h-svh p-6 md:p-10 bg-white flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl border-2 border-slate-200 bg-white p-8 md:p-10 shadow-sm text-center space-y-6 relative overflow-hidden">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-amber-400" />

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border-2 border-amber-200 shadow-sm">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border-2 border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> Quiz Completed
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{quizData.title}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Created by {quizData.creatorName} · {isStrict ? 'Strict Exam' : 'Casual Challenge'} Mode
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/80 p-5 border-2 border-slate-200 text-center divide-x-2 divide-slate-200">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Score</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{score} / {total}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Accuracy</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-600">{percent}%</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Time</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{minutes}:{seconds}</p>
            </div>
          </div>

          {isStrict && (
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/60 p-4 text-xs text-left">
              <span className="font-black text-indigo-800">Strict Anti-Cheat Report: </span>
              {violations.length === 0 ? (
                <span className="text-emerald-700 font-bold">Clean submission! No violations logged.</span>
              ) : (
                <span className="text-red-700 font-bold">{violations.length} violation(s) logged during session.</span>
              )}
            </div>
          )}

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
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
    <div className="min-h-svh bg-white p-4 md:p-8 flex justify-center text-left">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />
          <div>
            <div className="flex items-center gap-2">
              {isStrict ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border-2 border-indigo-200">
                  <ShieldAlert className="h-3.5 w-3.5" /> Exam Mode (Strict)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border-2 border-emerald-200">
                  <Gamepad2 className="h-3.5 w-3.5" /> Challenge Mode (Casual)
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">By {quizData.creatorName}</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{quizData.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-700 shadow-xs">
              <Timer className="h-4 w-4 text-indigo-600" />
              <span>{minutes}:{seconds}</span>
            </div>
            <div className="text-xs font-bold text-slate-700 bg-slate-100 border-2 border-slate-200 px-2.5 py-1.5 rounded-lg">
              Question {currentIndex + 1} of {quizData.questions.length}
            </div>
          </div>
        </div>

        {/* Question Section */}
        {currentQ && (
          <section className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="text-xl font-bold leading-relaxed text-slate-900">
              <FormattedText>{currentQ.prompt}</FormattedText>
            </div>

            <div className="mt-6">
              {currentQ.questionType === 'SHORT_ANSWER' ? (
                <label className="block space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Your Answer
                  </span>
                  <input
                    type="text"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder="Type your answer here..."
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all placeholder:text-slate-400"
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
                          'flex items-center gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left text-sm transition-all duration-150 shadow-xs',
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-lg border-2 text-xs font-bold transition-colors',
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
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 transition-all disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {currentIndex < quizData.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsFinished(true)}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] transition-all"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
