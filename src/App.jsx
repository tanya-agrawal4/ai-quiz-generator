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

  const [sharedDocId, setSharedDocId] = useState(null)

  // Listen to popstate (browser back/forward navigation) & sync URL routes
  useEffect(() => {
    const handleUrlSync = () => {
      try {
        const pathname = window.location.pathname
        const searchParams = new URLSearchParams(window.location.search)

        // 1. Shared Quiz Test Interceptor
        let id = null
        if (pathname?.startsWith('/test/')) {
          id = pathname.split('/test/')[1]?.split('/')[0]
        } else if (searchParams?.has('test')) {
          id = searchParams.get('test')
        }

        if (id) {
          setSharedDocId(id)
          return
        }
        setSharedDocId(null)

        // 2. Base Route (/) vs Protected Route (/dashboard)
        if (pathname === '/' || pathname === '') {
          useQuizStore.setState({ activeView: 'landing' })
        } else if (pathname.startsWith('/dashboard')) {
          const authState = useQuizStore.getState().isAuthenticated
          if (authState) {
            const subPath = pathname.replace('/dashboard', '').replace(/^\//, '')
            const targetView = VIEW_MAP[subPath] && subPath !== 'landing' ? subPath : 'dashboard'
            useQuizStore.setState({ activeView: targetView })
          } else {
            // Unauthenticated attempt to access /dashboard -> Redirect to /
            window.history.replaceState({}, '', '/')
            useQuizStore.setState({ activeView: 'landing' })
          }
        } else {
          // Fallback unknown routes to Landing page
          window.history.replaceState({}, '', '/')
          useQuizStore.setState({ activeView: 'landing' })
        }
      } catch (err) {
        console.error('URL Sync Error:', err)
      }
    }

    handleUrlSync()
    window.addEventListener('popstate', handleUrlSync)
    return () => window.removeEventListener('popstate', handleUrlSync)
  }, [isAuthenticated])

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
              useQuizStore.setState({ activeView: 'landing' })
            } catch (err) {
              console.error('Detailed Error:', err)
              window.location.href = '/'
            }
          }}
        />
      </ErrorBoundary>
    )
  }

  // 1. Base Route (/) or Landing View: MUST ONLY render the Landing Page
  if (activeView === 'landing' || window.location.pathname === '/') {
    return (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    )
  }

  // 2. Route Security Gate: Intercept unauthenticated access to protected /dashboard
  if (!isAuthenticated) {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/')
    }
    return (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    )
  }

  // 3. Render Protected Dashboard Layout
  const ActivePanel = VIEW_MAP[activeView] || Dashboard

  return (
    <ErrorBoundary>
      <div className="min-h-svh bg-muted text-ink">
        <div className="mx-auto flex min-h-svh max-w-[1440px]">
          {/* Sidebar and Main layout render for authenticated /dashboard routes */}
          <Sidebar />
          <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-10">
            <ActivePanel />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}