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
        explanation:
          'useState returns a state value and a setter function for functional components.',
      },
      {
        id: 'q2',
        prompt: 'Which lifecycle concern does useEffect primarily address?',
        options: ['Styling', 'Side effects', 'Routing', 'Memoization'],
        correctIndex: 1,
        explanation:
          'useEffect runs after render to synchronize components with external systems.',
      },
      {
        id: 'q3',
        prompt: 'What does JSX compile into?',
        options: ['HTML strings', 'React.createElement calls', 'Web Components', 'Templates'],
        correctIndex: 1,
        explanation:
          'JSX is syntactic sugar that transpiles to React.createElement invocations.',
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
  {
    id: 'a2',
    quizId: 'quiz-react-basics',
    score: 3,
    total: 3,
    completedAt: '2026-06-01T09:10:00.000Z',
    answers: { q1: 1, q2: 1, q3: 1 },
    violations: [],
  },
  {
    id: 'a3',
    quizId: 'quiz-react-basics',
    score: 1,
    total: 3,
    completedAt: '2026-06-03T18:45:00.000Z',
    answers: { q1: 1, q2: 0, q3: 2 },
    violations: [],
  },
]

const VIEWS = ['landing', 'dashboard', 'creator', 'quiz', 'review', 'flashcards']

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

  if (normalized.length === 0) {
    throw new Error('At least one valid question is required.')
  }

  return {
    id: uid('quiz'),
    title: title?.trim() || 'Untitled Quiz',
    topic: topic?.trim() || 'General',
    difficulty: difficulty?.trim() || 'Mixed',
    createdAt: new Date().toISOString(),
    questions: normalized,
  }
}

function parseRawTextToQuestions(text) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return blocks.map((block, blockIndex) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
    const prompt = lines[0] || `Question ${blockIndex + 1}`
    const options = lines
      .slice(1)
      .map((line) => line.replace(/^[A-Da-d][.)]\s*/, '').trim())
      .filter(Boolean)

    return normalizeQuestion(
      {
        prompt,
        options: options.length >= 2 ? options : ['True', 'False', 'Maybe', 'Unknown'],
        correctIndex: 0,
        explanation: `Generated from raw text block ${blockIndex + 1}.`,
      },
      blockIndex,
    )
  })
}

function parseCodeToQuestions(code) {
  const keywords = [...new Set(code.match(/\b[A-Za-z_][A-Za-z0-9_]{2,}\b/g) || [])].slice(0, 8)

  if (keywords.length === 0) {
    throw new Error('Could not extract meaningful identifiers from the code snippet.')
  }

  return keywords.slice(0, 5).map((keyword, index) =>
    normalizeQuestion(
      {
        prompt: `In the provided code context, what best describes "${keyword}"?`,
        options: [
          'A core implementation detail',
          'An unused symbol',
          'A syntax error',
          'A CSS class name',
        ],
        correctIndex: 0,
        explanation: `"${keyword}" appears in your snippet and likely represents an important symbol.`,
      },
      index,
    ),
  )
}

function parseJsonToQuestions(jsonText) {
  let parsed
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error('Invalid JSON. Provide an array of question objects or a quiz object.')
  }

  const questions = Array.isArray(parsed) ? parsed : parsed.questions
  if (!Array.isArray(questions)) {
    throw new Error('JSON must contain a questions array.')
  }

  return questions.map(normalizeQuestion)
}

function buildAiExplanation(question, selectedIndex) {
  const selected = question.options[selectedIndex]
  const correct = question.options[question.correctIndex]
  const isCorrect = selectedIndex === question.correctIndex

  if (isCorrect) {
    return `Correct. "${correct}" is the right answer because ${question.explanation}`
  }

  return `You selected "${selected ?? 'nothing'}", but the correct answer is "${correct}". ${question.explanation}`
}

export const useQuizStore = create((set, get) => ({
  activeView: 'landing', 
  isAuthenticated: false,
  userProfile: null,

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
  },

  setView: (view) => {
    if (!VIEWS.includes(view)) return
    set({ activeView: view })
  },

  updateCreatorDraft: (patch) =>
    set((state) => ({
      creatorDraft: { ...state.creatorDraft, ...patch },
    })),

  loginUser: (email, password) => {
    if (email && password) {
      set({
        isAuthenticated: true,
        activeView: 'dashboard',
        userProfile: {
          name: email.split('@')[0],
          email: email
        }
      })
      return true
    }
    return false
  },

  logoutUser: () => {
    set({
      isAuthenticated: false,
      userProfile: null,
      activeView: 'landing',
      session: null
    })
  },

  generateQuizFromCreator: () => {
    const { creatorDraft } = get()
    let questions = []

    if (creatorDraft.activeTab === 'raw') {
      questions = parseRawTextToQuestions(creatorDraft.rawText)
    } else if (creatorDraft.activeTab === 'code') {
      questions = parseCodeToQuestions(creatorDraft.code)
    } else if (creatorDraft.activeTab === 'json') {
      questions = parseJsonToQuestions(creatorDraft.json)
    } else if (creatorDraft.activeTab === 'pdf') {
      questions = parseRawTextToQuestions(creatorDraft.rawText)
    }

    const quiz = buildQuizFromPayload({
      title: creatorDraft.title,
      topic: creatorDraft.topic,
      difficulty: creatorDraft.difficulty,
      questions,
    })

    set((state) => ({
      quizzes: [quiz, ...state.quizzes],
      activeQuizId: quiz.id,
      activeView: 'quiz',
      session: {
        quizId: quiz.id,
        startedAt: new Date().toISOString(),
        currentIndex: 0,
        answers: {},
        violations: [],
        finished: false,
      },
    }))

    return quiz
  },

  importQuizFromJson: (jsonText) => {
    const questions = parseJsonToQuestions(jsonText)
    const quiz = buildQuizFromPayload({ title: 'Imported Quiz', questions })
    set((state) => ({ quizzes: [quiz, ...state.quizzes] }))
    return quiz
  },

  startQuiz: (quizId) => {
    const quiz = get().quizzes.find((item) => item.id === quizId)
    if (!quiz) return

    set({
      activeQuizId: quizId,
      activeView: 'quiz',
      session: {
        quizId,
        startedAt: new Date().toISOString(),
        currentIndex: 0,
        answers: {},
        violations: [],
        finished: false,
      },
    })
  },

  selectAnswer: (questionId, optionIndex) => {
    const { session } = get()
    if (!session || session.finished) return

    set({
      session: {
        ...session,
        answers: { ...session.answers, [questionId]: optionIndex },
      },
    })
  },

  goToQuestion: (index) => {
    const { session, quizzes, activeQuizId } = get()
    if (!session) return

    const quiz = quizzes.find((item) => item.id === activeQuizId)
    if (!quiz) return

    const safeIndex = Math.min(Math.max(index, 0), quiz.questions.length - 1)
    set({ session: { ...session, currentIndex: safeIndex } })
  },

  nextQuestion: () => {
    const { session, goToQuestion } = get()
    if (!session) return
    goToQuestion(session.currentIndex + 1)
  },

  previousQuestion: () => {
    const { session, goToQuestion } = get()
    if (!session) return
    goToQuestion(session.currentIndex - 1)
  },

  recordViolation: (type, detail = '') => {
    const { session } = get()
    if (!session || session.finished) return

    const violation = {
      id: uid('violation'),
      type,
      detail,
      at: new Date().toISOString(),
    }

    set({
      session: {
        ...session,
        violations: [...session.violations, violation],
      },
    })
  },

  finishQuiz: () => {
    const { session, quizzes } = get()
    if (!session) return

    const quiz = quizzes.find((item) => item.id === session.quizId)
    if (!quiz) return

    let score = 0
    quiz.questions.forEach((question) => {
      if (session.answers[question.id] === question.correctIndex) score += 1
    })

    const attempt = {
      id: uid('attempt'),
      quizId: quiz.id,
      score,
      total: quiz.questions.length,
      completedAt: new Date().toISOString(),
      answers: session.answers,
      violations: session.violations,
    }

    const flashcards = quiz.questions.map((question) => ({
      id: uid('card'),
      front: question.prompt,
      back: question.options[question.correctIndex],
      mastered: session.answers[question.id] === question.correctIndex,
    }))

    set((state) => ({
      attempts: [attempt, ...state.attempts],
      reviewAttemptId: attempt.id,
      session: { ...session, finished: true },
      flashcards,
      activeView: 'review',
    }))
  },

  openReview: (attemptId) => {
    set({ reviewAttemptId: attemptId, activeView: 'review' })
  },

  explainWithAi: async (questionId) => {
    const { quizzes, reviewAttemptId, attempts, aiExplanations } = get()
    const attempt = attempts.find((item) => item.id === reviewAttemptId)
    if (!attempt) return

    const quiz = quizzes.find((item) => item.id === attempt.quizId)
    const question = quiz?.questions.find((item) => item.id === questionId)
    if (!question) return

    const cacheKey = `${attempt.id}:${questionId}`
    if (aiExplanations[cacheKey]) return aiExplanations[cacheKey]

    await new Promise((resolve) => setTimeout(resolve, 650))

    const explanation = buildAiExplanation(question, attempt.answers[questionId])
    set({
      aiExplanations: {
        ...aiExplanations,
        [cacheKey]: explanation,
      },
    })

    return explanation
  },

  toggleFlashcardMastered: (cardId) => {
    set((state) => ({
      flashcards: state.flashcards.map((card) =>
        card.id === cardId ? { ...card, mastered: !card.mastered } : card,
      ),
    }))
  },

  getActiveQuiz: () => {
    const { quizzes, activeQuizId } = get()
    return quizzes.find((quiz) => quiz.id === activeQuizId) || null
  },

  getReviewAttempt: () => {
    const { attempts, reviewAttemptId } = get()
    return attempts.find((attempt) => attempt.id === reviewAttemptId) || null
  },

  getDashboardStats: () => {
    const { attempts, quizzes } = get()
    const totalAttempts = attempts.length
    const averageScore =
      totalAttempts === 0
        ? 0
        : Math.round(
            attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total) * 100, 0) /
              totalAttempts,
          )

    const chartData = [...attempts]
      .reverse()
      .slice(-8)
      .map((attempt, index) => {
        const quiz = quizzes.find((item) => item.id === attempt.quizId)
        return {
          name: `Attempt ${index + 1}`,
          score: Math.round((attempt.score / attempt.total) * 100),
          topic: quiz?.topic || 'General',
        }
      })

    const topicMap = {}
    attempts.forEach((attempt) => {
      const quiz = quizzes.find((item) => item.id === attempt.quizId)
      const topic = quiz?.topic || 'General'
      if (!topicMap[topic]) topicMap[topic] = { attempts: 0, totalPercent: 0 }
      topicMap[topic].attempts += 1
      topicMap[topic].totalPercent += (attempt.score / attempt.total) * 100
    })

    const topicData = Object.entries(topicMap).map(([topic, value]) => ({
      topic,
      average: Math.round(value.totalPercent / value.attempts),
    }))

    return {
      totalQuizzes: quizzes.length,
      totalAttempts,
      averageScore,
      chartData,
      topicData,
    }
  },

  // DYNAMIC EXTRA FEATURE LOOKUP WITH AUTOMATED TIMEOUT CHECKS
  isParsingPdf: false,
  extractTextFromPdf: async (file) => {
    set({ isParsingPdf: true })
    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // Explicitly pull the window subsystem context
      let pdfjs = window.pdfjsLib;
      
      // If network latency slowed down the script injection, wait 800ms and retry automatically
      if (!pdfjs) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        pdfjs = window.pdfjsLib;
      }
      
      if (!pdfjs) {
        throw new Error('CDN Script processing timed out. Please check your internet connection and refresh.')
      }
      
      // Configure background worker threading safely using our window tracking variables
      pdfjs.GlobalWorkerOptions.workerSrc = window.pdfjsLibWorkerUrl || 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      let compiledText = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageLines = textContent.items.map((item) => item.str).join(' ')
        compiledText += pageLines + '\n'
      }

      const cleanText = compiledText.trim()
      if (!cleanText) {
        throw new Error('This PDF appears to be a scanned image or photo containing no selectable text vectors.')
      }
      
      set((state) => ({
        isParsingPdf: false,
        creatorDraft: {
          ...state.creatorDraft,
          rawText: cleanText,
        }
      }))
      return cleanText

    } catch (error) {
      set({ isParsingPdf: false })
      console.error('PDF Processing Pipeline Fault:', error)
      alert(`Parsing Issue: ${error.message || 'Unable to accurately extract structure.'}`)
    }
  },
}))