'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import MicButton from '@/components/MicButton'
import GraduatedSentence from '@/components/GraduatedSentence'
import {
  getProfile,
  recordWordEncounter,
  recordSuccessfulRecall,
  applyGraduatedOpacity,
  type Token,
  type LearnerWord,
} from '@/lib/learnerModel'

type MicState = 'idle' | 'recording' | 'processing' | 'playing'

const SCENARIO_LABELS: Record<string, string> = {
  doctor: '🏥 Doctor',
  work: '🏗 Work',
  school: '📚 School',
  store: '🛒 Store',
  free: '💬 Free Talk',
}

const MOCK_SPEECH: Record<string, string> = {
  doctor: 'I have a headache and need to see a doctor for a prescription',
  work: 'I am looking for a job and want to know about the work schedule',
  school: 'I want to enroll my child in school and meet the teacher',
  store: 'I need to buy groceries and find out the price of this item',
  free: 'Hello I want to practice speaking English today',
}

type Response = {
  englishText: string
  translatedText: string
  highlightWord: string
  highlightTranslation: string
  audioScript: string
}

// Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

function ConversationInner() {
  const router = useRouter()
  const params = useSearchParams()
  const scenario = params.get('scenario') ?? 'free'

  const [micState, setMicState] = useState<MicState>('idle')
  const [response, setResponse] = useState<Response | null>(null)
  const [tokens, setTokens] = useState<Token[]>([])
  const [wordMap, setWordMap] = useState<Record<string, LearnerWord>>({})
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [usingSpeechAPI, setUsingSpeechAPI] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const profile = getProfile()
    setWordMap(profile.words)
    // Check if Web Speech API available
    setUsingSpeechAPI(
      typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) { onEnd?.(); return }
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.75
    utt.lang = 'en-US'
    utt.onend = () => onEnd?.()
    synthRef.current = utt
    window.speechSynthesis.speak(utt)
  }, [])

  const processTranscript = useCallback(
    async (spokenText: string) => {
      setMicState('processing')
      setError(null)
      try {
        const profile = getProfile()
        const learnedWords = Object.keys(profile.words)

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userSpeech: spokenText, scenario, learnedWords }),
        })

        if (!res.ok) throw new Error('API error')
        const data: Response = await res.json()
        setResponse(data)

        if (data.highlightWord) {
          recordWordEncounter(data.highlightWord)
          const updated = getProfile()
          setWordMap(updated.words)
        }

        const newTokens = applyGraduatedOpacity(data.englishText, getProfile().words)
        setTokens(newTokens)

        setMicState('playing')
        speak(data.audioScript, () => setMicState('idle'))
      } catch {
        setError('Could not connect. Check your internet connection.')
        setMicState('idle')
      }
    },
    [scenario, speak]
  )

  const startRecording = useCallback(() => {
    if (micState !== 'idle') return
    setError(null)
    setTranscript('')

    if (usingSpeechAPI) {
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
      const recognition = new SR()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript
        setTranscript(text)
      }
      recognition.onerror = () => {
        // Fall back to mock on speech error
        const mock = MOCK_SPEECH[scenario] ?? MOCK_SPEECH.free
        processTranscript(mock)
      }
      recognition.onend = () => {
        // onresult fires before onend — transcript may already be set
      }
      recognitionRef.current = recognition
      recognition.start()
      setMicState('recording')
    } else {
      setMicState('recording')
    }
  }, [micState, usingSpeechAPI, scenario, processTranscript])

  const stopRecording = useCallback(() => {
    if (micState !== 'recording') return

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      // Give onresult a tick to fire
      setTimeout(() => {
        setTranscript((t) => {
          const text = t || MOCK_SPEECH[scenario] ?? MOCK_SPEECH.free
          processTranscript(text)
          return t
        })
      }, 300)
    } else {
      // No speech API — use mock
      processTranscript(MOCK_SPEECH[scenario] ?? MOCK_SPEECH.free)
    }
  }, [micState, scenario, processTranscript])

  const replayAudio = () => {
    if (!response) return
    setMicState('playing')
    speak(response.audioScript, () => setMicState('idle'))
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col max-w-2xl mx-auto">
      {/* Top bar */}
      <header className="border-b border-[#E0D9CF] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-[#7C756D] text-sm font-medium hover:text-[#3A3530] transition-colors"
        >
          ← Back
        </button>
        <span className="text-xs font-bold tracking-widest uppercase text-[#C2A889]">
          {SCENARIO_LABELS[scenario] ?? scenario}
        </span>
        <div className="w-16" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Error */}
        {error && (
          <div className="border-l-4 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Transcript chip */}
        {transcript && (
          <div className="bg-[#EFEBE3] px-4 py-2 text-sm text-[#7C756D]">
            <span className="font-semibold uppercase tracking-wider text-xs">You said: </span>
            {transcript}
          </div>
        )}

        {/* Response card */}
        {response && (
          <div
            className="bg-white border border-[#E0D9CF] [box-shadow:0_4px_12px_rgba(58,53,48,0.06)] animate-fade-up"
          >
            {/* English with graduated opacity */}
            <div className="p-5 border-b border-[#E0D9CF]">
              <p className="text-xs font-bold tracking-widest uppercase text-[#7C756D] mb-3">
                English
              </p>
              <GraduatedSentence
                tokens={tokens}
                onReveal={(w) => {
                  recordSuccessfulRecall(w)
                  const updated = getProfile()
                  setWordMap(updated.words)
                }}
              />
            </div>

            {/* Native language */}
            <div className="p-5 border-b border-[#E0D9CF]">
              <p className="text-xs font-bold tracking-widest uppercase text-[#7C756D] mb-2">
                Your Language
              </p>
              <p className="text-lg text-[#3A3530]">{response.translatedText}</p>
            </div>

            {/* Word to learn */}
            {response.highlightWord && (
              <div className="p-5 bg-[#EFEBE3] border-b border-[#E0D9CF]">
                <p className="text-xs font-bold tracking-widest uppercase text-[#7C756D] mb-2">
                  Word to Learn
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#3A3530]">
                    {response.highlightWord}
                  </span>
                  <span className="text-[#7C756D] text-lg">→</span>
                  <span className="text-xl text-[#A68E71]">
                    {response.highlightTranslation}
                  </span>
                </div>
              </div>
            )}

            {/* Replay */}
            <button
              onClick={replayAudio}
              disabled={micState === 'playing'}
              className="w-full p-4 bg-[#C2A889] hover:bg-[#A68E71] text-white font-semibold
                         tracking-wide text-sm transition-colors disabled:opacity-50"
            >
              🔊&nbsp;&nbsp;Hear Again
            </button>
          </div>
        )}

        {/* Hint for gap words */}
        {Object.keys(wordMap).length > 0 && (
          <p className="text-center text-xs text-[#7C756D]">
            Tap <strong>___</strong> to reveal a word you've seen before
          </p>
        )}

        {/* Empty state */}
        {!response && !error && (
          <div className="text-center pt-10 text-[#7C756D]">
            <p className="text-5xl mb-4">🎙</p>
            <p className="text-base font-medium">Hold the button below and speak.</p>
            <p className="text-sm mt-1 opacity-70">
              {usingSpeechAPI
                ? 'Your microphone is ready.'
                : 'Microphone unavailable — using demo mode.'}
            </p>
          </div>
        )}
      </div>

      {/* Mic area */}
      <div className="border-t border-[#E0D9CF] py-8 flex justify-center bg-[#FAF8F5]">
        <MicButton state={micState} onStart={startRecording} onStop={stopRecording} />
      </div>
    </main>
  )
}

export default function ConversationPage() {
  return (
    <Suspense>
      <ConversationInner />
    </Suspense>
  )
}
