import { useState } from 'react'
import { Bot, CheckCircle2, Sparkles, XCircle } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import ExportButtons from '../quiz/ExportButtons'
import FormattedText from '../common/FormattedText'

export default function QuizReview() {
  const reviewAttemptId = useQuizStore((state) => state.reviewAttemptId)
  const attempts = useQuizStore((state) => state.attempts)
  const attempt = attempts.find((item) => item.id === reviewAttemptId) ?? null
  const quizzes = useQuizStore((state) => state.quizzes)
  const aiExplanations = useQuizStore((state) => state.aiExplanations)
  const explainWithAi = useQuizStore((state) => state.explainWithAi)
  const openReview = useQuizStore((state) => state.openReview)
  const [loadingId, setLoadingId] = useState(null)

  const quiz = quizzes.find((item) => item.id === attempt?.quizId)

  if (!attempt || !quiz) {
    return (
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center shadow-xs">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">No review selected</h2>
        <p className="mt-2 text-sm text-slate-500">Complete a quiz session or select an attempt from your dashboard.</p>
      </div>
    )
  }

  const scorePercent = Math.round((attempt.score / attempt.total) * 100)

  const handleExplain = async (questionId) => {
    setLoadingId(questionId)
    await explainWithAi(questionId)
    setLoadingId(null)
  }

  return (
    <div className="space-y-8 text-left p-2 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Quiz Review</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm font-bold text-slate-800">{quiz.title}</span>
            <span className="text-slate-300">·</span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-black border ${
                scorePercent >= 70
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {scorePercent}% Accuracy
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-600 font-mono">
              {attempt.score}/{attempt.total} Correct
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButtons quiz={quiz} />

          <label className="space-y-1 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Select Attempt</span>
            <select
              value={attempt.id}
              onChange={(event) => openReview(event.target.value)}
              className="rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
            >
              {attempts.map((item) => (
                <option key={item.id} value={item.id}>
                  {new Date(item.completedAt).toLocaleDateString()} · {item.score}/{item.total} ({Math.round((item.score/item.total)*100)}%)
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-5">
        {quiz.questions.map((question, index) => {
          const selectedIndex = attempt.answers?.[question.id]
          const isCorrect =
            question.questionType === 'SHORT_ANSWER'
              ? String(selectedIndex || '').trim().toLowerCase() ===
                String(question.correctAnswer || '').trim().toLowerCase()
              : selectedIndex === question.correctIndex
          const cacheKey = `${attempt.id}:${question.id}`
          const aiText = aiExplanations[cacheKey]

          const userAnswerText =
            selectedIndex == null
              ? 'Not answered'
              : question.questionType === 'SHORT_ANSWER'
              ? selectedIndex
              : question.options[selectedIndex]

          const correctAnswerText =
            question.questionType === 'SHORT_ANSWER'
              ? question.correctAnswer
              : question.options[question.correctIndex]

          return (
            <article
              key={question.id}
              className={`rounded-2xl border-2 bg-white p-6 shadow-sm transition-all ${
                isCorrect
                  ? 'border-emerald-200/90 border-l-4 border-l-emerald-500'
                  : 'border-rose-200/90 border-l-4 border-l-rose-500'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {isCorrect ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 font-mono">
                      Question {index + 1}
                    </p>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        CORRECT ANSWER
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                        INCORRECT
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    <FormattedText>{question.prompt}</FormattedText>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {/* Your Answer Box */}
                    <div
                      className={`rounded-xl border-2 p-4 transition-all ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                          : 'border-rose-200 bg-rose-50/40 text-rose-950'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          isCorrect ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isCorrect ? 'Your Answer (Correct)' : 'Your Answer (Incorrect)'}
                      </p>
                      <div className="mt-1.5 text-sm font-semibold">
                        <FormattedText>{userAnswerText}</FormattedText>
                      </div>
                    </div>

                    {/* Official Correct Answer Box */}
                    <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-4 text-indigo-950">
                      <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                        Official Correct Answer
                      </p>
                      <div className="mt-1.5 text-sm font-semibold text-slate-900">
                        <FormattedText>{correctAnswerText}</FormattedText>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExplain(question.id)}
                    disabled={loadingId === question.id}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 hover:border-indigo-300 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Bot className="h-4 w-4 text-indigo-600" />
                    <span>{loadingId === question.id ? 'Analyzing with AI…' : 'Explain with AI'}</span>
                  </button>

                  {aiText && (
                    <div className="mt-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4 text-xs leading-relaxed text-slate-800 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 mb-2">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        <span>AI Diagnostic Explanation</span>
                      </div>
                      <FormattedText>{aiText}</FormattedText>
                    </div>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
