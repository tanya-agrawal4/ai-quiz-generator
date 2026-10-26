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
  Play,
  Check,
  ChevronRight,
  BarChart3,
  Flame,
  Award,
  Layers,
  HelpCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

// Dynamic Typewriter Phrases
const TYPEWRITER_PHRASES = [
  'AI Innovation',
  'Instant Assessment',
  'Anti-Cheat Proctoring',
  'Classroom Live Sync',
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
    <span className="inline-flex items-center">
      <span className="bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {currentText}
      </span>
      <span className="ml-1 inline-block h-8 sm:h-12 w-1 bg-teal-500 animate-pulse rounded-full" />
    </span>
  )
}

// Sample Teaser Questions for Interactive Live Teaser Quiz
const SAMPLE_TEASERS = [
  {
    topic: 'AI Technology',
    question: 'How does QuizForge ensure student test integrity in real-time during synchronized exams?',
    options: [
      'Document visibilityState & fullscreen lock monitoring',
      'Mandatory physical paper verification sheets only',
      'Requiring external third-party hardware dongles',
      'Disabling student Wi-Fi connections manually',
    ],
    correctIndex: 0,
    explanation:
      'QuizForge continuously monitors tab switching, fullscreen status, and window blur events to automatically flag breaches and log anti-cheat records in real time.',
  },
  {
    topic: 'Assessment Engine',
    question: 'Which source materials can QuizForge transform into diagnostic quizzes in seconds?',
    options: [
      'Raw study notes, PDFs, code snippets, and custom topic prompts',
      'Only scanned 1990s textbook microfilm files',
      'Pre-compiled proprietary CD-ROM question banks only',
      'Printed bar-code scan cards without math support',
    ],
    correctIndex: 0,
    explanation:
      'QuizForge accepts any text input, syllabus outlines, uploaded PDF documents, or topic prompts, using Google Gemini AI to formulate multi-format questions instantly.',
  },
  {
    topic: 'Mathematics & Science',
    question: 'How are complex mathematical formulas and scientific notation rendered in QuizForge?',
    options: [
      'Native KaTeX and LaTeX high-definition rendering',
      'Unformatted plaintext ASCII characters',
      'Low-resolution blurry bitmap screenshots',
      'External download links that open in another app',
    ],
    correctIndex: 0,
    explanation:
      'With native KaTeX integration, formulas, algebraic equations, and chemical symbols are rendered crisply in vector quality directly in questions and answer keys.',
  },
]

// Dark Section Feature Cards (Matching the screenshot's "Why Startups Trust Us" layout)
const DARK_FEATURES = [
  {
    icon: BrainCircuit,
    title: 'Comprehensive AI Generation',
    description:
      'Generate multiple-choice, fill-in-blanks, true/false, and short answers with Gemini 2.5 Flash from any PDF or text topic.',
    badge: 'Multi-Modal',
    badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-500/30',
    iconGradient: 'from-teal-500 to-emerald-400',
  },
  {
    icon: ShieldCheck,
    title: 'Proven Anti-Cheat Record',
    description:
      'Live tab switch interception, fullscreen lock enforcement, and penalty logging prevent unauthorized student collaboration.',
    badge: 'Real-Time Proctor',
    badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30',
    iconGradient: 'from-indigo-500 to-purple-400',
  },
  {
    icon: Users,
    title: 'Synchronized Classroom Tests',
    description:
      'Launch live exam rooms with a 6-digit code. Every student starts synchronously with a global countdown and teacher leaderboard.',
    badge: 'Live Sync',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
    iconGradient: 'from-purple-500 to-pink-400',
  },
  {
    icon: FileText,
    title: 'Spaced Flashcards & PDF Export',
    description:
      'Automatically compile flashcard study decks with 3D flip cards, and export high-resolution printable PDF assessment sheets.',
    badge: 'Export & Share',
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
    iconGradient: 'from-cyan-500 to-teal-400',
  },
]

// How It Works Steps
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Provide Your Material',
    description: 'Paste study notes, syllabus text, or upload reference PDF files in one click.',
    tag: 'Input Source',
  },
  {
    step: '02',
    title: 'Configure Exam & Proctoring',
    description: 'Select question quantity, question types, timer limits, and anti-cheat strictness.',
    tag: 'Custom Engine',
  },
  {
    step: '03',
    title: 'Launch Live or Study Solo',
    description: 'Distribute a 6-digit PIN for synchronized tests or begin solo mastery with flashcards.',
    tag: 'Live Results',
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

  // Interactive Hero Widget States
  const [proctoringActive, setProctoringActive] = useState(true)
  const [scientificScore, setScientificScore] = useState(86)
  const [problemScore, setProblemScore] = useState(94)
  const [boosted, setBoosted] = useState(false)

  // Interactive Live Teaser Quiz State
  const [activeTeaserIndex, setActiveTeaserIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasAnswered, setHasAnswered] = useState(false)

  // Classroom PIN Quick Join
  const [classroomPin, setClassroomPin] = useState('')

  // How It Works Modal
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false)

  // Active step in How It Works section
  const [activeStep, setActiveStep] = useState(0)

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
      console.warn('Demo login fallback triggered:', err)
      setView('dashboard')
      setAuthModalOpen(false)
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

  const handleBoostBenchmark = () => {
    setBoosted(true)
    setScientificScore(98)
    setProblemScore(100)
    setTimeout(() => {
      setBoosted(false)
    }, 1800)
  }

  const handleSelectTeaserOption = (idx) => {
    if (hasAnswered) return
    setSelectedOption(idx)
    setHasAnswered(true)
  }

  const handleNextTeaser = () => {
    setSelectedOption(null)
    setHasAnswered(false)
    setActiveTeaserIndex((prev) => (prev + 1) % SAMPLE_TEASERS.length)
  }

  const handleJoinClassroom = (e) => {
    e.preventDefault()
    const clean = classroomPin.trim().toUpperCase()
    if (!clean) return
    window.history.pushState({}, '', `/classroom?code=${clean}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const currentTeaser = SAMPLE_TEASERS[activeTeaserIndex]

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* ═══════════════ Sticky Modern Navbar ═══════════════ */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-indigo-600 text-white shadow-md shadow-teal-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2 text-left">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Quiz<span className="text-teal-600">Forge</span>
              </span>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200/60 uppercase tracking-wider font-mono">
                AI 2.5
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
              <span>Interactive Quiz</span>
              <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[9px] font-bold text-teal-800 uppercase">Live</span>
            </a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
              How it works
            </a>
            <a href="#classroom-quick-join" className="hover:text-teal-600 transition-colors">
              Classroom PIN
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {authLoading ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                <span className="text-xs text-slate-500 font-medium">Loading…</span>
              </div>
            ) : isAuthenticated ? (
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 hover:border-teal-300 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>Try Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-500/25 hover:shadow-lg hover:shadow-teal-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO SECTION (Matching Landing Page Template) ═══════════════ */}
      <section className="relative pt-8 pb-20 md:py-16 lg:py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-6 text-left space-y-6 z-10">
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-4 py-1.5 text-xs font-bold text-teal-800 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
              <Zap className="h-3.5 w-3.5 text-teal-600" />
              <span>NEXT-GEN AI QUIZ & PROCTORING PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Redefine Your Learning with{' '}
              <br className="hidden sm:inline" />
              <TypewriterHero />
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
              Transform study notes, syllabus PDFs, or topic ideas into instant diagnostic quizzes with real-time anti-cheat proctoring and synchronized classroom countdowns.
            </p>

            {/* Call To Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isAuthenticated ? 'Enter Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setHowItWorksModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-2xs hover:border-teal-400 hover:text-teal-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </div>
                <span>How it works?</span>
              </button>
            </div>

            {/* Core Capabilities Row */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold">
                  ✓
                </div>
                <span>Gemini 2.5 Flash Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  🛡️
                </div>
                <span>Live Anti-Cheat Proctoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  ⚡
                </div>
                <span>6-Digit Classroom Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Circular Backdrop & Floating Interactive Widgets */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px] sm:min-h-[520px]">
            {/* Ambient Background Glow */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-teal-200/50 to-indigo-200/40 blur-3xl -z-10 animate-pulse-glow" />

            {/* Main Mint/Teal Circular Backdrop matching the screenshot */}
            <div className="relative w-76 h-76 sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-tr from-teal-500 via-teal-400 to-emerald-300 p-2 shadow-2xl shadow-teal-500/30 flex items-center justify-center overflow-hidden">
              {/* Concentric subtle orbit lines */}
              <div className="absolute inset-5 rounded-full border border-white/30 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-white/20 pointer-events-none" />

              {/* Modern Professional / Student Character Vector Graphic */}
              <div className="relative w-full h-full flex items-end justify-center pt-6">
                <svg
                  viewBox="0 0 340 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                >
                  {/* Soft radial glow behind head */}
                  <circle cx="170" cy="170" r="130" fill="url(#haloGradient)" opacity="0.4" />

                  {/* Suit / Blazer Shoulders */}
                  <path
                    d="M50 400 C50 315, 90 270, 135 258 L205 258 C250 270, 290 315, 290 400 Z"
                    fill="#1E293B"
                  />
                  {/* Left Lapel */}
                  <path d="M130 258 L152 350 L170 350 L170 258 Z" fill="#0F172A" />
                  {/* Right Lapel */}
                  <path d="M210 258 L188 350 L170 350 L170 258 Z" fill="#0F172A" />
                  {/* Pocket Square */}
                  <rect x="85" y="325" width="22" height="4" rx="2" fill="#0D9488" />

                  {/* Crisp White Shirt Collar */}
                  <path d="M150 242 L170 275 L190 242 Z" fill="#FFFFFF" />
                  {/* Modern Teal Necktie */}
                  <path d="M166 268 L174 268 L177 345 L170 356 L163 345 Z" fill="#0D9488" />

                  {/* Crossed Arms */}
                  <path
                    d="M75 365 C100 340, 240 340, 265 365 C240 400, 100 400, 75 365 Z"
                    fill="#0F172A"
                  />
                  {/* Sleeve cuff details */}
                  <circle cx="120" cy="378" r="3" fill="#64748B" />
                  <circle cx="220" cy="378" r="3" fill="#64748B" />

                  {/* Neck & Shading */}
                  <path d="M154 215 L186 215 L186 250 L154 250 Z" fill="#E2A684" />
                  <path d="M154 240 L186 240 L170 252 Z" fill="#D38A65" />

                  {/* Head / Face Contour */}
                  <path
                    d="M136 145 C136 100, 204 100, 204 145 C204 195, 188 224, 170 224 C152 224, 136 195, 136 145 Z"
                    fill="#F6C3A7"
                  />
                  {/* Subtle Cheek Blush */}
                  <ellipse cx="148" cy="172" rx="7" ry="4" fill="#F87171" opacity="0.25" />
                  <ellipse cx="192" cy="172" rx="7" ry="4" fill="#F87171" opacity="0.25" />

                  {/* Friendly Eyes */}
                  <ellipse cx="154" cy="153" rx="4.5" ry="4.5" fill="#0F172A" />
                  <ellipse cx="186" cy="153" rx="4.5" ry="4.5" fill="#0F172A" />
                  <circle cx="156" cy="151" r="1.5" fill="#FFFFFF" />
                  <circle cx="188" cy="151" r="1.5" fill="#FFFFFF" />

                  {/* Eyebrows */}
                  <path d="M148 144 Q154 139 161 144" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M179 144 Q186 139 192 144" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Nose */}
                  <path d="M170 156 L168 168 L173 168" stroke="#D38A65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Warm Confident Smile */}
                  <path d="M156 182 Q170 196 184 182" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
                  <path d="M161 184 Q170 190 179 184" fill="#FFFFFF" />

                  {/* Ears */}
                  <ellipse cx="134" cy="158" rx="4.5" ry="8" fill="#F6C3A7" />
                  <ellipse cx="206" cy="158" rx="4.5" ry="8" fill="#F6C3A7" />

                  {/* Modern Styled Hair */}
                  <path
                    d="M130 142 C124 100, 146 72, 172 72 C198 72, 216 95, 210 142 C200 102, 150 108, 130 142 Z"
                    fill="#0F172A"
                  />
                  {/* Subtle hair highlight */}
                  <path
                    d="M155 82 C168 78, 185 82, 195 90"
                    stroke="#334155"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Gradients */}
                  <defs>
                    <radialGradient id="haloGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 170) rotate(90) scale(130)">
                      <stop stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Floating AI Engine Badge (Top Left of Circle) */}
            <div className="hidden sm:flex absolute -top-2 left-6 z-20 items-center gap-1.5 rounded-full bg-white/95 border border-slate-200 py-1.5 px-3.5 shadow-md backdrop-blur-md animate-float-reverse">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span className="text-[11px] font-bold text-slate-800">Google Gemini 2.5 AI</span>
            </div>

            {/* ─── Floating Interactive Widget 1: Proctoring Guard & Live Toggle ─── */}
            <div className="absolute top-2 sm:top-4 right-0 sm:-right-4 z-20 animate-float-smooth">
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-3.5 shadow-xl shadow-slate-900/10 text-left min-w-[175px] space-y-2 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${proctoringActive ? 'bg-emerald-400' : 'bg-slate-300'} opacity-75`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${proctoringActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Test Guard
                    </span>
                  </div>
                  {/* Interactive Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setProctoringActive(!proctoringActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      proctoringActive ? 'bg-teal-500' : 'bg-slate-300'
                    }`}
                    title="Click to toggle proctoring state"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        proctoringActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
                    {proctoringActive ? 'STRICT' : 'CASUAL'}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    proctoringActive ? 'text-teal-700 bg-teal-50 border border-teal-200' : 'text-slate-600 bg-slate-100 border border-slate-200'
                  }`}>
                    {proctoringActive ? 'PROCTORED' : 'PRACTICE'}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className={`h-3 w-3 ${proctoringActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{proctoringActive ? 'Tab-Switch Guard ON' : 'Self-Paced Practice'}</span>
                </div>
              </div>
            </div>

            {/* ─── Floating Interactive Widget 2: Quiz Strategy & Progress Bars ─── */}
            <div className="absolute -bottom-6 sm:bottom-0 left-0 sm:-left-6 z-20 animate-float-reverse">
              <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-4 shadow-xl shadow-slate-900/10 text-left min-w-[210px] sm:min-w-[240px] space-y-3 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <BarChart3 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Quiz Analytics</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBoostBenchmark}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    {boosted ? '✦ Boosted!' : '⚡ Test'}
                  </button>
                </div>

                {/* Progress Bar 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>MCQ & Concept Accuracy</span>
                    <span className="text-teal-600 font-mono">{scientificScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-amber-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${scientificScore}%` }}
                    />
                  </div>
                </div>

                {/* Progress Bar 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Formulas & Short Answers</span>
                    <span className="text-purple-600 font-mono">{problemScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${problemScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Floating Live Classroom Sync Badge ─── */}
            <div className="hidden sm:flex absolute top-1/2 -left-8 -translate-y-1/2 z-20 items-center gap-2 rounded-full bg-white/95 border border-slate-200/90 py-1.5 px-3 shadow-lg backdrop-blur-md">
              <div className="flex -space-x-1.5">
                <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">
                  Q
                </span>
                <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-teal-500 text-[9px] font-bold text-white flex items-center justify-center">
                  Z
                </span>
                <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-purple-500 text-[9px] font-bold text-white flex items-center justify-center">
                  F
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-700">Classroom Live Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ INTERACTIVE LIVE TEASER QUIZ SECTION ═══════════════ */}
      <section id="interactive-demo" className="py-16 px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3.5 py-1 text-xs font-bold text-teal-700">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Interactive Demo · Try It Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See How AI Evaluates Your Knowledge
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Click an option below to test instant proctoring feedback and smart AI answer explanations.
          </p>
        </div>

        {/* Live Quiz Teaser Card */}
        <div className="relative rounded-3xl border-2 border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-100 text-left transition-all">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-200">
                {currentTeaser.topic}
              </span>
              <span className="text-xs text-slate-400 font-medium">Question {activeTeaserIndex + 1} of 3</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>Real-Time AI Grading</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="py-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentTeaser.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentTeaser.options.map((option, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentTeaser.correctIndex
              let btnClass = 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/40 text-slate-800'

              if (hasAnswered) {
                if (isCorrect) {
                  btnClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-rose-400 bg-rose-50/80 text-rose-950 font-medium'
                } else {
                  btnClass = 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-70'
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTeaserOption(idx)}
                  disabled={hasAnswered}
                  className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left text-xs sm:text-sm font-semibold transition-all duration-150 ${btnClass} cursor-pointer`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                      hasAnswered && isCorrect
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-slate-100 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {hasAnswered && isCorrect && <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                </button>
              )
            })}
          </div>

          {/* AI Explanation Box (reveals upon answer) */}
          {hasAnswered && (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 mb-6 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                <BrainCircuit className="h-4 w-4 text-teal-600" />
                <span>Gemini AI Explanation</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentTeaser.explanation}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              {!hasAnswered ? 'Select an answer to reveal explanation' : 'Great job! Explore more questions or generate your own.'}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasAnswered && (
                <button
                  type="button"
                  onClick={handleNextTeaser}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleCtaClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-teal-600 hover:to-indigo-700 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Create Custom Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DARK CONTRAST SECTION ("Why Educators & Students Trust Us") ═══════════════ */}
      {/* Matches the screenshot's dark section with luminous cards and gradient header */}
      <section id="features" className="bg-[#090D1A] text-white py-20 px-6 lg:px-12 relative overflow-hidden">
        {/* Ambient Cosmic Lights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Why Educators{' '}
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Trust Us
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              We deliver the easiest way to generate, proctor, and synchronize assessments across your classes.
            </p>
          </div>

          {/* 4 Luminous Cards Grid (Matching the screenshot's rounded card aesthetic) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {DARK_FEATURES.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="group relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-8 sm:p-10 hover:border-teal-400/40 hover:bg-white/[0.06] transition-all duration-300 shadow-xl space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.iconGradient} text-white shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore capability</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Interactive Classroom PIN Quick Join Bar */}
          <div id="classroom-quick-join" className="pt-8">
            <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Live Classroom Exam Lobby
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Have a 6-digit test code from your teacher?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Enter your room PIN to join the synchronous countdown without signing in.
                </p>
              </div>

              {/* Quick Join Input Form */}
              <form onSubmit={handleJoinClassroom} className="w-full md:w-auto flex items-center gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={classroomPin}
                  onChange={(e) => setClassroomPin(e.target.value.toUpperCase())}
                  placeholder="e.g. 748-291"
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-mono font-bold text-white placeholder:text-slate-500 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 uppercase tracking-widest text-center min-w-[160px]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-teal-500 hover:bg-teal-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-teal-500/20 active:scale-95"
                >
                  Join Test
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS INTERACTIVE SECTION ═══════════════ */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto text-left">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-bold text-indigo-700">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Generate In Three Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            From raw study notes to an orchestrated, proctored classroom test in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`rounded-3xl border-2 p-8 transition-all duration-200 cursor-pointer ${
                activeStep === idx
                  ? 'border-teal-500 bg-teal-50/30 shadow-lg shadow-teal-500/10'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black font-mono text-teal-600/30">{step.step}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {step.tag}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="w-full border-t border-slate-200/80 bg-slate-50/50 py-10 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-6 lg:px-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-800 text-sm">QuizForge Ecosystem</span>
          </div>

          <p>&copy; 2026 QuizForge AI Testing Ecosystem. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
              <CheckCircle2 className="h-4 w-4" /> All Systems Operational
            </span>
          </div>
        </div>
      </footer>

      {/* ═══════════════ "HOW IT WORKS" MODAL ═══════════════ */}
      {howItWorksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-left space-y-6">
            <button
              type="button"
              onClick={() => setHowItWorksModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                  WALKTHROUGH
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">How QuizForge Works</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Explore the end-to-end flow from content generation to classroom analytics.
              </p>
            </div>

            <div className="space-y-4">
              {HOW_IT_WORKS_STEPS.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500 text-white font-mono font-bold text-sm">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setHowItWorksModalOpen(false)
                  openAuthModal('signup')
                }}
                className="w-full rounded-full bg-teal-600 hover:bg-teal-700 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Try It Yourself Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ AUTHENTICATION MODAL ═══════════════ */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl text-left space-y-6">
            {/* Top Teal Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-indigo-600 rounded-t-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute right-5 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">QuizForge AI</span>
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
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-teal-900 font-bold">Testing QuizForge?</p>
                <p className="text-[11px] text-teal-700">Instant access with preloaded tests</p>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                <span>One-Click Demo</span>
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
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
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-xs transition-all placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
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
                    className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-bold shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 py-3 text-sm font-extrabold text-white shadow-md shadow-teal-500/25 hover:from-teal-600 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup')
                      setError('')
                      setEmail('')
                      setPassword('')
                    }}
                    className="font-bold text-teal-600 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login')
                      setError('')
                      setEmail('')
                      setPassword('')
                    }}
                    className="font-bold text-teal-600 hover:underline cursor-pointer"
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