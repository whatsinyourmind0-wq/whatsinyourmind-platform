/**
 * The Fixed 12 Anchor Topics
 * "You don't follow people; you pull up a chair to a table."
 *
 * Each topic is a "Table" in the Anonymous Coffee Shop.
 * Users choose one before posting. No custom topics allowed.
 */

export interface Topic {
    id: string
    name: string
    description: string
    icon: string       // Lucide icon name
    color: string      // CSS variable suffix
}

export const TOPICS: Topic[] = [
    {
        id: 'the-grind',
        name: 'The Grind',
        description: 'Work, career, office politics, testing, coding',
        icon: 'Briefcase',
        color: 'cyan',
    },
    {
        id: 'unfiltered',
        name: 'Unfiltered',
        description: 'Raw emotions, human behavior, things you can\'t say on LinkedIn',
        icon: 'Flame',
        color: 'pink',
    },
    {
        id: 'the-transit',
        name: 'The Transit',
        description: 'Daily life, commuting, observations from the street',
        icon: 'TrainFront',
        color: 'amber',
    },
    {
        id: 'deep-water',
        name: 'Deep Water',
        description: 'Philosophy, life\'s big questions',
        icon: 'Waves',
        color: 'cyan',
    },
    {
        id: 'small-joys',
        name: 'Small Joys',
        description: 'The minimalist wins — a good chai, a bug fixed, a sunset',
        icon: 'Sparkles',
        color: 'green',
    },
    {
        id: 'the-void',
        name: 'The Void',
        description: 'Gibberish, testing, random thoughts, screaming into the ether',
        icon: 'CircleDot',
        color: 'muted',
    },
    {
        id: 'future-proof',
        name: 'Future Proof',
        description: 'Tech trends, AI, what\'s coming next',
        icon: 'Cpu',
        color: 'cyan',
    },
    {
        id: 'hindsight',
        name: 'Hindsight',
        description: 'Lessons learned, "I wish I knew this at 22"',
        icon: 'Clock',
        color: 'amber',
    },
    {
        id: 'the-setup',
        name: 'The Setup',
        description: 'Your workspace, your tools, your physical environment',
        icon: 'Monitor',
        color: 'green',
    },
    {
        id: 'quietude',
        name: 'Quietude',
        description: 'Mental health, slowing down, meditation',
        icon: 'Moon',
        color: 'cyan',
    },
    {
        id: 'cultural-pulse',
        name: 'Cultural Pulse',
        description: 'Observations on society, movies, food — no politics',
        icon: 'Globe',
        color: 'pink',
    },
    {
        id: 'the-experiment',
        name: 'The Experiment',
        description: 'New ideas, "what if" scenarios',
        icon: 'FlaskConical',
        color: 'green',
    },
]

export function getTopicById(id: string): Topic | undefined {
    return TOPICS.find(t => t.id === id)
}

export function getTopicColor(color: string): string {
    const colorMap: Record<string, string> = {
        cyan: 'var(--accent-cyan)',
        pink: 'var(--accent-pink)',
        green: 'var(--accent-green)',
        amber: 'var(--accent-amber)',
        muted: 'var(--text-muted)',
    }
    return colorMap[color] || colorMap.cyan
}
