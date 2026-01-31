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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header / User Details Card */}
            <div className="bg-card rounded-2xl p-6 md:p-8 mb-6 border border-border shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-xl font-semibold text-card-foreground">User Details</h2>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
                    <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={user.avatar || ""} className="object-cover" />
                        <AvatarFallback className="bg-muted text-muted-foreground text-3xl">
                            {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
                        <div>
                            <h1 className="text-2xl font-bold text-card-foreground mb-1">{user.name}</h1>
                            <p className="text-muted-foreground text-sm">Passionate AI Creator</p>
                        </div>

                        <div>
                            <p className="text-muted-foreground text-xs uppercase font-medium mb-1">Subscription Tier</p>
                            <p className="text-card-foreground font-medium capitalize">{user.subscription} Plan</p>
                            <p className="text-muted-foreground text-xs mt-1">Valid until lifetime</p>
                        </div>

                        <div>
                            <p className="text-muted-foreground text-xs uppercase font-medium mb-1">Email Address</p>
                            <p className="text-card-foreground font-medium truncate">{user.email}</p>
                            <p className="text-muted-foreground text-xs mt-1">Primary Account</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Stat 1 */}
                <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-card-foreground">{user.promptsUnlocked.length}</h3>
                        <p className="text-muted-foreground text-xs">Unlocked Prompts</p>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-card-foreground">{user.generationsUsed}</h3>
                        <p className="text-muted-foreground text-xs">Generations Used</p>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-card-foreground">0</h3>
                        <p className="text-muted-foreground text-xs">Creations</p>
                    </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-card rounded-2xl p-5 border border-border flex items-center gap-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-card-foreground">Role Model</h3>
                        <p className="text-muted-foreground text-xs">Badge Status</p>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-xl font-semibold text-card-foreground">Recent Activity</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-secondary border-none text-secondary-foreground hover:bg-secondary/80 h-9 w-9 p-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                        </Button>
                        <Button variant="outline" className="bg-secondary border-none text-secondary-foreground hover:bg-secondary/80 h-9 px-3 text-sm gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></svg>
                            Sort
                        </Button>
                        <Button variant="outline" className="bg-secondary border-none text-secondary-foreground hover:bg-secondary/80 h-9 px-3 text-sm gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoadingActivity ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : activities.length > 0 ? (
                        activities.map((log) => (
                            <div key={log.id} className="bg-muted/30 rounded-xl p-5 border border-border transition-transform hover:scale-[1.02] flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${log.action.includes("security") ? "bg-orange-500/10 text-orange-500" :
                                        log.action === "login" ? "bg-primary/10 text-primary" :
                                            "bg-blue-500/10 text-blue-500"
                                        }`}>
                                        {log.action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-card-foreground line-clamp-2" title={log.details}>
                                        {log.details}
                                    </p>
                                    <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                                        <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {log.device && <span className="max-w-[50%] truncate opacity-70" title={log.device}>
                                            {log.device.includes("Windows") ? "Windows PC" : log.device.includes("Mac") ? "Mac" : "Mobile"}
                                        </span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-muted-foreground">
                            No recent activity found.
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <Button
                        variant="destructive"
                        onClick={() => {
                            signOut()
                            toast.info("You have been signed out.")
                            navigate("/")
                        }}
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    )
}
