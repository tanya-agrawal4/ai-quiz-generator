import { useState } from 'react'
import { Sparkles, ShieldCheck, Zap, Layers } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

export default function LandingPage() {
  const loginUser = useQuizStore((state) => state.loginUser)
  const setView = useQuizStore((state) => state.setView) // Brought in setView to force dashboard redirection
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please provide both an email and password.')
      return
    }
    
    const success = loginUser(email, password)
    if (success) {
      // Force update the view state immediately to reveal your dashboard and sidebar layout frame
      setView('dashboard')
    } else {
      setError('Authentication failed.')
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 text-left flex flex-col md:flex-row w-full">
      {/* Left Column: Product Marketing Side */}
      <div className="flex-1 bg-accent p-12 text-white flex flex-col justify-between min-h-[400px] md:min-h-screen">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">QuizForge</span>
        </div>

        <div className="space-y-6 max-w-lg my-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            The Intelligent Assessment Engine for Engineers
          </h1>
          <p className="text-indigo-100 text-lg">
            Instantly transform raw technical text, high-density source code layouts, or PDF reference manuals into structurally sound, interactive diagnostic quizzes.
          </p>

          <div className="grid gap-4 grid-cols-2 pt-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-indigo-200 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-100 font-medium">Built-in Anti-Cheat System</p>
            </div>
            <div className="flex items-start gap-2.5">
              <Layers className="h-5 w-5 text-indigo-200 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-100 font-medium">Zustand Global Cache Management</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-indigo-200/80">
          &copy; 2026 QuizForge AI Testing Ecosystem. Powered by Client-Side Extraction Engines.
        </p>
      </div>

      {/* Right Column: Secure Authorization Portal */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">Welcome back</h2>
            <p className="mt-2 text-sm text-subtle">
              Sign in to enter your protected workspace library dashboard.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanya@example.com"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
              />
            </div>

            {error && (
              <div className="text-xs font-semibold text-danger bg-red-50 border border-red-100 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
            >
              <Zap className="h-4 w-4" />
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}