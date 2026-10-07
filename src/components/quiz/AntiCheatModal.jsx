import { ShieldAlert } from 'lucide-react'

export default function AntiCheatModal({ open, violations, onContinue, onSubmit }) {
  if (!open) return null

  const latest = violations[violations.length - 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anti-cheat-title"
        className="relative w-full max-w-lg rounded-2xl border-2 border-slate-200 bg-white p-7 shadow-2xl text-left"
      >
        {/* Top accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 rounded-t-2xl" />

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border-2 border-red-200 shadow-sm">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <h2 id="anti-cheat-title" className="text-xl font-extrabold tracking-tight text-slate-900">
          Integrity Alert
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
          A restricted action was detected during your quiz session. Tab switching, leaving
          fullscreen, and context menu usage are monitored in secure mode.
        </p>

        {latest && (
          <div className="mt-4 rounded-xl border-2 border-red-100 bg-red-50/60 p-3.5 text-xs text-slate-800 space-y-1">
            <p className="font-black text-red-700 capitalize">{latest.type.replaceAll('-', ' ')}</p>
            {latest.detail && <p className="text-slate-600 font-medium">{latest.detail}</p>}
          </div>
        )}

        <p className="mt-4 text-xs font-semibold text-slate-500">
          Total violations recorded: <span className="font-black text-red-600">{violations.length}</span>
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98] transition-all"
          >
            Continue Quiz
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
          >
            Submit Now
          </button>
        </div>
      </div>
    </div>
  )
}
