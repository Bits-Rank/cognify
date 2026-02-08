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
    LayoutGrid,
    List,
    Pencil,
    Star
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

// Memoized AnalyticsChart
const AnalyticsChart = React.memo(({ data, isDark, metric }: any) => {
    const getColor = (m: string) => {
        switch (m) {
            case 'Generations': return '#f59e0b';
            case 'Likes': return '#ef4444';
            case 'Prompts': return '#10b981';
            case 'Unlocked': return '#3b82f6';
            default: return 'var(--primary)';
        }
    }
    const color = getColor(metric);

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#52525b' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? '#52525b' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#18181b' : '#ffffff',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        stroke={color}
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
})

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
    const [chartData, setChartData] = useState<any[]>([])
    const [activeMetric, setActiveMetric] = useState('Prompts')
    const [timezoneMode, setTimezoneMode] = useState<'local' | 'utc'>('local')
    const [dateRange, setDateRange] = useState('7d') // 7d, 30d, this_month, last_month, this_year, last_year
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [chartLoading, setChartLoading] = useState(false)

    // Initial Data Fetch (Runs once)
    useEffect(() => {
        if (!user?.id) return

        const fetchInitialData = async () => {
            setLoading(true)
            try {
                const [prompts, profile] = await Promise.all([
                    getPromptsByUser(user.id),
                    getUserProfile(user.id)
                ])

                setUserPrompts(prompts)

                if (profile) {
                    const currentStats = {
                        totalUnlocked: profile.promptsUnlocked?.length || 0,
                        generations: profile.generationsUsed || 0,
                        totalPrompts: prompts.length,
                        totalLikes: prompts.reduce((acc: any, p: any) => acc + (p.likes || 0), 0)
                    }
                    setStats(currentStats)
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
                toast.error("Error loading dashboard data")
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [user?.id])

    // Chart Data Fetch (Runs on filter change)
    useEffect(() => {
        if (!user?.id) return

        const fetchChartData = async () => {
            if (!loading) setChartLoading(true)
            try {
                // Calculate start date based on range
                const now = new Date()
                let startDate = new Date()
                let limitCount = 100

                switch (dateRange) {
                    case '7d':
                        startDate.setDate(now.getDate() - 7)
                        limitCount = 100
                        break
                    case '30d':
                        startDate.setDate(now.getDate() - 30)
                        limitCount = 500
                        break
                    case 'this_month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                        limitCount = 500
                        break
                    case 'last_month':
                        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                        limitCount = 1000
                        break
                    case 'this_year':
                        startDate = new Date(now.getFullYear(), 0, 1)
                        limitCount = 2000
                        break
                    case 'last_year':
                        startDate = new Date(now.getFullYear() - 1, 0, 1)
                        limitCount = 5000 // Large limit for full year
                        break
                    default:
                        startDate.setDate(now.getDate() - 7)
                }

                const activityLogs = await getUserActivity(user.id, limitCount, startDate)
                setActivities(activityLogs as any)

                // Generate Day List based on Range
                const days = []
                const rangeEnd = new Date()
                const rangeStart = new Date(startDate)

                if (dateRange === 'last_month') {
                    rangeEnd.setDate(0) // Last day of previous month
                } else if (dateRange === 'last_year') {
                    rangeEnd.setFullYear(now.getFullYear() - 1, 11, 31)
                }

                // Iterate from Start to End
                for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
                    days.push({
                        date: new Date(d),
                        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        matchKey: timezoneMode === 'local'
                            ? d.toLocaleDateString('en-CA') // YYYY-MM-DD local
                            : d.toISOString().split('T')[0] // YYYY-MM-DD UTC
                    })
                }

                const data = days.map((day) => {
                    const isMatch = (dateStr: string) => {
                        const d = new Date(dateStr)
                        const currentMatch = timezoneMode === 'local'
                            ? d.toLocaleDateString('en-CA')
                            : d.toISOString().split('T')[0]
                        return currentMatch === day.matchKey
                    }

                    return {
                        name: day.label,
                        Prompts: userPrompts.filter((p: any) => isMatch(p.createdAt)).length,
                        Unlocked: (activityLogs as any[]).filter((a: any) => a.action === 'unlock_prompt' && isMatch(a.createdAt)).length,
                        Likes: (activityLogs as any[]).filter((a: any) => a.action === 'like_prompt' && isMatch(a.createdAt)).length,
                        Generations: (activityLogs as any[]).filter((a: any) => a.action === 'generation' && isMatch(a.createdAt)).length
                    }
                })
                setChartData(data)

            } catch (error) {
                console.error("Failed to fetch chart data", error)
            } finally {
                setChartLoading(false)
            }
        }

        fetchChartData()
    }, [user?.id, timezoneMode, dateRange, userPrompts])

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

    // Skeleton Component for Dashboard
    const DashboardSkeleton = () => (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-64 md:w-96" />
                </div>
                <Skeleton className="h-12 w-full lg:w-80 rounded-full" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-[2rem]" />
                ))}
            </div>

            {/* Analytics Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="lg:col-span-2 h-[450px] rounded-[2.5rem]" />
                <Skeleton className="h-[450px] rounded-[2.5rem]" />
            </div>
        </div>
    )

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 md:mb-8">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Dashboard</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate">
                            Welcome back, <span className="highlight">{user.name?.split(' ')[0]}</span>
                        </h1>
                    </div>

                    <nav className={`flex items-center p-1.5 rounded-full border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} overflow-x-auto no-scrollbar w-full sm:w-auto`}>
                        <div className="flex items-center gap-1 min-w-max">
                            <NavButton id="overview" label="Overview" icon={Activity} />
                            <NavButton id="prompts" label="My Prompts" icon={Database} />
                            <NavButton id="history" label="Activity" icon={History} />
                        </div>
                    </nav>
                </header>

                {loading ? (
                    <DashboardSkeleton />
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
                                    {/* Analytics Visualization */}
                                    <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'} min-h-[400px] flex flex-col`}>
                                        <div className="flex flex-col gap-4 mb-6">
                                            {/* Row 1: Title and Date/Timezone Controls */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-xl font-bold">Activity Analytics</h2>
                                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                        {activeMetric} Trend ({timezoneMode.toUpperCase()})
                                                    </p>
                                                </div>
                                                <div className={`p-1 rounded-lg border flex items-center gap-1 self-start sm:self-auto ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                                                    <select
                                                        value={dateRange}
                                                        onChange={(e) => setDateRange(e.target.value)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase outline-none cursor-pointer ${isDark ? 'bg-zinc-900 text-zinc-400 hover:text-foreground' : 'bg-zinc-100 text-zinc-500 hover:text-foreground'}`}
                                                    >
                                                        <option value="7d" className={isDark ? 'bg-zinc-900 text-zinc-300' : ''}>Last 7 Days</option>
                                                        <option value="30d" className={isDark ? 'bg-zinc-900 text-zinc-300' : ''}>Last 30 Days</option>
                                                        <option value="this_month" className={isDark ? 'bg-zinc-900 text-zinc-300' : ''}>This Month</option>
                                                        <option value="last_month" className={isDark ? 'bg-zinc-900 text-zinc-300' : ''}>Last Month</option>
                                                        <option value="this_year" className={isDark ? 'bg-zinc-900 text-zinc-300' : ''}>This Year</option>
                                                        <option value="last_year" className={isDark ? 'bg-zinc-900 text-zinc-300' : ''}>Last Year</option>
                                                    </select>
                                                    <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-zinc-300'}`} />
                                                    <button
                                                        onClick={() => setTimezoneMode('local')}
                                                        className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${timezoneMode === 'local' ? 'bg-primary text-background' : 'text-zinc-500 hover:text-foreground'}`}
                                                    >
                                                        Local
                                                    </button>
                                                    <button
                                                        onClick={() => setTimezoneMode('utc')}
                                                        className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${timezoneMode === 'utc' ? 'bg-primary text-background' : 'text-zinc-500 hover:text-foreground'}`}
                                                    >
                                                        UTC
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Row 2: Metric Buttons */}
                                            <div className={`flex items-center gap-1 p-1 rounded-full border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-100 border-zinc-200'} overflow-x-auto no-scrollbar w-fit`}>
                                                {['Generations', 'Likes', 'Prompts', 'Unlocked'].map((m) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setActiveMetric(m)}
                                                        className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all whitespace-nowrap ${activeMetric === m
                                                            ? 'bg-primary text-background shadow-lg shadow-primary/20'
                                                            : isDark ? 'text-zinc-500 hover:text-foreground' : 'text-zinc-400 hover:text-zinc-900'
                                                            }`}
                                                    >
                                                        {m === 'Unlocked' ? 'Unlocked Nodes' : m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-h-[300px] relative">
                                            {chartLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 transition-all duration-300">
                                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                                </div>
                                            )}
                                            <div className={`transition-opacity duration-300 ${chartLoading ? 'opacity-40' : 'opacity-100'}`}>
                                                <AnalyticsChart data={chartData} isDark={isDark} metric={activeMetric} />
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                                            <div className="flex gap-8">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Total {activeMetric}</p>
                                                    <p className="text-sm font-bold">
                                                        {activeMetric === 'Generations' ? stats.generations :
                                                            activeMetric === 'Likes' ? stats.totalLikes :
                                                                activeMetric === 'Prompts' ? stats.totalPrompts :
                                                                    stats.totalUnlocked}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground/40 font-bold mb-1">Status</p>
                                                    <p className="text-sm font-bold text-green-500">Optimal</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('history')}
                                                className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-all hover:gap-3"
                                            >
                                                View Logs <ArrowUpRight className="h-3 w-3" />
                                            </button>
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
                                <div className="flex items-center gap-3 mb-8 w-full sticky top-0 z-10 py-1">
                                    <div className={`flex items-center p-1 rounded-2xl ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-lg shadow-primary/5' : 'bg-white border-zinc-200 shadow-lg shadow-black/5'} border shrink-0 h-11`}>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`h-full aspect-square flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-background' : 'text-muted-foreground hover:bg-white/5'}`}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`h-full aspect-square flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-background' : 'text-muted-foreground hover:bg-white/5'}`}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Button onClick={() => navigate('/submit')} variant="default" className="rounded-2xl gap-2 font-bold h-11 px-6 shadow-lg shadow-primary/20 border-none flex-1">
                                        <Plus className="h-4 w-4" /> Create New
                                    </Button>
                                </div>

                                <div className={`max-h-[600px] overflow-y-auto pr-2 no-scrollbar ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
                                    {userPrompts.length > 0 ? (
                                        userPrompts.map((prompt) => (
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
                                                                className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                                                            >
                                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/submit?id=${prompt.id}`)}
                                                                className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:text-primary'}`}
                                                                title="Edit Prompt"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleTogglePremium(prompt)}
                                                                className={`p-2 rounded-xl border transition-all ${prompt.isPremium
                                                                    ? 'bg-primary/20 border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary-values),0.2)]'
                                                                    : isDark ? 'bg-white/5 border-white/5 hover:bg-amber-500/20 hover:text-amber-500' : 'bg-zinc-50 border-zinc-200 hover:bg-amber-500/10 hover:text-amber-500'}`}
                                                                title={prompt.isPremium ? "Premium Prompt" : "Upgrade to Premium"}
                                                            >
                                                                <Star className={`h-3.5 w-3.5 ${prompt.isPremium ? 'fill-primary' : ''}`} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePrompt(prompt.id)}
                                                                className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-destructive/20 hover:text-destructive' : 'bg-zinc-50 border-zinc-200 hover:bg-destructive/10 hover:text-destructive'}`}
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
                                                                className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'}`}
                                                                title="View Details"
                                                            >
                                                                <ArrowUpRight className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/submit?id=${prompt.id}`)}
                                                                className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:text-primary'}`}
                                                                title="Edit Manifest"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleTogglePremium(prompt)}
                                                                className={`p-2.5 rounded-xl border transition-all ${prompt.isPremium
                                                                    ? 'bg-primary/20 border-primary/30 text-primary'
                                                                    : isDark ? 'bg-white/5 border-white/5 hover:bg-amber-500/20 hover:text-amber-500' : 'bg-zinc-50 border-zinc-200 hover:bg-amber-500/10 hover:text-amber-500'}`}
                                                                title={prompt.isPremium ? "Premium Node" : "Upgrade to Premium"}
                                                            >
                                                                <Star className={`h-4 w-4 ${prompt.isPremium ? 'fill-primary' : ''}`} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePrompt(prompt.id)}
                                                                className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-destructive/20 hover:text-destructive' : 'bg-zinc-50 border-zinc-200 hover:bg-destructive/10 hover:text-destructive'}`}
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
                                            <p className="text-muted-foreground/40 font-bold uppercase tracking-widest text-xs">No prompts created yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="glass-card rounded-[2.5rem] border-white/5 p-6 sm:p-8 animate-in fade-in duration-700">
                                <h2 className="text-xl font-bold mb-6">Activity History</h2>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                                    {activities.map((log: any) => (
                                        <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.01] border border-white/5 gap-3">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm sm:text-base truncate">{log.details}</p>
                                                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
                                                        <span className="text-[8px] sm:text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest truncate">{log.device?.split(' ')[0] || 'Unknown Node'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-white/10 hidden sm:block" />
                                                        <span className="text-[8px] sm:text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">{log.ip || '0.0.0.0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:text-right">
                                                <p className="text-[9px] sm:text-xs font-bold text-primary">{formatDistanceToNow(new Date(log.createdAt))} ago</p>
                                                <p className="text-[8px] sm:text-[9px] text-muted-foreground/40 font-bold">{new Date(log.createdAt).toLocaleTimeString()}</p>
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
