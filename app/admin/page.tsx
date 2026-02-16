'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Shield, Activity, Lock, Globe, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'metrics' | 'compliance'>('metrics')
    const router = useRouter()
    const supabase = createClient()

    // Mock Admin Check (For V1 - In production use RLS/Server Roles)
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            // Replace this with your specific email or ID for real security
            if (user && user.email?.includes('admin')) {
                setIsAdmin(true)
            } else {
                // For now, let's open it up if we are on localhost for demo
                if (window.location.hostname === 'localhost') {
                    setIsAdmin(true)
                } else {
                    router.push('/')
                }
            }
            setLoading(false)
        }
        checkUser()
    }, [router, supabase.auth])

    if (loading) return <div className="container" style={{ paddingTop: '100px' }}>Checking Clearance...</div>
    if (!isAdmin) return null

    return (
        <div className="container" style={{ marginTop: 'var(--space-xl)' }}>
            <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Shield size={32} color="var(--error)" />
                <h1 style={{ margin: 0 }}>Command Center</h1>
                <span className="badge badge-error">RESTRICTED</span>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'metrics' ? 'btn-primary' : ''}`}
                    onClick={() => setActiveTab('metrics')}
                >
                    <Activity size={16} /> Metrics
                </button>
                <button
                    className={`btn ${activeTab === 'compliance' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('compliance')}
                    style={{ borderColor: 'var(--error)', color: activeTab === 'compliance' ? 'var(--background)' : 'var(--error)' }}
                >
                    <Lock size={16} /> Compliance & Kill Switch
                </button>
            </div>

            {activeTab === 'metrics' && (
                <div className="surface" style={{ padding: '2rem' }}>
                    <h2>Platform Vitals</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                        <div className="card">
                            <h3>Total Posts</h3>
                            <p className="mono" style={{ fontSize: '2rem' }}>--</p>
                        </div>
                        <div className="card">
                            <h3>Active Regions</h3>
                            <p className="mono" style={{ fontSize: '2rem' }}>--</p>
                        </div>
                        <div className="card">
                            <h3>Global Resonance</h3>
                            <p className="mono" style={{ fontSize: '2rem' }}>--</p>
                        </div>
                    </div>
                    <p style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
                        * Real-time metrics wiring pending.
                    </p>
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="surface" style={{ padding: '2rem', border: '1px solid var(--error)' }}>
                    <h2 style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle /> Sovereignty Defense (Kill Switch)
                    </h2>
                    <p>
                        Use this panel to block access from specific regions in compliance with Government Orders (Section 69A IT Act).
                    </p>

                    <div style={{ marginTop: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Block Region (ISO-3166 Code)</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" className="input" placeholder="e.g. IN-JK, IN-PB" />
                            <button className="btn" style={{ backgroundColor: 'var(--error)', color: 'white' }}>
                                EXECUTE BLOCK
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h3>Active Blocks</h3>
                        <div className="card" style={{ marginTop: '1rem' }}>
                            <p>No active blocks.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
