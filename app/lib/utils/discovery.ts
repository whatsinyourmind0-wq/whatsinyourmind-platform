/**
 * Discovery Algorithm — "Resonance + Decay"
 *
 * "Most platforms use Engagement (clicks/rage) to drive discovery.
 *  We use Resonance and Decay."
 *
 * Every post starts with 100 "Life Force" points.
 * Hearts add life. Flags drain life. Time slowly decays it.
 * This prevents echo chambers and keeps the feed fresh.
 */

export interface PostMetrics {
    heartCount: number
    flagCount: number
    commentCount: number
    createdAt: string  // ISO timestamp
    humanityScore: number  // Author's verification score (0-100)
}

/**
 * Calculate the Resonance Score for a post.
 *
 * Formula:
 *   resonance = (lifeForce + hearts*2 - flags*5 + comments*1 + humanityBoost)
 *               / (1 + hoursSincePost^1.5)
 *
 * - Hearts amplify (+2 each)
 * - Flags suppress (-5 each, heavy penalty)
 * - Comments add mild signal (+1 each)
 * - Verified authors get a boost
 * - Time decay ensures new voices surface
 */
export function calculateResonance(metrics: PostMetrics): number {
    const lifeForce = 100
    const now = Date.now()
    const created = new Date(metrics.createdAt).getTime()
    const hoursSincePost = Math.max(0, (now - created) / (1000 * 60 * 60))

    // Humanity boost: verified users get up to 20 extra points
    const humanityBoost = (metrics.humanityScore / 100) * 20

    const rawScore =
        lifeForce +
        metrics.heartCount * 2 -
        metrics.flagCount * 5 +
        metrics.commentCount * 1 +
        humanityBoost

    // Time decay: posts lose prominence over time
    const decay = 1 + Math.pow(hoursSincePost, 1.5)

    return Math.max(0, rawScore / decay)
}

/**
 * Calculate "Velocity" — trending metric
 * How many hearts in the last N minutes
 */
export function calculateVelocity(
    recentHearts: number,
    windowMinutes: number = 10
): number {
    return recentHearts / (windowMinutes / 10)
}

/**
 * Sort posts by Resonance (primary) with diversity weighting
 */
export function sortByResonance<T extends { metrics: PostMetrics; topic: string }>(
    posts: T[]
): T[] {
    // Score each post
    const scored = posts.map(post => ({
        ...post,
        _resonance: calculateResonance(post.metrics),
    }))

    // Sort by resonance descending
    scored.sort((a, b) => b._resonance - a._resonance)

    // Diversity pass: avoid showing 3+ consecutive same-topic posts
    const result: typeof scored = []
    let lastTopic = ''
    let sameTopicStreak = 0

    for (const post of scored) {
        if (post.topic === lastTopic) {
            sameTopicStreak++
            if (sameTopicStreak >= 2) {
                // Defer this post — push to end
                result.push(post)
                continue
            }
        } else {
            sameTopicStreak = 0
        }
        lastTopic = post.topic
        result.splice(result.length - sameTopicStreak, 0, post)
    }

    return result
}
