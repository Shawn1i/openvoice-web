import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type ScenarioType = 'doctor' | 'work' | 'school' | 'store' | 'free'

const SCENARIO_CONTEXTS: Record<ScenarioType, string> = {
  doctor: 'medical clinic or hospital visit',
  work: 'workplace or job interview',
  school: 'school or classroom',
  store: 'grocery store or retail shop',
  free: 'everyday general conversation',
}

export async function POST(req: NextRequest) {
  try {
    const { userSpeech, scenario, learnedWords } = await req.json()

    const systemPrompt = `You are a language learning assistant for Rohingya refugees learning English.
The user is in a ${SCENARIO_CONTEXTS[scenario as ScenarioType] ?? 'general'} scenario.
Words they have already started learning: ${(learnedWords as string[]).join(', ') || 'none yet'}.

Respond ONLY in this exact JSON format with no extra text:
{
  "englishText": "Natural English sentence for this scenario",
  "translatedText": "Simplified back-translation in the user's language",
  "highlightWord": "oneword",
  "highlightTranslation": "meaning of that word in user language",
  "audioScript": "Slow clear English sentence for text-to-speech"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userSpeech }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text ?? '{}'
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}
