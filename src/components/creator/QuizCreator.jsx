import { useState } from 'react'
import { Braces, Code2, FileText, Sparkles } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

const TABS = [
  { id: 'raw', label: 'Raw Text', icon: FileText },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'json', label: 'JSON', icon: Braces },
]

const SAMPLE_JSON = `[
  {
    "prompt": "Which HTTP method is idempotent?",
    "options": ["POST", "PATCH", "PUT", "CONNECT"],
    "correctIndex": 2,
    "explanation": "PUT is idempotent when used to replace a resource."
  }
]`

export default function QuizCreator() {
  const creatorDraft = useQuizStore((state) => state.creatorDraft)
  const updateCreatorDraft = useQuizStore((state) => state.updateCreatorDraft)
  const generateQuizFromCreator = useQuizStore((state) => state.generateQuizFromCreator)
  const [error, setError] = useState('')

  const handleGenerate = () => {
    try {
      setError('')
      generateQuizFromCreator()
    } catch (err) {
      setError(err.message || 'Unable to generate quiz.')
    }
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Quiz Creator</h1>
        <p className="mt-2 text-subtle">
          Paste study material, code snippets, or structured JSON to generate a quiz instantly.
        </p>
      </div>

      {/* Input Configuration Grid (Teacher Settings added here) */}
      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            value={creatorDraft.title}
            onChange={(event) => updateCreatorDraft({ title: event.target.value })}
            placeholder="React Hooks Assessment"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
          />
        </label>
        
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Topic</span>
          <input
            value={creatorDraft.topic}
            onChange={(event) => updateCreatorDraft({ topic: event.target.value })}
            placeholder="Frontend"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
          />
        </label>
        
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Difficulty</span>
          <select
            value={creatorDraft.difficulty}
            onChange={(event) => updateCreatorDraft({ difficulty: event.target.value })}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Mixed</option>
          </select>
        </label>

        {/* TEACHER MODE: Custom Questions Count Limit Picker */}
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">No. of Questions</span>
          <input
            type="number"
            min={1}
            max={50}
            value={creatorDraft.questionCount || 5}
            onChange={(event) => updateCreatorDraft({ questionCount: Math.max(1, parseInt(event.target.value) || 1) })}
            placeholder="e.g. 10"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none ring-accent/20 focus:ring-4 text-ink font-medium"
          />
        </label>
      </div>

      {/* Material Input Selection Section */}
      <section className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-border p-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = creatorDraft.activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateCreatorDraft({ activeTab: id })}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
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
        </div>

        <div className="p-6">
          {creatorDraft.activeTab === 'raw' && (
            <textarea
              value={creatorDraft.rawText}
              onChange={(event) => updateCreatorDraft({ rawText: event.target.value })}
              rows={14}
              placeholder={`What hook manages local state?\nA) useEffect\nB) useState\nC) useMemo\nD) useRef\n\nWhich hook handles side effects?\nA) useEffect\nB) useState\nC) useCallback\nD) useLayoutEffect`}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 font-mono text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
            />
          )}

          {creatorDraft.activeTab === 'code' && (
            <textarea
              value={creatorDraft.code}
              onChange={(event) => updateCreatorDraft({ code: event.target.value })}
              rows={14}
              placeholder={`function QuizApp() {\n  const [score, setScore] = useState(0)\n  useEffect(() => {\n    document.title = \`Score: \${score}\`\n  }, [score])\n  return <main>{score}</main>\n}`}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 font-mono text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
            />
          )}

          {creatorDraft.activeTab === 'json' && (
            <textarea
              value={creatorDraft.json || SAMPLE_JSON}
              onChange={(event) => updateCreatorDraft({ json: event.target.value })}
              rows={14}
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 font-mono text-sm outline-none ring-accent/20 focus:ring-4 text-ink"
            />
          )}
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
        >
          <Sparkles className="h-4 w-4" />
          Generate Quiz
        </button>
      </div>
    </div>
  )
}