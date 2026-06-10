import { ShieldAlert } from 'lucide-react'

export default function AntiCheatModal({ open, violations, onContinue, onSubmit }) {
  if (!open) return null

  const latest = violations[violations.length - 1]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="anti-cheat-title"
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-danger">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <h2 id="anti-cheat-title" className="text-xl font-semibold text-ink">
          Integrity Alert
        </h2>
        <p className="mt-2 text-sm leading-6 text-subtle">
          A restricted action was detected during your quiz session. Tab switching, leaving
          fullscreen, and context menu usage are monitored in secure mode.
        </p>

        {latest && (
          <div className="mt-4 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-ink">
            <p className="font-medium capitalize">{latest.type.replaceAll('-', ' ')}</p>
            {latest.detail && <p className="mt-1 text-subtle">{latest.detail}</p>}
          </div>
        )}

        <p className="mt-4 text-sm text-subtle">
          Total violations recorded: <span className="font-semibold text-ink">{violations.length}</span>
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-muted"
          >
            Continue Quiz
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          >
            Submit Now
          </button>
        </div>
      </div>
    </div>
  )
}
