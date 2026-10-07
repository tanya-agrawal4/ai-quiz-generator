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

  // eslint-disable-next-line no-unused-vars
  const [selectedMode, setSelectedMode] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [shareResult, setShareResult] = useState(null)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-2xl text-left transition-all">
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 rounded-t-2xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetModal}
          className="absolute right-5 top-6 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 border-2 border-indigo-200">
            <Share2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Shareable Link Generator</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {shareResult ? 'Quiz Link Ready to Share!' : 'Share Quiz'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {shareResult
              ? `Share "${quizTitle}" with students, classmates, or friends.`
              : `Select a sharing mode to generate a shareable link for "${quizTitle}".`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-semibold">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Mode Selection */}
        {!shareResult && !isSaving && (
          <div className="mt-6 grid gap-3.5 text-left">
            {/* Strict Mode Card */}
            <button
              type="button"
              onClick={() => handleSelectMode('strict')}
              className="group relative flex items-start gap-4 rounded-2xl border-2 border-slate-200 p-5 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-sm focus:outline-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border-2 border-indigo-200 shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Share as Exam (Strict)
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black text-indigo-700 border-2 border-indigo-200">
                    Anti-Cheat Enabled
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 font-normal">
                  Enforces full-screen, logs tab switching & focus losses, and locks time limit. Best for formal tests & graded assessments.
                </p>
              </div>
            </button>

            {/* Casual Mode Card */}
            <button
              type="button"
              onClick={() => handleSelectMode('casual')}
              className="group relative flex items-start gap-4 rounded-2xl border-2 border-slate-200 p-5 transition-all hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-sm focus:outline-none"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 shadow-xs group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Challenge Friends (Casual)
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border-2 border-emerald-200">
                    Friendly & Relaxed
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 font-normal">
                  Relaxed practice mode for friends and study groups without tab locking. Immediate results & practice reviews.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {isSaving && (
          <div className="my-10 flex flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm font-bold text-slate-900">Saving Quiz & Generating Share Link...</p>
            <p className="text-xs text-slate-500">Uploading payload to Firestore database...</p>
          </div>
        )}

        {/* Generated Share Results */}
        {shareResult && !isSaving && (
          <div className="mt-6 space-y-6 text-left">
            {/* Mode Confirmation Badge */}
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border-2 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-black text-slate-900">Mode: </span>
                <span className="font-bold text-indigo-600 uppercase tracking-wide">
                  {shareResult?.mode === 'strict' ? 'Exam (Strict Mode)' : 'Challenge Friends (Casual Mode)'}
                </span>
              </div>
            </div>

            {/* Generated Shareable URL Box */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                Shareable Link
              </label>
              <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 p-2 pl-3 shadow-xs">
                <input
                  type="text"
                  readOnly
                  value={shareResult?.shareUrl || ''}
                  className="w-full bg-transparent text-xs font-mono font-medium text-slate-900 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Social Sharing Buttons */}
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Direct Share
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={handleEmailShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 shadow-xs transition-all"
                >
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-2 flex justify-between items-center border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (shareResult?.shareUrl) {
                    window.open(shareResult.shareUrl, '_blank')
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test Open Link</span>
              </button>
              <button
                type="button"
                onClick={handleResetModal}
                className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 transition-all"
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
