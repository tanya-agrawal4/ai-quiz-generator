import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Check, Share2 } from 'lucide-react'
import { exportQuizToPdf, exportQuizToCsv } from '../../utils/exportUtils'
import ShareQuizModal from './ShareQuizModal'

export default function ExportButtons({ quiz }) {
  const [pdfSuccess, setPdfSuccess] = useState(false)
  const [csvSuccess, setCsvSuccess] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return null
  }

  const handlePdfExport = () => {
    try {
      exportQuizToPdf(quiz)
      setPdfSuccess(true)
      setTimeout(() => setPdfSuccess(false), 2500)
    } catch (err) {
      console.error('PDF export failed:', err)
    }
  }

  const handleCsvExport = () => {
    try {
      exportQuizToCsv(quiz)
      setCsvSuccess(true)
      setTimeout(() => setCsvSuccess(false), 2500)
    } catch (err) {
      console.error('CSV export failed:', err)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Share Quiz Button */}
        <button
          type="button"
          onClick={() => setShareModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all group"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share Quiz</span>
        </button>

        <button
          type="button"
          onClick={handlePdfExport}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98] transition-all group"
        >
          {pdfSuccess ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">PDF Saved!</span>
            </>
          ) : (
            <>
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
              <span>Download PDF</span>
              <Download className="h-3 w-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleCsvExport}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-emerald-300 hover:text-emerald-700 active:scale-[0.98] transition-all group"
        >
          {csvSuccess ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">CSV Saved!</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Download CSV</span>
              <Download className="h-3 w-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </button>
      </div>

      <ShareQuizModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        quiz={quiz}
      />
    </>
  )
}
