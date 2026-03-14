'use client'

import { useState } from 'react'
import type { Token } from '@/lib/learnerModel'

export default function GraduatedSentence({
  tokens,
  onReveal,
}: {
  tokens: Token[]
  onReveal?: (word: string) => void
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const handleReveal = (i: number, word: string) => {
    setRevealed((prev) => new Set([...prev, i]))
    onReveal?.(word)
  }

  return (
    <p className="text-lg leading-loose flex flex-wrap gap-1 items-baseline">
      {tokens.map((token, i) => {
        if (token.text.trim() === '') return <span key={i}>&nbsp;</span>

        if (token.isGap && !revealed.has(i)) {
          return (
            <button
              key={i}
              onClick={() => handleReveal(i, token.original)}
              className="
                inline-block px-1 border-b-2 border-[#C2A889] text-[#C2A889]
                font-bold tracking-widest hover:bg-[#C2A889]/10 transition-colors
              "
            >
              ___
            </button>
          )
        }

        if (token.isEnglish) {
          return (
            <span
              key={i}
              className="
                inline-block px-1 bg-[#8B9D83]/10 border-b-2 border-[#8B9D83]
                text-[#3A3530] font-semibold
              "
            >
              {token.text}
            </span>
          )
        }

        if (revealed.has(i)) {
          return (
            <span
              key={i}
              className="inline-block px-1 bg-[#C2A889]/20 text-[#A68E71] font-semibold word-revealed"
            >
              {token.original}
            </span>
          )
        }

        return (
          <span key={i} className="text-[#3A3530]">
            {token.text}
          </span>
        )
      })}
    </p>
  )
}
