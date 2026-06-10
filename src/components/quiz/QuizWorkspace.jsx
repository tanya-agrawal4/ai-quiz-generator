import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Shield,
  Timer,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import AntiCheatModal from './AntiCheatModal'

function ProgressRing({ value, total }) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100)
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-ink">{percent}%</span>
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
    if (!isQuizRunning) {
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
        // Relaxed for UI testing: log only, no forced modal or auto-submit.
        // setModalOpen(true)
      }
    }

    const onContextMenu = (event) => {
      event.preventDefault()
      recordViolation('context-menu', 'Right-click context menu was blocked.')
      // setModalOpen(true)
    }

    // Window blur is noisy during normal devtools/UI testing — disabled for now.
    // const onBlur = () => {
    //   recordViolation('window-blur', 'Quiz window lost focus.')
    //   setModalOpen(true)
    // }

    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('contextmenu', onContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('contextmenu', onContextMenu)
    }
  }, [secureMode, isQuizRunning, recordViolation])

  useEffect(() => {
    if (!secureMode || !isQuizRunning) return undefined

    // Fullscreen is opt-in only — no automatic request on enable (prevents startup/focus thrash).
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen-exit', 'Fullscreen mode was exited.')
        // setModalOpen(true)
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
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">No active quiz session</h2>
        <p className="mt-2 text-subtle">Start a quiz from the dashboard or create a new one.</p>
        {quizzes[0] && (
          <button
            type="button"
            onClick={() => startQuiz(quizzes[0].id)}
            className="mt-6 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white"
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{quiz.title}</h1>
            <p className="mt-2 text-subtle">
              Question {session.currentIndex + 1} of {quiz.questions.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-subtle">
              <Timer className="h-4 w-4" />
              {minutes}:{seconds}
            </div>
            <ProgressRing value={answeredCount} total={quiz.questions.length} />
            <button
              type="button"
              onClick={toggleSecureMode}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition',
                secureMode
                  ? 'bg-accent text-white'
                  : 'border border-border bg-surface text-ink hover:bg-muted',
              ].join(' ')}
            >
              {secureMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {secureMode ? 'Secure Mode On' : 'Enable Secure Mode'}
            </button>
            {secureMode && (
              <button
                type="button"
                onClick={enterFullscreen}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-muted"
              >
                Enter Fullscreen
              </button>
            )}
          </div>
        </div>

        {secureMode && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-accent-soft px-4 py-3 text-sm text-accent">
            <Shield className="h-4 w-4" />
            Secure mode is on (relaxed): violations are logged only. Use Enter Fullscreen when ready.
          </div>
        )}

        <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-semibold leading-8 text-ink">{currentQuestion.prompt}</h2>

          <div className="mt-6 grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const selected = selectedIndex === index
              return (
                <button
                  key={`${currentQuestion.id}-${index}`}
                  type="button"
                  onClick={() => selectAnswer(currentQuestion.id, index)}
                  className={[
                    'rounded-xl border px-4 py-4 text-left text-sm transition',
                    selected
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-border bg-muted text-ink hover:border-slate-300 hover:bg-surface',
                  ].join(' ')}
                >
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={previousQuestion}
            disabled={session.currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <button
                type="button"
                onClick={nextQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishQuiz}
                className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
              >
                Submit Quiz
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
          // Relaxed: dismiss modal without auto-submitting the quiz during UI testing.
          setModalOpen(false)
          // finishQuiz()
        }}
      />
    </>
  )
}
