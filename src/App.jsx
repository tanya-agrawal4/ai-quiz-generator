import Sidebar from './components/dashboard/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import QuizCreator from './components/creator/QuizCreator'
import QuizWorkspace from './components/quiz/QuizWorkspace'
import QuizReview from './components/review/QuizReview'
import FlashcardDeck from './components/flashcards/FlashcardDeck'
import LandingPage from './components/auth/LandingPage' // Imported your new landing page layout
import { useQuizStore } from './context/QuizStore'

const VIEW_MAP = {
  landing: LandingPage,
  dashboard: Dashboard,
  creator: QuizCreator,
  quiz: QuizWorkspace,
  review: QuizReview,
  flashcards: FlashcardDeck,
}

export default function App() {
  const activeView = useQuizStore((state) => state.activeView)
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated)

  // 1. Route Security Gate: Intercept unauthenticated sessions completely
  if (activeView === 'landing' || !isAuthenticated) {
    return <LandingPage />
  }

  // 2. Safe Fallback resolution for protected views
  const ActivePanel = VIEW_MAP[activeView] || Dashboard

  return (
    <div className="min-h-svh bg-muted text-ink">
      <div className="mx-auto flex min-h-svh max-w-[1440px]">
        {/* Sidebar and Main layout frames now only render when properly authenticated */}
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-10">
          <ActivePanel />
        </main>
      </div>
    </div>
  )
}