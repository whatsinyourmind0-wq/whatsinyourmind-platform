'use client'

import { useState, useEffect, useRef } from 'react'
import Globe, { GlobeMethods } from 'react-globe.gl'
import { createClient } from '@/app/lib/supabase/client'
import { getTopicColor } from '@/app/lib/constants/topics'

// Data Types
type Arc = {
    startLat: number
    startLng: number
    endLat: number
    endLng: number
    color: string
}

type PostLocation = {
    location_lat: number
    location_lng: number
    topic_id: string
}

export default function GlobeViz() {
    const globeEl = useRef<GlobeMethods | undefined>(undefined)
    const [arcs, setArcs] = useState<Arc[]>([])
    const [mounted, setMounted] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)

        const fetchPulseData = async () => {
            // Fetch latest 50 posts that have location data
            const { data, error } = await supabase
                .from('posts')
                .select('location_lat, location_lng, topic_id')
                .not('location_lat', 'is', null)
                .order('created_at', { ascending: false })
                .limit(50)

            if (data && data.length > 0) {
                // Transform posts into Arcs
                // Since we don't have "destination" for a post, we create an arc 
                // from the Post Location -> to a random point (or another post).
                // A better viz for single points is "Points/Ripples", but user asked for Arcs/Pulse.
                // Let's make an arc from the Post -> Random point nearby to simulate "Broadcasting"

                const realArcs = data.map((post: any) => ({
                    startLat: post.location_lat,
                    startLng: post.location_lng,
                    endLat: post.location_lat + (Math.random() * 20 - 10), // Random nearby point
                    endLng: post.location_lng + (Math.random() * 20 - 10),
                    color: getTopicColor(post.topic_id) || '#00ffcc'
                }))
                setArcs(realArcs)
            } else {
                // Fallback to Mock Data if DB is empty (so it looks cool)
                const N = 20
                const newArcs = [...Array(N).keys()].map(() => ({
                    startLat: (Math.random() - 0.5) * 180,
                    startLng: (Math.random() - 0.5) * 360,
                    endLat: (Math.random() - 0.5) * 180,
                    endLng: (Math.random() - 0.5) * 360,
                    color: ['red', 'cyan', 'magenta', 'yellow'][Math.floor(Math.random() * 4)]
                }))
                setArcs(newArcs)
            }
        }

        fetchPulseData()

        // Auto-rotate
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true
            globeEl.current.controls().autoRotateSpeed = 0.5
        }
    }, [])

    if (!mounted) return <div className="mono">INITIALIZING GLOBE...</div>

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                arcsData={arcs}
                arcColor="color"
                arcDashLength={() => Math.random()}
                arcDashGap={() => Math.random()}
                arcDashAnimateTime={() => Math.random() * 4000 + 500}
                atmosphereColor="#00ffcc"
                atmosphereAltitude={0.15}
                // Points (The User Locations)
                pointsData={arcs}
                pointLat="startLat"
                pointLng="startLng"
                pointColor="color"
                pointAltitude={0}
                pointRadius={0.5}
            />
        </div>
    )
}
