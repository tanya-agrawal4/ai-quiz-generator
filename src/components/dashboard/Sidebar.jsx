import {
  LayoutDashboard,
  PenSquare,
  PlayCircle,
  ClipboardCheck,
  Layers3,
  Sparkles,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'creator', label: 'Create Quiz', icon: PenSquare },
  { id: 'quiz', label: 'Take Quiz', icon: PlayCircle },
  { id: 'review', label: 'Review', icon: ClipboardCheck },
  { id: 'flashcards', label: 'Flashcards', icon: Layers3 },
]

export default function Sidebar() {
  const activeView = useQuizStore((state) => state.activeView)
  const setView = useQuizStore((state) => state.setView)
  const totalQuizzes = useQuizStore((state) => state.quizzes.length)

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface px-5 py-6">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-ink">QuizForge</p>
          <p className="text-xs text-subtle">AI Quiz Generator</p>
        </div>
      </div>

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

      <div className="mt-auto rounded-2xl border border-border bg-muted p-4 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-subtle">Workspace</p>
        <p className="mt-2 text-2xl font-semibold text-ink">{totalQuizzes}</p>
        <p className="text-sm text-subtle">Quizzes in library</p>
      </div>
    </aside>
  )
}
