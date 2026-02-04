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
import { getAiModels, addAiModel, updateAiModel, deleteAiModel } from '@/lib/db'

const StatCard = ({ title, value, icon: Icon, color, isDark }: any) => (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-card border-border/50' : 'bg-white border-zinc-200 shadow-sm'} group hover:border-primary/20 transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6`} style={{ color }} />
            </div>
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                +12%
            </div>
        </div>
        <div>
            <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold mb-1`}>{title}</p>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-foreground' : 'text-zinc-900'}`}>{value}</h3>
        </div>
    </div>
)

export const AdminDashboard = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [activeTab, setActiveTab] = React.useState('overview')
    const [models, setModels] = React.useState<{ label: string; value: string }[]>([])
    const [loadingModels, setLoadingModels] = React.useState(true)
    const [newModel, setNewModel] = React.useState({ label: '', value: '' })
    const [editingModel, setEditingModel] = React.useState<{ label: string; value: string, oldValue: string } | null>(null)

    React.useEffect(() => {
        if (activeTab === 'models') {
            loadModels()
        }
    }, [activeTab])

    const loadModels = async () => {
        setLoadingModels(true)
        try {
            const data = await getAiModels()
            setModels(data)
        } catch (error) {
            toast.error("Failed to load models")
        } finally {
            setLoadingModels(false)
        }
    }

    const handleAddModel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newModel.label || !newModel.value) {
            toast.error("Please fill in both name and identifier")
            return
        }
        try {
            await addAiModel(newModel.label, newModel.value)
            setNewModel({ label: '', value: '' })
            loadModels()
            toast.success(`Model "${newModel.label}" added successfully`)
        } catch (error) {
            toast.error("Failed to add model")
        }
    }

    const handleDeleteModel = async (value: string) => {
        if (!confirm("Are you sure you want to delete this model?")) return
        try {
            await deleteAiModel(value)
            loadModels()
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
            loadModels()
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
            loadModels()
            toast.update(toastId, { render: "Defaults loaded", type: "success", isLoading: false, autoClose: 2000 })
        } catch (error) {
            toast.update(toastId, { render: "Failed to load defaults", type: "error", isLoading: false, autoClose: 2000 })
        }
    }

    const NavButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${activeTab === id
                ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-[1.05]'
                : isDark ? 'text-zinc-500 hover:text-foreground hover:bg-white/5' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
        >
            <Icon className="h-3.5 w-3.5" strokeWidth={activeTab === id ? 3 : 2} />
            {label}
        </button>
    )

    return (
        <div className={`min-h-screen ${isDark ? 'bg-background text-foreground' : 'bg-zinc-50 text-zinc-900'} p-8 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operational Terminal</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">System Overview</h1>
                    </div>

                    <nav className={`flex items-center gap-2 p-1.5 rounded-full border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                        <NavButton id="overview" label="Overview" icon={Activity} />
                        <NavButton id="models" label="Models" icon={Database} />
                        <NavButton id="analytics" label="Analytics" icon={BarChart3} />
                        <NavButton id="security" label="Security" icon={Shield} />
                    </nav>
                </header>

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <StatCard title="Total Users" value="1,284" icon={Users} color="#3b82f6" isDark={isDark} />
                            <StatCard title="Active Prompts" value="8,492" icon={Share2} color="#a855f7" isDark={isDark} />
                            <StatCard title="Total Likes" value="42.5k" icon={Heart} color="#ef4444" isDark={isDark} />
                            <StatCard title="Revenue" value="₹1.2M" icon={LayoutDashboard} color="#10b981" isDark={isDark} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'} min-h-[400px]`}>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold">Recent Activity</h2>
                                    <button className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-80">
                                        View Logs <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} flex items-center justify-center text-xs font-bold`}>
                                                    JS
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">New user registered</p>
                                                    <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>john_doe@example.com • 2 minutes ago</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>#USR-082</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-primary/10 border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]' : 'bg-primary/5 border-primary/10'} relative overflow-hidden group`}>
                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold mb-2">System Health</h3>
                                        <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'} mb-6`}>All services are operational and running at peak performance.</p>
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

                                <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-card/50 border-border/50' : 'bg-white border-zinc-200'}`}>
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
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Model Creation/Edit Form */}
                            <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-card border-border/50' : 'bg-white border-zinc-200'} shadow-none h-fit`}>
                                <h2 className="text-2xl font-bold mb-8">{editingModel ? 'Edit Intelligence' : 'Add Intelligence'}</h2>
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
                                        <Label htmlFor="modelValue" className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold ml-1">Relay Identifier</Label>
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
                                            <div key={model.value} className={`p-6 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'} group hover:border-primary/20 transition-all`}>
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
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingModel({ ...model, oldValue: model.value })}
                                                            className="text-zinc-600 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-2"
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteModel(model.value)}
                                                            className="text-zinc-600 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-2"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
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
                        <h2 className="text-2xl font-bold mb-2">Neural Analytics</h2>
                        <p className="text-muted-foreground/40 font-medium">Data visualization processing...</p>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="p-24 text-center glass-card rounded-[3rem] border-white/5 animate-in fade-in duration-700">
                        <Shield className="h-16 w-16 mx-auto mb-6 text-primary/20" />
                        <h2 className="text-2xl font-bold mb-2">Security Hub</h2>
                        <p className="text-muted-foreground/40 font-medium">Initializing threat detection relays...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
