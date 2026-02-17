'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { Shield, Activity, Lock, Globe, AlertTriangle, Trash2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Hardcoded admins for V1
const ADMIN_USERNAMES = ['admin', 'urban_pulse', 'system']

export default function AdminDashboard() {
    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ users: 0, posts: 0, resonance: 0 })
    const [complianceRules, setComplianceRules] = useState<any[]>([])
    const [flags, setFlags] = useState<any[]>([]) // Reports Inbox
    const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview')
    const [newRegion, setNewRegion] = useState('')

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        // DEV MODE BYPASS: If localhost, specific development bypass
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            // Check if user exists, if not just allow for testing UI
            setAuthorized(true)
            fetchDashboardData()
            setLoading(false)
            return
        }

        if (!user) {
            router.push('/')
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()

        if (profile && (ADMIN_USERNAMES.includes(profile.username) || profile.username.includes('admin'))) {
            setAuthorized(true)
            fetchDashboardData()
        } else {
            router.push('/') // Kick out non-admins
        }
        setLoading(false)
    }

    const fetchDashboardData = async () => {
        // 1. Stats (Use exact count)
        const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        const { count: posts } = await supabase.from('posts').select('*', { count: 'exact', head: true })
        const { count: resonance } = await supabase.from('resonance').select('*', { count: 'exact', head: true })

        setStats({ users: users || 0, posts: posts || 0, resonance: resonance || 0 })

        // 2. Compliance Rules
        const { data: rules } = await supabase.from('compliance_rules').select('*').order('created_at', { ascending: false })
        setComplianceRules(rules || [])

        // 3. Flags (Reports Inbox)
        // We join to get content details.
        const { data: pendingFlags } = await supabase
            .from('flags')
            .select(`
                id, reason, status, created_at,
                post:posts(id, content),
                comment:comments(id, content),
                reporter:profiles!flags_user_id_fkey(username)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        setFlags(pendingFlags || [])
    }

    const toggleRule = async (id: string, currentStatus: boolean) => {
        await supabase.from('compliance_rules').update({ is_blocked: !currentStatus }).eq('id', id)
        // Optimistic update
        setComplianceRules(prev => prev.map(r => r.id === id ? { ...r, is_blocked: !currentStatus } : r))
    }

    const addBlock = async () => {
        if (!newRegion) return
        const { data, error } = await supabase.from('compliance_rules').insert({
            region_code: newRegion.toUpperCase(),
            feature: 'all',
            is_blocked: true,
            message: 'Region temporarily restricted.'
        }).select().single()

        if (!error && data) {
            setComplianceRules([data, ...complianceRules])
            setNewRegion('')

            // AUDIT LOG
            await supabase.from('admin_logs').insert({
                action: 'BLOCK_REGION',
                details: { region: newRegion, rule_id: data.id }
            })
        }
    }

    const deleteRule = async (id: string) => {
        if (!confirm('Permanently remove this rule?')) return
        await supabase.from('compliance_rules').delete().eq('id', id)
        setComplianceRules(prev => prev.filter(r => r.id !== id))
    }

    const handleResolveFlag = async (id: string) => {
        // Mark as resolved (dismiss)
        await supabase.from('flags').update({ status: 'resolved' }).eq('id', id)
        setFlags(prev => prev.filter(f => f.id !== id))
    }

    const handleDeleteContent = async (flag: any) => {
        if (!confirm('Nuclear Option: Delete this content permanently?')) return

        let error
        if (flag.post) {
            const { error: err } = await supabase.from('posts').delete().eq('id', flag.post.id)
            error = err
        } else if (flag.comment) {
            const { error: err } = await supabase.from('comments').delete().eq('id', flag.comment.id)
            error = err
        }

        if (!error) {
            // Auto-resolve the flag
            handleResolveFlag(flag.id)

            // AUDIT LOG
            const targetId = flag.post ? flag.post.id : flag.comment.id
            const targetType = flag.post ? 'POST' : 'COMMENT'
            await supabase.from('admin_logs').insert({
                action: 'NUKE_CONTENT',
                target_id: targetId,
                details: { type: targetType, reason: flag.reason, reporter: flag.reporter?.username }
            })
        } else {
            alert('Failed to delete content.')
        }
    }

    if (loading) return (
        <div className="container flex-center h-screen">
            <div className="mono"><Shield className="spin" /> VERIFYING ID...</div>
        </div>
    )

    if (!authorized) return null

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <h1 className="glitch" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Shield className="text-error" /> CONTROL ROOM
                </h1>
                <div className="flex-between">
                    <p className="mono text-muted">SYSTEM STATUS: OPERATIONAL</p>
                    <span className="badge badge-red">LEVEL 5 CLEARANCE</span>
                </div>
            </header>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
                <button
                    className={`btn-ghost ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                    style={{ borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none' }}
                >
                    OVERVIEW
                </button>
                <button
                    className={`btn-ghost ${activeTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reports')}
                    style={{ borderBottom: activeTab === 'reports' ? '2px solid var(--status-error)' : 'none' }}
                >
                    REPORTS ({flags.length})
                </button>
            </div>

            {activeTab === 'reports' ? (
                /* REPORTS INBOX */
                <div className="surface p-4">
                    <h2 className="mono mb-4 text-error">PENDING FLAGS</h2>
                    {flags.length === 0 ? (
                        <div className="text-muted mono text-center p-8">All quiet. No active reports.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {flags.map(flag => (
                                <div key={flag.id} style={{ border: '1px solid var(--border-light)', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <span className="badge badge-red">{flag.reason}</span>
                                            <span className="badge mono">{flag.post ? 'POST' : 'COMMENT'}</span>
                                            <span className="text-muted text-sm">by @{flag.reporter?.username || 'anon'}</span>
                                        </div>
                                        <p className="mono font-bold">
                                            "{flag.post?.content || flag.comment?.content || '[DELETED CONTENT]'}"
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleResolveFlag(flag.id)} className="btn btn-ghost text-sm">DISMISS</button>
                                        <button onClick={() => handleDeleteContent(flag)} className="btn btn-red text-sm"><Trash2 size={14} /> NUKE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* OVERVIEW TAB CONTENT */
                <>
                    {/* METRICS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                        <div className="surface" style={{ padding: '1.5rem', border: '1px solid var(--border-light)' }}>
                            <div className="mono text-muted mb-2"><Globe size={16} /> POPULATION</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.users}</div>
                        </div>
                        <div className="surface" style={{ padding: '1.5rem', border: '1px solid var(--border-light)' }}>
                            <div className="mono text-muted mb-2"><Activity size={16} /> THOUGHTS</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.posts}</div>
                        </div>
                        <div className="surface" style={{ padding: '1.5rem', border: '1px solid var(--border-light)' }}>
                            <div className="mono text-muted mb-2"><Activity size={16} /> RESONANCE</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-pink)' }}>{stats.resonance}</div>
                        </div>
                    </div>

                    {/* KILL SWITCH */}
                    <section className="surface" style={{ padding: '2rem', border: '1px solid var(--status-error)' }}>
                        <h2 className="mono mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-error)' }}>
                            <AlertTriangle /> SOVEREIGNTY DEFENSE (COMPLIANCE)
                        </h2>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Region Code (e.g. IN-KA)"
                                className="input"
                                value={newRegion}
                                onChange={e => setNewRegion(e.target.value)}
                                style={{ maxWidth: '250px' }}
                            />
                            <button className="btn" style={{ background: 'var(--status-error)', color: 'black' }} onClick={addBlock}>
                                BLOCK REGION
                            </button>
                            <span className="mono text-muted text-sm">Target ISO-3166 Codes</span>
                        </div>

                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <th className="mono p-2 text-muted">REGION</th>
                                    <th className="mono p-2 text-muted">MESSAGE</th>
                                    <th className="mono p-2 text-muted">STATUS</th>
                                    <th className="mono p-2 text-muted">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complianceRules.length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center mono text-muted">No active restrictions.</td></tr>
                                ) : (
                                    complianceRules.map(rule => (
                                        <tr key={rule.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td className="p-2 font-bold mono">{rule.region_code}</td>
                                            <td className="p-2 text-sm text-secondary">{rule.message}</td>
                                            <td className="p-2">
                                                <span className={`badge ${rule.is_blocked ? 'badge-red' : 'badge-green'}`} style={{
                                                    background: rule.is_blocked ? 'rgba(255, 59, 48, 0.2)' : 'rgba(52, 199, 89, 0.2)',
                                                    color: rule.is_blocked ? '#ff3b30' : '#34c759',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    {rule.is_blocked ? <Lock size={10} /> : <CheckCircle size={10} />}
                                                    {rule.is_blocked ? 'BLOCKED' : 'MONITORING'}
                                                </span>
                                            </td>
                                            <td className="p-2 flex gap-2">
                                                <button
                                                    className="btn-ghost mono text-sm"
                                                    onClick={() => toggleRule(rule.id, rule.is_blocked)}
                                                    style={{ color: rule.is_blocked ? 'var(--text-primary)' : 'var(--status-error)' }}
                                                >
                                                    {rule.is_blocked ? 'LIFT BAN' : 'BLOCK'}
                                                </button>
                                                <button className="btn-icon" onClick={() => deleteRule(rule.id)}>
                                                    <Trash2 size={14} className="text-muted" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </div>
    )
}
