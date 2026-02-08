import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-toastify"
import {
    getUserByUsername,
    getPromptsByUser,
    followUser,
    unfollowUser,
    isFollowing as checkIsFollowing,
    toggleLikePrompt,
    subscribeToUser,
    subscribeToPromptsByUser,
    getLikedPrompts
} from "@/lib/db"
import { type Prompt, type User } from "@/lib/data"
import { useState, useEffect } from "react"
import {
    Loader2,
    Grid,
    Heart,
    Bookmark,
    Settings,
    UserPlus,
    UserMinus,
    Check
} from "lucide-react"

export function ProfilePage() {
    const { user: currentUser, isLoading: isAuthLoading } = useAuth()
    const { username } = useParams<{ username?: string }>()
    const navigate = useNavigate()

    const [profileUser, setProfileUser] = useState<User | null>(null)
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'posts' | 'liked' | 'saved'>('posts')

    const isOwnProfile = !username || (currentUser && (username === currentUser.username || username === currentUser.id))

    useEffect(() => {
        let unsubscribeUser: (() => void) | undefined;
        let unsubscribePrompts: (() => void) | undefined;

        const loadAndSubscribe = async () => {
            setIsLoading(true)
            try {
                let userToDisplay: User | undefined;

                if (isOwnProfile && currentUser) {
                    userToDisplay = currentUser as unknown as User;
                } else if (username) {
                    userToDisplay = await getUserByUsername(username);
                }

                if (userToDisplay) {
                    setProfileUser(userToDisplay);

                    if (currentUser && currentUser.id !== userToDisplay.id) {
                        const following = await checkIsFollowing(currentUser.id, userToDisplay.id);
                        setIsFollowing(following);
                    }

                    // Real-time stats listener
                    unsubscribeUser = subscribeToUser(userToDisplay.id, (updatedUser) => {
                        console.log("Profile updated real-time:", updatedUser.followersCount);
                        setProfileUser(prev => prev ? {
                            ...prev,
                            followersCount: updatedUser.followersCount || 0,
                            followingCount: updatedUser.followingCount || 0,
                            bio: updatedUser.bio,
                            name: updatedUser.name,
                            avatar: updatedUser.avatar
                        } : updatedUser);
                    });

                    // Real-time prompts listener
                    unsubscribePrompts = subscribeToPromptsByUser(userToDisplay.id, (updatedPrompts) => {
                        setPrompts(updatedPrompts);
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
                toast.error("Could not load profile")
            } finally {
                setIsLoading(false)
            }
        }

        loadAndSubscribe()

        return () => {
            if (unsubscribeUser) unsubscribeUser();
            if (unsubscribePrompts) unsubscribePrompts();
        }
    }, [username, currentUser, isOwnProfile])

    const handleFollowToggle = async () => {
        if (!currentUser || !profileUser) {
            toast.info("Sign in to follow creators")
            navigate("/sign-in")
            return
        }

        // Store original state for reverting on error
        const originalFollowing = isFollowing
        const originalProfileUser = { ...profileUser }

        // Optimistic UI Update
        const nextFollowing = !isFollowing
        setIsFollowing(nextFollowing)

        setProfileUser(prev => {
            if (!prev) return prev
            return {
                ...prev,
                followersCount: nextFollowing
                    ? (prev.followersCount || 0) + 1
                    : Math.max(0, (prev.followersCount || 1) - 1)
            }
        })

        try {
            if (originalFollowing) {
                await unfollowUser(currentUser.id, profileUser.id)
            } else {
                await followUser(currentUser.id, profileUser.id)
            }
        } catch (error) {
            // Revert on error
            setIsFollowing(originalFollowing)
            setProfileUser(originalProfileUser)
            toast.error("Failed to update follow status")
        }
    }

    const handleLikeToggle = async (promptId: string, authorId: string) => {
        if (!currentUser) {
            toast.info("Sign in to like prompts")
            return
        }

        // Store original state for reverting
        const originalPrompts = [...prompts]
        const targetPrompt = prompts.find(p => p.id === promptId)
        if (!targetPrompt) return

        const wasLiked = targetPrompt.likedBy?.includes(currentUser.id)

        // Optimistic UI Update
        setPrompts(prev => prev.map(p => {
            if (p.id === promptId) {
                return {
                    ...p,
                    likes: wasLiked ? Math.max(0, (p.likes || 1) - 1) : (p.likes || 0) + 1,
                    likedBy: wasLiked
                        ? (p.likedBy || []).filter(id => id !== currentUser.id)
                        : [...(p.likedBy || []), currentUser.id]
                }
            }
            return p
        }))

        try {
            await toggleLikePrompt(currentUser.id, promptId, authorId)
        } catch (error) {
            // Revert on error
            setPrompts(originalPrompts)
            toast.error("Failed to update like status")
        }
    }

    if (isAuthLoading || isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">User not found</p>
                <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-10 pb-20 px-4 max-w-5xl mx-auto">
            {/* Header: Instagram Mobile Style */}
            <header className="px-4 mb-10 max-w-2xl mx-auto">
                {/* Top Row: Avatar & Stats */}
                <div className="flex items-center gap-8 md:gap-12 mb-6">
                    <div className="shrink-0">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 border border-border/10 p-0.5 bg-background shadow-sm">
                            <AvatarImage
                                src={profileUser.avatar || `https://ui-avatars.com/api/?name=${profileUser.name || profileUser.username}&background=random&size=256`}
                                className="rounded-full object-cover"
                            />
                            <AvatarFallback className="bg-muted text-2xl font-bold">
                                {profileUser.name?.charAt(0) || profileUser.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 flex justify-around sm:justify-between sm:max-w-xs">
                        <div className="flex flex-col items-center">
                            <span className="font-bold sm:text-lg">{prompts.length}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">posts</span>
                        </div>
                        <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity">
                            <span className="font-bold sm:text-lg">{profileUser.followersCount || 0}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">followers</span>
                        </div>
                        <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity">
                            <span className="font-bold sm:text-lg">{profileUser.followingCount || 0}</span>
                            <span className="text-xs sm:text-sm text-muted-foreground">following</span>
                        </div>
                    </div>
                </div>

                {/* Identity Section: Username, Name, Bio */}
                <div className="space-y-1 mb-6">
                    <h1 className="text-sm font-bold tracking-tight lowercase">{profileUser.username}</h1>
                    <p className="text-sm font-semibold">{profileUser.name}</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {profileUser.bio || "Prompt engineer & visual artist."}
                    </p>
                    {profileUser.website && (
                        <a
                            href={profileUser.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#00376b] dark:text-[#e0f1ff] hover:underline block"
                        >
                            {profileUser.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>

                {/* Action Buttons: Full width on mobile */}
                <div className="flex gap-2">
                    {isOwnProfile ? (
                        <>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-9 flex-1 font-bold bg-secondary/80 hover:bg-secondary transition-colors"
                                onClick={() => navigate("/settings")}
                            >
                                Edit Profile
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-9 flex-1 font-bold bg-secondary/80 hover:bg-secondary transition-colors"
                                onClick={() => navigate("/settings")}
                            >
                                Share profile
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-9 w-9 bg-secondary/80 hover:bg-secondary shrink-0"
                                onClick={() => navigate("/settings")}
                            >
                                <Settings className="h-5 w-5" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant={isFollowing ? "secondary" : "default"}
                                size="sm"
                                className={`h-9 flex-1 font-bold transition-all ${!isFollowing ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-secondary/80 hover:bg-secondary'}`}
                                onClick={handleFollowToggle}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </Button>
                            <Button variant="secondary" size="sm" className="h-9 flex-1 font-bold bg-secondary/80 hover:bg-secondary">
                                Message
                            </Button>
                        </>
                    )}
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="border-t border-border/50 mb-0">
                <div className="flex justify-center gap-12 -mt-px">
                    {[
                        { id: 'posts', icon: Grid, label: 'POSTS' },
                        { id: 'liked', icon: Heart, label: 'LIKED' },
                        { id: 'saved', icon: Bookmark, label: 'SAVED' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-4 border-t-2 transition-colors text-[10px] font-bold tracking-widest ${activeTab === tab.id
                                ? 'border-foreground text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-3 gap-1 md:gap-8 mt-2 md:mt-8 px-0 sm:px-4">
                {activeTab === 'posts' && (
                    prompts.length > 0 ? (
                        prompts.map((prompt) => (
                            <div
                                key={prompt.id}
                                className="relative aspect-square group cursor-pointer overflow-hidden rounded-sm md:rounded-lg bg-muted"
                                onClick={() => navigate(`/prompt/${prompt.id}`)}
                            >
                                <img
                                    src={prompt.image}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={prompt.title}
                                />
                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-6 w-6 fill-white" />
                                        <span>{prompt.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bookmark className="h-6 w-6" />
                                        <span>{prompt.downloads || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 py-20 text-center flex flex-col items-center gap-4">
                            <div className="p-6 rounded-full border-2 border-muted-foreground/20">
                                <Grid className="h-12 w-12 text-muted-foreground/40" />
                            </div>
                            <h2 className="text-2xl font-black italic">NO POSTS YET</h2>
                            <p className="text-muted-foreground">Start sharing your visual prompts with the world.</p>
                            <Button onClick={() => navigate("/submit")} className="mt-4">Create Prompt</Button>
                        </div>
                    )
                )}

                {activeTab === 'liked' && (
                    <LikedPromptsGrid userId={profileUser.id} />
                )}

                {activeTab === 'saved' && (
                    <div className="col-span-3 py-20 text-center flex flex-col items-center gap-4 min-h-[300px] justify-center">
                        <Bookmark className="h-12 w-12 text-muted-foreground/20" />
                        <h2 className="text-xl font-bold">Saved Prompts</h2>
                        <p className="text-muted-foreground max-w-sm">Save your favorite prompts to find them easily later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function LikedPromptsGrid({ userId }: { userId: string }) {
    const [likedPrompts, setLikedPrompts] = useState<Prompt[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchLiked = async () => {
            const prompts = await getLikedPrompts(userId)
            setLikedPrompts(prompts)
            setIsLoading(false)
        }
        fetchLiked()
    }, [userId])

    if (isLoading) {
        return (
            <div className="col-span-3 py-20 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (likedPrompts.length === 0) {
        return (
            <div className="col-span-3 py-20 text-center flex flex-col items-center gap-4 min-h-[300px] justify-center">
                <Heart className="h-12 w-12 text-muted-foreground/20" />
                <h2 className="text-xl font-bold">No Liked Prompts</h2>
                <p className="text-muted-foreground max-w-sm">When you like prompts, they'll appear here for quick access.</p>
            </div>
        )
    }

    return (
        <>
            {likedPrompts.map((prompt) => (
                <div
                    key={prompt.id}
                    className="relative aspect-square group cursor-pointer overflow-hidden rounded-sm md:rounded-lg bg-muted"
                    onClick={() => navigate(`/prompt/${prompt.id}`)}
                >
                    <img
                        src={prompt.image}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={prompt.title}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                        <div className="flex items-center gap-2">
                            <Heart className="h-6 w-6 fill-white" />
                            <span>{prompt.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Bookmark className="h-6 w-6" />
                            <span>{prompt.downloads || 0}</span>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
