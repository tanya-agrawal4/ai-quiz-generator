import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Star } from 'lucide-react'
import { useQuizStore } from '../../context/QuizStore'
import FormattedText from '../common/FormattedText'

export default function FlashcardDeck() {
  const flashcards = useQuizStore((state) => state.flashcards)
  const toggleFlashcardMastered = useQuizStore((state) => state.toggleFlashcardMastered)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const deck = useMemo(
    () => (flashcards.length > 0 ? flashcards : []),
    [flashcards],
  )

  const card = deck[index]

  const goNext = () => {
    setFlipped(false)
    setIndex((value) => (value + 1) % deck.length)
  }

  const goPrevious = () => {
    setFlipped(false)
    setIndex((value) => (value - 1 + deck.length) % deck.length)
  }

  if (deck.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-ink">No flashcards yet</h2>
        <p className="mt-2 text-subtle">Complete a quiz to auto-generate a study deck.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Flashcards</h1>
        <p className="mt-2 text-subtle">
          Card {index + 1} of {deck.length}. Click the card to flip.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="relative h-80 [perspective:1200px]">
          <AnimatePresence mode="wait">
            <motion.button
              key={card.id}
              type="button"
              onClick={() => setFlipped((value) => !value)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, rotateY: flipped ? 180 : 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: 'easeInOut' }}
              className="absolute inset-0 h-full w-full rounded-3xl border border-border bg-surface p-8 text-left shadow-lg [transform-style:preserve-3d]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                    {flipped ? 'Answer' : 'Question'}
                  </p>
                  <div className="mt-4 text-xl font-semibold leading-8 text-ink">
                    <FormattedText>{flipped ? card.back : card.front}</FormattedText>
                  </div>
                </div>
                <p className="text-sm text-subtle">Tap to flip</p>
              </div>
            </motion.button>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrevious}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="button"
          onClick={() => setFlipped(false)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Flip
        </button>

        <button
          type="button"
          onClick={() => toggleFlashcardMastered(card.id)}
          className={[
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium',
            card.mastered
              ? 'bg-accent text-white'
              : 'border border-border bg-surface text-ink',
          ].join(' ')}
        >
          <Star className="h-4 w-4" />
          {card.mastered ? 'Mastered' : 'Mark Mastered'}
        </button>

        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
