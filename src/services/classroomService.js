import {
  db,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
} from './firebase'

/**
 * Race a promise against a timeout. Firebase SDK calls can hang indefinitely
 * when connectivity or Firestore security rules block the request.
 */
function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Request timed out after ${ms / 1000}s. Check your internet connection and Firestore security rules.`
            )
          ),
        ms
      )
    ),
  ])
}

/** Generate a random 6-digit numeric code */
function generateTestCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * Teacher: Create a new classroom test document in Firestore.
 * @returns {{ testId: string }} The generated test ID.
 */
export async function createClassroomTest(quiz, timeLimit, userProfile) {
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    throw new Error('Please select a valid quiz with at least one question.')
  }

  const testId = generateTestCode()
  console.log('[Classroom] Creating test:', testId, '| Quiz:', quiz.title, '| Time:', timeLimit, 'min')

  const payload = {
    testId,
    quizTitle: quiz.title || 'Untitled Quiz',
    quiz: {
      questions: quiz.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        options: q.options || [],
        correctIndex: q.correctIndex ?? 0,
        questionType: q.questionType || 'MCQ',
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
      })),
      topic: quiz.topic || 'General',
      difficulty: quiz.difficulty || 'Mixed',
    },
    timeLimit: Number(timeLimit) || 10,
    status: 'waiting', // 'waiting' | 'active' | 'completed'
    teacherId: userProfile?.email || 'teacher@unknown',
    teacherName: userProfile?.name || userProfile?.email || 'Teacher',
    startTime: null,
    createdAt: new Date().toISOString(),
  }

  try {
    await withTimeout(setDoc(doc(db, 'classroom_tests', testId), payload))
    console.log('[Classroom] ✅ Test created successfully:', testId)
    return { testId }
  } catch (err) {
    console.error('[Classroom] Error creating test:', err)
    throw err
  }
}

/**
 * Student: Register in the students subcollection.
 */
export async function joinClassroomTest(testId, studentName) {
  if (!testId || !studentName?.trim()) {
    throw new Error('Test ID and student name are required.')
  }

  console.log('[Classroom] Student joining:', testId, '| Name:', studentName)

  try {
    const subCol = collection(db, 'classroom_tests', testId, 'students')
    await withTimeout(addDoc(subCol, {
      studentName: studentName.trim(),
      joinedAt: new Date().toISOString(),
    }))
    console.log('[Classroom] ✅ Student joined:', studentName)
  } catch (err) {
    console.error('[Classroom] Error joining test:', err)
    throw err
  }
}

/**
 * Teacher: Start the test for all students.
 */
export async function startClassroomTest(testId) {
  if (!testId) throw new Error('Test ID is required.')

  console.log('[Classroom] Starting test:', testId)
  try {
    await withTimeout(updateDoc(doc(db, 'classroom_tests', testId), {
      status: 'active',
      startTime: serverTimestamp(),
    }))
    console.log('[Classroom] ✅ Test started')
  } catch (err) {
    console.error('[Classroom] Error starting test:', err)
    throw err
  }
}

/**
 * Teacher: End the test manually.
 */
export async function endClassroomTest(testId) {
  if (!testId) return
  try {
    await withTimeout(updateDoc(doc(db, 'classroom_tests', testId), {
      status: 'completed',
    }))
    console.log('[Classroom] ✅ Test ended')
  } catch (err) {
    console.error('[Classroom] Error ending test:', err)
  }
}

/**
 * Student: Submit quiz answers.
 */
export async function submitStudentResult(testId, submission) {
  if (!testId || !submission) throw new Error('Test ID and submission are required.')

  console.log('[Classroom] Submitting result for:', submission.studentName)
  try {
    const subCol = collection(db, 'classroom_tests', testId, 'submissions')
    await withTimeout(addDoc(subCol, {
      studentName: submission.studentName || 'Anonymous',
      rollNumber: submission.rollNumber || '',
      score: submission.score ?? 0,
      totalQuestions: submission.totalQuestions ?? 0,
      submittedAt: new Date().toISOString(),
    }))
    console.log('[Classroom] ✅ Result submitted')
  } catch (err) {
    console.error('[Classroom] Error submitting result:', err)
    throw err
  }
}

/**
 * Real-time listener on the test document.
 * @returns {Function} unsubscribe
 */
export function subscribeToTest(testId, callback) {
  if (!testId || !db) {
    callback(null, 'Firebase is not available.')
    return () => {}
  }

  const ref = doc(db, 'classroom_tests', testId)
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data(), null)
      } else {
        callback(null, `Test "${testId}" not found.`)
      }
    },
    (err) => {
      console.error('[Classroom] Snapshot error:', err)
      callback(null, err?.message || 'Connection error.')
    }
  )
}

/**
 * Real-time listener on the students subcollection.
 * @returns {Function} unsubscribe
 */
export function subscribeToStudents(testId, callback) {
  if (!testId || !db) {
    callback([])
    return () => {}
  }

  const colRef = collection(db, 'classroom_tests', testId, 'students')
  return onSnapshot(
    colRef,
    (snap) => {
      const students = snap.docs.map((d) => d.data())
      callback(students)
    },
    (err) => {
      console.error('[Classroom] Students snapshot error:', err)
      callback([])
    }
  )
}

/**
 * Fetch all submissions for the leaderboard.
 */
export async function fetchSubmissions(testId) {
  if (!testId || !db) return []

  try {
    const colRef = collection(db, 'classroom_tests', testId, 'submissions')
    const snap = await withTimeout(getDocs(colRef))
    const results = snap.docs.map((d) => d.data())
    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    console.log('[Classroom] Fetched', results.length, 'submissions')
    return results
  } catch (err) {
    console.error('[Classroom] Error fetching submissions:', err)
    return []
  }
}

/**
 * Check if a classroom test document exists.
 */
export async function checkTestExists(testId) {
  if (!testId || !db) return false
  try {
    const snap = await withTimeout(getDoc(doc(db, 'classroom_tests', testId)))
    return snap.exists()
  } catch {
    return false
  }
}

/**
 * Real-time listener on the submissions subcollection (for teacher leaderboard).
 * @returns {Function} unsubscribe
 */
export function subscribeToSubmissions(testId, callback) {
  if (!testId || !db) {
    callback([])
    return () => {}
  }

  const colRef = collection(db, 'classroom_tests', testId, 'submissions')
  return onSnapshot(
    colRef,
    (snap) => {
      const subs = snap.docs.map((d) => d.data())
      // Sort by score descending
      subs.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      callback(subs)
    },
    (err) => {
      console.error('[Classroom] Submissions snapshot error:', err)
      callback([])
    }
  )
}
