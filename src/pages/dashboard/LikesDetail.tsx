import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    Heart,
    TrendingUp,
    BarChart3,
    Clock,
    ArrowUpRight,
    Loader2,
    Database,
    Sparkles,
    Zap
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { getPromptsByUser } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import type { Prompt } from '@/lib/data'

export const LikesDetail = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [userPrompts, setUserPrompts] = useState<Prompt[]>([])

    useEffect(() => {
        if (!user?.username && !user?.name) return

        const fetchPrompts = async () => {
            setLoading(true)
            try {
                const prompts = await getPromptsByUser(user.id)
                // Sort by likes descending
                const sorted = [...prompts].sort((a, b) => (b.likes || 0) - (a.likes || 0))
                setUserPrompts(sorted)
            } catch (error) {
                console.error("Failed to fetch user prompts analytics", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPrompts()
    }, [user?.username, user?.name])

    const totalLikes = userPrompts.reduce((acc, p) => acc + (p.likes || 0), 0)
    const topPrompt = userPrompts[0]
    const avgLikes = userPrompts.length > 0 ? (totalLikes / userPrompts.length).toFixed(1) : 0

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500 hover:text-primary' : 'text-zinc-400 hover:text-primary'} transition-colors`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Engagement Statistics</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Intelligence <span className="highlight">Engagement</span>
                        </h1>
                        <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Detailed metrics of how the platform is interacting with your prompts.
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Calculating Engagement...</span>
                    </div>
                ) : (
                    <div className="space-y-12 animate-in fade-in duration-700">
                        {/* High Level Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/40 border-primary/20 shadow-xl shadow-primary/5' : 'bg-white border-zinc-200'}`}>
                                <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mb-2">Total Power</p>
                                <div className="flex items-center gap-4">
                                    <h3 className="text-4xl font-black">{totalLikes}</h3>
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-[10px] font-bold text-primary mt-2 uppercase">Total Likes</p>
                            </div>
                            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/40 border-border/10' : 'bg-white border-zinc-200'}`}>
                                <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mb-2">Engagement Density</p>
                                <div className="flex items-center gap-4">
                                    <h3 className="text-4xl font-black">{avgLikes}</h3>
                                    <Zap className="h-6 w-6 text-orange-500" />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground/40 mt-2 uppercase">Avg per Prompt</p>
                            </div>
                            <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/40 border-border/10' : 'bg-white border-zinc-200'}`}>
                                <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mb-2">My Prompts</p>
                                <div className="flex items-center gap-4">
                                    <h3 className="text-4xl font-black">{userPrompts.length}</h3>
                                    <Database className="h-6 w-6 text-blue-500" />
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground/40 mt-2 uppercase">Total Created</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Top Manifests List */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <Sparkles className="h-5 w-5 text-primary" /> Top Prompts
                                </h2>
                                <div className="space-y-4">
                                    {userPrompts.slice(0, 5).map((prompt, index) => (
                                        <div key={prompt.id} className={`flex items-center gap-6 p-5 rounded-3xl border ${isDark ? 'bg-card/20 border-white/5' : 'bg-white border-zinc-100'} group hover:border-primary/20 transition-all`}>
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-2xl font-black text-sm ${index === 0 ? 'bg-primary text-background' : 'bg-white/5 text-muted-foreground'}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold truncate text-sm">{prompt.title}</h4>
                                                <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-0.5">{prompt.category}</p>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-primary">
                                                <Heart className="h-3 w-3 fill-primary" />
                                                <span className="text-sm font-black">{prompt.likes || 0}</span>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/prompt/${prompt.id}`)}
                                                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                                            >
                                                <ArrowUpRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hero Top Card */}
                            {topPrompt && (
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className={`relative p-8 rounded-[3rem] border ${isDark ? 'bg-card/50 border-primary/20' : 'bg-white border-zinc-200'} overflow-hidden h-full flex flex-col`}>
                                        <h2 className="text-xl font-bold mb-8 uppercase tracking-widest flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-primary" /> Most Popular
                                        </h2>
                                        <div className="aspect-video rounded-3xl overflow-hidden mb-8">
                                            <img src={topPrompt.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-black mb-2">{topPrompt.title}</h3>
                                            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'} line-clamp-2 mb-6`}>
                                                This is currently your most popular prompt on the platform.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-[9px] font-black uppercase tracking-tighter opacity-40 mb-1">Status</p>
                                                    <p className="text-lg font-black text-primary">Top Prompt</p>
                                                </div>
                                                <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-[9px] font-black uppercase tracking-tighter opacity-40 mb-1">Created</p>
                                                    <p className="text-lg font-black">{formatDistanceToNow(new Date(topPrompt.createdAt))} ago</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="w-full h-14 rounded-2xl mt-8 font-bold gap-2" onClick={() => navigate(`/prompt/${topPrompt.id}`)}>
                                            View Top Prompt <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
