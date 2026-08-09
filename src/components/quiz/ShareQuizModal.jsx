import { useState } from 'react'
import {
  Share2,
  X,
  ShieldCheck,
  Gamepad2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { saveSharedQuiz } from '../../services/shareService'
import { useQuizStore } from '../../context/QuizStore'

export default function ShareQuizModal({ open, onClose, quiz }) {
  const userProfile = useQuizStore((state) => state.userProfile)

  const [selectedMode, setSelectedMode] = useState(null) // 'strict' | 'casual' | null
  const [isSaving, setIsSaving] = useState(false)
  const [shareResult, setShareResult] = useState(null) // { docId, shareUrl, mode }
  const [copied, setCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!open || !quiz) return null

  const handleSelectMode = async (mode) => {
    setSelectedMode(mode)
    setIsSaving(true)
    setErrorMessage('')

    try {
      const result = await saveSharedQuiz(quiz, mode, userProfile)
      if (!result || !result.shareUrl) {
        throw new Error('Failed to obtain shareable URL from database.')
      }
      setShareResult(result)
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage(err?.message || 'Unable to save quiz to database. Please check your connection and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareResult?.shareUrl) return
    setErrorMessage('')

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareResult.shareUrl)
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = shareResult.shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage('Could not copy link automatically. Please manually copy the link text.')
    }
  }

  const handleWhatsAppShare = () => {
    if (!shareResult?.shareUrl) return
    setErrorMessage('')

    try {
      const modeLabel = shareResult?.mode === 'strict' ? 'Strict Exam' : 'Casual Challenge'
      const titleText = quiz?.title || 'AI Quiz'
      const questionCount = quiz?.questions?.length || 0

      const text = encodeURIComponent(
        `Take this quiz "${titleText}" (${questionCount} questions, ${modeLabel} mode) on AI Quiz Generator:\n${shareResult.shareUrl}`
      )
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage('Unable to launch WhatsApp sharing. Check pop-up blocker settings.')
    }
  }

  const handleEmailShare = () => {
    if (!shareResult?.shareUrl) return
    setErrorMessage('')

    try {
      const modeLabel = shareResult?.mode === 'strict' ? 'Strict Exam' : 'Casual Challenge'
      const titleText = quiz?.title || 'AI Quiz'
      const topicText = quiz?.topic || 'General'
      const questionCount = quiz?.questions?.length || 0

      const subject = encodeURIComponent(`Quiz Invitation: ${titleText}`)
      const body = encodeURIComponent(
        `Hi!\n\nYou've been invited to take the quiz "${titleText}" (${topicText}).\n\nMode: ${modeLabel}\nQuestions: ${questionCount}\n\nClick the link below to access the quiz:\n${shareResult.shareUrl}\n\nHappy learning!`
      )
      window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
    } catch (err) {
      console.error('Detailed Error:', err)
      setErrorMessage('Unable to launch mail client. Please copy the link instead.')
    }
  }

  const handleResetModal = () => {
    try {
      setSelectedMode(null)
      setShareResult(null)
      setCopied(false)
      setErrorMessage('')
      if (typeof onClose === 'function') {
        onClose()
      }
    } catch (err) {
      console.error('Detailed Error:', err)
    }
  }

  const quizTitle = quiz?.title || 'AI Generated Quiz'
  const questionCount = quiz?.questions?.length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-border bg-surface p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetModal}
          className="absolute right-6 top-6 rounded-full p-2 text-subtle hover:bg-muted hover:text-ink transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left space-y-2 pr-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Share2 className="h-3.5 w-3.5" />
            <span>Shareable Link Generator</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            {shareResult ? 'Quiz Link Ready to Share!' : 'Share Quiz'}
          </h2>
          <p className="text-sm text-subtle">
            {shareResult
              ? `Share "${quizTitle}" with students, classmates, or friends.`
              : `Select a sharing mode to generate a shareable link for "${quizTitle}".`}
          </p>
        </div>

        {/* RED ERROR UI ALERT FALLBACK */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-left text-danger flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Execution Warning: </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* STEP 1: MODE SELECTION */}
        {!shareResult && !isSaving && (
          <div className="mt-6 grid gap-4 text-left">
            {/* Strict Mode Card */}
            <button
              type="button"
              onClick={() => handleSelectMode('strict')}
              className="group relative flex items-start gap-4 rounded-2xl border-2 border-border p-5 transition hover:border-accent hover:bg-accent-soft/30 focus:outline-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-accent group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink group-hover:text-accent transition">
                    Share as Exam (Strict)
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                    Anti-Cheat Enabled
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-subtle">
                  Enforces full-screen, logs tab switching & focus losses, and locks time limit. Best for formal tests & graded assessments.
                </p>
              </div>
            </button>

            {/* Casual Mode Card */}
            <button
              type="button"
              onClick={() => handleSelectMode('casual')}
              className="group relative flex items-start gap-4 rounded-2xl border-2 border-border p-5 transition hover:border-emerald-500 hover:bg-emerald-50/50 focus:outline-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink group-hover:text-emerald-700 transition">
                    Challenge Friends (Casual)
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Friendly & Relaxed
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-subtle">
                  Relaxed practice mode for friends and study groups without strict rules or tab locking. Immediate results & practice reviews.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {isSaving && (
          <div className="my-10 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-base font-semibold text-ink">Saving Quiz & Generating Document ID...</p>
            <p className="text-xs text-subtle">Uploading payload to Firestore database...</p>
          </div>
        )}

        {/* STEP 2: LINK GENERATED & SHARE OPTIONS */}
        {shareResult && !isSaving && (
          <div className="mt-6 space-y-6 text-left">
            {/* Mode Badge Confirmation */}
            <div className="flex items-center gap-2 rounded-xl bg-muted p-3.5 border border-border">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-ink">Mode Selected: </span>
                <span className="font-semibold text-accent uppercase tracking-wide">
                  {shareResult?.mode === 'strict' ? 'Exam (Strict Mode)' : 'Challenge Friends (Casual Mode)'}
                </span>
              </div>
            </div>

            {/* Generated Shareable URL Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-subtle block">
                Shareable Link
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 p-2 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareResult?.shareUrl || ''}
                  className="w-full bg-transparent text-sm font-mono font-medium text-ink outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Social Sharing Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-subtle block">
                Direct Share
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:bg-muted transition"
                >
                  <Mail className="h-4 w-4 text-subtle" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Open link test button */}
            <div className="pt-2 flex justify-between items-center border-t border-border">
              <button
                type="button"
                onClick={() => {
                  if (shareResult?.shareUrl) {
                    window.open(shareResult.shareUrl, '_blank')
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test Open Link in New Tab</span>
              </button>
              <button
                type="button"
                onClick={handleResetModal}
                className="rounded-xl bg-surface border border-border px-4 py-2 text-xs font-semibold text-ink hover:bg-muted"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
