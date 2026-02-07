import React from 'react'
import { LayoutDashboard, Users, Heart, Share2, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'
import { Plus, Trash2, Database, BarChart3, Shield, Activity, Edit2, RotateCcw } from 'lucide-react'
import { aiModels as initialAiModels } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-toastify'
import { subscribeToAiModels, addAiModel, updateAiModel, deleteAiModel, getSystemStats, getSystemRecentActivity, getAllUsersList, getAllPromptsList, adminUpdateUser, adminDeleteUser, adminUpdatePrompt, adminDeletePrompt } from '@/lib/db'
import { X, Check, Clock, TrendingUp, Search, Filter, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Memoized StatCard
const StatCard = React.memo(({ title, value, icon: Icon, color, isDark, onClick }: any) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-3xl border ${isDark ? 'bg-card border-border/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-white border-zinc-200 shadow-sm'} group hover:border-primary/20 hover:scale-[1.02] cursor-pointer transition-all duration-300 relative overflow-hidden`}
    >
        {isDark && <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />}
        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'bg-zinc-100 shadow-inner'} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6`} style={{ color }} />
            </div>
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                +12%
            </div>
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

// Memoized ModelCard
const ModelCard = React.memo(({ model, isDark, onEdit, onDelete, confirmingDelete }: any) => (
    <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'} group hover:border-primary/20 transition-all`}>
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {model.label.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-sm tracking-tight">{model.label}</h4>
                    <p className="text-[10px] text-muted-foreground/40 uppercase font-bold tracking-widest mt-0.5">{model.value}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {confirmingDelete === model.value ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                        <button onClick={() => onDelete(model.value, true)} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors" title="Confirm Delete">
                            <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => onDelete(null)} className="p-2 text-zinc-500 hover:bg-zinc-500/10 rounded-full transition-colors" title="Cancel">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit({ ...model, oldValue: model.value })}
                            className="text-zinc-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-2"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(model.value)}
                            className="text-zinc-600 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-2"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
))

// Memoized Pagination component
const Pagination = ({ total, currentPage, itemsPerPage, onPageChange, isDark }: any) => {
    const totalPages = Math.ceil(total / itemsPerPage)
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between px-2 py-8 border-t border-white/5 mt-8">
            <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                Showing <span className="text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-primary">{Math.min(currentPage * itemsPerPage, total)}</span> of <span className="text-primary">{total}</span> items
            </p>
            <div className="flex items-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className={`p-2 rounded-xl border transition-all disabled:opacity-20 ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-white border-zinc-200 hover:border-primary/20 shadow-sm'}`}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onPageChange(i + 1)}
                            className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === i + 1
                                ? 'bg-primary text-background shadow-lg shadow-primary/20'
                                : isDark ? 'bg-white/5 text-zinc-500 hover:bg-white/10' : 'bg-white border border-zinc-200 text-zinc-400 hover:border-primary/20'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className={`p-2 rounded-xl border transition-all disabled:opacity-20 ${isDark ? 'bg-white/5 border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-white border-zinc-200 hover:border-primary/20 shadow-sm'}`}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export const AdminDashboard = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [activeTab, setActiveTab] = React.useState('overview')
    const [models, setModels] = React.useState<{ label: string; value: string }[]>([])
    const [loadingModels, setLoadingModels] = React.useState(true)
    const [newModel, setNewModel] = React.useState({ label: '', value: '' })
    const [editingModel, setEditingModel] = React.useState<{ label: string; value: string, oldValue: string } | null>(null)
    const [confirmingDelete, setConfirmingDelete] = React.useState<string | null>(null)

    // Real Data State
    const [stats, setStats] = React.useState({ totalUsers: 0, totalPrompts: 0, totalLikes: 0, revenue: 0 })
    const [activities, setActivities] = React.useState<any[]>([])
    const [loadingOverview, setLoadingOverview] = React.useState(true)
    const [loadingDetail, setLoadingDetail] = React.useState(false)
    const [auditData, setAuditData] = React.useState<any[]>([])

    // Admin Edit States
    const [editingUser, setEditingUser] = React.useState<any | null>(null)
    const [editingPrompt, setEditingPrompt] = React.useState<any | null>(null)

    // Search & Filter State
    const [searchTerm, setSearchTerm] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState("all")
    const [currentPage, setCurrentPage] = React.useState(1)
    const itemsPerPage = 12

    React.useEffect(() => {
        const unsubscribe = subscribeToAiModels((data) => {
            setModels(data)
            setLoadingModels(false)
        })

        // Fetch Overview Data
        fetchOverviewData()

        return () => unsubscribe()
    }, [])

    const fetchOverviewData = async () => {
        setLoadingOverview(true)
        try {
            const [s, a] = await Promise.allSettled([
                getSystemStats(),
                getSystemRecentActivity(8)
            ])

            if (s.status === 'fulfilled') setStats(s.value)
            if (a.status === 'fulfilled') setActivities(a.value)
        } catch (error) {
            toast.error("Partial failure syncing system data")
        } finally {
            setLoadingOverview(false)
        }
    }


    const refreshAuditData = async () => {
        setLoadingDetail(true)
        try {
            if (activeTab === 'audit-users') {
                const data = await getAllUsersList({ search: searchTerm, status: statusFilter })
                setAuditData(data)
            } else if (activeTab === 'audit-prompts') {
                const data = await getAllPromptsList({ search: searchTerm, status: statusFilter })
                setAuditData(data)
            } else if (activeTab === 'audit-likes') {
                const data = await getAllPromptsList({ search: searchTerm, status: statusFilter })
                setAuditData(data.sort((a, b) => (b.likes || 0) - (a.likes || 0)))
            }
            setCurrentPage(1)
        } catch (error) {
            console.error("Query failed:", error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleDetailClick = async (type: string) => {
        setActiveTab(`audit-${type.toLowerCase()}`)
        setCurrentPage(1)
        setSearchTerm("")
        setStatusFilter("all")
    }

    // Effect to trigger search/filter re-fetch
    React.useEffect(() => {
        if (activeTab.startsWith('audit-')) {
            const timer = setTimeout(() => {
                refreshAuditData()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [activeTab, searchTerm, statusFilter])

    const handleAdminUpdateUser = async (userId: string, data: any) => {
        try {
            await adminUpdateUser(userId, data)
            toast.success("User updated")
            // Optimistic update
            setAuditData(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u))
            setEditingUser(null)
        } catch (error) {
            toast.error("Failed to update user")
        }
    }

    const handleAdminDeleteUser = async (userId: string) => {
        if (!confirm("CRITICAL: Are you sure you want to delete this user and ALL their content?")) return
        try {
            await adminDeleteUser(userId)
            toast.success("User removed from platform")
            setAuditData(prev => prev.filter(u => u.id !== userId))
        } catch (error) {
            toast.error("Failed to delete user")
        }
    }

    const handleAdminUpdatePrompt = async (userId: string, promptId: string, data: any) => {
        try {
            await adminUpdatePrompt(userId, promptId, data)
            toast.success("Prompt updated")
            setAuditData(prev => prev.map(p => p.id === promptId ? { ...p, ...data } : p))
            setEditingPrompt(null)
        } catch (error) {
            toast.error("Failed to update prompt")
        }
    }

    const handleAdminDeletePrompt = async (userId: string, promptId: string) => {
        if (!confirm("Are you sure you want to delete this prompt?")) return
        try {
            await adminDeletePrompt(userId, promptId)
            toast.success("Prompt removed")
            setAuditData(prev => prev.filter(p => p.id !== promptId))
        } catch (error) {
            toast.error("Failed to delete prompt")
        }
    }

    const handleAddModel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newModel.label || !newModel.value) {
            toast.error("Please fill in both name and identifier")
            return
        }
        // Optimistic UI
        const tempModel = { label: newModel.label, value: newModel.value }
        setModels(prev => [...prev, tempModel].sort((a, b) => a.label.localeCompare(b.label)))

        try {
            await addAiModel(newModel.label, newModel.value)
            setNewModel({ label: '', value: '' })
            toast.success(`Model "${newModel.label}" added successfully`)
        } catch (error) {
            toast.error("Failed to add model")
            // Revert on failure is handled by onSnapshot for simplicity
        }
    }

    const handleDeleteModel = async (value: string | null, confirmed = false) => {
        if (!confirmed) {
            setConfirmingDelete(value)
            return
        }
        if (!value) return

        // Optimistic UI
        setModels(prev => prev.filter(m => m.value !== value))
        setConfirmingDelete(null)

        try {
            await deleteAiModel(value)
            toast.success("Model deleted")
        } catch (error) {
            toast.error("Failed to delete model")
        }
    }

    const handleUpdateModel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingModel) return
        try {
            await updateAiModel(editingModel.oldValue, editingModel.label, editingModel.value)
            setEditingModel(null)
            toast.success("Model updated")
        } catch (error) {
            toast.error("Failed to update model")
        }
    }

    const handleLoadDefaults = async () => {
        const toastId = toast.loading("Loading default models...")
        try {
            for (const m of initialAiModels) {
                await addAiModel(m.label, m.value)
            }
            toast.update(toastId, { render: "Defaults loaded", type: "success", isLoading: false, autoClose: 2000 })
        } catch (error) {
            toast.update(toastId, { render: "Failed to load defaults", type: "error", isLoading: false, autoClose: 2000 })
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

    return (
        <>
            <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-4 sm:p-6 md:p-8 font-sans`}>
                <div className="max-w-full mx-auto px-2 sm:px-4">
                    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                {activeTab.startsWith('audit-') ? (
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="flex items-center gap-2 text-primary hover:opacity-70 transition-opacity"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Overview</span>
                                    </button>
                                ) : (
                                    <>
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Admin Panel</span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate">
                                {activeTab === 'overview' && 'System Overview'}
                                {activeTab === 'models' && 'AI Models'}
                                {activeTab === 'analytics' && 'Analytics'}
                                {activeTab === 'security' && 'Security Center'}
                                {activeTab === 'audit-users' && 'User Management'}
                                {activeTab === 'audit-prompts' && 'Prompt Management'}
                                {activeTab === 'audit-likes' && 'Engagement Statistics'}
                                {activeTab === 'audit-revenue' && 'Revenue Index'}
                            </h1>
                        </div>

                        {!activeTab.startsWith('audit-') && (
                            <nav className={`flex items-center gap-2 p-1.5 rounded-full border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} overflow-x-auto no-scrollbar max-w-full pb-0.5`}>
                                <div className="flex items-center gap-1 min-w-max">
                                    <NavButton id="overview" label="Overview" icon={Activity} />
                                    <NavButton id="models" label="Models" icon={Database} />
                                    <NavButton id="analytics" label="Analytics" icon={BarChart3} />
                                    <NavButton id="security" label="Security" icon={Shield} />
                                </div>
                            </nav>
                        )}
                    </header>

                    {activeTab === 'overview' && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <StatCard
                                    title="Total Users"
                                    value={stats.totalUsers.toLocaleString()}
                                    icon={Users}
                                    color="#3b82f6"
                                    isDark={isDark}
                                    onClick={() => handleDetailClick('Users')}
                                />
                                <StatCard
                                    title="Total Prompts"
                                    value={stats.totalPrompts.toLocaleString()}
                                    icon={Share2}
                                    color="#a855f7"
                                    isDark={isDark}
                                    onClick={() => handleDetailClick('Prompts')}
                                />
                                <StatCard
                                    title="Engagement"
                                    value={stats.totalLikes.toLocaleString()}
                                    icon={Heart}
                                    color="#ef4444"
                                    isDark={isDark}
                                    onClick={() => handleDetailClick('Likes')}
                                />
                                <StatCard
                                    title="Revenue"
                                    value={`₹${stats.revenue.toLocaleString()}`}
                                    icon={TrendingUp}
                                    color="#10b981"
                                    isDark={isDark}
                                    onClick={() => handleDetailClick('Revenue')}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className={`lg:col-span-2 p-5 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'} min-h-[400px]`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-bold">Recent Activity</h2>
                                        <button
                                            onClick={fetchOverviewData}
                                            className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-80 disabled:opacity-30"
                                            disabled={loadingOverview}
                                        >
                                            {loadingOverview ? "Syncing..." : "Refresh Feed"} <ArrowUpRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1rem] sm:rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center">
                                                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg sm:text-xl font-bold">System Activity</h3>
                                                <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Recent activity logs</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {activities.length > 0 ? (
                                            activities.map((activity: any) => (
                                                <div key={activity.id} className="group/item flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-default">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-2 h-2 rounded-full ${activity.type === 'user_joined' ? 'bg-green-500' : 'bg-primary'}`} />
                                                        <div>
                                                            <p className="text-sm font-bold">{activity.message}</p>
                                                            <p className="text-[10px] text-muted-foreground/40 font-bold tracking-widest mt-0.5">{formatDistanceToNow(new Date(activity.timestamp))} ago</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                                        #{activity.id.substring(0, 8).toUpperCase()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center text-muted-foreground/40 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">
                                                No recent activity detected.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className={`p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${isDark ? 'bg-primary/10 border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]' : 'bg-primary/5 border-primary/10'} relative overflow-hidden group`}>
                                        <div className="relative z-10">
                                            <h3 className="text-lg font-bold mb-2">System Health</h3>
                                            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mb-6`}>All services are operational and running normally.</p>
                                            <div className="space-y-4">
                                                {['Database', 'Auth Server', 'Assets'].map(s => (
                                                    <div key={s} className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{s}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <span className="text-[10px] font-bold text-green-500">100%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                                    </div>

                                    <div className={`p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'}`}>
                                        <h3 className="text-lg font-bold mb-6">Moderation Queue</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                                <p className="text-xs font-bold text-orange-500">8 Pending Prompts</p>
                                                <button className="bg-orange-500 text-white p-2 rounded-lg"><ArrowUpRight className="h-4 w-4" /></button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                                <p className="text-xs font-bold text-blue-500">2 Reported Users</p>
                                                <button className="bg-blue-500 text-white p-2 rounded-lg"><ArrowUpRight className="h-4 w-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Model Creation/Edit Form */}
                                <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-card border-border/50' : 'bg-white border-zinc-200'} shadow-none h-fit`}>
                                    <h2 className="text-2xl font-bold mb-8">{editingModel ? 'Edit AI Model' : 'Add AI Model'}</h2>
                                    <form onSubmit={editingModel ? handleUpdateModel : handleAddModel} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="modelLabel" className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Model Name</Label>
                                            <Input
                                                id="modelLabel"
                                                value={editingModel ? editingModel.label : newModel.label}
                                                onChange={e => editingModel ? setEditingModel({ ...editingModel, label: e.target.value }) : setNewModel({ ...newModel, label: e.target.value })}
                                                placeholder="e.g. Midjourney v7"
                                                className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary/30"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="modelValue" className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Model ID</Label>
                                            <Input
                                                id="modelValue"
                                                value={editingModel ? editingModel.value : newModel.value}
                                                onChange={e => editingModel ? setEditingModel({ ...editingModel, value: e.target.value.toLowerCase().replace(/\s+/g, '-') }) : setNewModel({ ...newModel, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                placeholder="e.g. mj-v7"
                                                className="h-12 rounded-xl bg-white/5 border-white/10 focus:border-primary/30"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            {editingModel && (
                                                <Button type="button" variant="outline" onClick={() => setEditingModel(null)} className="flex-1 h-12 rounded-xl font-bold transition-all">
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button className="flex-[2] h-12 rounded-xl font-bold gap-2 transition-all hover:scale-[1.02]">
                                                {editingModel ? <Plus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                {editingModel ? 'Update Model' : 'Add Model'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>

                                {/* Active Models List */}
                                <div className={`lg:col-span-2 p-10 rounded-[2.5rem] border ${isDark ? 'bg-card border-border/50' : 'bg-white border-zinc-200'} shadow-none text-left`}>
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-2xl font-bold">Neural Models</h2>
                                        <div className="flex items-center gap-4">
                                            {models.length === 0 && !loadingModels && (
                                                <Button variant="outline" size="sm" onClick={handleLoadDefaults} className="rounded-full gap-2 text-[10px] font-bold uppercase tracking-widest h-8 px-4">
                                                    <RotateCcw className="h-3 w-3" /> Load Defaults
                                                </Button>
                                            )}
                                            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                                {loadingModels ? '...' : `${models.length} Total`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {loadingModels ? (
                                            <div className="col-span-full py-20 text-center text-muted-foreground/40 font-bold uppercase tracking-widest animate-pulse">
                                                Fetching neural nodes...
                                            </div>
                                        ) : models.length > 0 ? (
                                            models.map(model => (
                                                <ModelCard
                                                    key={model.value}
                                                    model={model}
                                                    isDark={isDark}
                                                    onEdit={setEditingModel}
                                                    onDelete={handleDeleteModel}
                                                    confirmingDelete={confirmingDelete}
                                                />
                                            ))
                                        ) : (
                                            <div className="col-span-full py-20 text-center text-muted-foreground/40 font-bold uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">
                                                No neural models detected.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="p-24 text-center glass-card rounded-[3rem] border-white/5 animate-in fade-in duration-700">
                            <BarChart3 className="h-16 w-16 mx-auto mb-6 text-primary/20" />
                            <h2 className="text-2xl font-bold mb-2">Analytics</h2>
                            <p className="text-muted-foreground/40 font-medium">Processing visualization data...</p>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-24 text-center glass-card rounded-[3rem] border-white/5 animate-in fade-in duration-700">
                            <Shield className="h-16 w-16 mx-auto mb-6 text-primary/20" />
                            <h2 className="text-2xl font-bold mb-2">Security Center</h2>
                            <p className="text-muted-foreground/40 font-medium">Processing data security checks...</p>
                        </div>
                    )}
                    {activeTab.startsWith('audit-') && (
                        <div className="admin-section animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[600px] glass-card rounded-[3rem] border border-white/5 p-6 sm:p-10">
                            {loadingDetail ? (
                                <div className="py-40 flex flex-col items-center justify-center gap-4">
                                    <Activity className="h-10 w-10 text-primary animate-spin" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Loading data...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeTab === 'audit-users' && (
                                        <div className="space-y-6">
                                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search users (name, email, unique ID)..."
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        className={`w-full h-12 pl-12 pr-4 rounded-2xl border text-sm transition-all outline-none ${isDark ? 'bg-white/5 border-white/5 focus:border-primary/30' : 'bg-white border-zinc-200 focus:border-primary/20 shadow-sm'}`}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-muted-foreground/40 hidden sm:block" />
                                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                        <SelectTrigger className={`h-12 w-[180px] rounded-xl border text-xs font-bold uppercase tracking-widest outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:ring-primary/30' : 'bg-white border-zinc-200 focus:ring-primary/20 shadow-sm'}`}>
                                                            <SelectValue placeholder="STATUS" />
                                                        </SelectTrigger>
                                                        <SelectContent className={`${isDark ? 'bg-zinc-950/95' : 'bg-white'} backdrop-blur-2xl border-white/5 rounded-2xl`}>
                                                            <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">ALL USERS</SelectItem>
                                                            <SelectItem value="pro" className="text-[10px] font-bold uppercase tracking-widest">PRO ONLY</SelectItem>
                                                            <SelectItem value="blocked" className="text-[10px] font-bold uppercase tracking-widest">RESTRICTED</SelectItem>
                                                            <SelectItem value="verified" className="text-[10px] font-bold uppercase tracking-widest">VERIFIED</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {auditData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((usr: any) => (
                                                    <div key={usr.id} className={`p-5 sm:p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'} flex flex-col gap-4 group hover:border-primary/20 transition-all`}>
                                                        {/* Top Row: User Primary Info */}
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-[1.25rem] bg-primary/10 text-primary flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
                                                                    {usr.name?.[0] || usr.username?.[0] || 'U'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5 truncate">
                                                                        <span className="truncate">{usr.name || usr.username}</span>
                                                                        {usr.isVerified && <UserCheck className="h-3 w-3 text-primary" />}
                                                                    </h4>
                                                                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest truncate">
                                                                        {usr.email || 'No email provided'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 flex-shrink-0">
                                                                <button
                                                                    onClick={() => setEditingUser(usr)}
                                                                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-primary/20 hover:text-primary' : 'bg-white border-zinc-200 shadow-sm'}`}
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAdminDeleteUser(usr.id)}
                                                                    className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-destructive/20 hover:text-destructive' : 'bg-white border-zinc-200 shadow-sm'}`}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Info Row: Status, Credits & Deployment */}
                                                        <div className="flex flex-col gap-3 py-4 border-t border-white/5">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {usr.subscription === 'pro' && <span className="text-[7px] px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase font-black tracking-widest border border-primary/10">Pro Member</span>}
                                                                {usr.isBlocked && <span className="text-[7px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive uppercase font-black tracking-widest border border-destructive/10">Restricted</span>}
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-white/50 border-white/5' : 'bg-zinc-100 text-zinc-500 border-zinc-200'} text-[7px] font-black uppercase tracking-widest border`}>
                                                                    {usr.credits || 0} Credits
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[8px] text-muted-foreground/30 font-bold uppercase tracking-widest">Joined</span>
                                                                    <span className="font-mono text-[9px] font-bold opacity-60 italic">{new Date(usr.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Pagination
                                                total={auditData.length}
                                                currentPage={currentPage}
                                                itemsPerPage={itemsPerPage}
                                                onPageChange={setCurrentPage}
                                                isDark={isDark}
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'audit-prompts' && (
                                        <div className="space-y-6">
                                            <div className="flex flex-col md:flex-row gap-4 mb-8">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search prompts (title, author)..."
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                        className={`w-full h-12 pl-12 pr-4 rounded-2xl border text-sm transition-all outline-none ${isDark ? 'bg-white/5 border-white/5 focus:border-primary/30' : 'bg-white border-zinc-200 focus:border-primary/20 shadow-sm'}`}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-4 w-4 text-muted-foreground/40 hidden sm:block" />
                                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                        <SelectTrigger className={`h-12 w-[180px] rounded-xl border text-xs font-bold uppercase tracking-widest outline-none transition-all ${isDark ? 'bg-white/5 border-white/5 focus:ring-primary/30' : 'bg-white border-zinc-200 focus:ring-primary/20 shadow-sm'}`}>
                                                            <SelectValue placeholder="STATUS" />
                                                        </SelectTrigger>
                                                        <SelectContent className={`${isDark ? 'bg-zinc-950/95' : 'bg-white'} backdrop-blur-2xl border-white/5 rounded-2xl`}>
                                                            <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest">ALL PROMPTS</SelectItem>
                                                            <SelectItem value="visible" className="text-[10px] font-bold uppercase tracking-widest">VISIBLE ONLY</SelectItem>
                                                            <SelectItem value="hidden" className="text-[10px] font-bold uppercase tracking-widest">MODERATED</SelectItem>
                                                            <SelectItem value="premium" className="text-[10px] font-bold uppercase tracking-widest">PREMIUM</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                                {auditData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((prompt: any) => (
                                                    <div key={prompt.id} className={`p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'} flex flex-col gap-3 sm:gap-4 group hover:border-primary/20 transition-all relative`}>
                                                        <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-white/5 flex-shrink-0 relative">
                                                            <img src={prompt.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] sm:text-[9px] font-bold text-white flex items-center gap-1">
                                                                <Heart className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-primary fill-primary" /> {prompt.likes || 0}
                                                            </div>
                                                        </div>
                                                        <div className="px-1 sm:px-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0 pr-1">
                                                                    <h4 className="font-bold text-xs sm:text-sm truncate flex items-center gap-1.5">
                                                                        {prompt.title}
                                                                        {prompt.isHidden && <span className="text-[6px] sm:text-[7px] px-1 py-0.5 rounded-sm bg-destructive/20 text-destructive uppercase font-black flex-shrink-0">Hidden</span>}
                                                                    </h4>
                                                                    <p className="text-[8px] sm:text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5 sm:mt-1 truncate">@{prompt.authorDetails?.username}</p>
                                                                </div>
                                                                <div className="flex gap-1 flex-shrink-0">
                                                                    <button onClick={() => setEditingPrompt(prompt)} className={`p-1 sm:p-1.5 rounded-md border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary' : 'bg-white border-zinc-200 hover:border-primary/30 hover:text-primary shadow-sm'}`}>
                                                                        <Edit2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                                    </button>
                                                                    <button onClick={() => handleAdminDeletePrompt(prompt.authorDetails?.id, prompt.id)} className={`p-1 sm:p-1.5 rounded-md border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-destructive/20 hover:text-destructive' : 'bg-white border-zinc-200 hover:border-destructive/30 hover:text-destructive shadow-sm'}`}>
                                                                        <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2 sm:mt-3 text-[8px] sm:text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                                                                <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> {formatDistanceToNow(new Date(prompt.createdAt))} ago
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <Pagination
                                                total={auditData.length}
                                                currentPage={currentPage}
                                                itemsPerPage={itemsPerPage}
                                                onPageChange={setCurrentPage}
                                                isDark={isDark}
                                            />
                                        </div>
                                    )}

                                    {activeTab === 'audit-likes' && (
                                        <div className="max-w-3xl mx-auto space-y-6">
                                            {auditData.slice(0, 20).map((prompt: any, i) => (
                                                <div key={prompt.id} className={`p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'} flex items-center justify-between group hover:border-primary/20 transition-all`}>
                                                    <div className="flex items-center gap-6">
                                                        <div className={`text-4xl font-black italic ${i < 3 ? 'text-primary' : 'text-primary/10'} w-12 text-center`}>{i + 1}</div>
                                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-white/5 group-hover:scale-110 transition-transform">
                                                            <img src={prompt.image} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg">{prompt.title}</h4>
                                                            <p className="text-[11px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] mt-1">Discovered by {prompt.authorDetails?.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/10">
                                                        <Heart className="h-5 w-5 text-primary fill-primary" />
                                                        <span className="text-2xl font-black text-primary">{prompt.likes || 0}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'audit-revenue' && (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {[
                                                    { label: 'Avg Monthly ARPU', value: '₹1,500', color: '#3b82f6', growth: '+5%' },
                                                    { label: 'Pro Conversion', value: '24%', color: '#a855f7', growth: '+12%' },
                                                    { label: 'Monthly Churn', value: '1.2%', color: '#ef4444', growth: '-2%' }
                                                ].map(i => (
                                                    <div key={i.label} className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-zinc-200 shadow-sm'} group hover:border-primary/20 transition-all`}>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{i.label}</p>
                                                            <span className={`text-[10px] font-bold ${i.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{i.growth}</span>
                                                        </div>
                                                        <p className="text-4xl font-bold" style={{ color: i.color }}>{i.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-2">
                                                    <h3 className="text-xl font-bold">Recent Transactions</h3>
                                                    <TrendingUp className="h-5 w-5 text-primary opacity-20" />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {auditData.map((tx: any) => (
                                                        <div key={tx.id} className={`p-6 rounded-[2rem] border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-white border-zinc-200 shadow-sm'} flex items-center justify-between group hover:border-green-500/20 transition-all`}>
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xs">TX</div>
                                                                <div>
                                                                    <p className="text-sm font-bold">{tx.user}</p>
                                                                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">{tx.plan} Subscription • {formatDistanceToNow(new Date(tx.date))} ago</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-green-500">{tx.amount}</div>
                                                                <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Completed</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* User Edit Modal */}
            < Dialog open={!!editingUser
            } onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className={`max-w-md p-0 border-white/5 ${isDark ? 'bg-zinc-950/95' : 'bg-white'} backdrop-blur-2xl rounded-[2.5rem] overflow-hidden`}>
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold">Admin: Edit User</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-0 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Account Display Name</Label>
                                <Input
                                    value={editingUser?.name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold">Verified Status</Label>
                                    <p className="text-[10px] text-muted-foreground">Grant platform verification badge</p>
                                </div>
                                <button
                                    onClick={() => setEditingUser({ ...editingUser, isVerified: !editingUser.isVerified })}
                                    className={`w-10 h-6 rounded-full transition-all relative ${editingUser?.isVerified ? 'bg-primary' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingUser?.isVerified ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-destructive">Restricted Access (Block)</Label>
                                    <p className="text-[10px] text-muted-foreground">Prevent user from creating new prompts</p>
                                </div>
                                <button
                                    onClick={() => setEditingUser({ ...editingUser, isBlocked: !editingUser.isBlocked })}
                                    className={`w-10 h-6 rounded-full transition-all relative ${editingUser?.isBlocked ? 'bg-destructive' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingUser?.isBlocked ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Subscription Tier</Label>
                                <Select
                                    value={editingUser?.subscription || 'free'}
                                    onValueChange={val => setEditingUser({ ...editingUser, subscription: val })}
                                >
                                    <SelectTrigger className={`w-full h-11 rounded-xl px-4 text-sm font-bold border transition-all outline-none ${isDark ? 'bg-zinc-900 border-white/5 focus:ring-primary/30' : 'bg-zinc-100 border-zinc-200 focus:ring-primary/30'}`}>
                                        <SelectValue placeholder="Select Tier" />
                                    </SelectTrigger>
                                    <SelectContent className={`${isDark ? 'bg-zinc-950/95' : 'bg-white'} backdrop-blur-2xl border-white/5 rounded-2xl`}>
                                        <SelectItem value="free" className="text-sm font-bold">Standard (Free)</SelectItem>
                                        <SelectItem value="pro" className="text-sm font-bold">Pro Membership</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Available Credits</Label>
                                <Input
                                    type="number"
                                    value={editingUser?.credits || 0}
                                    onChange={e => setEditingUser({ ...editingUser, credits: parseInt(e.target.value) || 0 })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={() => handleAdminUpdateUser(editingUser.id, { name: editingUser.name, isVerified: editingUser.isVerified, subscription: editingUser.subscription, isBlocked: editingUser.isBlocked, credits: editingUser.credits })}
                            className="w-full h-12 rounded-xl font-bold transition-all hover:scale-[1.02]"
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Prompt Edit Modal */}
            < Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
                <DialogContent className={`max-w-md p-0 border-white/5 ${isDark ? 'bg-zinc-950/95' : 'bg-white'} backdrop-blur-2xl rounded-[2.5rem] overflow-hidden`}>
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold">Admin: Edit Content</DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-0 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Prompt Title</Label>
                                <Input
                                    value={editingPrompt?.title || ''}
                                    onChange={e => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold">Premium Access</Label>
                                    <p className="text-[10px] text-muted-foreground text-left">Restrict content to Pro members only</p>
                                </div>
                                <button
                                    onClick={() => setEditingPrompt({ ...editingPrompt, isPremium: !editingPrompt.isPremium })}
                                    className={`w-10 h-6 rounded-full transition-all relative ${editingPrompt?.isPremium ? 'bg-primary' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingPrompt?.isPremium ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-destructive">Hide Prompt</Label>
                                    <p className="text-[10px] text-muted-foreground text-left">Hide prompt from public gallery</p>
                                </div>
                                <button
                                    onClick={() => setEditingPrompt({ ...editingPrompt, isHidden: !editingPrompt.isHidden })}
                                    className={`w-10 h-6 rounded-full transition-all relative ${editingPrompt?.isHidden ? 'bg-destructive' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingPrompt?.isHidden ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleAdminUpdatePrompt(editingPrompt.authorDetails?.id, editingPrompt.id, { title: editingPrompt.title, isPremium: editingPrompt.isPremium, isHidden: editingPrompt.isHidden })}
                            className="w-full h-12 rounded-xl font-bold transition-all hover:scale-[1.02]"
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >
        </>
    )
}
