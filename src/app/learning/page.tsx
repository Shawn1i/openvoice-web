'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLearnedWords, type LearnerWord } from '@/lib/learnerModel'

const STAGE_META = {
  1: { label: 'New',      bg: 'bg-[#EFEBE3]',         text: 'text-[#7C756D]',  border: 'border-[#E0D9CF]' },
  2: { label: 'Learning', bg: 'bg-[#C2A889]/15',       text: 'text-[#A68E71]',  border: 'border-[#C2A889]' },
  3: { label: 'Known',    bg: 'bg-[#8B9D83]/15',       text: 'text-[#8B9D83]',  border: 'border-[#8B9D83]' },
}

export default function LearningPage() {
  const router = useRouter()
  const [words, setWords] = useState<LearnerWord[]>([])

  useEffect(() => {
    setWords(getLearnedWords())
  }, [])

  const speakWord = (word: string) => {
    if (!window.speechSynthesis) return
    const utt = new SpeechSynthesisUtterance(word)
    utt.rate = 0.7
    utt.lang = 'en-US'
    window.speechSynthesis.speak(utt)
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] max-w-2xl mx-auto">
      {/* Header */}
      <header className="border-b border-[#E0D9CF] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-[#7C756D] text-sm font-medium hover:text-[#3A3530] transition-colors"
        >
          ← Back
        </button>
        <h1
          className="flex-1 text-center text-xl text-[#3A3530]"
          style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
        >
          My Words
        </h1>
        <span className="w-16 text-right text-sm font-bold text-[#C2A889]">
          {words.length}
        </span>
      </header>

      {/* Legend */}
      <div className="flex gap-2 px-6 py-3 border-b border-[#E0D9CF]">
        {([1, 2, 3] as const).map((s) => {
          const m = STAGE_META[s]
          return (
            <span
              key={s}
              className={`px-3 py-1 text-xs font-semibold tracking-wider uppercase border ${m.bg} ${m.text} ${m.border}`}
            >
              {m.label}
            </span>
          )
        })}
      </div>

      {/* Word grid */}
      <div className="p-6">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-4 text-center">
            <span className="text-6xl">📖</span>
            <p
              className="text-xl text-[#3A3530]"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              No words yet
            </p>
            <p className="text-[#7C756D] text-sm max-w-xs">
              Start a conversation to begin building your word bank.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 bg-[#C2A889] hover:bg-[#A68E71] text-white px-8 py-3
                         font-semibold text-sm tracking-wide transition-colors"
            >
              Start Talking
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {words.map((w) => {
              const m = STAGE_META[w.stage]
              return (
                <button
                  key={w.word}
                  onClick={() => speakWord(w.word)}
                  className={`
                    p-4 text-left border flex flex-col gap-2
                    ${m.bg} ${m.border}
                    hover:opacity-80 transition-opacity
                    [box-shadow:0_2px_8px_rgba(58,53,48,0.05)]
                    animate-fade-up
                  `}
                >
                  <span className="text-xl font-bold text-[#3A3530] capitalize">{w.word}</span>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${m.text}`}>
                      {m.label}
                    </span>
                    <span className="text-xs text-[#7C756D]">×{w.encounteredCount}</span>
                  </div>
                  <span className="text-base">🔊</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
