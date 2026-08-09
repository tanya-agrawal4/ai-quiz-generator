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
      // Typing forward
      timer = setTimeout(() => {
        setCurrentText(targetPhrase.slice(0, currentText.length + 1))
      }, 70)
    } else if (!isDeleting && currentText.length === targetPhrase.length) {
      // Pause at full word
      timer = setTimeout(() => {
        setIsDeleting(true)
      }, 2200)
    } else if (isDeleting && currentText.length > 0) {
      // Deleting back
      timer = setTimeout(() => {
        setCurrentText(targetPhrase.slice(0, currentText.length - 1))
      }, 40)
    } else if (isDeleting && currentText.length === 0) {
      // Move to next phrase
      setIsDeleting(false)
      setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length)
    }

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, phraseIndex])

  return (
    <div className="inline-flex items-center">
      <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
        {currentText}
      </span>
      <span className="ml-1 inline-block h-10 w-1 bg-indigo-400 animate-pulse" />
    </div>
  )
}

export default function LandingPage() {
  const loginUser = useQuizStore((state) => state.loginUser)
  const setView = useQuizStore((state) => state.setView)
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated)

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

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))

    const success = loginUser(email, password)
    setIsLoading(false)

    if (success) {
      setAuthModalOpen(false)
      setView('dashboard')
    } else {
      setError('Authentication failed. Please check your credentials.')
    }
  }

  const handleDemoLogin = () => {
    loginUser('user@quizforge.ai', 'demoPass123')
    setView('dashboard')
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
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden flex flex-col justify-between select-none">
      {/* Background Ambient Mesh & Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/60 border-b border-white/10 transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-2 text-left">
              <span className="text-xl font-bold tracking-tight text-white">QuizForge</span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-400/20 uppercase tracking-wide">
                AI v2.5
              </span>
            </div>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition transform hover:scale-105"
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
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:border-white/40 hover:bg-white/10 transition"
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
                  className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition transform hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Center Typewriter Animation & CTA) */}
      <main className="my-auto py-16 px-6 lg:px-10 text-center max-w-5xl mx-auto space-y-8 z-10">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
          <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Next-Gen Assessment & Proctoring System</span>
        </div>

        {/* Dynamic Typewriter Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Experience the <br className="hidden sm:inline" />
          <TypewriterHero />
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed">
          Instantly transform study notes, code repositories, or reference PDFs into diagnostic quizzes with real-time anti-cheat proctoring and live multiplayer arenas.
        </p>

        {/* Call to Action (CTA) Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_35px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all transform hover:scale-105 group"
          >
            <Sparkles className="h-5 w-5" />
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-4 text-base font-semibold text-white hover:bg-white/10 hover:border-white/30 transition backdrop-blur-md"
          >
            <span>Try Demo Account</span>
          </button>
        </div>

        {/* Features Preview Cards */}
        <div className="pt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-2 hover:border-indigo-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Gemini AI Generator</h3>
            <p className="text-xs text-slate-400">Generates custom MCQ, Fill-in-blanks, True/False, and Short Answer questions.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-2 hover:border-purple-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Strict Anti-Cheat</h3>
            <p className="text-xs text-slate-400">Monitors tab switches, fullscreen escapes, and context menus for exam integrity.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-2 hover:border-emerald-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Live Multiplayer Arena</h3>
            <p className="text-xs text-slate-400">Host live real-time quiz matches with synchronized live leaderboards.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-2 hover:border-pink-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Quiz Sharing & Export</h3>
            <p className="text-xs text-slate-400">Share via Firestore unique links or download as PDF / CSV assessments.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-500 z-10">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-6 gap-2">
          <p>&copy; 2026 QuizForge AI Testing Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> All Services Operational
            </span>
          </div>
        </div>
      </footer>

      {/* 3. Authentication Modal (Login / Sign Up) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-8 shadow-2xl text-left space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8">
              <h2 className="text-2xl font-bold text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-slate-400">
                {authMode === 'login'
                  ? 'Sign in to access your AI quiz workspace.'
                  : 'Get started with your free QuizForge account.'}
              </p>
            </div>

            {/* Autofill Demo User Shortcut */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Testing out QuizForge?</span>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                One-Click Demo Login
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    className="w-full rounded-xl border border-white/15 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white outline-none ring-indigo-500/50 focus:ring-2"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    className="w-full rounded-xl border border-white/15 bg-slate-800/80 pl-10 pr-10 py-2.5 text-sm text-white outline-none ring-indigo-500/50 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="font-bold text-indigo-400 hover:underline"
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
                    className="font-bold text-indigo-400 hover:underline"
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