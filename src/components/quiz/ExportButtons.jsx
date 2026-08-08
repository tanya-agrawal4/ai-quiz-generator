import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Check } from 'lucide-react'
import { exportQuizToPdf, exportQuizToCsv } from '../../utils/exportUtils'

export default function ExportButtons({ quiz }) {
  const [pdfSuccess, setPdfSuccess] = useState(false)
  const [csvSuccess, setCsvSuccess] = useState(false)

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null
  }

  const handlePdfExport = () => {
    exportQuizToPdf(quiz)
    setPdfSuccess(true)
    setTimeout(() => setPdfSuccess(false), 2500)
  }

  const handleCsvExport = () => {
    exportQuizToCsv(quiz)
    setCsvSuccess(true)
    setTimeout(() => setCsvSuccess(false), 2500)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handlePdfExport}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 focus:ring-4 focus:ring-accent/20 transition group"
      >
        {pdfSuccess ? (
          <>
            <Check className="h-4 w-4 text-emerald-300" />
            <span>PDF Exported!</span>
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            <span>Download as PDF</span>
            <Download className="h-3.5 w-3.5 opacity-70 group-hover:translate-y-0.5 transition-transform" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleCsvExport}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm hover:bg-muted focus:ring-4 focus:ring-accent/10 transition group"
      >
        {csvSuccess ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">CSV Exported!</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Download as CSV</span>
            <Download className="h-3.5 w-3.5 text-subtle group-hover:translate-y-0.5 transition-transform" />
          </>
        )}
      </button>
    </div>
  )
}
