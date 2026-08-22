import {
  LayoutDashboard,
  PenSquare,
  PlayCircle,
  ClipboardCheck,
  Layers3,
  Sparkles,
  LogOut,
  Users,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'creator', label: 'Create Quiz', icon: PenSquare },
  { id: 'quiz', label: 'Take Quiz', icon: PlayCircle },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
  { id: 'flashcards', label: 'Flashcards', icon: Layers3 },
  { id: 'classroom', label: 'Classroom Test', icon: Users },
]

export default function Sidebar() {
  const activeView = useQuizStore((state) => state.activeView)
  const setView = useQuizStore((state) => state.setView)
  const totalQuizzes = useQuizStore((state) => state.quizzes.length)

  // Swapped state.user to state.userProfile to match your exact Zustand schema fields
  const userProfile = useQuizStore((state) => state.userProfile)
  const logoutUser = useQuizStore((state) => state.logoutUser)

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface px-5 py-6">
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-ink">QuizForge</p>
          <p className="text-xs text-subtle">AI Quiz Generator</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={[
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-accent-soft text-accent'
                  : 'text-subtle hover:bg-muted hover:text-ink',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Workspace & Bottom User Section */}
      <div className="mt-auto space-y-4">
        {/* Workspace Card */}
        <div className="rounded-2xl border border-border bg-muted p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">Workspace</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{totalQuizzes}</p>
          <p className="text-sm text-subtle">Quizzes in library</p>
        </div>

        <hr className="border-border" />

        {/* Dynamic User Profile Block */}
        {(() => {
          const displayName = userProfile?.name || userProfile?.email || 'User'
          const displayEmail = userProfile?.email || ''
          const initial = displayName.charAt(0).toUpperCase()

          return (
            <div className="flex flex-col gap-3 text-left px-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent font-bold uppercase text-sm">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink capitalize">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="truncate text-xs text-subtle">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Fully Functional Sign Out Operational Trigger */}
              <button
                type="button"
                onClick={logoutUser}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive-soft transition group"
              >
                <LogOut className="h-4 w-4 text-destructive group-hover:translate-x-0.5 transition-transform" />
                Sign Out
              </button>
            </div>
          )
        })()}
      </div>
    </aside>
  )
}