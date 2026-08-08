import { useEffect, useState } from 'react'
import {
  Users,
  Play,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Copy,
  Check,
  Radio,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import FormattedText from '../common/FormattedText'
import {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from '../../services/firebase'

function generateRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export default function LiveMultiplayer() {
  const userProfile = useQuizStore((state) => state.userProfile)
  const quizzes = useQuizStore((state) => state.quizzes)

  const [mode, setMode] = useState('lobby') // 'lobby' | 'host_setup' | 'join_setup' | 'room'
  const [selectedQuizId, setSelectedQuizId] = useState(quizzes[0]?.id || '')
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [roomData, setRoomData] = useState(null)
  const [currentRoomCode, setCurrentRoomCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const userId = userProfile?.email
    ? userProfile.email.replace(/[^a-zA-Z0-9]/g, '_')
    : `guest_${Math.random().toString(36).slice(2, 8)}`
  const userName = userProfile?.name || userProfile?.email || 'Anonymous Player'

  // Real-time Firestore subscription via onSnapshot
  useEffect(() => {
    if (!currentRoomCode) return undefined

    setLoading(true)
    console.log('[Multiplayer] Subscribing to Firestore document for Room Code:', currentRoomCode)

    const roomRef = doc(db, 'multiplayer_rooms', currentRoomCode)
    const unsubscribe = onSnapshot(
      roomRef,
      (snapshot) => {
        setLoading(false)
        if (snapshot.exists()) {
          const data = snapshot.data()
          console.log('[Multiplayer Real-time Sync] Room state updated:', data)
          setRoomData(data)
          setError('')
        } else {
          console.warn('[Multiplayer Fault] Room code document does not exist:', currentRoomCode)
          setError(`Room code ${currentRoomCode} was not found.`)
          setRoomData(null)
        }
      },
      (err) => {
        setLoading(false)
        console.error('[Multiplayer Real-time Fault] Subscription error:', err)
        setError('Connection issue subscribing to real-time room updates.')
      }
    )

    return () => {
      console.log('[Multiplayer] Unsubscribing from room code:', currentRoomCode)
      unsubscribe()
    }
  }, [currentRoomCode])

  // Host: Create a new Multiplayer Room
  const handleHostRoomCreation = async () => {
    const quizToHost = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0]
    if (!quizToHost) {
      setError('Please select or create a quiz first.')
      return
    }

    const code = generateRoomCode()
    setLoading(true)
    setError('')

    const roomPayload = {
      roomCode: code,
      hostEmail: userProfile?.email || 'host@example.com',
      hostName: userName,
      status: 'waiting', // 'waiting' | 'in_progress' | 'completed'
      createdAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      quiz: {
        title: quizToHost.title,
        topic: quizToHost.topic,
        difficulty: quizToHost.difficulty,
        questions: quizToHost.questions,
      },
      participants: {
        [userId]: {
          name: userName,
          email: userProfile?.email || 'host@example.com',
          score: 0,
          answers: {},
          isHost: true,
          joinedAt: new Date().toISOString(),
        },
      },
    }

    try {
      console.log('[Multiplayer] Creating Firestore document for Room Code:', code)
      await setDoc(doc(db, 'multiplayer_rooms', code), roomPayload)
      setCurrentRoomCode(code)
      setIsHost(true)
      setMode('room')
    } catch (err) {
      console.error('[Multiplayer Host Fault] Error creating room:', err)
      setError('Failed to initialize room document. Check connection.')
    } finally {
      setLoading(false)
    }
  }

  // Peer: Join existing Multiplayer Room via Code
  const handleJoinRoom = async (e) => {
    e?.preventDefault()
    const cleanCode = roomCodeInput.trim()
    if (!cleanCode || cleanCode.length < 4) {
      setError('Please enter a valid 6-digit room code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const roomRef = doc(db, 'multiplayer_rooms', cleanCode)
      const snap = await getDoc(roomRef)

      if (!snap.exists()) {
        setError(`Room code "${cleanCode}" does not exist.`)
        setLoading(false)
        return
      }

      const existingData = snap.data()
      console.log('[Multiplayer Peer] Joining room:', cleanCode)

      // Add or update participant entry
      const updatedParticipants = {
        ...(existingData.participants || {}),
        [userId]: {
          name: userName,
          email: userProfile?.email || 'user@example.com',
          score: existingData.participants?.[userId]?.score || 0,
          answers: existingData.participants?.[userId]?.answers || {},
          isHost: false,
          joinedAt: new Date().toISOString(),
        },
      }

      await updateDoc(roomRef, {
        participants: updatedParticipants,
      })

      setCurrentRoomCode(cleanCode)
      setIsHost(false)
      setMode('room')
    } catch (err) {
      console.error('[Multiplayer Join Fault] Error joining room:', err)
      setError('Failed to join room. Verify the code and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Host Control Actions
  const handleStartQuiz = async () => {
    if (!currentRoomCode || !isHost) return
    try {
      await updateDoc(doc(db, 'multiplayer_rooms', currentRoomCode), {
        status: 'in_progress',
        currentQuestionIndex: 0,
      })
    } catch (err) {
      console.error('[Multiplayer Host] Error starting quiz:', err)
    }
  }

  const handleNextQuestion = async () => {
    if (!currentRoomCode || !isHost || !roomData) return
    const nextIdx = roomData.currentQuestionIndex + 1
    const totalQ = roomData.quiz.questions.length

    if (nextIdx >= totalQ) {
      await updateDoc(doc(db, 'multiplayer_rooms', currentRoomCode), {
        status: 'completed',
      })
    } else {
      await updateDoc(doc(db, 'multiplayer_rooms', currentRoomCode), {
        currentQuestionIndex: nextIdx,
      })
    }
    setSelectedAnswerIndex(null)
  }

  // Participant Submit Answer
  const handleSelectAnswer = async (optionIdx) => {
    if (!currentRoomCode || !roomData) return
    setSelectedAnswerIndex(optionIdx)

    const qIndex = roomData.currentQuestionIndex
    const currentQ = roomData.quiz.questions[qIndex]
    const isCorrect = currentQ.questionType === 'SHORT_ANSWER'
      ? String(optionIdx).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase()
      : optionIdx === currentQ.correctIndex

    const currentParticipant = roomData.participants?.[userId] || {}
    const prevScore = currentParticipant.score || 0
    const prevAnswers = currentParticipant.answers || {}

    // Don't double count score if answer was already recorded for this question
    const alreadyAnswered = prevAnswers[currentQ.id] !== undefined
    const newScore = !alreadyAnswered && isCorrect ? prevScore + 1 : prevScore

    const updatedParticipant = {
      ...currentParticipant,
      name: userName,
      score: newScore,
      answers: { ...prevAnswers, [currentQ.id]: optionIdx },
    }

    try {
      await updateDoc(doc(db, 'multiplayer_rooms', currentRoomCode), {
        [`participants.${userId}`]: updatedParticipant,
      })
    } catch (err) {
      console.error('[Multiplayer Answer Fault] Error updating answer:', err)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(currentRoomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // RENDER LOBBY SELECTION MODE
  if (mode === 'lobby') {
    return (
      <div className="space-y-8 text-left max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink flex items-center gap-3">
            <Radio className="h-7 w-7 text-accent animate-pulse" />
            Live Multiplayer Quiz Arena
          </h1>
          <p className="mt-2 text-subtle">
            Host live real-time quizzes or join room lobbies with a 6-digit room code.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Host Card */}
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-ink">Host a Live Quiz</h2>
              <p className="text-sm text-subtle">
                Select a quiz from your library, generate a 6-digit room code, and control real-time question navigation for all players.
              </p>
            </div>

            {quizzes.length > 0 ? (
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    Select Quiz to Host
                  </span>
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-ink outline-none"
                  >
                    {quizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} ({q.questions.length} questions)
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={handleHostRoomCreation}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-600 transition disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  <span>Generate Room Code & Host</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-muted p-4 text-xs text-subtle">
                No quizzes in library yet. Create a quiz in Quiz Creator first!
              </div>
            )}
          </div>

          {/* Join Card */}
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-ink">Join Live Room</h2>
              <p className="text-sm text-subtle">
                Enter the 6-digit code shared by your host to join the live session and sync real-time questions.
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  6-Digit Room Code
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 849201"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg font-mono font-bold tracking-widest text-ink text-center outline-none ring-accent/20 focus:ring-4"
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 text-xs font-semibold text-danger bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || roomCodeInput.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Users className="h-4 w-4" />
                <span>Join Multiplayer Room</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // RENDER ACTIVE MULTIPLAYER ROOM (Host or Participant View)
  const participantsList = Object.values(roomData?.participants || {})
  const currentQIndex = roomData?.currentQuestionIndex || 0
  const currentQ = roomData?.quiz?.questions?.[currentQIndex]
  const isCompleted = roomData?.status === 'completed'
  const isWaiting = roomData?.status === 'waiting'
  const isInProgress = roomData?.status === 'in_progress'

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/20 uppercase tracking-wide">
              {isHost ? 'Host Mode' : 'Player Mode'}
            </span>
            <span className="text-xs font-semibold text-subtle">
              {participantsList.length} Connected Player(s)
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
            {roomData?.quiz?.title || 'Live Quiz Room'}
          </h1>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-muted border border-border px-4 py-2.5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle">Room Code</p>
            <p className="text-2xl font-mono font-extrabold tracking-widest text-accent">
              {currentRoomCode}
            </p>
          </div>
          <button
            type="button"
            onClick={copyRoomCode}
            className="rounded-xl border border-border bg-surface p-3 text-subtle hover:bg-muted transition"
            title="Copy Room Code"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* WAITING LOBBY SCREEN */}
      {isWaiting && (
        <div className="rounded-3xl border border-border bg-surface p-10 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent animate-bounce">
            <Radio className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-ink">Waiting for Players to Join...</h2>
            <p className="text-subtle text-sm max-w-md mx-auto">
              Share Room Code <span className="font-mono font-bold text-accent">{currentRoomCode}</span> with your peers.
            </p>
          </div>

          {/* Connected Players Grid */}
          <div className="pt-4 max-w-md mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle mb-3">
              Lobby Players ({participantsList.length})
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {participantsList.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-xl bg-muted border border-border px-3.5 py-2 text-xs font-medium text-ink"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {p.name} {p.isHost && '(Host)'}
                </span>
              ))}
            </div>
          </div>

          {/* Host Start Button */}
          {isHost ? (
            <button
              type="button"
              onClick={handleStartQuiz}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-600 transition"
            >
              <Play className="h-5 w-5 fill-current" />
              <span>Start Live Quiz Now</span>
            </button>
          ) : (
            <p className="text-xs text-subtle animate-pulse">
              Waiting for the host to click "Start Live Quiz"...
            </p>
          )}
        </div>
      )}

      {/* IN PROGRESS QUIZ SCREEN */}
      {isInProgress && currentQ && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Question View (Syncs live via currentQuestionIndex) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-subtle">
                  Question {currentQIndex + 1} of {roomData.quiz.questions.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Sync Active
                </span>
              </div>

              <div className="text-xl font-semibold leading-8 text-ink">
                <FormattedText>{currentQ.prompt}</FormattedText>
              </div>

              {/* Options */}
              <div className="grid gap-3 pt-2">
                {currentQ.questionType === 'SHORT_ANSWER' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type your answer..."
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm outline-none text-ink font-medium"
                    />
                  </div>
                ) : (
                  currentQ.options?.map((opt, idx) => {
                    const selected = selectedAnswerIndex === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAnswer(idx)}
                        className={[
                          'flex items-center gap-3 rounded-xl border px-4 py-4 text-left text-sm transition',
                          selected
                            ? 'border-accent bg-accent-soft text-accent font-semibold'
                            : 'border-border bg-muted text-ink hover:border-slate-300 hover:bg-surface',
                        ].join(' ')}
                      >
                        <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <div className="flex-1">
                          <FormattedText>{opt}</FormattedText>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Host Navigation Controls */}
            {isHost && (
              <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                <span className="text-xs text-subtle font-medium">Host Controls</span>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition"
                >
                  <span>{currentQIndex === roomData.quiz.questions.length - 1 ? 'End Quiz' : 'Next Question'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Real-time Live Leaderboard Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm text-left space-y-4">
              <div className="flex items-center gap-2 text-ink font-bold text-lg">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>Live Leaderboard</span>
              </div>
              <div className="space-y-3">
                {participantsList
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-subtle text-xs">#{idx + 1}</span>
                        <span className="font-semibold text-ink">{p.name}</span>
                      </div>
                      <span className="font-mono font-bold text-accent">{p.score || 0} pts</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED QUIZ LEADERBOARD SCREEN */}
      {isCompleted && (
        <div className="rounded-3xl border border-border bg-surface p-10 text-center shadow-sm space-y-8 max-w-2xl mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Trophy className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-ink">Multiplayer Match Completed!</h2>
            <p className="text-subtle text-sm">Final scores synced in real time across all players.</p>
          </div>

          <div className="space-y-3">
            {participantsList
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((p, idx) => (
                <div
                  key={idx}
                  className={[
                    'flex items-center justify-between rounded-2xl border p-4 text-left transition',
                    idx === 0
                      ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                      : 'border-border bg-muted',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border font-bold text-sm text-ink">
                      {idx === 0 ? '🏆' : `#${idx + 1}`}
                    </span>
                    <div>
                      <p className="font-bold text-ink">{p.name}</p>
                      <p className="text-xs text-subtle">{p.email}</p>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-lg text-accent">
                    {p.score || 0} pts
                  </span>
                </div>
              ))}
          </div>

          <button
            type="button"
            onClick={() => setMode('lobby')}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-medium text-ink hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Arena Lobby
          </button>
        </div>
      )}
    </div>
  )
}
