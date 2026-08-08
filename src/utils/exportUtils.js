import { jsPDF } from 'jspdf'

/**
 * Pure JavaScript CSV Exporter with Blob URL download
 * Converts quiz JSON data into a formatted CSV file string including correct answers & explanations.
 */
export function exportQuizToCsv(quiz) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    console.warn('[CSV Exporter] No valid quiz data provided for export.')
    return
  }

  // Header row definition
  const headers = [
    'Question Number',
    'Question Prompt',
    'Question Type',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer',
    'Explanation',
  ]

  const escapeCsvCell = (val) => {
    if (val == null) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const rows = quiz.questions.map((q, idx) => {
    const qType = q.questionType || 'MCQ'
    let correctText = ''

    if (qType === 'SHORT_ANSWER') {
      correctText = q.correctAnswer || ''
    } else if (Array.isArray(q.options) && q.options[q.correctIndex] !== undefined) {
      correctText = `Option ${String.fromCharCode(65 + q.correctIndex)}: ${q.options[q.correctIndex]}`
    }

    const optA = q.options?.[0] || ''
    const optB = q.options?.[1] || ''
    const optC = q.options?.[2] || ''
    const optD = q.options?.[3] || ''

    return [
      idx + 1,
      escapeCsvCell(q.prompt),
      escapeCsvCell(qType),
      escapeCsvCell(optA),
      escapeCsvCell(optB),
      escapeCsvCell(optC),
      escapeCsvCell(optD),
      escapeCsvCell(correctText),
      escapeCsvCell(q.explanation || ''),
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  const fileName = `${(quiz.title || 'quiz').toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.csv`
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * jsPDF Document Exporter
 * Formats quiz title, topic, difficulty, questions, options, correct answers, and explanations into a clean PDF.
 */
export function exportQuizToPdf(quiz) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    console.warn('[PDF Exporter] No valid quiz data provided for export.')
    return
  }

  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const maxWidth = pageWidth - margin * 2
  let y = margin

  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Header Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(79, 70, 229) // Indigo Accent
  doc.text(quiz.title || 'Quiz Assessment', margin, y)
  y += 24

  // Topic & Difficulty Meta Summary
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  const metaStr = `Topic: ${quiz.topic || 'General'}  |  Difficulty: ${quiz.difficulty || 'Mixed'}  |  Total Questions: ${quiz.questions.length}`
  doc.text(metaStr, margin, y)
  y += 16

  // Divider Line
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(1)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  // Iterate questions
  quiz.questions.forEach((q, idx) => {
    checkPageBreak(80)

    // Question prompt
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(17, 24, 39)
    const promptLines = doc.splitTextToSize(`Q${idx + 1}. ${q.prompt}`, maxWidth)
    doc.text(promptLines, margin, y)
    y += promptLines.length * 14 + 4

    // Options for MCQ / True False
    if (q.questionType !== 'SHORT_ANSWER' && Array.isArray(q.options) && q.options.length > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(55, 65, 81)

      q.options.forEach((opt, oIdx) => {
        checkPageBreak(18)
        const prefix = String.fromCharCode(65 + oIdx)
        const optLines = doc.splitTextToSize(`   [ ${prefix} ]  ${opt}`, maxWidth - 10)
        doc.text(optLines, margin + 10, y)
        y += optLines.length * 13
      })
      y += 4
    }

    // Correct Answer Section
    checkPageBreak(25)
    let answerStr = ''
    if (q.questionType === 'SHORT_ANSWER') {
      answerStr = `Correct Answer: ${q.correctAnswer || 'N/A'}`
    } else {
      const correctOpt = q.options?.[q.correctIndex] ?? ''
      answerStr = `Correct Answer: Option ${String.fromCharCode(65 + q.correctIndex)} (${correctOpt})`
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(5, 150, 105) // Green success
    doc.text(answerStr, margin + 10, y)
    y += 14

    // Explanation Section
    if (q.explanation) {
      checkPageBreak(20)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.setTextColor(107, 114, 128)
      const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, maxWidth - 10)
      doc.text(expLines, margin + 10, y)
      y += expLines.length * 12
    }

    y += 16
  })

  // Trigger browser download
  const fileName = `${(quiz.title || 'quiz').toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.pdf`
  doc.save(fileName)
}
