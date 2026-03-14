'use client'

import Link from 'next/link'

const SCENARIOS = [
  { id: 'doctor', label: 'Doctor', emoji: '🏥', desc: 'Clinic & hospital' },
  { id: 'work',   label: 'Work',   emoji: '🏗', desc: 'Job & workplace' },
  { id: 'school', label: 'School', emoji: '📚', desc: 'Classroom & learning' },
  { id: 'store',  label: 'Store',  emoji: '🛒', desc: 'Shopping & errands' },
  { id: 'free',   label: 'Free Talk', emoji: '💬', desc: 'Any conversation' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E0D9CF] px-6 py-5 flex items-end justify-between">
        <div>
          <h1
            className="text-3xl md:text-4xl text-[#3A3530] leading-none"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            OpenVoice
          </h1>
          <p className="text-[#7C756D] text-sm mt-1 font-light tracking-wide">
            Speak. Learn. Belong.
          </p>
        </div>
        <Link
          href="/learning"
          className="text-sm font-medium text-[#7C756D] border border-[#E0D9CF] px-4 py-2
                     hover:bg-[#EFEBE3] transition-colors"
        >
          📖 My Words
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        <p className="text-[#7C756D] text-base mb-6 uppercase tracking-widest text-xs font-semibold">
          Choose where you are today
        </p>

        <div className="grid grid-cols-2 gap-3">
          {SCENARIOS.map((s, i) => (
            <Link
              key={s.id}
              href={`/conversation?scenario=${s.id}`}
              className="
                bg-white border border-[#E0D9CF] p-5 flex flex-col gap-3
                hover:bg-[#EFEBE3] hover:border-[#C2A889] transition-all duration-200
                animate-fade-up
                [box-shadow:0_4px_12px_rgba(58,53,48,0.06)]
                hover:[box-shadow:0_8px_24px_rgba(58,53,48,0.1)]
                active:scale-[0.98]
              "
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-4xl">{s.emoji}</span>
              <div>
                <p className="text-[#3A3530] font-bold text-lg leading-tight">{s.label}</p>
                <p className="text-[#7C756D] text-xs mt-0.5">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="mt-10 border-t border-[#E0D9CF] pt-6">
          <p
            className="text-[#3A3530] text-xl leading-snug"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            Every conversation teaches you<br />
            <span className="text-[#C2A889]">one new word.</span>
          </p>
          <p className="text-[#7C756D] text-sm mt-2 leading-relaxed">
            Tap a scenario. Hold the mic. Speak in your language.<br />
            OpenVoice translates, teaches, and grows with you.
          </p>
        </div>
      </div>
    </main>
  )
}
