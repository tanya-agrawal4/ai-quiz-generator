import { useState } from 'react'
import { Braces, Code2, FileText, Sparkles, Upload } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

// Added PDF tab configuration to TABS structure
const TABS = [
  { id: 'raw', label: 'Raw Text', icon: FileText },
  { id: 'code', label: 'Code', icon: Code2 },
  { id: 'json', label: 'JSON', icon: Braces },
  { id: 'pdf', label: 'PDF Document', icon: FileText },
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
  const isGeneratingQuiz = useQuizStore((state) => state.isGeneratingQuiz)
  
  // PDF state operations from store
  const extractTextFromPdf = useQuizStore((state) => state.extractTextFromPdf)
  const isParsingPdf = useQuizStore((state) => state.isParsingPdf)
  
  const [error, setError] = useState('')
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState('')

  const handleGenerate = async () => {
    setError('')
    try {
      await generateQuizFromCreator()
    } catch (err) {
      setError(err.message || 'Unable to generate quiz.')
    }
  }

  // Intercepts uploaded file buffer stream with strict PDF validation & UI feedback
  const handlePdfFileSelection = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset input target value so selecting the same file triggers onChange again if needed
    event.target.value = ''

    console.log('[QuizCreator] User selected file:', file.name, '| Size:', file.size, 'bytes | Type:', file.type)

    const isPdfExtension = file.name.toLowerCase().endsWith('.pdf')
    const isPdfMime = file.type === 'application/pdf'

    if (!isPdfExtension && !isPdfMime) {
      console.warn('[QuizCreator Validation Fault] Non-PDF file selected:', file.name)
      setError('Invalid file format. Please select a valid .pdf file.')
      setPdfSuccessMessage('')
      return
    }

    try {
      setError('')
      setPdfSuccessMessage('')
      const result = await extractTextFromPdf(file)
      console.log('[QuizCreator] PDF extraction successful:', result)
      setPdfSuccessMessage(`Successfully extracted ${result.charCount} characters from ${result.numPages} page(s) in "${file.name}". Switched to Raw Text mode.`)
    } catch (err) {
      console.error('[QuizCreator Fault] Error during PDF text extraction:', err)
      setError(err.message || 'Failed to extract text from the PDF file.')
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

      {/* Input Configuration Grid (Teacher Settings) */}
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

          {/* Interactive PDF Upload Zone View Pane */}
          {creatorDraft.activeTab === 'pdf' && (
            <div className="w-full rounded-xl border border-dashed border-border bg-muted/50 px-4 py-12 flex flex-col items-center justify-center text-center min-h-[290px]">
              {isParsingPdf ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                  <p className="text-base font-semibold text-accent animate-pulse">Parsing Document...</p>
                  <p className="text-xs text-subtle">Extracting text vectors page by page...</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink">Upload reference material PDF</p>
                    <p className="text-xs text-subtle">Strictly accepts .pdf documents</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-surface border border-border px-4 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-muted transition">
                    <span>Select PDF File</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handlePdfFileSelection}
                    />
                  </label>
                  {pdfSuccessMessage && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs font-medium text-green-700 mt-3">
                      {pdfSuccessMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
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
          disabled={isGeneratingQuiz}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition disabled:opacity-50"
        >
          {isGeneratingQuiz ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Quiz
            </>
          )}
        </button>
      </div>
    </div>
  )
}