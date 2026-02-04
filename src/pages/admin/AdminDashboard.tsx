import React from 'react'
import { LayoutDashboard, Users, Heart, Share2, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/components/ThemeProvider'

const StatCard = ({ title, value, icon: Icon, color, isDark }: any) => (
    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200 shadow-sm'} group hover:border-primary/20 transition-all duration-300`}>
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6`} style={{ color }} />
            </div>
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                +12%
            </div>
        </div>
        <div>
            <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'} font-bold mb-1`}>{title}</p>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</h3>
        </div>
    </div>
)

export const AdminDashboard = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <div className={`min-h-screen ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'} p-8 font-sans`}>
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Operational Terminal</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">System Overview</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Administrator</p>
                            <p className="font-bold text-sm">{user?.name}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20`}>
                            <img src={user?.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Total Users" value="1,284" icon={Users} color="#3b82f6" isDark={isDark} />
                    <StatCard title="Active Prompts" value="8,492" icon={Share2} color="#a855f7" isDark={isDark} />
                    <StatCard title="Total Likes" value="42.5k" icon={Heart} color="#ef4444" isDark={isDark} />
                    <StatCard title="Revenue" value="₹1.2M" icon={LayoutDashboard} color="#10b981" isDark={isDark} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border ${isDark ? 'bg-zinc-900/30 border-white/5' : 'bg-white border-zinc-200'} min-h-[400px]`}>
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

                        <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-zinc-900/30 border-white/5' : 'bg-white border-zinc-200'}`}>
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
        </div>
    )
}
