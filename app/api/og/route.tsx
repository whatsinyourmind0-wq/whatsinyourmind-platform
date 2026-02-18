import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // ?title=<text>
        const hasTitle = searchParams.has('title')
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'WHATSINYOURMIND'

        // ?emotion=<joy|anxiety|etc>
        const emotion = searchParams.get('emotion') || 'neutral'

        // Map emotion to color (matching global CSS)
        const colors: Record<string, string> = {
            joy: '#FFD700',       // Gold
            anxiety: '#FF4500',   // OrangeRed
            sadness: '#4169E1',   // RoyalBlue
            anger: '#DC143C',     // Crimson
            waiting: '#32CD32',   // LimeGreen
            neutral: '#00f3ff',   // Cyan
            tech: '#00f3ff',
            grind: '#FF3B30'
        }

        const color = colors[emotion] || colors.neutral

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#040d21', // bg-void
                        backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        fontFamily: 'monospace',
                    }}
                >
                    {/* Glitch/Scanline effect overlay simulated with borders/opacity */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '40px',
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 20px ${color}40`,
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            maxWidth: '80%',
                        }}
                    >
                        <div
                            style={{
                                color: '#fff',
                                fontSize: 60,
                                fontWeight: 'bold',
                                marginBottom: 20,
                                letterSpacing: '-2px',
                                textShadow: `2px 2px 0px ${color}`,
                            }}
                        >
                            {title}
                        </div>

                        <div
                            style={{
                                color: color,
                                fontSize: 24,
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                            }}
                        >
                            SIGNAL • {emotion.toUpperCase()}
                        </div>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            bottom: 40,
                            color: '#626573', // text-muted
                            fontSize: 20,
                        }}
                    >
                        whatsinyourmind.com
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
