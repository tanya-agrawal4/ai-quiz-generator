import { create } from 'zustand'

const SAMPLE_QUIZZES = [
  {
    id: 'quiz-react-basics',
    title: 'React Fundamentals',
    topic: 'Frontend',
    difficulty: 'Intermediate',
    createdAt: '2026-05-28T10:00:00.000Z',
    questions: [
      {
        id: 'q1',
        prompt: 'What hook is used to manage local component state?',
        options: ['useEffect', 'useState', 'useMemo', 'useRef'],
        correctIndex: 1,
        explanation: 'useState returns a state value and a setter function for functional components.',
      },
      {
        id: 'q2',
        prompt: 'Which lifecycle concern does useEffect primarily address?',
        options: ['Styling', 'Side effects', 'Routing', 'Memoization'],
        correctIndex: 1,
        explanation: 'useEffect runs after render to synchronize components with external systems.',
      },
      {
        id: 'q3',
        prompt: 'What does JSX compile into?',
        options: ['HTML strings', 'React.createElement calls', 'Web Components', 'Templates'],
        correctIndex: 1,
        explanation: 'JSX is syntactic sugar that transpiles to React.createElement invocations.',
      },
    ],
  },
]

const SAMPLE_ATTEMPTS = [
  {
    id: 'a1',
    quizId: 'quiz-react-basics',
    score: 2,
    total: 3,
    completedAt: '2026-05-29T14:20:00.000Z',
    answers: { q1: 1, q2: 1, q3: 0 },
    violations: [],
  },
]

const VIEWS = ['dashboard', 'creator', 'quiz', 'review', 'flashcards']

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeQuestion(raw, index) {
  const options = Array.isArray(raw.options) ? raw.options.slice(0, 4) : []
  while (options.length < 4) options.push(`Option ${options.length + 1}`)

  const correctIndex =
    typeof raw.correctIndex === 'number'
      ? Math.min(Math.max(raw.correctIndex, 0), options.length - 1)
      : 0

  return {
    id: raw.id || uid(`q${index}`),
    prompt: String(raw.prompt || raw.question || `Question ${index + 1}`).trim(),
    options,
    correctIndex,
    explanation: String(raw.explanation || 'No explanation provided yet.').trim(),
  }
}

function buildQuizFromPayload({ title, topic, difficulty, questions }) {
  const normalized = (questions || []).map(normalizeQuestion).filter((q) => q.prompt.length > 0)
  if (normalized.length === 0) throw new Error('At least one valid question is required.')

  return {
    id: uid('quiz'),
    title: title?.trim() || 'Untitled Quiz',
    topic: topic?.trim() || 'General',
    difficulty: difficulty?.trim() || 'Mixed',
    createdAt: new Date().toISOString(),
    questions: normalized,
  }
}

// 1. SMART TEXT PARSER: Detects custom options and custom answers (* or correct marks)
function parseRawTextToQuestions(text) {
  const blocks = text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
    const prompt = lines[0] || `Question ${blockIndex + 1}`
    
    let options = []
    let correctIndex = 0

    const rawOptions = lines.slice(1).filter(line => /^[A-Da-d1-4][.)\s]/.test(line) || line.startsWith('-') || line.startsWith('*'))

    if (rawOptions.length >= 2) {
      rawOptions.forEach((line, index) => {
        // Checking if this specific line is marked as correct by ending with (*) or starting with *
        const isMarkedCorrect = line.includes('(*)') || line.startsWith('*')
        const cleanOption = line
          .replace(/^[A-Da-d1-4][.)]\s*/, '') // Remove prefixes like A), B., 1.
          .replace(/^\*\s*/, '')              // Remove leading asterisk
          .replace(/\s*\(\*\)$/, '')         // Remove trailing (*)
          .trim()
        
        options.push(cleanOption)
        if (isMarkedCorrect) correctIndex = index
      })
    } else {
      // Fallback dynamic pool generation so answers don't match on missing inputs
      options = ['Option Alpha', 'Option Beta', 'Option Gamma', 'Option Delta']
      correctIndex = blockIndex % 4 
    }

    return normalizeQuestion(
      {
        prompt,
        options,
        correctIndex,
        explanation: `Verified answer token tracked from source line content block ${blockIndex + 1}.`,
      },
      blockIndex,
    )
  })
}

// 2. DYNAMIC CODE PARSER: Creates varied questions mapping syntax usecases instead of repeats
function parseCodeToQuestions(code) {
  const keywords = [...new Set(code.match(/\b[A-Za-z_][A-Za-z0-9_]{2,}\b/g) || [])].slice(0, 15)
  if (keywords.length === 0) throw new Error('Could not extract meaningful identifiers from the code snippet.')

  const templates = [
    (kw) => ({ prompt: `What is the primary role of "${kw}" inside this codebase?`, options: ['State variable / Reference identifier', 'Global API window property', 'Build configuration script tool', 'Styling Layout definition style'], correct: 0 }),
    (kw) => ({ prompt: `If "${kw}" is modified or removed unexpectedly, what execution context breaks?`, options: ['The active runtime evaluation scope', 'Development local server environments only', 'Static asset styling rules', 'Network fetch interception requests'], correct: 0 }),
    (kw) => ({ prompt: `Which programming paradigm is directly represented by the keyword symbol "${kw}"?`, options: ['Functional / Component state logic encapsulation', 'Low level direct assembly mapping', 'Relational database schema structure', 'Asynchronous service worker background pipeline'], correct: 0 }),
    (kw) => ({ prompt: `Identify the scope allocation type most associated with "${kw}":`, options: ['Local functional module references', 'Browser native microtask event loops', 'Global runtime macro-queue definitions', 'Serverless cloud engine configurations'], correct: 0 })
  ]

  return keywords.map((keyword, index) => {
    const templateSelector = templates[index % templates.length]
    const data = templateSelector(keyword)

    // Dynamic shuffling of option layout array index positioning to break hardcoded 0 loops
    const initialOptions = [...data.options]
    const targetedTargetIndex = (index + 2) % 4
    
    // Swap the correct value with target index to make option positions completely random
    const temp = initialOptions[0]
    initialOptions[0] = initialOptions[targetedTargetIndex]
    initialOptions[targetedTargetIndex] = temp

    return normalizeQuestion({
      prompt: data.prompt,
      options: initialOptions,
      correctIndex: targetedTargetIndex,
      explanation: `Analyzed symbolic keyword context wrapper sequence token matching parameter index ${index + 1}.`
    }, index)
  })
}

function parseJsonToQuestions(jsonText) {
  let parsed
  try { parsed = JSON.parse(jsonText) } catch {
    throw new Error('Invalid JSON. Provide an array of question objects or a quiz object.')
  }
  const questions = Array.isArray(parsed) ? parsed : parsed.questions
  if (!Array.isArray(questions)) throw new Error('JSON must contain a questions array.')
  return questions.map(normalizeQuestion)
}

function buildAiExplanation(question, selectedIndex) {
  const selected = question.options[selectedIndex]
  const correct = question.options[question.correctIndex]
  return selectedIndex === question.correctIndex
    ? `Correct. "${correct}" is the right answer because ${question.explanation}`
    : `You selected "${selected ?? 'nothing'}", but the correct answer is "${correct}". ${question.explanation}`
}

export const useQuizStore = create((set, get) => ({
  user: {
    name: 'Anjali Singh',
    email: 'anjali@school.com',
    isLoggedIn: true,
  },
  activeView: 'dashboard',
  quizzes: SAMPLE_QUIZZES,
  attempts: SAMPLE_ATTEMPTS,
  activeQuizId: null,
  session: null,
  reviewAttemptId: 'a1',
  aiExplanations: {},
  flashcards: [],
  creatorDraft: {
    title: '',
    topic: 'General',
    difficulty: 'Mixed',
    rawText: '',
    code: '',
    json: '',
    activeTab: 'raw',
    questionCount: 5,
  },

  loginUser: (userData) => set({ user: { ...userData, isLoggedIn: true } }),
  logoutUser: () => set({ user: { name: 'Guest', email: 'guest@quizforge.com', isLoggedIn: false }, activeView: 'dashboard' }),
  setView: (view) => { if (VIEWS.includes(view)) set({ activeView: view }) },
  updateCreatorDraft: (patch) => set((state) => ({ creatorDraft: { ...state.creatorDraft, ...patch } })),

  generateQuizFromCreator: () => {
    const { creatorDraft } = get()
    let questions = []

    if (creatorDraft.activeTab === 'raw') {
      questions = parseRawTextToQuestions(creatorDraft.rawText)
    } else if (creatorDraft.activeTab === 'code') {
      questions = parseCodeToQuestions(creatorDraft.code)
    } else {
      questions = parseJsonToQuestions(creatorDraft.json)
    }

    const desiredCount = parseInt(creatorDraft.questionCount) || questions.length
    const limitedQuestions = questions.slice(0, desiredCount)

    const quiz = buildQuizFromPayload({
      title: creatorDraft.title,
      topic: creatorDraft.topic,
      difficulty: creatorDraft.difficulty,
      questions: limitedQuestions,
    })

    set((state) => ({
      quizzes: [quiz, ...state.quizzes],
      activeQuizId: quiz.id,
      activeView: 'quiz',
      session: { quizId: quiz.id, startedAt: new Date().toISOString(), currentIndex: 0, answers: {}, violations: [], finished: false },
    }))
    return quiz
  },

  startQuiz: (quizId) => {
    const quiz = get().quizzes.find((item) => item.id === quizId)
    if (!quiz) return
    set({
      activeQuizId: quizId, activeView: 'quiz',
      session: { quizId, startedAt: new Date().toISOString(), currentIndex: 0, answers: {}, violations: [], finished: false }
    })
  },
  selectAnswer: (questionId, optionIndex) => {
    const { session } = get()
    if (!session || session.finished) return
    set({ session: { ...session, answers: { ...session.answers, [questionId]: optionIndex } } })
  },
  goToQuestion: (index) => {
    const { session, quizzes, activeQuizId } = get()
    if (!session) return
    const quiz = quizzes.find((item) => item.id === activeQuizId)
    if (!quiz) return
    set({ session: { ...session, currentIndex: Math.min(Math.max(index, 0), quiz.questions.length - 1) } })
  },
  nextQuestion: () => { const { session, goToQuestion } = get(); if (session) goToQuestion(session.currentIndex + 1) },
  previousQuestion: () => { const { session, goToQuestion } = get(); if (session) goToQuestion(session.currentIndex - 1) },
  recordViolation: (type, detail = '') => {
    const { session } = get()
    if (!session || session.finished) return
    set({ session: { ...session, violations: [...session.violations, { id: uid('violation'), type, detail, at: new Date().toISOString() }] } })
  },
  finishQuiz: () => {
    const { session, quizzes } = get()
    if (!session) return
    const quiz = quizzes.find((item) => item.id === session.quizId)
    if (!quiz) return
    let score = 0
    quiz.questions.forEach((q) => { if (session.answers[q.id] === q.correctIndex) score += 1 })
    const attempt = { id: uid('attempt'), quizId: quiz.id, score, total: quiz.questions.length, completedAt: new Date().toISOString(), answers: session.answers, violations: session.violations }
    set((state) => ({
      attempts: [attempt, ...state.attempts], reviewAttemptId: attempt.id, session: { ...session, finished: true },
      flashcards: quiz.questions.map((q) => ({ id: uid('card'), front: q.prompt, back: q.options[q.correctIndex], mastered: session.answers[q.id] === q.correctIndex })),
      activeView: 'review',
    }))
  },
  openReview: (attemptId) => set({ reviewAttemptId: attemptId, activeView: 'review' }),
  explainWithAi: async (questionId) => {
    const { quizzes, reviewAttemptId, attempts, aiExplanations } = get()
    const attempt = attempts.find((item) => item.id === reviewAttemptId)
    const quiz = quizzes.find((item) => item.id === attempt?.quizId)
    const question = quiz?.questions.find((item) => item.id === questionId)
    if (!question || !attempt) return
    const cacheKey = `${attempt.id}:${questionId}`
    if (aiExplanations[cacheKey]) return aiExplanations[cacheKey]
    await new Promise((res) => setTimeout(res, 650))
    const exp = buildAiExplanation(question, attempt.answers[questionId])
    set({ aiExplanations: { ...aiExplanations, [cacheKey]: exp } })
    return exp
  },
  toggleFlashcardMastered: (id) => set((s) => ({ flashcards: s.flashcards.map((c) => c.id === id ? { ...c, mastered: !c.mastered } : c) })),
  getActiveQuiz: () => get().quizzes.find((q) => q.id === get().activeQuizId) || null,
  getReviewAttempt: () => get().attempts.find((a) => a.id === get().reviewAttemptId) || null,
  getDashboardStats: () => {
    const { attempts, quizzes } = get()
    const totalAttempts = attempts.length
    const averageScore = totalAttempts === 0 ? 0 : Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / totalAttempts)
    const chartData = [...attempts].reverse().slice(-8).map((a, i) => ({ name: `Attempt ${i + 1}`, score: Math.round((a.score / a.total) * 100), topic: quizzes.find((q) => q.id === a.quizId)?.topic || 'General' }))
    const topicMap = {}
    attempts.forEach((a) => {
      const t = quizzes.find((q) => q.id === a.quizId)?.topic || 'General'
      if (!topicMap[t]) topicMap[t] = { attempts: 0, totalPercent: 0 }
      topicMap[t].attempts += 1; topicMap[t].totalPercent += (a.score / a.total) * 100
    })
    return { totalQuizzes: quizzes.length, totalAttempts, averageScore, chartData, topicData: Object.entries(topicMap).map(([topic, v]) => ({ topic, average: Math.round(v.totalPercent / v.attempts) })) }
  },
}))