/**
 * Reserved Usernames — The "Sanity" Layer
 *
 * Block system names to prevent tech exploits,
 * celebrity names to prevent squatting,
 * and platform names for official use.
 */

export const RESERVED_USERNAMES: string[] = [
    // --- SYSTEM & ROLES ---
    'admin', 'administrator', 'root', 'system', 'sysadmin',
    'mod', 'moderator', 'staff', 'team', 'crew', 'employee',
    'owner', 'founder', 'ceo', 'cto', 'cfo', 'coo', 'manager',
    'help', 'support', 'contact', 'info', 'feedback', 'inquiry',
    'official', 'verified', 'vip', 'master', 'god', 'jesus', 'allah',

    // --- TECHNICAL & ROUTING ---
    'api', 'auth', 'login', 'signup', 'register', 'verify',
    'password', 'reset', 'recover', 'invite',
    'settings', 'config', 'dashboard', 'console', 'analytics',
    'status', 'health', 'monitor', 'log', 'logs',
    'search', 'explore', 'discover', 'feed', 'home',
    'post', 'posts', 'comment', 'comments', 'reply',
    'profile', 'profiles', 'user', 'users', 'account', 'accounts',
    'about', 'terms', 'privacy', 'legal', 'tos', 'gdpr', 'policy',
    'test', 'testing', 'debug', 'dev', 'staging', 'prod', 'beta',
    'null', 'undefined', 'void', 'true', 'false', 'nan',
    'bot', 'robot', 'crawler', 'spider', 'agent', 'ai',

    // --- PLATFORM IDENTITY ---
    'whatsinyourmind', 'wiym', 'whatisinyourmind',
    'antigravity', 'zerogravity', 'resonance', 'pulse',
    'thevoid', 'void', 'entropy',

    // --- GLOBAL BRANDS & TECH ---
    'google', 'youtube', 'gmail', 'meta', 'facebook', 'instagram', 'whatsapp',
    'twitter', 'x', 'elonmusk', 'tesla', 'spacex', 'starlink',
    'amazon', 'aws', 'apple', 'icloud', 'microsoft', 'windows', 'azure',
    'openai', 'chatgpt', 'gemini', 'anthropic', 'claude', 'sora',
    'github', 'gitlab', 'discord', 'telegram', 'signal', 'slack',
    'netflix', 'spotify', 'tiktok', 'snapchat', 'pinterest', 'reddit',
    'vercel', 'netlify', 'supabase', 'firebase', 'aws',

    // --- PUBLIC FIGURES (INDIA & GLOBAL) ---
    // Preventing impersonation of high-risk profiles
    'potus', 'whitehouse', 'usa', 'uk', 'eu', 'un', 'nato',
    'pm', 'pmo', 'narendramodi', 'modi', 'amitshah', 'rahul', 'gandhi',
    'srk', 'shahrukh', 'salman', 'aamir', 'bachchan',
    'virat', 'kohli', 'dhoni', 'sachin', 'rohit',
    'zuck', 'bezos', 'gates', 'jobs', 'cook', 'nadella', 'pichai',

    // --- OFFENSIVE / SENSITIVE (Placeholder examples) ---
    'hate', 'kill', 'murder', 'suicide', 'abuse', 'terror',
    'scam', 'fraud', 'phishing', 'virus', 'malware',
]

export function isUsernameReserved(username: string): boolean {
    return RESERVED_USERNAMES.includes(username.toLowerCase().trim())
}
