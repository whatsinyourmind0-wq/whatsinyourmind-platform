export type Emotion = 'joy' | 'anxiety' | 'sadness' | 'anger' | 'waiting' | 'neutral' | 'tech' | 'grind'

export interface SentimentResult {
    emotion: Emotion
    intensity: number
}

// Simple heuristic keyword mapping for V1
// In V2, we will replace this with an LLM call (Claude/OpenAI) for depth.
const KEYWORDS: Record<string, Emotion> = {
    // JOY / GRATEFUL
    'happy': 'joy',
    'great': 'joy',
    'awesome': 'joy',
    'love': 'joy',
    'excited': 'joy',
    'grateful': 'joy',
    'hope': 'joy',
    'blessed': 'joy',
    'wonderful': 'joy',

    // ANXIETY / FEAR
    'worried': 'anxiety',
    'anxious': 'anxiety',
    'scared': 'anxiety',
    'stress': 'anxiety',
    'panic': 'anxiety',
    'nervous': 'anxiety',
    'afraid': 'anxiety',
    'overwhelmed': 'anxiety',

    // SADNESS / REFLECTIVE
    'sad': 'sadness',
    'lonely': 'sadness',
    'miss': 'sadness',
    'cry': 'sadness',
    'hurt': 'sadness',
    'sorry': 'sadness',
    'tired': 'sadness',
    'exhausted': 'sadness',

    // ANGER / FRUSTRATION
    'angry': 'anger',
    'hate': 'anger',
    'mad': 'anger',
    'annoyed': 'anger',
    'stupid': 'anger',
    'fail': 'anger',
    'sucks': 'anger',

    // TECH / WORK
    'code': 'tech',
    'bug': 'tech',
    'deploy': 'tech',
    'server': 'tech',
    'app': 'tech',
    'ai': 'tech',
    'system': 'tech',
    'work': 'grind',
    'job': 'grind',
    'boss': 'grind',
    'office': 'grind',
    'hustle': 'grind',
}

export function analyzeSentiment(text: string): SentimentResult {
    const words = text.toLowerCase().split(/\s+/)
    const scores: Record<Emotion, number> = {
        joy: 0,
        anxiety: 0,
        sadness: 0,
        anger: 0,
        waiting: 0,
        neutral: 0.1, // Base value
        tech: 0,
        grind: 0
    }

    // Count matches
    words.forEach(word => {
        // Check exact match
        const emotion = KEYWORDS[word]
        if (emotion) {
            scores[emotion] += 1
        } else {
            // Check partial match (e.g., "coding" -> "code")
            for (const [key, val] of Object.entries(KEYWORDS)) {
                if (word.includes(key)) {
                    scores[val] += 0.5
                    break
                }
            }
        }
    })

    // Find dominant emotion
    let dominant: Emotion = 'neutral'
    let maxScore = scores.neutral

    // Iterate strictly typed keys
    const keys = Object.keys(scores) as Emotion[]
    keys.forEach(key => {
        if (scores[key] > maxScore) {
            maxScore = scores[key]
            dominant = key
        }
    })

    // Calculate intensity (0.0 - 1.0)
    // Cap at 1.0. Example: 3 hits = 0.8, 1 hit = 0.4
    const intensity = Math.min(0.2 + (maxScore * 0.2), 1.0)

    return {
        emotion: dominant,
        intensity
    }
}
