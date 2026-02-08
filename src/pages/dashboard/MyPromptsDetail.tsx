import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    Database,
    Plus,
    Trash2,
    Clock,
    Heart,
    ArrowUpRight,
    Loader2,
    Search,
    Filter,
    LayoutGrid,
    List,
    Pencil,
    Star
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { getPromptsByUser, adminDeletePrompt, togglePromptPremium } from '@/lib/db'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import type { Prompt } from '@/lib/data'
import { DeleteNodeDialog } from '@/components/DeleteNodeDialog'

export const MyPromptsDetail = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.username && !user?.name) return

        const fetchPrompts = async () => {
            setLoading(true)
            try {
                const prompts = await getPromptsByUser(user.id)
                setUserPrompts(prompts)
            } catch (error) {
                console.error("Failed to fetch user prompts", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPrompts()
    }, [user?.username, user?.name])

    const handleDeletePrompt = (promptId: string) => {
        setPromptToDelete(promptId)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!promptToDelete || !user?.id) return

        try {
            await adminDeletePrompt(user.id, promptToDelete)
            toast.success("Prompt deleted")
            setUserPrompts(prev => prev.filter(p => p.id !== promptToDelete))
        } catch (error) {
            toast.error("Delete failed")
        } finally {
            setIsDeleteDialogOpen(false)
            setPromptToDelete(null)
        }
    }

    const handleTogglePremium = async (prompt: any) => {
        if (!user?.id) return
        const newStatus = !prompt.isPremium
        try {
            await togglePromptPremium(user.id, prompt.id, newStatus)
            setUserPrompts(prev => prev.map(p =>
                p.id === prompt.id ? { ...p, isPremium: newStatus } : p
            ))
            toast.success(newStatus ? "Prompt upgraded to Premium" : "Prompt returned to Standard")
        } catch (error) {
            toast.error("Update failed")
        }
    }

    const filteredPrompts = userPrompts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500 hover:text-primary' : 'text-zinc-400 hover:text-primary'} transition-colors`}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
                    </button>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                        <div className="relative group flex-1 w-full sm:w-auto">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'} group-focus-within:text-primary transition-colors`} />
                            <input
                                type="text"
                                placeholder="Search prompts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`pl-11 pr-6 py-3 rounded-2xl border text-sm font-medium w-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${isDark ? 'bg-zinc-900/50 border-white/5 focus:border-primary/50 text-foreground' : 'bg-white border-zinc-200 focus:border-primary/50 text-zinc-900 shadow-sm'}`}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className={`flex items-center p-1 rounded-2xl ${isDark ? 'bg-zinc-900/50 border-white/5 h-11' : 'bg-white border-zinc-200 h-11'} border shrink-0 relative`}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`h-full aspect-square flex items-center justify-center rounded-xl transition-all relative group ${viewMode === 'grid' ? 'text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                                >
                                    {viewMode === 'grid' && (
                                        <motion.div
                                            layoutId="viewToggle"
                                            className="absolute inset-0 bg-primary rounded-xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <LayoutGrid className="h-4 w-4 relative z-10" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`h-full aspect-square flex items-center justify-center rounded-xl transition-all relative group ${viewMode === 'list' ? 'text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                                >
                                    {viewMode === 'list' && (
                                        <motion.div
                                            layoutId="viewToggle"
                                            className="absolute inset-0 bg-primary rounded-xl"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <List className="h-4 w-4 relative z-10" />
                                </button>
                            </div>
                            <Button onClick={() => navigate('/submit')} className="rounded-2xl h-11 px-6 font-bold gap-2 shrink-0 shadow-lg shadow-primary/20 border-none flex-1 sm:flex-initial">
                                <Plus className="h-4 w-4" /> Create New
                            </Button>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Loading Prompts...</span>
                    </div>
                ) : (
                    <div className={`animate-in fade-in duration-700 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'space-y-4'}`}>
                        {filteredPrompts.length > 0 ? (
                            filteredPrompts.map((prompt) => (
                                viewMode === 'grid' ? (
                                    <div key={prompt.id} className={`p-4 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/10' : 'bg-white border-zinc-200'} group hover:border-primary/20 transition-all`}>
                                        <div className="aspect-square rounded-3xl overflow-hidden bg-white/5 mb-4 relative">
                                            <img src={prompt.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white flex items-center gap-1">
                                                <Heart className="h-2.5 w-2.5 text-primary fill-primary" /> {prompt.likes || 0}
                                            </div>
                                        </div>
                                        <div className="px-2">
                                            <h4 className="font-bold text-sm mb-3 truncate">{prompt.title}</h4>
                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest mb-3">
                                                <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(prompt.createdAt))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/prompt/${prompt.id}`)}
                                                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'}`}
                                                >
                                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/submit?id=${prompt.id}`)}
                                                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100 hover:text-primary'}`}
                                                    title="Edit Prompt"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePremium(prompt)}
                                                    className={`p-2 rounded-xl border transition-all ${prompt.isPremium
                                                        ? 'bg-primary/20 border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-values),0.2)]'
                                                        : isDark ? 'bg-white/5 border-white/5 hover:bg-amber-500/20 hover:text-amber-500' : 'bg-zinc-50 border-zinc-100 hover:bg-amber-500/10 hover:text-amber-500'}`}
                                                    title={prompt.isPremium ? "Premium Prompt" : "Upgrade to Premium"}
                                                >
                                                    <Star className={`h-3.5 w-3.5 ${prompt.isPremium ? 'fill-primary' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrompt(prompt.id)}
                                                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-destructive/20 hover:text-destructive' : 'bg-zinc-50 border-zinc-100 hover:bg-destructive/10 hover:text-destructive'}`}
                                                    title="Delete Prompt"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={prompt.id} className={`relative flex gap-4 p-4 rounded-3xl border ${isDark ? 'bg-card/50 border-border/10' : 'bg-white border-zinc-200'} group hover:border-primary/20 transition-all`}>
                                        <img src={prompt.image} className="h-20 w-20 rounded-2xl object-cover shrink-0" />
                                        <div className="flex-1 min-w-0 flex flex-col justify-center sm:pr-40">
                                            <div>
                                                <h4 className="font-bold truncate text-base sm:text-lg mb-1">{prompt.title}</h4>
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                                        <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(prompt.createdAt))}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                                                        <Heart className="h-2.5 w-2.5 fill-primary" /> {prompt.likes || 0} Likes
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 sm:mt-0 sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
                                                <button
                                                    onClick={() => navigate(`/prompt/${prompt.id}`)}
                                                    className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'}`}
                                                    title="View Details"
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/submit?id=${prompt.id}`)}
                                                    className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100 hover:text-primary'}`}
                                                    title="Edit Manifest"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleTogglePremium(prompt)}
                                                    className={`p-2.5 rounded-xl border transition-all ${prompt.isPremium
                                                        ? 'bg-primary/20 border-primary/30 text-primary'
                                                        : isDark ? 'bg-white/5 border-white/5 hover:bg-amber-500/20 hover:text-amber-500' : 'bg-zinc-50 border-zinc-100 hover:bg-amber-500/10 hover:text-amber-500'}`}
                                                    title={prompt.isPremium ? "Premium Node" : "Upgrade to Premium"}
                                                >
                                                    <Star className={`h-4 w-4 ${prompt.isPremium ? 'fill-primary' : ''}`} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrompt(prompt.id)}
                                                    className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-destructive/20 hover:text-destructive' : 'bg-zinc-50 border-zinc-100 hover:bg-destructive/10 hover:text-destructive'}`}
                                                    title="Delete Manifest"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-[3rem]">
                                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                                <p className="text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">No prompts found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DeleteNodeDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    )
}
