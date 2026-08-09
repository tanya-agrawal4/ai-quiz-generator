import { create } from 'zustand'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

if (pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
}

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

const VIEWS = ['landing', 'dashboard', 'creator', 'quiz', 'review', 'flashcards', 'multiplayer']

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeQuestion(raw, index) {
  const questionType = raw.questionType || 'MCQ'
  
  let options;
  if (questionType === 'MCQ' || questionType === 'FILL_BLANK') {
    options = Array.isArray(raw.options) ? raw.options.slice(0, 4) : []
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`)
    }
  } else if (questionType === 'TRUE_FALSE') {
    options = Array.isArray(raw.options) && raw.options.length === 2 ? raw.options : ['True', 'False']
  } else {
    // SHORT_ANSWER
    options = []
  }

  const correctIndex =
    typeof raw.correctIndex === 'number'
      ? Math.min(Math.max(raw.correctIndex, 0), Math.max(options.length - 1, 0))
      : 0

  return {
    id: raw.id || uid(`q${index}`),
    prompt: String(raw.prompt || raw.question || `Question ${index + 1}`).trim(),
    options,
    correctIndex,
    questionType,
    correctAnswer: raw.correctAnswer ? String(raw.correctAnswer).trim() : '',
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

/* eslint-disable-next-line no-unused-vars */
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

/* eslint-disable-next-line no-unused-vars */
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
  const isShort = question.questionType === 'SHORT_ANSWER'
  const selected = isShort ? selectedIndex : question.options[selectedIndex]
  const correct = isShort ? question.correctAnswer : question.options[question.correctIndex]
  const isCorrect = isShort
    ? String(selectedIndex || '').trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase()
    : selectedIndex === question.correctIndex

  if (isCorrect) {
    return `Correct. "${correct}" is the right answer because ${question.explanation}`
  }

  return `You selected "${selected ?? 'nothing'}", but the correct answer is "${correct}". ${question.explanation}`
}

function loadUserData(email) {
  const quizzesKey = `quiz_app:${email}:quizzes`
  const attemptsKey = `quiz_app:${email}:attempts`
  const flashcardsKey = `quiz_app:${email}:flashcards`
  const explanationsKey = `quiz_app:${email}:aiExplanations`

  const storedQuizzes = localStorage.getItem(quizzesKey)
  const storedAttempts = localStorage.getItem(attemptsKey)
  const storedFlashcards = localStorage.getItem(flashcardsKey)
  const storedExplanations = localStorage.getItem(explanationsKey)

  return {
    quizzes: storedQuizzes ? JSON.parse(storedQuizzes) : [],
    attempts: storedAttempts ? JSON.parse(storedAttempts) : [],
    flashcards: storedFlashcards ? JSON.parse(storedFlashcards) : [],
    aiExplanations: storedExplanations ? JSON.parse(storedExplanations) : {},
  }
}

function saveUserData(email, data) {
  if (!email) return
  if (data.quizzes !== undefined) {
    localStorage.setItem(`quiz_app:${email}:quizzes`, JSON.stringify(data.quizzes))
  }
  if (data.attempts !== undefined) {
    localStorage.setItem(`quiz_app:${email}:attempts`, JSON.stringify(data.attempts))
  }
  if (data.flashcards !== undefined) {
    localStorage.setItem(`quiz_app:${email}:flashcards`, JSON.stringify(data.flashcards))
  }
  if (data.aiExplanations !== undefined) {
    localStorage.setItem(`quiz_app:${email}:aiExplanations`, JSON.stringify(data.aiExplanations))
  }
}

const getInitialState = () => {
  const currentUserStr = localStorage.getItem('quiz_app:current_user')
  if (currentUserStr) {
    try {
      const userProfile = JSON.parse(currentUserStr)
      if (userProfile && userProfile.email) {
        const userData = loadUserData(userProfile.email)
        return {
          activeView: 'dashboard',
          isAuthenticated: true,
          userProfile,
          quizzes: userData.quizzes,
          attempts: userData.attempts,
          flashcards: userData.flashcards,
          aiExplanations: userData.aiExplanations,
        }
      }
    } catch (e) {
      console.error('Error parsing restored user session:', e)
    }
  }

  return {
    activeView: 'landing',
    isAuthenticated: false,
    userProfile: null,
    quizzes: [],
    attempts: [],
    flashcards: [],
    aiExplanations: {},
  }
}

const initialState = getInitialState()

export const useQuizStore = create((set, get) => ({
  activeView: initialState.activeView, 
  isAuthenticated: initialState.isAuthenticated,
  userProfile: initialState.userProfile,
  isGeneratingQuiz: false,

  quizzes: initialState.quizzes,
  attempts: initialState.attempts,
  activeQuizId: null,
  session: null,
  reviewAttemptId: 'a1',
  aiExplanations: initialState.aiExplanations,
  flashcards: initialState.flashcards,
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
    const { isAuthenticated } = get()
    if (!isAuthenticated && view !== 'landing') {
      set({ activeView: 'landing' })
      return
    }
    set({ activeView: view })
  },

  updateCreatorDraft: (patch) =>
    set((state) => ({
      creatorDraft: { ...state.creatorDraft, ...patch },
    })),

  loginUser: (email, password) => {
    if (email && password) {
      const userProfile = {
        name: email.split('@')[0],
        email: email
      }
      localStorage.setItem('quiz_app:current_user', JSON.stringify(userProfile))
      const userData = loadUserData(email)
      set({
        isAuthenticated: true,
        activeView: 'dashboard',
        userProfile,
        quizzes: userData.quizzes,
        attempts: userData.attempts,
        flashcards: userData.flashcards,
        aiExplanations: userData.aiExplanations,
      })
      return true
    }
    return false
  },

  logoutUser: () => {
    localStorage.removeItem('quiz_app:current_user')
    set({
      isAuthenticated: false,
      userProfile: null,
      activeView: 'landing',
      session: null,
      quizzes: [],
      attempts: [],
      flashcards: [],
      aiExplanations: {},
    })
  },

  generateQuizWithGemini: async (sourceText, questionCount) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please check your .env file.')
    }

    const mcqCount = Math.round(questionCount * 0.40)
    const fillBlankCount = Math.round(questionCount * 0.20)
    const trueFalseCount = Math.round(questionCount * 0.20)
    const shortAnswerCount = questionCount - (mcqCount + fillBlankCount + trueFalseCount)

    const promptText = `
You are an expert educational assessment generator. Your task is to generate exactly ${questionCount} questions based on the following text content:

---
${sourceText}
---

You must strictly adhere to the following rules:
1. Generate exactly ${questionCount} questions in total.
2. The question distribution MUST be as follows:
   - MCQ (Multiple Choice Questions): ${mcqCount} questions.
   - FILL_BLANK (Fill in the Blanks): ${fillBlankCount} questions.
   - TRUE_FALSE (True or False): ${trueFalseCount} questions.
   - SHORT_ANSWER (Short Answer): ${shortAnswerCount} questions.
3. Every question must be strictly derived from and based on the provided text content. Do not include external knowledge or facts not present in or inferable from the text.
4. Avoid copy-pasting complete sentences from the text. Phrase questions in your own words.
5. Some questions must require logical inference or deduction from the text rather than just simple recall.
6. Avoid trivial, one-word answer questions (especially for Short Answer and MCQ).
7. For MCQ and FILL_BLANK questions:
   - Provide exactly 4 options.
   - Set 'correctIndex' to the 0-based index of the correct option.
   - Set 'correctAnswer' to an empty string.
8. For TRUE_FALSE questions:
   - Provide exactly 2 options: ["True", "False"].
   - Set 'correctIndex' to 0 if True is correct, or 1 if False is correct.
   - Set 'correctAnswer' to an empty string.
9. For SHORT_ANSWER questions:
   - Provide an empty array for options.
   - Set 'correctIndex' to 0.
   - Set 'correctAnswer' to the correct answer string.
10. Ensure the format matches the JSON schema exactly.
`.trim()

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    let lastError;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: promptText,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      prompt: { type: 'STRING' },
                      questionType: { type: 'STRING', enum: ['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'SHORT_ANSWER'] },
                      options: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                      },
                      correctIndex: { type: 'INTEGER' },
                      correctAnswer: { type: 'STRING' },
                      explanation: { type: 'STRING' },
                    },
                    required: ['prompt', 'questionType', 'options', 'correctIndex', 'correctAnswer', 'explanation'],
                  },
                },
              },
            }),
          }
        )

        const data = await response.json()
        if (!response.ok) {
          const isRateLimit = response.status === 429 || 
            String(data.error?.message || '').toLowerCase().includes('quota') ||
            String(data.error?.message || '').toLowerCase().includes('limit') ||
            String(data.error?.message || '').toLowerCase().includes('exhausted') ||
            String(data.error?.message || '').toLowerCase().includes('rate') ||
            String(data.error?.message || '').toLowerCase().includes('demand');
          
          if (isRateLimit && model !== models[models.length - 1]) {
            console.warn(`Model ${model} returned rate limit or high demand error. Retrying with next model...`)
            continue
          }
          throw new Error(data.error?.message || `Gemini API call failed for model ${model}`)
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          throw new Error('Empty response received from Gemini API.')
        }

        try {
          return JSON.parse(text)
        } catch (parseError) {
          throw new Error('Failed to parse Gemini response as valid JSON.', { cause: parseError })
        }
      } catch (err) {
        lastError = err
        const isRateLimitError = err.message?.includes('429') ||
          err.message?.toLowerCase().includes('quota') ||
          err.message?.toLowerCase().includes('limit') ||
          err.message?.toLowerCase().includes('exhausted') ||
          err.message?.toLowerCase().includes('rate') ||
          err.message?.toLowerCase().includes('demand');
        if (isRateLimitError && model !== models[models.length - 1]) {
          console.warn(`Error using model ${model}: ${err.message}. Retrying with next model...`)
          continue
        }
        throw err
      }
    }

    throw lastError || new Error('All Gemini model fallbacks exhausted.')
  },

  generateQuizFromCreator: async () => {
    const { creatorDraft } = get()
    let questions;

    set({ isGeneratingQuiz: true })

    try {
      if (creatorDraft.activeTab === 'json') {
        questions = parseJsonToQuestions(creatorDraft.json || '[]')
      } else {
        const sourceText =
          creatorDraft.activeTab === 'code'
            ? creatorDraft.code
            : creatorDraft.rawText

        const questionCount = creatorDraft.questionCount || 5
        questions = await get().generateQuizWithGemini(sourceText, questionCount)
      }

      const quiz = buildQuizFromPayload({
        title: creatorDraft.title,
        topic: creatorDraft.topic,
        difficulty: creatorDraft.difficulty,
        questions,
      })

      set((state) => {
        const nextQuizzes = [quiz, ...state.quizzes]
        if (state.userProfile?.email) {
          saveUserData(state.userProfile.email, { quizzes: nextQuizzes })
        }
        return {
          quizzes: nextQuizzes,
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
        }
      })

      return quiz
    } finally {
      set({ isGeneratingQuiz: false })
    }
  },

  importQuizFromJson: (jsonText) => {
    const questions = parseJsonToQuestions(jsonText)
    const quiz = buildQuizFromPayload({ title: 'Imported Quiz', questions })
    set((state) => {
      const nextQuizzes = [quiz, ...state.quizzes]
      if (state.userProfile?.email) {
        saveUserData(state.userProfile.email, { quizzes: nextQuizzes })
      }
      return { quizzes: nextQuizzes }
    })
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
      const isCorrect =
        question.questionType === 'SHORT_ANSWER'
          ? String(session.answers[question.id] || '').trim().toLowerCase() ===
            String(question.correctAnswer || '').trim().toLowerCase()
          : session.answers[question.id] === question.correctIndex
      if (isCorrect) score += 1
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

    const flashcards = quiz.questions.map((question) => {
      const isCorrect =
        question.questionType === 'SHORT_ANSWER'
          ? String(session.answers[question.id] || '').trim().toLowerCase() ===
            String(question.correctAnswer || '').trim().toLowerCase()
          : session.answers[question.id] === question.correctIndex
      return {
        id: uid('card'),
        front: question.prompt,
        back: question.questionType === 'SHORT_ANSWER' ? question.correctAnswer : question.options[question.correctIndex],
        mastered: isCorrect,
      }
    })

    set((state) => {
      const nextAttempts = [attempt, ...state.attempts]
      if (state.userProfile?.email) {
        saveUserData(state.userProfile.email, {
          attempts: nextAttempts,
          flashcards,
        })
      }
      return {
        attempts: nextAttempts,
        reviewAttemptId: attempt.id,
        session: { ...session, finished: true },
        flashcards,
        activeView: 'review',
      }
    })
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
    set((state) => {
      const nextExplanations = {
        ...state.aiExplanations,
        [cacheKey]: explanation,
      }
      if (state.userProfile?.email) {
        saveUserData(state.userProfile.email, { aiExplanations: nextExplanations })
      }
      return {
        aiExplanations: nextExplanations,
      }
    })

    return explanation
  },

  toggleFlashcardMastered: (cardId) => {
    set((state) => {
      const nextFlashcards = state.flashcards.map((card) =>
        card.id === cardId ? { ...card, mastered: !card.mastered } : card,
      )
      if (state.userProfile?.email) {
        saveUserData(state.userProfile.email, { flashcards: nextFlashcards })
      }
      return {
        flashcards: nextFlashcards,
      }
    })
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
    console.log('[PDF Processing] Starting extraction for file:', file?.name, 'Size:', file?.size, 'bytes', 'Type:', file?.type)

    try {
      if (!file) {
        throw new Error('No file selected for PDF processing.')
      }

      console.log('[PDF Processing] Converting file to ArrayBuffer...')
      const arrayBuffer = await file.arrayBuffer()
      console.log('[PDF Processing] ArrayBuffer successfully loaded, byte length:', arrayBuffer.byteLength)

      console.log('[PDF Processing] Loading PDF document into PDF.js engine...')
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      console.log('[PDF Processing] Document loaded successfully. Total pages:', pdf.numPages)

      let compiledText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`[PDF Processing] Extracting text from page ${i}/${pdf.numPages}...`)
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageLines = textContent.items.map((item) => item.str).join(' ')
        compiledText += pageLines + '\n\n'
      }

      const cleanText = compiledText.trim()
      console.log('[PDF Processing] Text extraction completed. Total character count:', cleanText.length)

      if (!cleanText) {
        throw new Error('No readable text found in the PDF. The file may be a scanned image or empty.')
      }

      set((state) => ({
        isParsingPdf: false,
        creatorDraft: {
          ...state.creatorDraft,
          rawText: cleanText,
          activeTab: 'raw',
        },
      }))

      return { text: cleanText, numPages: pdf.numPages, charCount: cleanText.length }
    } catch (error) {
      set({ isParsingPdf: false })
      console.error('[PDF Processing Fault] Failed to extract text from PDF:', error)
      throw error
    }
  },
}))