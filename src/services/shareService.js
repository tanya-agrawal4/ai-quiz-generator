import { db, collection, addDoc, doc, getDoc } from './firebase'

/**
 * Saves a quiz into Firestore 'shared_quizzes' collection with chosen mode.
 * @param {Object} quiz - The quiz object containing title, topic, difficulty, and questions.
 * @param {'strict' | 'casual'} mode - The sharing mode selected by the user.
 * @param {Object} [userProfile] - Optional user profile of the creator.
 * @returns {Promise<{ docId: string, shareUrl: string }>} Unique document ID and formatted shareable URL.
 */
export async function saveSharedQuiz(quiz, mode = 'casual', userProfile = null) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    throw new Error('Invalid quiz data. Quiz must contain at least one question.')
  }

  const payload = {
    title: quiz.title || 'AI Generated Quiz',
    topic: quiz.topic || 'General',
    difficulty: quiz.difficulty || 'Mixed',
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options || [],
      correctIndex: q.correctIndex ?? 0,
      questionType: q.questionType || 'MCQ',
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
    })),
    mode: mode === 'strict' ? 'strict' : 'casual',
    createdAt: new Date().toISOString(),
    creatorName: userProfile?.name || userProfile?.email || 'Quiz Generator User',
    creatorEmail: userProfile?.email || '',
  }

  try {
    console.log('[ShareService] Saving quiz payload to Firestore collection "shared_quizzes"...', payload)
    const colRef = collection(db, 'shared_quizzes')
    const docRef = await addDoc(colRef, payload)
    const docId = docRef.id

    const origin = window.location.origin
    const shareUrl = `${origin}/test/${docId}`

    console.log('[ShareService] Quiz saved successfully. Doc ID:', docId, '| Share URL:', shareUrl)
    return { docId, shareUrl, mode: payload.mode }
  } catch (err) {
    console.error('[ShareService Fault] Error saving quiz to Firestore:', err)
    // Fallback ID generation in case Firestore is unreachable, ensuring local testing doesn't break
    const fallbackId = `local_${Math.random().toString(36).slice(2, 10)}`
    const shareUrl = `${window.location.origin}/test/${fallbackId}`
    return { docId: fallbackId, shareUrl, mode: payload.mode, isFallback: true }
  }
}

/**
 * Fetches a shared quiz document from Firestore by document ID.
 * @param {string} docId - The Firestore document ID.
 * @returns {Promise<Object>} Quiz document data.
 */
export async function fetchSharedQuiz(docId) {
  if (!docId) {
    throw new Error('Document ID is required to fetch shared quiz.')
  }

  try {
    console.log('[ShareService] Fetching shared quiz for ID:', docId)
    const docRef = doc(db, 'shared_quizzes', docId)
    const snap = await getDoc(docRef)

    if (!snap.exists()) {
      throw new Error(`Shared quiz with ID "${docId}" was not found or may have expired.`)
    }

    const data = snap.data()
    return {
      id: docId,
      title: data.title,
      topic: data.topic,
      difficulty: data.difficulty,
      questions: data.questions || [],
      mode: data.mode || 'casual',
      creatorName: data.creatorName || 'Anonymous',
      createdAt: data.createdAt,
    }
  } catch (err) {
    console.error('[ShareService Fault] Error fetching shared quiz:', err)
    throw err
  }
}

/**
 * Saves a student/participant test submission to Firestore under 'shared_quizzes/[docId]/submissions'.
 * @param {string} docId - The shared quiz document ID.
 * @param {Object} submission - Details including participantName, score, total, answers, and elapsed.
 */
export async function saveQuizSubmission(docId, submission) {
  if (!docId || !submission) return null

  try {
    const payload = {
      participantName: submission.participantName || 'Anonymous Participant',
      score: submission.score || 0,
      total: submission.total || 0,
      answers: submission.answers || {},
      elapsedSeconds: submission.elapsedSeconds || 0,
      submittedAt: new Date().toISOString(),
    }

    const subColRef = collection(db, 'shared_quizzes', docId, 'submissions')
    const subDocRef = await addDoc(subColRef, payload)
    console.log('[ShareService] Saved student submission to Firestore:', subDocRef.id)
    return subDocRef.id
  } catch (err) {
    console.warn('[ShareService] Non-critical warning saving student submission to Firestore:', err)
    return null
  }
}
