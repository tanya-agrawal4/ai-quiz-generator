import { useState, useEffect } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  BrainCircuit,
  BookOpenCheck,
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
      <span className="text-accent">
        {currentText}
      </span>
      <span className="ml-1 inline-block h-10 w-1 bg-accent animate-pulse rounded-full" />
    </div>
  )
}

/* ─── Feature card data ─── */
const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Gemini AI Generator',
    description: 'Generates custom MCQ, Fill-in-blanks, True/False, and Short Answer questions.',
    accent: 'text-accent',
    accentBg: 'bg-accent-soft',
  },
  {
    icon: ShieldCheck,
    title: 'Strict Anti-Cheat',
    description: 'Monitors tab switches, fullscreen escapes, and context menus for exam integrity.',
    accent: 'text-purple-600',
    accentBg: 'bg-purple-50',
  },
  {
    icon: Users,
    title: 'Synchronized Classroom Tests',
    description: 'Create timed classroom tests with a 6-digit code. All students start together with a global countdown.',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
  },
  {
    icon: FileText,
    title: 'Quiz Sharing & Export',
    description: 'Share via Firestore unique links or download as PDF / CSV assessments.',
    accent: 'text-rose-600',
    accentBg: 'bg-rose-50',
  },
]

export default function LandingPage() {
  const loginUser = useQuizStore((state) => state.loginUser)
  const setView = useQuizStore((state) => state.setView)
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated)
  const authLoading = useQuizStore((state) => state.authLoading)

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      const success = await loginUser(email, password, authMode)

      if (success) {
        setAuthModalOpen(false)
        setView('dashboard')
      } else {
        setError(
          authMode === 'signup'
            ? 'Could not create account. Email may already be in use.'
            : 'Invalid email or password. Please try again.'
        )
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    // Demo login uses Firebase Auth — creates or signs in a demo account
    setIsLoading(true)
    try {
      // Try login first, fall back to signup for first-time demo users
      let success = await loginUser('user@quizforge.ai', 'demoPass123', 'login')
      if (!success) {
        success = await loginUser('user@quizforge.ai', 'demoPass123', 'signup')
      }
      if (success) {
        setView('dashboard')
      }
    } catch {
      // Silently handle — demo login is best-effort
    } finally {
      setIsLoading(false)
    }
  }

  const handleCtaClick = () => {
    if (isAuthenticated) {
      setView('dashboard')
    } else {
      setAuthMode('signup')
      setAuthModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-muted font-sans relative flex flex-col justify-between select-none">

      {/* ═══════════════ Header / Navbar ═══════════════ */}
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-border shadow-sm transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2 text-left">
              <span className="text-lg font-bold tracking-tight text-ink">QuizForge</span>
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-semibold text-accent border border-indigo-200 uppercase tracking-wide">
                AI v2.5
              </span>
            </div>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              /* Placeholder while Firebase Auth initializes — prevents flicker */
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-subtle" />
                <span className="text-sm text-subtle font-medium">Loading…</span>
              </div>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setError('')
                    setAuthModalOpen(true)
                  }}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-muted transition"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setError('')
                    setAuthModalOpen(true)
                  }}
                  className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════ Hero Section ═══════════════ */}
      <main className="my-auto py-20 px-6 lg:px-10 text-center max-w-5xl mx-auto space-y-8 z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-accent-soft px-4 py-1.5 text-xs font-semibold text-accent">
          <Zap className="h-3.5 w-3.5 text-accent" />
          <span>Next-Gen Assessment & Proctoring System</span>
        </div>

        {/* Dynamic Typewriter Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-ink">
          Experience the <br className="hidden sm:inline" />
          <TypewriterHero />
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-subtle font-normal leading-relaxed">
          Instantly transform study notes, code repositories, or reference PDFs into diagnostic quizzes with real-time anti-cheat proctoring and synchronized classroom tests.
        </p>

        {/* Call to Action (CTA) Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 text-base font-bold text-white shadow-md hover:bg-indigo-600 hover:shadow-lg transition-all group"
          >
            <Sparkles className="h-5 w-5" />
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-7 py-4 text-base font-semibold text-ink shadow-sm hover:bg-muted transition"
          >
            <span>Try Demo Account</span>
          </button>
        </div>

        {/* Features Preview Cards */}
        <div className="pt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {FEATURES.map(({ icon: Icon, title, description, accent, accentBg }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg} ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-ink">{title}</h3>
              <p className="text-xs text-subtle leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="w-full border-t border-border bg-surface py-5 text-center text-xs text-subtle z-10">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-6 gap-2">
          <p>&copy; 2026 QuizForge AI Testing Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-success font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Services Operational
            </span>
          </div>
        </div>
      </footer>

      {/* ═══════════════ Authentication Modal ═══════════════ */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xl text-left space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-5 top-5 rounded-lg p-2 text-subtle hover:bg-muted hover:text-ink transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8">
              <h2 className="text-2xl font-bold text-ink">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-subtle">
                {authMode === 'login'
                  ? 'Sign in to access your AI quiz workspace.'
                  : 'Get started with your free QuizForge account.'}
              </p>
            </div>

            {/* Autofill Demo User Shortcut */}
            <div className="rounded-xl border border-border bg-muted p-3 flex items-center justify-between text-xs">
              <span className="text-subtle font-medium">Testing out QuizForge?</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 transition"
              >
                One-Click Demo Login
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  Email Address
                </span>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-subtle" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-border bg-muted pl-10 pr-4 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 focus:border-accent transition"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  Password
                </span>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-subtle" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-muted pl-10 pr-10 py-2.5 text-sm text-ink outline-none ring-accent/40 focus:ring-2 focus:border-accent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-subtle hover:text-ink transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-danger font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-600 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center text-xs text-subtle pt-3 border-t border-border">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="font-bold text-accent hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-bold text-accent hover:underline"
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