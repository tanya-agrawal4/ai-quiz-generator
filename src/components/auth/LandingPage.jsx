import { useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  BrainCircuit,
  BookOpenCheck,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

export default function LandingPage() {
  const loginUser = useQuizStore((state) => state.loginUser)
  const setView = useQuizStore((state) => state.setView)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please provide both an email and password.')
      return
    }

    setIsLoading(true)

    // Smooth loading state delay for real-time authentication feedback
    await new Promise((resolve) => setTimeout(resolve, 600))

    const success = loginUser(email, password)
    setIsLoading(false)

    if (success) {
      setView('dashboard')
    } else {
      setError('Authentication failed. Please check your credentials.')
    }
  }

  const fillDemoUser = () => {
    setEmail('user@quizforge.ai')
    setPassword('demoPass123')
    setError('')
  }

  return (
    <div className="min-h-screen bg-muted/40 text-left flex flex-col lg:flex-row w-full font-sans">
      {/* Left Column: Hero Side with Gradient & Feature Showcase */}
      <div className="lg:w-7/12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-8 md:p-12 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="bg-white/10 border border-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner">
            <Sparkles className="h-6 w-6 text-indigo-300" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">QuizForge</span>
            <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              AI Powered
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="space-y-8 max-w-xl my-auto py-12 z-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              The Intelligent Assessment Engine
            </h1>
            <p className="text-indigo-200 text-base md:text-lg leading-relaxed font-normal">
              Instantly transform technical text, high-density code snippets, or reference PDFs into interactive diagnostic quizzes powered by AI.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <BrainCircuit className="h-5 w-5 text-indigo-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Gemini AI Generation</p>
                <p className="text-xs text-indigo-200/80">Multi-format assessments</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-indigo-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Anti-Cheat Proctoring</p>
                <p className="text-xs text-indigo-200/80">Tab & focus tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <BookOpenCheck className="h-5 w-5 text-indigo-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Smart Flashcards</p>
                <p className="text-xs text-indigo-200/80">Auto-generated review decks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <Layers className="h-5 w-5 text-indigo-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Per-User Workspaces</p>
                <p className="text-xs text-indigo-200/80">Isolated session state</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 text-xs text-indigo-300/80">
          <p>&copy; 2026 QuizForge AI Testing Ecosystem.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> System Operational
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Authorization Portal */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md space-y-8">
          {/* Form Header */}
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-accent-soft text-accent mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">Welcome Back</h2>
            <p className="text-sm text-subtle">
              Sign in to access your protected workspace library dashboard.
            </p>
          </div>

          {/* Quick Demo Fill Card */}
          <div className="rounded-2xl border border-border bg-muted/60 p-4 text-left flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Testing the application?</p>
              <p className="text-xs text-subtle">Click to autofill demo credentials</p>
            </div>
            <button
              type="button"
              onClick={fillDemoUser}
              className="shrink-0 rounded-lg bg-surface border border-border px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-soft transition shadow-sm"
            >
              Demo Login
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink flex items-center justify-between">
                <span>Email address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-subtle">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm outline-none ring-accent/20 focus:border-accent focus:ring-4 text-ink transition disabled:opacity-60 disabled:bg-muted"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink flex items-center justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-subtle">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-10 py-3 text-sm outline-none ring-accent/20 focus:border-accent focus:ring-4 text-ink transition disabled:opacity-60 disabled:bg-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-subtle hover:text-ink transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="flex items-center gap-3 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-xl p-3.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 focus:ring-4 focus:ring-accent/30 transition disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to QuizForge</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}