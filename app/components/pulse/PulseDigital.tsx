'use client'

import { useEffect, useRef } from 'react'
import styles from './PulseDigital.module.css'

export default function PulseDigital() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let width = window.innerWidth
        let height = window.innerHeight

        // Matrix Rain Configuration
        const fontSize = 14
        const columns = Math.ceil(width / fontSize)
        const drops: number[] = []

        // Initialize drops
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100 // Start above screen with random offset
        }

        const characters = 'WHATSINYOURMIND01ABCDEFGHIJKLMNOPQRSTUVWXYZ'

        const resize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height

            // Re-initialize columns on resize
            const newColumns = Math.ceil(width / fontSize)
            // Preserve existing drops if possible, or add new ones
            for (let i = drops.length; i < newColumns; i++) {
                drops[i] = Math.random() * -100
            }
        }

        window.addEventListener('resize', resize)
        resize()

        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = 'rgba(4, 13, 33, 0.05)'
            ctx.fillRect(0, 0, width, height)

            ctx.fillStyle = '#00f3ff' // Cyan glow
            ctx.font = `${fontSize}px monospace`

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const text = characters.charAt(Math.floor(Math.random() * characters.length))

                // Draw character
                // Add a random glow effect occasionally
                if (Math.random() > 0.98) {
                    ctx.shadowBlur = 10
                    ctx.shadowColor = '#00f3ff'
                    ctx.fillStyle = '#fff'
                } else {
                    ctx.shadowBlur = 0
                    ctx.fillStyle = '#008899' // Darker cyan for trail
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize)

                // Reset drop to top randomly or if off screen
                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0
                }

                // Move drop down
                drops[i]++

                // Reset styles
                ctx.shadowBlur = 0
            }

            animationFrameId = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0,
                background: '#040d21' // Deep void
            }}
        />
    )
}
