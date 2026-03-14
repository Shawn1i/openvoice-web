export type LearnerWord = {
  word: string
  encounteredCount: number
  successfulRecalls: number
  stage: 1 | 2 | 3
}

export type LearnerProfile = {
  words: Record<string, LearnerWord>
}

const STORAGE_KEY = 'openvoice_learner'

const THRESHOLDS = { toStage2: 3, toStage3: 8 }

export function getProfile(): LearnerProfile {
  if (typeof window === 'undefined') return { words: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { words: {} }
}

export function saveProfile(profile: LearnerProfile) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function recordWordEncounter(word: string): LearnerWord {
  const profile = getProfile()
  const key = word.toLowerCase().trim()
  const existing: LearnerWord = profile.words[key] ?? {
    word: key,
    encounteredCount: 0,
    successfulRecalls: 0,
    stage: 1,
  }
  existing.encounteredCount += 1
  if (existing.encounteredCount >= THRESHOLDS.toStage2 && existing.stage < 2) existing.stage = 2
  if (existing.successfulRecalls >= THRESHOLDS.toStage3 && existing.stage < 3) existing.stage = 3
  profile.words[key] = existing
  saveProfile(profile)
  return existing
}

export function recordSuccessfulRecall(word: string) {
  const profile = getProfile()
  const key = word.toLowerCase().trim()
  if (profile.words[key]) {
    profile.words[key].successfulRecalls += 1
    if (profile.words[key].successfulRecalls >= THRESHOLDS.toStage3) {
      profile.words[key].stage = 3
    }
    saveProfile(profile)
  }
}

export function getLearnedWords(): LearnerWord[] {
  const profile = getProfile()
  return Object.values(profile.words).sort((a, b) => b.encounteredCount - a.encounteredCount)
}

export type Token = {
  text: string
  isGap: boolean
  isEnglish: boolean
  original: string
}

export function applyGraduatedOpacity(
  sentence: string,
  wordMap: Record<string, LearnerWord>
): Token[] {
  return sentence.split(/(\s+)/).map((token) => {
    const key = token.toLowerCase().replace(/[^a-z]/g, '')
    const w = wordMap[key]
    if (!w) return { text: token, isGap: false, isEnglish: false, original: token }
    if (w.stage === 3) return { text: token, isGap: false, isEnglish: true, original: token }
    if (w.stage === 2) return { text: '___', isGap: true, isEnglish: false, original: token }
    return { text: token, isGap: false, isEnglish: false, original: token }
  })
}
