'use client'

type State = 'idle' | 'recording' | 'processing' | 'playing'

const LABELS: Record<State, string> = {
  idle: 'Hold to Speak',
  recording: 'Listening…',
  processing: 'Thinking…',
  playing: 'Speaking…',
}

export default function MicButton({
  state,
  onStart,
  onStop,
}: {
  state: State
  onStart: () => void
  onStop: () => void
}) {
  const isActive = state === 'recording'
  const isDisabled = state === 'processing' || state === 'playing'

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        {isActive && (
          <>
            <span
              className="absolute w-32 h-32 rounded-full bg-[#C2A889] opacity-30"
              style={{ animation: 'pulse_ring 1.4s ease-out infinite' }}
            />
            <span
              className="absolute w-32 h-32 rounded-full bg-[#C2A889] opacity-20"
              style={{ animation: 'pulse_ring 1.4s ease-out infinite', animationDelay: '0.7s' }}
            />
          </>
        )}

        <button
          onMouseDown={onStart}
          onMouseUp={onStop}
          onTouchStart={(e) => { e.preventDefault(); onStart() }}
          onTouchEnd={(e) => { e.preventDefault(); onStop() }}
          disabled={isDisabled}
          className={`
            relative z-10 w-28 h-28 rounded-full flex items-center justify-center
            text-5xl select-none transition-all duration-150
            ${isActive
              ? 'bg-[#A68E71] scale-95 [box-shadow:0_0_0_6px_rgba(194,168,137,0.3)]'
              : isDisabled
              ? 'bg-[#EFEBE3] opacity-60'
              : 'bg-[#C2A889] hover:bg-[#A68E71] [box-shadow:0_8px_24px_rgba(194,168,137,0.4)]'
            }
          `}
        >
          {state === 'processing' ? '⏳' : state === 'playing' ? '🔊' : '🎙'}
        </button>
      </div>

      <p className="text-xs font-semibold tracking-widest uppercase text-[#7C756D]">
        {LABELS[state]}
      </p>
    </div>
  )
}
