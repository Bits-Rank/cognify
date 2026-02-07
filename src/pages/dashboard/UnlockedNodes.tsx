import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ChevronLeft,
    Share2,
    Loader2,
    Clock,
    Heart,
    ArrowUpRight,
    Search,
    Filter,
    Database
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { getPromptsByIds } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import type { Prompt } from '@/lib/data'

export const UnlockedNodes = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [unlockedPrompts, setUnlockedPrompts] = useState<Prompt[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (!user?.promptsUnlocked?.length) {
            setLoading(false)
            return
        }

        const fetchUnlocked = async () => {
            setLoading(true)
            try {
                const prompts = await getPromptsByIds(user.promptsUnlocked)
                setUnlockedPrompts(prompts)
            } catch (error) {
                console.error("Failed to fetch unlocked prompts", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUnlocked()
    }, [user?.promptsUnlocked])

    const filteredPrompts = unlockedPrompts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authorUsername.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500 hover:text-primary' : 'text-zinc-400 hover:text-primary'} transition-colors`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Dispatch
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Share2 className="h-5 w-5 text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Archive Retrieval</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Unlocked <span className="highlight">Neural Nodes</span>
                            </h1>
                            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                You have authorized access to {unlockedPrompts.length} primary intelligence manifests.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-focus-within:text-primary transition-colors`} />
                                <input
                                    type="text"
                                    placeholder="Search archive..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`pl-11 pr-6 py-3 rounded-2xl border text-sm font-medium w-full md:w-64 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${isDark ? 'bg-zinc-900/50 border-white/5 focus:border-primary/50 text-foreground' : 'bg-white border-zinc-200 focus:border-primary/50 text-zinc-900'}`}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Decrypting Archives...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
                        {filteredPrompts.length > 0 ? (
                            filteredPrompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className={`group relative p-4 rounded-[2.5rem] border ${isDark ? 'bg-card/40 border-border/10' : 'bg-white border-zinc-200'} hover:border-primary/30 transition-all duration-500`}
                                >
                                    <div className="aspect-square rounded-3xl overflow-hidden bg-black/20 mb-4 relative">
                                        <img
                                            src={prompt.image}
                                            alt={prompt.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white flex items-center gap-1">
                                            <Heart className="h-2.5 w-2.5 text-primary fill-primary" /> {prompt.likes || 0}
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${isDark ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary'}`}>
                                                {prompt.category}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1 truncate group-hover:text-primary transition-colors">{prompt.title}</h4>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-4 w-4 rounded-full overflow-hidden bg-zinc-800">
                                                {prompt.authorAvatar && <img src={prompt.authorAvatar} className="h-full w-full object-cover" />}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/60 font-medium">@{prompt.authorUsername}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                                <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(prompt.createdAt))}
                                            </div>
                                            <button
                                                onClick={() => navigate(`/prompt/${prompt.id}`)}
                                                className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-white' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100 hover:text-primary'}`}
                                            >
                                                <ArrowUpRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-[3rem]">
                                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                                <p className="text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">
                                    {searchQuery ? 'No matching nodes found in archive.' : 'Your neural archive is currently empty.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
