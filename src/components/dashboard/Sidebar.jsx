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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-600', hoverBg: 'hover:bg-indigo-50/60 hover:text-indigo-950' },
  { id: 'creator', label: 'Create Quiz', icon: PenSquare, color: 'text-cyan-600', hoverBg: 'hover:bg-cyan-50/60 hover:text-cyan-950' },
  { id: 'quiz', label: 'Take Quiz', icon: PlayCircle, color: 'text-emerald-600', hoverBg: 'hover:bg-emerald-50/60 hover:text-emerald-950' },
  { id: 'review', label: 'Review', icon: ClipboardCheck, color: 'text-amber-600', hoverBg: 'hover:bg-amber-50/60 hover:text-amber-950' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers3, color: 'text-violet-600', hoverBg: 'hover:bg-violet-50/60 hover:text-violet-950' },
  { id: 'classroom', label: 'Classroom Test', icon: Users, color: 'text-blue-600', hoverBg: 'hover:bg-blue-50/60 hover:text-blue-950' },
]

export default function Sidebar() {
  const activeView = useQuizStore((state) => state.activeView)
  const setView = useQuizStore((state) => state.setView)
  const totalQuizzes = useQuizStore((state) => state.quizzes.length)

  const userProfile = useQuizStore((state) => state.userProfile)
  const logoutUser = useQuizStore((state) => state.logoutUser)

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200/80 bg-white px-5 py-6">
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-base font-extrabold tracking-tight text-slate-900">QuizForge</p>
            <span className="rounded-full bg-indigo-50 px-2 py-0.2 text-[10px] font-bold text-indigo-700 border border-indigo-200 uppercase font-mono">
              v2.5
            </span>
          </div>
          <p className="text-xs font-semibold text-indigo-600">AI Assessment Studio</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon, color, hoverBg }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={[
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : `text-slate-700 ${hoverBg} border border-transparent hover:border-slate-200/60`,
              ].join(' ')}
            >
              <Icon className={['h-4.5 w-4.5 shrink-0 transition-colors', active ? 'text-white' : color].join(' ')} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Workspace & Bottom User Section */}
      <div className="mt-auto space-y-4">
        {/* Workspace Card */}
        <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4 text-left shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">WORKSPACE</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ACTIVE
            </span>
          </div>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-900 font-mono">
            {totalQuizzes} <span className="text-xs font-semibold text-slate-500 font-sans">assessments</span>
          </p>
          <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, totalQuizzes * 25))}%` }}
            />
          </div>
        </div>

        <hr className="border-slate-200/80" />

        {/* Dynamic User Profile Block */}
        {(() => {
          const displayName = userProfile?.name || userProfile?.email || 'User'
          const displayEmail = userProfile?.email || ''
          const initial = displayName.charAt(0).toUpperCase()

          return (
            <div className="flex flex-col gap-3 text-left px-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-extrabold uppercase text-sm shadow-2xs">
                    {initial}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 capitalize">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="truncate text-xs font-medium text-slate-400">
                      {displayEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Functional Sign Out */}
              <button
                type="button"
                onClick={logoutUser}
                className="flex w-full items-center gap-2.5 rounded-xl border border-transparent hover:border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all group"
              >
                <LogOut className="h-4 w-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                Sign Out
              </button>
            </div>
          )
        })()}
      </div>
    </aside>
  )
}