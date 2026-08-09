import { useEffect, useState } from 'react'
import Sidebar from './components/dashboard/Sidebar'
import Dashboard from './components/dashboard/Dashboard'
import QuizCreator from './components/creator/QuizCreator'
import QuizWorkspace from './components/quiz/QuizWorkspace'
import QuizReview from './components/review/QuizReview'
import FlashcardDeck from './components/flashcards/FlashcardDeck'
import LiveMultiplayer from './components/multiplayer/LiveMultiplayer'
import LandingPage from './components/auth/LandingPage'
import TakeSharedTest from './components/quiz/TakeSharedTest'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useQuizStore } from './context/QuizStore'

const VIEW_MAP = {
  landing: LandingPage,
  dashboard: Dashboard,
  creator: QuizCreator,
  quiz: QuizWorkspace,
  review: QuizReview,
  flashcards: FlashcardDeck,
  multiplayer: LiveMultiplayer,
}

export default function App() {
  const activeView = useQuizStore((state) => state.activeView)
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated)
  const setView = useQuizStore((state) => state.setView)

  const [sharedDocId, setSharedDocId] = useState(null)

  useEffect(() => {
    try {
      // Check if the current URL has a shared quiz route: /test/[unique-id] or ?test=[unique-id]
      const pathname = window.location.pathname
      const searchParams = new URLSearchParams(window.location.search)
      
      let id = null
      if (pathname?.startsWith('/test/')) {
        id = pathname.split('/test/')[1]?.split('/')[0]
      } else if (searchParams?.has('test')) {
        id = searchParams.get('test')
      }

      if (id) {
        console.log('[App Router] Intercepting shared quiz route with Document ID:', id)
        setSharedDocId(id)
      }
    } catch (err) {
      console.error('Detailed Error:', err)
    }
  }, [])

  useEffect(() => {
    try {
      if (!isAuthenticated && activeView !== 'landing' && !sharedDocId) {
        setView('landing')
      }
    } catch (err) {
      console.error('Detailed Error:', err)
    }
  }, [isAuthenticated, activeView, setView, sharedDocId])

  // 0. Dynamic Route Interceptor: If student/friend opens /test/[id] link, display TakeSharedTest directly
  if (sharedDocId) {
    return (
      <ErrorBoundary>
        <TakeSharedTest
          docId={sharedDocId}
          onBackToApp={() => {
            try {
              window.history.pushState({}, '', '/')
              setSharedDocId(null)
            } catch (err) {
              console.error('Detailed Error:', err)
              window.location.href = '/'
            }
          }}
        />
      </ErrorBoundary>
    )
  }

  // 1. Route Security Gate: Intercept unauthenticated sessions completely
  if (activeView === 'landing' || !isAuthenticated) {
    return (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    )
  }

  // 2. Safe Fallback resolution for protected views
  const ActivePanel = VIEW_MAP[activeView] || Dashboard

  return (
    <ErrorBoundary>
      <div className="min-h-svh bg-muted text-ink">
        <div className="mx-auto flex min-h-svh max-w-[1440px]">
          {/* Sidebar and Main layout frames now only render when properly authenticated */}
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-10">
            <ActivePanel />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}