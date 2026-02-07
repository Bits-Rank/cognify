import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    Zap,
    TrendingUp,
    Shield,
    Clock,
    ArrowUpRight,
    BarChart3,
    History
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const GenerationsDetail = () => {
    const { user, generationsRemaining } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()

    const limit = user?.subscription === 'free' ? 10 : user?.subscription === 'pro' ? 100 : 1000 // Placeholder for Unlimited
    const used = user?.generationsUsed || 0
    const remaining = generationsRemaining()
    const usagePercent = (used / limit) * 100

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500 hover:text-primary' : 'text-zinc-400 hover:text-primary'} transition-colors`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Dispatch
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Neural Capacity Flow</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Generation <span className="highlight">Metrics</span>
                        </h1>
                        <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Advanced analytics of your AI generation bandwidth and protocol limits.
                        </p>
                    </div>
                </header>

                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Hero Usage Card */}
                    <div className={`p-8 md:p-12 rounded-[3rem] border ${isDark ? 'bg-card/50 border-border/10 shadow-2xl shadow-black/40' : 'bg-white border-zinc-200'} relative overflow-hidden`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                            <div className="flex-1">
                                <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${isDark ? 'text-zinc-500' : 'text-zinc-400'} mb-2`}>Current Bandwidth Status</p>
                                <div className="flex items-baseline gap-4 mb-6">
                                    <h2 className="text-6xl font-black">{usagePercent.toFixed(0)}%</h2>
                                    <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Utilized</span>
                                </div>
                                <div className="space-y-4">
                                    <Progress value={usagePercent} className="h-3 rounded-full bg-primary/10" />
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        <span>0 Relays</span>
                                        <span>{limit} Limit</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`flex flex-col gap-4 p-8 rounded-[2rem] ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'} border border-white/5`}>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-40 mb-1">Remaining Units</p>
                                    <p className="text-3xl font-black text-primary">{remaining}</p>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-40 mb-1">Reset Cycle</p>
                                    <p className="text-xs font-bold flex items-center justify-center gap-2">
                                        <Clock className="h-3 w-3" /> Monthly
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                            <Zap className="h-96 w-96 -mr-20 -mt-20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan Status */}
                        <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-card/30 border-border/10' : 'bg-white border-zinc-200'}`}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Protocol Tier</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{user?.subscription} access</p>
                                </div>
                            </div>
                            <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                Your current uplink is restricted to <span className="text-foreground font-bold">{limit}</span> generations per cycle. Upgrade to a higher protocol tier for expanded capacity.
                            </p>
                            <Button className="w-full h-12 rounded-2xl font-bold gap-2" variant="outline" onClick={() => navigate('/pricing')}>
                                Expand Capacity <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Usage Analytics */}
                        <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-card/30 border-border/10' : 'bg-white border-zinc-200'}`}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Neural Efficiency</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Sync Rank: Alpha</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-60">Avg. Daily Relays</span>
                                    <span className="text-sm font-bold">{(used / 30).toFixed(1)}</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium opacity-60">Success Rate</span>
                                    <span className="text-sm font-bold">99.2%</span>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="flex items-center justify-between text-primary">
                                    <span className="text-xs font-bold uppercase tracking-widest">View Full Logs</span>
                                    <History className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
