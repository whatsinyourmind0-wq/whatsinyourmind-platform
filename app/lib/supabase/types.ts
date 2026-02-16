export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            topics: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    color: string
                    is_active: boolean
                    sort_order: number
                }
                Insert: {
                    id: string
                    name: string
                    description?: string | null
                    color?: string
                    is_active?: boolean
                    sort_order?: number
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    color?: string
                    is_active?: boolean
                    sort_order?: number
                }
            }
            tones: {
                Row: {
                    id: string
                    name: string
                    emoji: string
                    description: string | null
                    is_active: boolean
                    sort_order: number
                }
                Insert: {
                    id: string
                    name: string
                    emoji: string
                    description?: string | null
                    is_active?: boolean
                    sort_order?: number
                }
                Update: {
                    id?: string
                    name?: string
                    emoji?: string
                    description?: string | null
                    is_active?: boolean
                    sort_order?: number
                }
            }
            profiles: {
                Row: {
                    id: string
                    username: string
                    display_name: string
                    bio: string | null
                    avatar_url: string | null
                    humanity_score: number
                    is_verified: boolean
                    is_banned: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    display_name: string
                    bio?: string | null
                    avatar_url?: string | null
                    humanity_score?: number
                    is_verified?: boolean
                    is_banned?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    display_name?: string
                    bio?: string | null
                    avatar_url?: string | null
                    humanity_score?: number
                    is_verified?: boolean
                    is_banned?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    author_id: string
                    content: string
                    topic_id: string
                    tone_id: string
                    auto_tags: string[]
                    life_force: number
                    resonance_count: number
                    comment_count: number
                    flag_count: number
                    is_void: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    author_id: string
                    content: string
                    topic_id: string
                    tone_id: string
                    auto_tags?: string[]
                    life_force?: number
                    resonance_count?: number
                    comment_count?: number
                    flag_count?: number
                    is_void?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    author_id?: string
                    content?: string
                    topic_id?: string
                    tone_id?: string
                    auto_tags?: string[]
                    life_force?: number
                    resonance_count?: number
                    comment_count?: number
                    flag_count?: number
                    is_void?: boolean
                    created_at?: string
                }
            }
            resonance: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    created_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    author_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    author_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    author_id?: string
                    content?: string
                    created_at?: string
                }
            }
            flags: {
                Row: {
                    id: string
                    user_id: string
                    post_id: string
                    reason: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    post_id: string
                    reason?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    post_id?: string
                    reason?: string | null
                    status?: string
                    created_at?: string
                }
            }
            compliance_rules: {
                Row: {
                    id: string
                    region_code: string
                    feature: string
                    is_blocked: boolean
                    message: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    region_code: string
                    feature?: string
                    is_blocked?: boolean
                    message?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    region_code?: string
                    feature?: string
                    is_blocked?: boolean
                    message?: string
                    created_at?: string
                }
            }
            reserved_usernames: {
                Row: {
                    username: string
                }
                Insert: {
                    username: string
                }
                Update: {
                    username?: string
                }
            }
        }
    }
}
