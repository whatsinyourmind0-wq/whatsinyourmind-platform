/**
 * Undertones — the "Volume" of a thought
 * "You decide the tone of your voice —
 *  whether you're whispering a secret or giving a lecture."
 */

export interface Tone {
    id: string
    name: string
    description: string
    emoji: string
}

export const TONES: Tone[] = [
    {
        id: 'casual',
        name: 'Casual',
        description: 'Everyday, relaxed, like texting a friend',
        emoji: '💬',
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Work mode, structured, like a clean email',
        emoji: '📋',
    },
    {
        id: 'sarcastic',
        name: 'Sarcastic',
        description: 'The wit, the edge, the eye-roll energy',
        emoji: '🙃',
    },
    {
        id: 'observational',
        name: 'Observational',
        description: 'Watching the world, noting the patterns',
        emoji: '👁️',
    },
    {
        id: 'reflective',
        name: 'Reflective',
        description: 'Looking inward, quiet contemplation',
        emoji: '🪞',
    },
    {
        id: 'venting',
        name: 'Venting',
        description: 'Letting it out, the steam release valve',
        emoji: '🌋',
    },
]

export function getToneById(id: string): Tone | undefined {
    return TONES.find(t => t.id === id)
}
