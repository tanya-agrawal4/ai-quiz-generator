import { useState, useEffect } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Users,
  FileText,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

// Dynamic Typewriter Phrases
const TYPEWRITER_PHRASES = [
  'AI Quiz Generator',
  'Instant Assessment Engine',
  'Smart Flashcard Decks',
  'Real-Time Exam Proctoring',
]

function TypewriterHero() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const targetPhrase = TYPEWRITER_PHRASES[phraseIndex]
    let timer

    if (!isDeleting && currentText.length < targetPhrase.length) {
      timer = setTimeout(() => {
        setCurrentText(targetPhrase.slice(0, currentText.length + 1))
      }, 70)
    } else if (!isDeleting && currentText.length === targetPhrase.length) {
      timer = setTimeout(() => {
        setIsDeleting(true)
      }, 2200)
    } else if (isDeleting && currentText.length > 0) {
      timer = setTimeout(() => {
        setCurrentText(targetPhrase.slice(0, currentText.length - 1))
      }, 40)
    } else if (isDeleting && currentText.length === 0) {
      setIsDeleting(false)
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length)
    }

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, phraseIndex])

  return (
    <div className="inline-flex items-center">
      <span className="text-indigo-600">
        {currentText}
      </span>
      <span className="ml-1 inline-block h-9 sm:h-12 w-1 bg-indigo-600 animate-pulse rounded-full" />
    </div>
  )
}

/* ─── Feature card data ─── */
const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Gemini AI Generator',
    description: 'Generates custom MCQ, Fill-in-blanks, True/False, and Short Answer questions from any source.',
    accent: 'text-indigo-600',
    accentBg: 'bg-indigo-50 border-indigo-100',
  },
  {
    icon: ShieldCheck,
    title: 'Strict Anti-Cheat',
    description: 'Monitors tab switches, fullscreen escapes, and context menus for student test integrity.',
    accent: 'text-slate-800',
    accentBg: 'bg-slate-50 border-slate-200',
  },
  {
    icon: Users,
    title: 'Synchronized Classroom Tests',
    description: 'Create timed classroom tests with a 6-digit code. All students start together with a global countdown.',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-50 border-emerald-100',
  },
  {
    icon: FileText,
    title: 'Quiz Sharing & Export',
    description: 'Share via Firestore unique links or download high-resolution PDF and CSV assessment sheets.',
    accent: 'text-cyan-700',
    accentBg: 'bg-cyan-50 border-cyan-100',
  },
]

export default function LandingPage() {
  const loginUser = useQuizStore((state) => state.loginUser)
  const loginAnonymous = useQuizStore((state) => state.loginAnonymous)
  const setView = useQuizStore((state) => state.setView)
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated)
  const authLoading = useQuizStore((state) => state.authLoading)

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const getFirebaseErrorMessage = (error) => {
    const code = error?.code || ''
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is not valid.'
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact support.'
      case 'auth/user-not-found':
        return 'No account found with this email. Try signing up instead.'
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check and try again.'
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Try logging in instead.'
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment and try again.'
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.'
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled. Contact support.'
      default:
        return error?.message || 'An unexpected error occurred. Please try again.'
    }
  }

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setError('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setAuthModalOpen(true)
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please provide both an email and password.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    try {
      const currentMode = authMode
      if (currentMode !== 'login' && currentMode !== 'signup') {
        throw new Error(`Unknown auth mode: "${currentMode}"`)
      }
      await loginUser(email, password, currentMode)
      setAuthModalOpen(false)
      setView('dashboard')
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      await loginAnonymous()
      setAuthModalOpen(false)
      setView('dashboard')
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCtaClick = () => {
    if (isAuthenticated) {
      setView('dashboard')
    } else {
      openAuthModal('signup')
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans relative flex flex-col justify-between select-none">

      {/* ═══════════════ Header / Navbar ═══════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2 text-left">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">QuizForge</span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200 uppercase tracking-wide font-mono">
                AI v2.5
              </span>
            </div>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2.5">
            {authLoading ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span className="text-xs text-slate-500 font-medium">Loading…</span>
              </div>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98] transition-all"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════ Hero Section ═══════════════ */}
      <main className="my-auto py-16 sm:py-20 px-6 lg:px-10 text-center max-w-5xl mx-auto space-y-8 z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 shadow-xs">
          <Zap className="h-3.5 w-3.5 text-indigo-600" />
          <span>Next-Gen Assessment & Proctoring System</span>
        </div>

        {/* Dynamic Typewriter Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
          Experience the <br className="hidden sm:inline" />
          <TypewriterHero />
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 font-normal leading-relaxed">
          Instantly transform study notes, code repositories, or reference PDFs into diagnostic quizzes with real-time anti-cheat proctoring and synchronized classroom tests.
        </p>

        {/* Call to Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl active:scale-[0.99] transition-all group"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.99] transition-all"
          >
            <span>Try Demo Account</span>
          </button>
        </div>

        {/* Features Preview Cards */}
        <div className="pt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {FEATURES.map(({ icon: Icon, title, description, accent, accentBg }) => (
            <div
              key={title}
              className="rounded-2xl border-2 border-slate-200/90 bg-white p-6 shadow-sm space-y-3 hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${accentBg} ${accent} shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">{description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500 z-10">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-6 gap-2">
          <p>&copy; 2026 QuizForge AI Testing Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Services Operational
            </span>
          </div>
        </div>
      </footer>

      {/* ═══════════════ Authentication Modal ═══════════════ */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-2xl text-left space-y-6">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 rounded-t-2xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-5 top-6 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">QuizForge AI</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {authMode === 'login'
                  ? 'Sign in to access your personal AI quiz workspace.'
                  : 'Get started with your free QuizForge testing account.'}
              </p>
            </div>

            {/* Autofill Demo User Shortcut */}
            <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50/60 p-3 flex items-center justify-between text-xs">
              <span className="text-indigo-800 font-semibold">Testing out QuizForge?</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                One-Click Demo
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Email Address
                </span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  Password
                </span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-3 text-xs text-red-700 font-bold shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center text-xs text-slate-500 pt-3 border-t-2 border-slate-100">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setError(''); setEmail(''); setPassword('') }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setError(''); setEmail(''); setPassword('') }}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}