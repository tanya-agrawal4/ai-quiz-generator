/**
 * Rich sample data for Demo Account
 * Showcases all QuizForge usecases:
 * - Interactive multi-format quizzes (MCQ, Fill-in-the-blank, True/False)
 * - Complete quiz attempts with scores, answers, and proctoring violation logs
 * - Flashcards with mastery tracking
 * - Pre-cached AI Diagnostic Explanations for instant review
 */

export function getSeedDemoData() {
  const quizzes = [
    {
      id: 'quiz-react-fundamentals',
      title: 'React 19 & Modern Web Fundamentals',
      topic: 'Frontend',
      difficulty: 'Intermediate',
      createdAt: '2026-05-20T10:00:00.000Z',
      questions: [
        {
          id: 'q1',
          prompt: 'What hook is used to manage local component state in functional React components?',
          options: ['useEffect', 'useState', 'useMemo', 'useRef'],
          correctIndex: 1,
          questionType: 'MCQ',
          correctAnswer: '',
          explanation: 'useState returns a state value and an updater function for functional components.',
        },
        {
          id: 'q2',
          prompt: 'Which lifecycle concern does the useEffect hook primarily address?',
          options: ['Component Styling', 'Side effects and synchronization', 'Page Routing', 'Object Memoization'],
          correctIndex: 1,
          questionType: 'MCQ',
          correctAnswer: '',
          explanation: 'useEffect runs after render to synchronize components with external systems and manage side effects.',
        },
        {
          id: 'q3',
          prompt: 'In React, the built-in mechanism for sharing state across components without passing props down through every level is called _______.',
          options: ['Context API', 'Prop Drilling', 'Redux Store', 'State Hoisting'],
          correctIndex: 0,
          questionType: 'FILL_BLANK',
          correctAnswer: '',
          explanation: 'React Context provides a way to pass data through the component tree without manually passing props at every level.',
        },
        {
          id: 'q4',
          prompt: 'React Server Components execute entirely on the server and do not add to the client-side JavaScript bundle size.',
          options: ['True', 'False'],
          correctIndex: 0,
          questionType: 'TRUE_FALSE',
          correctAnswer: '',
          explanation: 'Server Components render solely on the server and stream serialized UI to the client without sending JS code.',
        },
      ],
    },
    {
      id: 'quiz-python-ds',
      title: 'Python Algorithms & Data Structures',
      topic: 'Computer Science',
      difficulty: 'Advanced',
      createdAt: '2026-05-22T14:30:00.000Z',
      questions: [
        {
          id: 'py-q1',
          prompt: 'What is the average time complexity of searching for a key in a Python dictionary (hash table)?',
          options: ['O(1) Constant', 'O(log n) Logarithmic', 'O(n) Linear', 'O(n log n)'],
          correctIndex: 0,
          questionType: 'MCQ',
          correctAnswer: '',
          explanation: 'Python dictionaries use open-addressing hash tables, giving average O(1) time complexity for key lookups.',
        },
        {
          id: 'py-q2',
          prompt: 'Which underlying data structure powers Python\'s collections.deque for efficient push/pop at both ends?',
          options: ['Doubly-linked block list', 'Dynamic array with realloc', 'Binary Heap', 'Skip List'],
          correctIndex: 0,
          questionType: 'MCQ',
          correctAnswer: '',
          explanation: 'collections.deque is implemented as a doubly linked list of fixed-size blocks, providing O(1) operations at ends.',
        },
        {
          id: 'py-q3',
          prompt: 'Python generator functions maintain their local execution frame and variables between successive yield statements.',
          options: ['True', 'False'],
          correctIndex: 0,
          questionType: 'TRUE_FALSE',
          correctAnswer: '',
          explanation: 'Generators pause and suspend their stack frame on yield, resuming exactly where they left off when next() is called.',
        },
      ],
    },
    {
      id: 'quiz-cloud-arch',
      title: 'Cloud Architecture & System Design',
      topic: 'System Design',
      difficulty: 'Intermediate',
      createdAt: '2026-05-25T08:15:00.000Z',
      questions: [
        {
          id: 'cloud-q1',
          prompt: 'According to the CAP Theorem, when a network partition (P) occurs, what trade-off must a distributed database make?',
          options: [
            'Consistency vs. Availability',
            'Latency vs. Throughput',
            'Durability vs. Atomicity',
            'Scalability vs. Fault Tolerance',
          ],
          correctIndex: 0,
          questionType: 'MCQ',
          correctAnswer: '',
          explanation: 'In the presence of a network partition, a distributed system can guarantee Consistency or Availability, but not both.',
        },
        {
          id: 'cloud-q2',
          prompt: 'Which caching strategy writes data to both the cache and backend database simultaneously before acknowledging the client?',
          options: ['Write-Through', 'Write-Back (Write-Behind)', 'Cache-Aside (Lazy Loading)', 'Refresh-Ahead'],
          correctIndex: 0,
          questionType: 'MCQ',
          correctAnswer: '',
          explanation: 'Write-Through writes synchronously to both the cache and persistent store, guaranteeing consistency at the expense of write latency.',
        },
        {
          id: 'cloud-q3',
          prompt: 'An idempotent HTTP method produces the identical side-effect state on the server whether executed once or ten times in succession.',
          options: ['True', 'False'],
          correctIndex: 0,
          questionType: 'TRUE_FALSE',
          correctAnswer: '',
          explanation: 'Methods like GET, PUT, and DELETE are idempotent because repeating them yields the exact same server-side resource state.',
        },
      ],
    },
  ]

  const attempts = [
    {
      id: 'attempt-react-1',
      quizId: 'quiz-react-fundamentals',
      score: 3,
      total: 4,
      completedAt: '2026-05-26T11:20:00.000Z',
      answers: { q1: 1, q2: 1, q3: 1, q4: 0 },
      violations: [],
    },
    {
      id: 'attempt-react-2',
      quizId: 'quiz-react-fundamentals',
      score: 4,
      total: 4,
      completedAt: '2026-05-28T16:45:00.000Z',
      answers: { q1: 1, q2: 1, q3: 0, q4: 0 },
      violations: [],
    },
    {
      id: 'attempt-py-1',
      quizId: 'quiz-python-ds',
      score: 2,
      total: 3,
      completedAt: '2026-06-01T09:15:00.000Z',
      answers: { 'py-q1': 0, 'py-q2': 1, 'py-q3': 0 },
      violations: [
        {
          id: 'v-demo-1',
          type: 'TAB_SWITCH',
          detail: 'Proctor Alert: Browser tab switch detected during timed session',
          at: '2026-06-01T09:12:30.000Z',
        },
      ],
    },
    {
      id: 'attempt-cloud-1',
      quizId: 'quiz-cloud-arch',
      score: 3,
      total: 3,
      completedAt: '2026-06-03T14:10:00.000Z',
      answers: { 'cloud-q1': 0, 'cloud-q2': 0, 'cloud-q3': 0 },
      violations: [],
    },
  ]

  const flashcards = [
    {
      id: 'card-1',
      front: 'What is the primary role of the React Virtual DOM?',
      back: 'An in-memory lightweight representation of the real DOM. React computes minimal diffs (reconciliation) and batches updates to optimize render performance.',
      mastered: true,
    },
    {
      id: 'card-2',
      front: 'What is the average time complexity of a hash map lookup?',
      back: 'O(1) constant time on average, determined by hashing keys into bucket indices. Worst-case is O(n) during hash collisions.',
      mastered: true,
    },
    {
      id: 'card-3',
      front: 'Explain the Write-Through caching pattern.',
      back: 'Data is written to the cache and the backing database simultaneously before returning success. Ensures high data consistency but adds write latency.',
      mastered: false,
    },
    {
      id: 'card-4',
      front: 'What does Idempotency mean in RESTful API design?',
      back: 'Making multiple identical requests produces the exact same server-side outcome as making a single request (e.g., GET, PUT, DELETE).',
      mastered: true,
    },
    {
      id: 'card-5',
      front: 'What is the CAP Theorem trade-off during network partitions?',
      back: 'In the presence of a network partition (P), a distributed system must choose between Consistency (all nodes see latest data) and Availability (every request receives a response).',
      mastered: false,
    },
    {
      id: 'card-6',
      front: 'How does React useMemo optimize performance?',
      back: 'It caches the calculated return value of an expensive function across re-renders until specified dependency values change.',
      mastered: true,
    },
  ]

  const aiExplanations = {
    'attempt-react-1:q3':
      '**Diagnostic Analysis:** You selected **"Prop Drilling"**, but the correct answer is **"Context API"**.\n\n*Why:* Prop drilling describes the *problem* where data must be passed manually through layers of intermediate components. React\'s **Context API** solves this by providing a top-level Provider that any nested Consumer or `useContext` hook can read directly.',
    'attempt-react-1:q1':
      '**Diagnostic Analysis:** Correct! **useState** is the standard React hook for declaring state variables in functional components.',
    'attempt-py-1:py-q2':
      '**Diagnostic Analysis:** You selected **"Dynamic array with realloc"**, but Python\'s `collections.deque` uses a **doubly-linked block list**. This ensures true O(1) performance for appending and popping from both ends without array reallocations.',
    'attempt-cloud-1:cloud-q1':
      '**Diagnostic Analysis:** Correct! The CAP theorem states that a distributed data store can guarantee at most two of three properties: Consistency, Availability, and Partition Tolerance.',
  }

  return {
    quizzes,
    attempts,
    flashcards,
    aiExplanations,
  }
}
