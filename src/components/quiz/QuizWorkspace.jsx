import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Shield,
  Timer,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import AntiCheatModal from './AntiCheatModal'
import ExportButtons from './ExportButtons'
import FormattedText from '../common/FormattedText'

function ProgressRing({ value, total }) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span className="absolute text-[10px] font-mono font-bold text-indigo-700">{percent}%</span>
    </div>
  )
}

export default function QuizWorkspace() {
  const activeQuizId = useQuizStore((state) => state.activeQuizId)
  const session = useQuizStore((state) => state.session)
  const quizzes = useQuizStore((state) => state.quizzes)
  const quiz = quizzes.find((item) => item.id === activeQuizId) ?? null
  const selectAnswer = useQuizStore((state) => state.selectAnswer)
  const nextQuestion = useQuizStore((state) => state.nextQuestion)
  const previousQuestion = useQuizStore((state) => state.previousQuestion)
  const finishQuiz = useQuizStore((state) => state.finishQuiz)
  const recordViolation = useQuizStore((state) => state.recordViolation)
  const startQuiz = useQuizStore((state) => state.startQuiz)

  const [secureMode, setSecureMode] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const isQuizRunning = Boolean(quiz && session && !session.finished)
  const currentQuestion = isQuizRunning ? quiz.questions[session.currentIndex] : null
  const answeredCount = useMemo(
    () => Object.keys(session?.answers || {}).length,
    [session?.answers],
  )

  useEffect(() => {
    if (isQuizRunning && session?.violations && session.violations.length >= 3) {
      finishQuiz()
    }
  }, [session, isQuizRunning, finishQuiz])

  useEffect(() => {
    if (!isQuizRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSecureMode(false)
      setModalOpen(false)
    }
  }, [isQuizRunning])

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (!session?.startedAt || !isQuizRunning) return undefined
    const started = new Date(session.startedAt).getTime()
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [session?.startedAt, isQuizRunning])

  useEffect(() => {
    if (!secureMode || !isQuizRunning) return undefined

    const onVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab-switch', 'The document became hidden during secure mode.')
        setModalOpen(true)
      }
    }

    const onContextMenu = (event) => {
      event.preventDefault()
      recordViolation('context-menu', 'Right-click context menu was blocked.')
      setModalOpen(true)
    }

    const onBlur = () => {
      if (!document.hidden) {
        recordViolation('window-blur', 'Quiz window lost focus.')
        setModalOpen(true)
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('blur', onBlur)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('blur', onBlur)
    }
  }, [secureMode, isQuizRunning, recordViolation])

  useEffect(() => {
    if (!secureMode || !isQuizRunning) return undefined

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen-exit', 'Fullscreen mode was exited.')
        setModalOpen(true)
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [secureMode, isQuizRunning, recordViolation])

  const enterFullscreen = async () => {
    if (!isQuizRunning) return
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      recordViolation('fullscreen-denied', 'Browser denied fullscreen access.')
    }
  }

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {})
    }
  }

  const toggleSecureMode = async () => {
    if (!isQuizRunning) return

    if (secureMode) {
      setSecureMode(false)
      setModalOpen(false)
      await exitFullscreen()
      return
    }

    setSecureMode(true)
  }

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  if (!isQuizRunning || !currentQuestion) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">No active quiz session</h2>
        <p className="mt-2 text-sm text-slate-500">Start a quiz from the dashboard library or create a new assessment.</p>
        {quizzes[0] && (
          <button
            type="button"
            onClick={() => startQuiz(quizzes[0].id)}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Start Sample Quiz
          </button>
        )}
      </div>
    )
  }

  const selectedIndex = session.answers[currentQuestion.id]
  const isLastQuestion = session.currentIndex === quiz.questions.length - 1

  return (
    <>
      <div className="space-y-6 text-left p-2 sm:p-4">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{quiz.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs">
                Question {session.currentIndex + 1} of {quiz.questions.length}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                # {quiz.topic || 'General'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                ● Live Assessment
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ExportButtons quiz={quiz} />
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 px-3.5 py-2 text-xs font-mono font-bold text-amber-900 shadow-2xs">
              <Timer className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>{minutes}:{seconds}</span>
            </div>
            <ProgressRing value={answeredCount} total={quiz.questions.length} />
            <button
              type="button"
              onClick={toggleSecureMode}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-2xs',
                secureMode
                  ? 'bg-slate-900 text-white hover:bg-slate-800 ring-2 ring-indigo-500/20'
                  : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600',
              ].join(' ')}
            >
              {secureMode ? <Minimize2 className="h-3.5 w-3.5 text-indigo-400" /> : <Maximize2 className="h-3.5 w-3.5 text-slate-500" />}
              {secureMode ? 'Secure Mode Active' : 'Enable Secure Mode'}
            </button>
            {secureMode && (
              <button
                type="button"
                onClick={enterFullscreen}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
              >
                Enter Fullscreen
              </button>
            )}
          </div>
        </div>

        {secureMode && (
          <div className="flex items-center gap-2.5 rounded-xl border-2 border-indigo-200 bg-indigo-50/80 px-4 py-3 text-xs font-medium text-indigo-900 shadow-2xs">
            <Shield className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Secure mode is active: browser tab switches and focus losses are strictly monitored for assessment integrity.</span>
          </div>
        )}

        {/* Question Content Box */}
        <section className="relative overflow-hidden rounded-2xl border-2 border-indigo-100/80 bg-white p-6 sm:p-8 shadow-sm">
          {/* Subtle Top Gradient Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600" />

          {/* Question Meta Tag Row */}
          <div className="flex items-center justify-between gap-3 mb-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                QUESTION {session.currentIndex + 1}
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {currentQuestion.questionType === 'SHORT_ANSWER' ? 'Short Answer' : 'Multiple Choice'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              {answeredCount}/{quiz.questions.length} answered
            </span>
          </div>

          <div className="text-lg sm:text-xl font-bold leading-relaxed text-slate-900">
            <FormattedText>{currentQuestion.prompt}</FormattedText>
          </div>

          <div className="mt-6">
            {currentQuestion.questionType === 'SHORT_ANSWER' ? (
              <label className="block space-y-2 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Your Answer</span>
                <input
                  type="text"
                  value={session.answers[currentQuestion.id] || ''}
                  onChange={(event) => selectAnswer(currentQuestion.id, event.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 shadow-2xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                />
              </label>
            ) : (
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const selected = selectedIndex === index
                  return (
                    <button
                      key={`${currentQuestion.id}-${index}`}
                      type="button"
                      onClick={() => selectAnswer(currentQuestion.id, index)}
                      className={[
                        'flex items-center justify-between gap-3.5 rounded-xl border-2 px-4 py-3.5 text-left text-sm transition-all duration-150 group cursor-pointer',
                        selected
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 ring-2 ring-indigo-500/20 font-semibold shadow-xs'
                          : 'border-slate-200/90 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20 hover:shadow-2xs',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={[
                            'shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition-all shadow-2xs',
                            selected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                              : 'border-indigo-100 bg-indigo-50/60 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600',
                          ].join(' ')}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="flex-1 font-medium leading-snug">
                          <FormattedText>{option}</FormattedText>
                        </div>
                      </div>

                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs ml-2">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Footer Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={previousQuestion}
            disabled={session.currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={nextQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishQuiz}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all"
              >
                <span>Submit Quiz</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AntiCheatModal
        open={modalOpen}
        violations={session.violations}
        onContinue={() => setModalOpen(false)}
        onSubmit={() => {
          setModalOpen(false)
          finishQuiz()
        }}
      />
    </>
  )
}
