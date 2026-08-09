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
  UserCheck,
  Play,
  Clock,
  BookOpen,
  Maximize2,
} from 'lucide-react'
import { fetchSharedQuiz, saveQuizSubmission } from '../../services/shareService'
import FormattedText from '../common/FormattedText'

// Component: Skeleton Loader for "Loading Test..." state
function SkeletonLoader() {
  return (
    <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-8 w-3/4 rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="h-14 w-full rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-14 w-full rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-14 w-full rounded-2xl bg-slate-100 animate-pulse" />
        </div>

        <div className="flex justify-center pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent animate-pulse">
            <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Loading Test... Fetching database payload...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TakeSharedTest({ docId, onBackToApp }) {
  // Extract ID from URL safely
  const effectiveDocId =
    docId ||
    (typeof window !== 'undefined'
      ? window.location.pathname.startsWith('/test/')
        ? window.location.pathname.split('/test/')[1]?.split('/')[0]
        : new URLSearchParams(window.location.search).get('test')
      : null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quizData, setQuizData] = useState(null)

  // Stage state: 'welcome' | 'test' | 'completed'
  const [stage, setStage] = useState('welcome')

  // Participant Registration State
  const [participantName, setParticipantName] = useState('')

  // Active Quiz State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [violations, setViolations] = useState([])
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Fetch Quiz Data from Firestore with robust try...catch
  useEffect(() => {
    if (!effectiveDocId) {
      setError('No valid test ID provided in URL.')
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError('')

    const loadData = async () => {
      try {
        const data = await fetchSharedQuiz(effectiveDocId)
        if (!isMounted) return
        if (!data || !data.questions || data.questions.length === 0) {
          throw new Error('Test data is empty or corrupted.')
        }
        setQuizData(data)
      } catch (err) {
        console.error('Detailed Error:', err)
        if (isMounted) {
          setError(err?.message || 'Unable to fetch test details from database.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [effectiveDocId])

  // 2. Timer Effect during test taking
  useEffect(() => {
    if (stage !== 'test') return undefined
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [stage])

  // 3. Strict Mode Anti-Cheat Enforcement & Event Listeners
  useEffect(() => {
    if (stage !== 'test' || !quizData || quizData?.mode !== 'strict') return undefined

    const triggerViolation = (reason) => {
      try {
        setViolations((prev) => [
          ...prev,
          { at: new Date().toISOString(), detail: reason },
        ])
        setShowWarningModal(true)
      } catch (err) {
        console.error('Detailed Error:', err)
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab switched or browser minimized')
      }
    }

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation('Exited full-screen mode')
      }
    }

    const onContextMenu = (event) => {
      event.preventDefault()
      triggerViolation('Right-click context menu blocked')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('contextmenu', onContextMenu)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('contextmenu', onContextMenu)
    }
  }, [stage, quizData])

  // Handlers with robust try...catch blocks
  const handleStartTest = async (e) => {
    e?.preventDefault()
    setErrorMessage('')

    try {
      if (!participantName.trim()) {
        setErrorMessage('Please enter your name before starting the test.')
        return
      }

      setStage('test')
      setElapsed(0)

      // Request Full-Screen API if in Strict Mode
      if (quizData?.mode === 'strict') {
        try {
          if (document?.documentElement?.requestFullscreen) {
            await document.documentElement.requestFullscreen()
          }
        } catch (fsErr) {
          console.error('Detailed Error:', fsErr)
          // Display graceful UI notification if browser restricts automatic fullscreen
          setErrorMessage('Full-screen request was blocked by browser. Click "Enter Fullscreen" button in header.')
        }
      }
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage(err?.message || 'Error initializing test session.')
    }
  }

  const handleReturnToFullscreen = async () => {
    setShowWarningModal(false)
    setErrorMessage('')

    try {
      if (!document.fullscreenElement && document?.documentElement?.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage('Full-screen request denied by browser settings.')
    }
  }

  const calculateFinalScore = () => {
    try {
      const questions = quizData?.questions || []
      if (questions.length === 0) return { score: 0, total: 0 }

      let score = 0
      questions.forEach((q) => {
        const userAns = answers[q.id]
        const isCorrect =
          q?.questionType === 'SHORT_ANSWER'
            ? String(userAns || '').trim().toLowerCase() === String(q?.correctAnswer || '').trim().toLowerCase()
            : userAns === q?.correctIndex
        if (isCorrect) score += 1
      })
      return { score, total: questions.length }
    } catch (err) {
      console.error('Detailed Error:', err)
      return { score: 0, total: quizData?.questions?.length || 0 }
    }
  }

  const handleSubmitTest = async () => {
    setIsSubmitting(true)
    setShowWarningModal(false)
    setErrorMessage('')

    try {
      // Exit full-screen mode cleanly if active
      if (document?.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch (fsErr) {
          console.error('Detailed Error:', fsErr)
        }
      }

      const { score, total } = calculateFinalScore()

      if (effectiveDocId) {
        try {
          await saveQuizSubmission(effectiveDocId, {
            participantName: participantName.trim(),
            score,
            total,
            answers,
            elapsedSeconds: elapsed,
          })
        } catch (subErr) {
          console.error('Detailed Error:', subErr)
        }
      }

      setStage('completed')
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage(err?.message || 'Error submitting test scores.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- RENDER STAGES ---

  // 1. Loading Skeleton
  if (loading) {
    return <SkeletonLoader />
  }

  // 2. Error State
  if (error || !quizData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-muted">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-surface p-8 shadow-xl text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-danger">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Test Link Invalid</h2>
          <p className="text-sm text-subtle">{error || 'The test link may have expired or does not exist.'}</p>
          {onBackToApp && (
            <button
              type="button"
              onClick={() => {
                try {
                  onBackToApp()
                } catch (err) {
                  console.error('Detailed Error:', err)
                  window.location.href = '/'
                }
              }}
              className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    )
  }

  const isStrict = quizData?.mode === 'strict'
  const questionsList = quizData?.questions || []
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  // 3. Welcome to the Test Landing Screen
  if (stage === 'welcome') {
    return (
      <div className="min-h-svh flex items-center justify-center p-4 md:p-8 bg-muted">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-surface p-8 md:p-10 shadow-2xl space-y-8 text-left">
          {/* Header Badge & Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {isStrict ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-bold text-accent border border-indigo-200">
                  <ShieldAlert className="h-3.5 w-3.5" /> Exam Mode (Strict Anti-Cheat)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <Gamepad2 className="h-3.5 w-3.5" /> Challenge Mode (Casual)
                </span>
              )}
              <span className="text-xs text-subtle font-medium">By {quizData?.creatorName || 'Creator'}</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-ink">
              Welcome to the Test!
            </h1>
            <p className="text-sm text-subtle leading-relaxed">
              You are about to begin <span className="font-bold text-ink">"{quizData?.title || 'Quiz'}"</span>. Please enter your name below to start.
            </p>
          </div>

          {/* RED UI ERROR BANNER */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-danger flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Quiz Details Summary Box */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted p-4 border border-border text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center text-subtle">
                <BookOpen className="h-4 w-4" />
              </div>
              <p className="text-xs text-subtle font-medium">Questions</p>
              <p className="text-lg font-bold text-ink">{questionsList.length}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center text-subtle">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-xs text-subtle font-medium">Topic</p>
              <p className="text-sm font-bold text-ink truncate">{quizData?.topic || 'General'}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center text-subtle">
                <UserCheck className="h-4 w-4 text-accent" />
              </div>
              <p className="text-xs text-subtle font-medium">Difficulty</p>
              <p className="text-sm font-bold text-accent">{quizData?.difficulty || 'Mixed'}</p>
            </div>
          </div>

          {/* Strict Anti-Cheat Warning Banner */}
          {isStrict && (
            <div className="rounded-2xl border border-indigo-200 bg-accent-soft/60 p-4 text-xs space-y-1 text-ink">
              <p className="font-bold text-accent flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Strict Full-Screen Exam Notice
              </p>
              <p className="text-subtle">
                Clicking 'Start Test Now' will force full-screen mode. Tab switching or exiting full-screen will log violations and display a warning overlay.
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleStartTest} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-subtle block">
                Participant's Name <span className="text-danger">*</span>
              </span>
              <input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-base font-medium outline-none ring-accent/20 focus:ring-4 text-ink shadow-sm"
              />
            </label>

            <button
              type="submit"
              disabled={!participantName.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-indigo-600 transition disabled:opacity-40"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Start Test Now</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 4. Test Taking View (Strict Answer Privacy & Distraction-Free Layout)
  const currentQ = questionsList[currentIndex]

  if (stage === 'test' && currentQ) {
    return (
      <>
        <div className="min-h-svh bg-muted p-4 md:p-8 flex justify-center text-left">
          <div className="w-full max-w-4xl space-y-6">
            {/* RED UI ERROR BANNER */}
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-danger flex items-start gap-2.5 shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Notice: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Distraction-Free Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent uppercase tracking-wide">
                    Candidate: {participantName}
                  </span>
                  <span className="text-xs text-subtle">· {quizData?.title || 'Quiz'}</span>
                </div>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
                  Question {currentIndex + 1} of {questionsList.length}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-mono font-semibold text-ink shadow-sm">
                  <Timer className="h-4 w-4 text-accent" />
                  {minutes}:{seconds}
                </div>

                {isStrict && !document.fullscreenElement && (
                  <button
                    type="button"
                    onClick={handleReturnToFullscreen}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-accent bg-accent-soft px-3 py-2 text-xs font-bold text-accent hover:bg-indigo-100 transition"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Enter Fullscreen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Box (DISTRACTION FREE & NO ANSWERS REVEALED) */}
            <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
              <div className="text-xl font-semibold leading-8 text-ink">
                <FormattedText>{currentQ?.prompt || ''}</FormattedText>
              </div>

              <div className="mt-6">
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
                      className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-base outline-none ring-accent/20 focus:ring-4 font-medium text-ink shadow-sm"
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
                            'flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm transition shadow-sm',
                            selected
                              ? 'border-accent bg-accent-soft text-accent font-semibold ring-2 ring-accent/20'
                              : 'border-border bg-muted/60 text-ink hover:border-slate-300 hover:bg-surface',
                          ].join(' ')}
                        >
                          <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-xs font-bold">
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

            {/* Navigation Controls */}
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

              {currentIndex < questionsList.length - 1 ? (
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
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Test...' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STRICT ANTI-CHEAT WARNING MODAL OVERLAY */}
        {showWarningModal && isStrict && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border-2 border-red-500 bg-surface p-8 shadow-2xl text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-danger animate-bounce">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-danger">
                  Anti-Cheat Violation Detected
                </span>
                <h3 className="text-2xl font-bold text-ink">
                  Warning: You have exited the test environment.
                </h3>
                <p className="text-sm font-bold text-danger">
                  Your actions are recorded.
                </p>
                <p className="text-xs text-subtle">
                  Exiting full-screen mode or switching tabs violates exam integrity guidelines.
                </p>
              </div>

              <div className="rounded-xl bg-muted p-3.5 border border-border text-xs text-ink flex items-center justify-between">
                <span className="font-semibold">Total Violations Logged:</span>
                <span className="font-mono font-bold text-danger text-sm">{violations.length}</span>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleReturnToFullscreen}
                  className="w-full rounded-2xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-600 transition"
                >
                  Return to Full-Screen Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="w-full rounded-2xl border border-border bg-surface px-6 py-3 text-xs font-semibold text-subtle hover:bg-muted transition"
                >
                  Submit Test Now
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // 5. Final Completed & Score Screen
  if (stage === 'completed') {
    const { score, total } = calculateFinalScore()
    const percent = total === 0 ? 0 : Math.round((score / total) * 100)

    return (
      <div className="min-h-svh p-6 md:p-10 bg-muted flex items-center justify-center text-center">
        <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-8 md:p-10 shadow-2xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Trophy className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test Submitted Successfully
            </span>
            <h1 className="text-3xl font-extrabold text-ink">{quizData?.title || 'Quiz'}</h1>
            <p className="text-sm text-subtle font-medium">
              Candidate: <span className="text-ink font-bold">{participantName}</span> · {isStrict ? 'Strict Exam' : 'Casual Challenge'}
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
              <p className="text-xs text-subtle font-medium">Time Taken</p>
              <p className="text-3xl font-extrabold text-ink">{minutes}:{seconds}</p>
            </div>
          </div>

          {isStrict && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-left space-y-1">
              <span className="font-bold text-accent block">Anti-Cheat Report: </span>
              {violations.length === 0 ? (
                <span className="text-emerald-700 font-semibold">Clean submission! Zero violations logged.</span>
              ) : (
                <div className="space-y-1 text-danger font-semibold">
                  <p>{violations.length} violation(s) logged during test session:</p>
                  <ul className="list-disc list-inside text-[11px] text-subtle">
                    {violations.map((v, i) => (
                      <li key={i}>{v.detail} ({new Date(v.at).toLocaleTimeString()})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {onBackToApp && (
            <button
              type="button"
              onClick={() => {
                try {
                  onBackToApp()
                } catch (err) {
                  console.error('Detailed Error:', err)
                  window.location.href = '/'
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition"
            >
              <span>Explore AI Quiz Generator</span>
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}
