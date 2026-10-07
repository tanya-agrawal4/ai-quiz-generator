import { useState } from 'react'
import { Braces, Code2, FileText, Sparkles, Upload } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

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

  const handlePdfFileSelection = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    event.target.value = ''

    const isPdfExtension = file.name.toLowerCase().endsWith('.pdf')
    const isPdfMime = file.type === 'application/pdf'

    if (!isPdfExtension && !isPdfMime) {
      setError('Invalid file format. Please select a valid .pdf file.')
      setPdfSuccessMessage('')
      return
    }

    try {
      setError('')
      setPdfSuccessMessage('')
      const result = await extractTextFromPdf(file)
      setPdfSuccessMessage(`Successfully extracted ${result.charCount} characters from ${result.numPages} page(s) in "${file.name}". Switched to Raw Text mode.`)
    } catch (err) {
      setError(err.message || 'Failed to extract text from the PDF file.')
    }
  }

  return (
    <div className="space-y-8 text-left p-2 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>Quiz Creator</span>
            <Sparkles className="h-7 w-7 text-indigo-600" />
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Paste study material, code snippets, or structured JSON to generate a diagnostic quiz instantly with AI.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
          ✦ Gemini Engine Ready
        </span>
      </div>

      {/* Input Configuration Grid (Teacher Settings) */}
      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Title
          </span>
          <input
            value={creatorDraft.title}
            onChange={(event) => updateCreatorDraft({ title: event.target.value })}
            placeholder="React Hooks Assessment"
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </label>
        
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            Topic
          </span>
          <input
            value={creatorDraft.topic}
            onChange={(event) => updateCreatorDraft({ topic: event.target.value })}
            placeholder="Frontend Engineering"
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </label>
        
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Difficulty
          </span>
          <select
            value={creatorDraft.difficulty}
            onChange={(event) => updateCreatorDraft({ difficulty: event.target.value })}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition-all cursor-pointer"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Mixed</option>
          </select>
        </label>

        {/* Question Count Limit Picker */}
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            No. of Questions
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={creatorDraft.questionCount || 5}
            onChange={(event) => updateCreatorDraft({ questionCount: Math.max(1, parseInt(event.target.value) || 1) })}
            placeholder="e.g. 10"
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-mono font-black text-slate-900 shadow-2xs outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </label>
      </div>

      {/* Material Input Selection Section */}
      <section className="rounded-2xl border-2 border-indigo-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b-2 border-slate-100 bg-slate-50/80 p-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = creatorDraft.activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateCreatorDraft({ activeTab: id })}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150',
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200',
                ].join(' ')}
              >
                <Icon className={['h-3.5 w-3.5', active ? 'text-white' : 'text-slate-500'].join(' ')} />
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
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/40 px-4 py-3.5 font-mono text-sm leading-relaxed text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
            />
          )}

          {creatorDraft.activeTab === 'code' && (
            <textarea
              value={creatorDraft.code}
              onChange={(event) => updateCreatorDraft({ code: event.target.value })}
              rows={14}
              placeholder={`function QuizApp() {\n  const [score, setScore] = useState(0)\n  useEffect(() => {\n    document.title = \`Score: \${score}\`\n  }, [score])\n  return <main>{score}</main>\n}`}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/40 px-4 py-3.5 font-mono text-sm leading-relaxed text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
            />
          )}

          {creatorDraft.activeTab === 'json' && (
            <textarea
              value={creatorDraft.json || SAMPLE_JSON}
              onChange={(event) => updateCreatorDraft({ json: event.target.value })}
              rows={14}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/40 px-4 py-3.5 font-mono text-sm leading-relaxed text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          )}

          {/* Interactive PDF Upload Zone Pane */}
          {creatorDraft.activeTab === 'pdf' && (
            <div className="w-full rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 px-6 py-12 flex flex-col items-center justify-center text-center min-h-[290px] hover:border-indigo-400 hover:bg-indigo-50/40 transition-all">
              {isParsingPdf ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                  <p className="text-base font-bold text-indigo-700 animate-pulse">Parsing Document...</p>
                  <p className="text-xs text-slate-500 font-medium">Extracting text vectors page by page...</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 border border-indigo-200 shadow-2xs">
                    <Upload className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Upload Reference Material PDF</p>
                    <p className="text-xs text-slate-500 font-medium">Strictly accepts .pdf documents up to multi-page study packs</p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white border-2 border-indigo-200 px-5 py-2.5 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-50 hover:border-indigo-300 active:scale-[0.98] transition-all">
                    <span>Select PDF File</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handlePdfFileSelection}
                    />
                  </label>
                  {pdfSuccessMessage && (
                    <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-3 text-xs font-bold text-emerald-800 mt-3 text-left">
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
        <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 shadow-2xs">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGeneratingQuiz}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 px-8 py-3.5 text-sm font-extrabold text-white shadow-md shadow-indigo-200 hover:shadow-lg active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {isGeneratingQuiz ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Generating Quiz…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Quiz</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}