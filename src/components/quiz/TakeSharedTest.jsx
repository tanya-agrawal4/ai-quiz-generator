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
    <div className="min-h-svh flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-3/4 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-slate-100 animate-pulse" />

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="h-14 w-full rounded-xl bg-slate-50 animate-pulse" />
          <div className="h-14 w-full rounded-xl bg-slate-50 animate-pulse" />
          <div className="h-14 w-full rounded-xl bg-slate-50 animate-pulse" />
        </div>

        <div className="flex justify-center pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 animate-pulse">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span>Loading Test Payload…</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TakeSharedTest({ docId, onBackToApp }) {
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

  const [stage, setStage] = useState('welcome')
  const [participantName, setParticipantName] = useState('')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [violations, setViolations] = useState([])
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Fetch Quiz Data from Firestore
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

  // 3. Strict Mode Anti-Cheat Enforcement
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

      if (quizData?.mode === 'strict') {
        try {
          if (document?.documentElement?.requestFullscreen) {
            await document.documentElement.requestFullscreen()
          }
        } catch (fsErr) {
          console.error('Detailed Error:', fsErr)
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

  // 1. Loading Skeleton
  if (loading) {
    return <SkeletonLoader />
  }

  // 2. Error State
  if (error || !quizData) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xs text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Test Link Invalid</h2>
          <p className="text-xs text-slate-500 leading-relaxed">{error || 'The test link may have expired or does not exist.'}</p>
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
              className="mt-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all"
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
      <div className="min-h-svh flex items-center justify-center p-4 md:p-8 bg-white">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-8 md:p-10 shadow-xs space-y-6 text-left">
          {/* Header Badge & Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isStrict ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                  <ShieldAlert className="h-3.5 w-3.5" /> Exam Mode (Strict)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                  <Gamepad2 className="h-3.5 w-3.5" /> Challenge Mode (Casual)
                </span>
              )}
              <span className="text-xs text-slate-500 font-medium">By {quizData?.creatorName || 'Creator'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome to the Test
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              You are about to begin <span className="font-semibold text-slate-900">"{quizData?.title || 'Quiz'}"</span>. Please enter your name below to register your session.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 flex items-start gap-2 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <div className="font-medium">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Quiz Details Summary Box */}
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/70 p-4 border border-slate-200 text-center">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <BookOpen className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Questions</p>
              <p className="text-lg font-extrabold text-slate-900">{questionsList.length}</p>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-center text-slate-400 mb-1">
                <Clock className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Topic</p>
              <p className="text-xs font-bold text-slate-900 truncate">{quizData?.topic || 'General'}</p>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-center text-indigo-500 mb-1">
                <UserCheck className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Difficulty</p>
              <p className="text-xs font-bold text-indigo-600">{quizData?.difficulty || 'Mixed'}</p>
            </div>
          </div>

          {/* Strict Anti-Cheat Notice */}
          {isStrict && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs space-y-1 text-slate-800">
              <p className="font-bold text-indigo-800 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-indigo-600" /> Strict Full-Screen Exam Notice
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Clicking 'Start Test Now' will activate full-screen mode. Tab switching or exiting full-screen logs violations for session integrity.
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleStartTest} className="space-y-4 pt-1">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Participant's Name <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-900 shadow-xs transition-all placeholder:text-slate-400"
              />
            </label>

            <button
              type="submit"
              disabled={!participantName.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Start Test Now</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 4. Test Taking View
  const currentQ = questionsList[currentIndex]

  if (stage === 'test' && currentQ) {
    return (
      <>
        <div className="min-h-svh bg-white p-4 md:p-8 flex justify-center text-left">
          <div className="w-full max-w-4xl space-y-6">
            {/* Error Notification */}
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 flex items-start gap-2 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <div className="font-medium">
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                    Candidate: {participantName}
                  </span>
                  <span className="text-xs text-slate-400">· {quizData?.title || 'Quiz'}</span>
                </div>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                  Question {currentIndex + 1} of {questionsList.length}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-700 shadow-xs">
                  <Timer className="h-4 w-4 text-indigo-600" />
                  <span>{minutes}:{seconds}</span>
                </div>

                {isStrict && !document.fullscreenElement && (
                  <button
                    type="button"
                    onClick={handleReturnToFullscreen}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Enter Fullscreen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Card */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-6">
              <div className="text-xl font-bold leading-relaxed text-slate-900">
                <FormattedText>{currentQ?.prompt || ''}</FormattedText>
              </div>

              <div className="mt-6">
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
                            'flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-150 shadow-xs',
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

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {currentIndex < questionsList.length - 1 ? (
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
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Test…' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Warning Modal Overlay */}
        {showWarningModal && isStrict && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl border-2 border-red-500 bg-white p-8 shadow-2xl text-center space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-xs">
                <ShieldAlert className="h-7 w-7" />
              </div>

              <div className="space-y-1.5">
                <span className="rounded-full bg-red-50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 border border-red-200">
                  Anti-Cheat Violation Detected
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  You have exited the test environment
                </h3>
                <p className="text-xs font-bold text-red-600">
                  Your actions are recorded for instructor audit.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Exiting full-screen mode or switching windows violates exam integrity guidelines.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Total Violations Logged:</span>
                <span className="font-mono font-bold text-red-600 text-sm">{violations.length}</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReturnToFullscreen}
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  Return to Full-Screen Test
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="w-full rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
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
      <div className="min-h-svh p-6 md:p-10 bg-white flex items-center justify-center text-center">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-8 md:p-10 shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 shadow-xs">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test Submitted Successfully
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{quizData?.title || 'Quiz'}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Candidate: <span className="text-slate-900 font-bold">{participantName}</span> · {isStrict ? 'Strict Exam' : 'Casual Challenge'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/70 p-5 border border-slate-200 text-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Score</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{score} / {total}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Accuracy</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-600">{percent}%</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Time</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{minutes}:{seconds}</p>
            </div>
          </div>

          {isStrict && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-left space-y-1">
              <span className="font-bold text-indigo-800 block">Anti-Cheat Report: </span>
              {violations.length === 0 ? (
                <span className="text-emerald-700 font-semibold">Clean submission! Zero violations logged.</span>
              ) : (
                <div className="space-y-1 text-red-700 font-medium">
                  <p>{violations.length} violation(s) logged during test session:</p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600">
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
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all"
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
