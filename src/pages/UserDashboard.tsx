import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Heart,
    Share2,
    ShieldCheck,
    ArrowUpRight,
    Plus,
    Trash2,
    Database,
    BarChart3,
    Shield,
    Activity,
    Edit2,
    RotateCcw,
    X,
    Check,
    Clock,
    TrendingUp,
    Search,
    Filter,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Sparkles,
    Zap,
    History,
    Pencil,
    Star
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import {
    getUserActivity,
    getPromptsByUser,
    getUserProfile,
    adminDeletePrompt,
    togglePromptPremium
} from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityLog, Prompt } from '@/lib/data'
import { DeleteNodeDialog } from '@/components/DeleteNodeDialog'

// Memoized StatCard
const StatCard = React.memo(({ title, value, icon: Icon, color, isDark, subtext, onClick }: any) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-3xl border ${isDark ? 'bg-card border-border/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-white border-zinc-200 shadow-sm'} group hover:border-primary/20 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden cursor-pointer`}
    >
        {isDark && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />}
        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'bg-zinc-100 shadow-inner'} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6`} style={{ color }} />
            </div>
            {subtext && (
                <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary'}`}>
                    {subtext}
                </div>
            )}
        </div>
        <div className="relative z-10">
            <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold mb-1`}>{title}</p>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-foreground' : 'text-zinc-900'}`}>{value}</h3>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
            <Icon className="h-24 w-24 -mr-4 -mb-4" style={{ color }} />
        </div>
    </div>
))

export const UserDashboard = () => {
    const { user, signOut } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null)
    const [stats, setStats] = useState({
        totalUnlocked: 0,
        generations: 0,
        totalPrompts: 0,
        totalLikes: 0
    })

    useEffect(() => {
        if (!user?.id) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const [activityLogs, prompts, profile] = await Promise.all([
                    getUserActivity(user.id, 5),
                    getPromptsByUser(user.id),
                    getUserProfile(user.id)
                ])

                setActivities(activityLogs as any)
                setUserPrompts(prompts)

                if (profile) {
                    setStats({
                        totalUnlocked: profile.promptsUnlocked?.length || 0,
                        generations: profile.generationsUsed || 0,
                        totalPrompts: prompts.length,
                        totalLikes: prompts.reduce((acc, p) => acc + (p.likes || 0), 0)
                    })
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
                toast.error("Error loading dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.id, user?.username, user?.name])

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
            setStats(prev => ({ ...prev, totalPrompts: prev.totalPrompts - 1 }))
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

    const NavButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === id
                ? 'bg-primary text-background shadow-xl shadow-primary/30 scale-[1.08] -translate-y-0.5'
                : isDark ? 'text-zinc-500 hover:text-foreground hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
        >
            <Icon className="h-3.5 w-3.5" strokeWidth={activeTab === id ? 3 : 2} />
            {label}
        </button>
    )

    if (!user) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Login required to access your dashboard.</p>
                <Button onClick={() => navigate("/sign-in")}>Sign In</Button>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Dashboard</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate">
                            Welcome back, <span className="highlight">{user.name?.split(' ')[0]}</span>
                        </h1>
                    </div>

                    <nav className={`flex items-center gap-2 p-1.5 rounded-full border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} overflow-x-auto no-scrollbar max-w-full pb-0.5`}>
                        <div className="flex items-center gap-1 min-w-max">
                            <NavButton id="overview" label="Overview" icon={Activity} />
                            <NavButton id="prompts" label="My Prompts" icon={Database} />
                            <NavButton id="history" label="Activity" icon={History} />
                        </div>
                    </nav>
                </header>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Loading...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div className="space-y-12 animate-in fade-in duration-700">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <StatCard
                                        title="Unlocked Nodes"
                                        value={stats.totalUnlocked}
                                        icon={Share2}
                                        color="#3b82f6"
                                        isDark={isDark}
                                        subtext="Archive"
                                        onClick={() => navigate('/dashboard/unlocked')}
                                    />
                                    <StatCard
                                        title="Generations"
                                        value={stats.generations}
                                        icon={Zap}
                                        color="#f59e0b"
                                        isDark={isDark}
                                        subtext="Active"
                                        onClick={() => navigate('/dashboard/generations')}
                                    />
                                    <StatCard
                                        title="My Prompts"
                                        value={stats.totalPrompts}
                                        icon={Database}
                                        color="#10b981"
                                        isDark={isDark}
                                        subtext="Created"
                                        onClick={() => navigate('/dashboard/prompts')}
                                    />
                                    <StatCard
                                        title="Total Likes"
                                        value={stats.totalLikes}
                                        icon={Heart}
                                        color="#ef4444"
                                        isDark={isDark}
                                        subtext="Engagement"
                                        onClick={() => navigate('/dashboard/likes')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Recent Activity */}
                                    <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'} min-h-[400px]`}>
                                        <div className="flex items-center justify-between mb-8">
                                            <h2 className="text-xl font-bold">Recent Activity</h2>
                                            <button
                                                onClick={() => navigate('/profile')}
                                                className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-80"
                                            >
                                                View All <ArrowUpRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {activities.length > 0 ? (
                                                activities.map((activity: any) => (
                                                    <div key={activity.id} className="group/item flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-2 h-2 rounded-full ${activity.action === 'login' ? 'bg-primary' : 'bg-green-500'}`} />
                                                            <div>
                                                                <p className="text-sm font-bold">{activity.details}</p>
                                                                <p className="text-[10px] text-muted-foreground/40 font-bold tracking-widest mt-0.5">{formatDistanceToNow(new Date(activity.createdAt))} ago</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                                            {activity.action.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center text-muted-foreground/40 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">
                                                    No recent relays detected.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="space-y-6">
                                        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-primary/10 border-primary/20' : 'bg-primary/5 border-primary/10'} relative overflow-hidden group`}>
                                            <h3 className="text-lg font-bold mb-2">Create Prompt</h3>
                                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mb-6`}>Create and share a new prompt with the community.</p>
                                            <Button
                                                onClick={() => navigate('/submit')}
                                                className="w-full h-12 rounded-2xl font-bold gap-2 bg-primary text-background hover:scale-[1.02] transition-transform"
                                            >
                                                <Plus className="h-4 w-4" /> New Prompt
                                            </Button>
                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                                        </div>

                                        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'}`}>
                                            <h3 className="text-lg font-bold mb-6">Security & Identity</h3>
                                            <div className="space-y-4">
                                                <button
                                                    onClick={() => navigate('/settings')}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 opacity-30" />
                                                </button>
                                                <button
                                                    onClick={() => navigate('/profile')}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Users className="h-4 w-4 text-primary" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Public Profile</span>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 opacity-30" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'prompts' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold">My Prompts</h2>
                                    <Button onClick={() => navigate('/submit')} variant="outline" className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest h-10">
                                        <Plus className="h-3 w-3" /> New Prompt
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {userPrompts.length > 0 ? (
                                        userPrompts.map((prompt) => (
                                            <div key={prompt.id} className={`p-4 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/10' : 'bg-white border-zinc-200'} group hover:border-primary/20 transition-all`}>
                                                <div className="aspect-square rounded-3xl overflow-hidden bg-white/5 mb-4 relative">
                                                    <img src={prompt.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white flex items-center gap-1">
                                                        <Heart className="h-2.5 w-2.5 text-primary fill-primary" /> {prompt.likes || 0}
                                                    </div>
                                                </div>
                                                <div className="px-2">
                                                    <h4 className="font-bold text-sm mb-1 truncate">{prompt.title}</h4>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
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
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-40 text-center border border-dashed border-white/5 rounded-[3rem]">
                                            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                                            <p className="text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">No prompts created yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="glass-card rounded-[3rem] border-white/5 p-10 animate-in fade-in duration-700">
                                <h2 className="text-2xl font-bold mb-10">Activity History</h2>
                                <div className="space-y-6">
                                    {activities.map((log: any) => (
                                        <div key={log.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.01] border border-white/5">
                                            <div className="flex items-center gap-6">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <ShieldCheck className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{log.details}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{log.device?.split(' ')[0] || 'Unknown Node'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                                        <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{log.ip || '0.0.0.0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-primary">{formatDistanceToNow(new Date(log.createdAt))} ago</p>
                                                <p className="text-[10px] text-muted-foreground/40 font-bold mt-1">{new Date(log.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <DeleteNodeDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDelete}
                />
            </div>
        </div>
    )
}
