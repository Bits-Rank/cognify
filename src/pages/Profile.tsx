import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-toastify"
import { getUserActivity } from "@/lib/db"
import { type ActivityLog } from "@/lib/data"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function ProfilePage() {
    const { user, isLoading, signOut } = useAuth()
    const navigate = useNavigate()
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [isLoadingActivity, setIsLoadingActivity] = useState(true)

    useEffect(() => {
        if (!user?.id) return

        const fetchActivity = async () => {
            try {
                const logs = await getUserActivity(user.id, 6) // Fetch 6 most recent
                const typedLogs = logs.map((log: any) => ({
                    id: log.id,
                    action: log.action as any,
                    details: log.details,
                    device: log.device,
                    ip: log.ip,
                    createdAt: log.createdAt
                })) as ActivityLog[]
                setActivities(typedLogs)
            } catch (error) {
                console.error("Failed to fetch activity", error)
            } finally {
                setIsLoadingActivity(false)
            }
        }

        fetchActivity()
    }, [user?.id])

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banana"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Please sign in to view your profile</p>
                <Button onClick={() => navigate("/sign-in")}>Sign In</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 px-4 mesh-gradient">
            <div className="container mx-auto max-w-6xl">
                {/* Header / User Details Card */}
                <div className="glass-card rounded-[40px] p-8 md:p-12 mb-10 border-white/5 shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000" />

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14 relative z-10">
                        <div className="relative group/avatar">
                            <Avatar className="h-32 w-32 border-[6px] border-white/5 shadow-2xl transition-transform group-hover/avatar:scale-105 duration-500">
                                <AvatarImage src={user.avatar || ""} className="object-cover" />
                                <AvatarFallback className="bg-white/5 text-muted-foreground/60 text-4xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-background p-2 rounded-full shadow-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="mb-6">
                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
                                    {user.name.split(' ').map((word, i) => i === 0 ? <span key={i}>{word} </span> : <span key={i} className="highlight">{word} </span>)}
                                </h1>
                                <p className="text-muted-foreground/60 text-lg font-medium tracking-wide">Elite Prompt Architect</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                                <div>
                                    <p className="text-[10px] text-muted-foreground/40 uppercase font-bold tracking-[0.2em] mb-2">Vault Status</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-foreground font-semibold text-xl capitalize">{user.subscription} Status</span>
                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-full border border-green-500/20">Active</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] text-muted-foreground/40 uppercase font-bold tracking-[0.2em] mb-2">Primary Relay</p>
                                    <p className="text-foreground font-semibold text-lg truncate opacity-80">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Stat 1 */}
                    <div className="glass-card rounded-3xl p-6 border-white/5 shadow-none group hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold highlight leading-tight">{user.promptsUnlocked.length}</h3>
                                <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">Unlocked</p>
                            </div>
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="glass-card rounded-3xl p-6 border-white/5 shadow-none group hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold opacity-80 leading-tight">{user.generationsUsed}</h3>
                                <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">Generations</p>
                            </div>
                        </div>
                    </div>

                    {/* Stat 3 */}
                    <div className="glass-card rounded-3xl p-6 border-white/5 shadow-none group hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold opacity-80 leading-tight">0</h3>
                                <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">Creations</p>
                            </div>
                        </div>
                    </div>

                    {/* Stat 4 */}
                    <div className="glass-card rounded-3xl p-6 border-white/5 shadow-none group hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold highlight leading-tight">Elite Tier</h3>
                                <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">Identity</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none mb-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-1 bg-primary rounded-full shadow-lg"></div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recent <span className="highlight">Relays</span></h2>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <Button variant="outline" className="bg-white/5 border-white/10 text-muted-foreground h-12 w-12 p-0 rounded-2xl hover:bg-white/10 hover:text-foreground transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                            </Button>
                            <Button variant="outline" className="bg-white/5 border-white/10 text-muted-foreground/60 h-12 px-6 rounded-2xl text-sm font-semibold gap-3 hover:bg-white/10 hover:text-foreground transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></svg>
                                Sort Relays
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoadingActivity ? (
                            <div className="col-span-full flex justify-center py-24">
                                <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
                            </div>
                        ) : activities.length > 0 ? (
                            activities.map((log) => (
                                <div key={log.id} className="glass-card bg-white/[0.01] rounded-3xl p-6 border-white/5 transition-all hover:bg-white/[0.03] group/item">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3 text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                            <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${log.action.includes("security") ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                                            log.action === "login" ? "bg-primary/10 text-primary border border-primary/20" :
                                                "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                            }`}>
                                            {log.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-foreground/80 line-clamp-2 mb-4 group-hover/item:text-foreground transition-colors" title={log.details}>
                                            {log.details}
                                        </p>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                            <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {log.device && <span className="truncate opacity-70">
                                                {log.device.includes("Windows") ? "Relay: PC" : log.device.includes("Mac") ? "Relay: MAC" : "Relay: MOB"}
                                            </span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
                                No relay history detected.
                            </div>
                        )}
                    </div>

                    <div className="mt-16 flex justify-center">
                        <Button
                            variant="ghost"
                            className="text-red-500/60 hover:text-red-500 hover:bg-red-500/5 px-10 h-12 rounded-full font-bold uppercase tracking-[0.2em] text-xs transition-all"
                            onClick={() => {
                                signOut()
                                toast.info("Relay Terminated. Secure session ended.")
                                navigate("/")
                            }}
                        >
                            Terminate Session
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
