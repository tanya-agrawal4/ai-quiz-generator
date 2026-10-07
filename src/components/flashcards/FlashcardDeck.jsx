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
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-12 text-center shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">No flashcards yet</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Complete a quiz session to auto-generate a spaced repetition study deck.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-left p-2 sm:p-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Flashcards</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Card {index + 1} of {deck.length} · Tap the card to flip between prompt and explanation
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
              className="absolute inset-0 h-full w-full rounded-2xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm hover:shadow-md transition-shadow [transform-style:preserve-3d] cursor-pointer"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <span className={`h-1.5 w-1.5 rounded-full ${flipped ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      {flipped ? 'Answer & Explanation' : 'Question Prompt'}
                    </span>
                    {card.mastered && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border-2 border-amber-200">
                        <Star className="h-3 w-3 fill-current" /> Mastered
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-xl font-bold leading-relaxed text-slate-900">
                    <FormattedText>{flipped ? card.back : card.front}</FormattedText>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">Click anywhere to flip</p>
              </div>
            </motion.button>
          </AnimatePresence>
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={goPrevious}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98] transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="button"
          onClick={() => setFlipped(false)}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Flip
        </button>

        <button
          type="button"
          onClick={() => toggleFlashcardMastered(card.id)}
          className={[
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs',
            card.mastered
              ? 'bg-amber-50 text-amber-800 border-2 border-amber-300'
              : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-amber-700',
          ].join(' ')}
        >
          <Star className={['h-4 w-4', card.mastered ? 'fill-current text-amber-500' : 'text-slate-400'].join(' ')} />
          {card.mastered ? 'Mastered' : 'Mark Mastered'}
        </button>

        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
