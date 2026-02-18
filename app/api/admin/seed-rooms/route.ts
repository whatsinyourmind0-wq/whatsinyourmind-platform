import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/client'

// Simple Admin Route to Seed Rooms
// Usage: POST /api/admin/seed-rooms
export async function GET(request: Request) {
    const supabase = createClient()

    // 1. Define Standard Rooms (V1)
    const standardRooms = [
        {
            name: "The Daily Grind",
            description: "Vent about work, deadlines, and the hustle.",
            topic_id: "the-grind",
            is_active: true
        },
        {
            name: "Midnight Thoughts",
            description: "For the sleepless and the dreamers.",
            topic_id: "the-void",
            is_active: true
        },
        {
            name: "Tech Talk",
            description: "Bugs, features, and future.",
            topic_id: "tech-life",
            is_active: true
        },
        {
            name: "Calm Space",
            description: "Breathe in. Breathe out.",
            topic_id: "quiet-corner",
            is_active: true
        }
    ]

    const results = []

    for (const room of standardRooms) {
        // Check if active room exists for this topic
        const { data: existing } = await supabase
            .from('rooms')
            .select('id')
            .eq('topic_id', room.topic_id)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString()) // Not expired
            .single()

        if (!existing) {
            // Create new room
            const { data, error } = await supabase
                .from('rooms')
                .insert({
                    name: room.name,
                    description: room.description,
                    topic_id: room.topic_id,
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24h
                    is_active: true
                })
                .select()

            if (error) {
                results.push({ name: room.name, status: 'error', message: error.message })
            } else {
                results.push({ name: room.name, status: 'created', id: data[0].id })
            }
        } else {
            results.push({ name: room.name, status: 'exists', id: existing.id })
        }
    }

    return NextResponse.json({ success: true, results })
}
