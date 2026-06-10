import { useState } from 'react'
import { Bot, CheckCircle2, XCircle } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'

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
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">No review selected</h2>
        <p className="mt-2 text-subtle">Complete a quiz or pick an attempt from the dashboard.</p>
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Quiz Review</h1>
          <p className="mt-2 text-subtle">
            {quiz.title} · {scorePercent}% · {attempt.score}/{attempt.total} correct
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Attempt</span>
          <select
            value={attempt.id}
            onChange={(event) => openReview(event.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none"
          >
            {attempts.map((item) => (
              <option key={item.id} value={item.id}>
                {new Date(item.completedAt).toLocaleString()} · {item.score}/{item.total}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => {
          const selectedIndex = attempt.answers?.[question.id]
          const isCorrect = selectedIndex === question.correctIndex
          const cacheKey = `${attempt.id}:${question.id}`
          const aiText = aiExplanations[cacheKey]

          return (
            <article
              key={question.id}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-danger" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-subtle">Question {index + 1}</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">{question.prompt}</h2>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                        Your Answer
                      </p>
                      <p className="mt-2 text-sm text-ink">
                        {selectedIndex == null
                          ? 'Not answered'
                          : question.options[selectedIndex]}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                        Correct Answer
                      </p>
                      <p className="mt-2 text-sm text-ink">
                        {question.options[question.correctIndex]}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExplain(question.id)}
                    disabled={loadingId === question.id}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-muted disabled:opacity-60"
                  >
                    <Bot className="h-4 w-4" />
                    {loadingId === question.id ? 'Explaining...' : 'Explain with AI'}
                  </button>

                  {aiText && (
                    <div className="mt-4 rounded-xl border border-indigo-200 bg-accent-soft p-4 text-sm leading-6 text-ink">
                      {aiText}
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
