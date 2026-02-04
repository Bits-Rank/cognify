import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPrompts } from "@/lib/db"
import type { Prompt } from "@/lib/data"
import { PromptCard } from "@/components/PromptCard"
import { useAuth } from "@/lib/auth-context"
import { CommunityResources } from "@/components/CommunityResources"

export function HomePage() {
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        async function loadPrompts() {
            try {
                const data = await getPrompts(6)
                setPrompts(data)
            } catch (error) {
                console.error("Error loading prompts:", error)
            }
            setLoading(false)
        }
        loadPrompts()
    }, [user]) // Reload when user changes

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-16 md:py-24 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
                        Community Prompt Studio & Gallery
                    </p>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                        Share the <span className="highlight">prompts</span> behind the art.
                        Discover trending AI images and videos that inspire your next creation.
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                        Cognify is the open gallery where AI artists share their secrets and
                        curious fans discover what's possible. Browse stunning images, copy the exact
                        prompts, and track the trends shaping generative art.
                    </p>

                    {/* Stats, Actions, etc. */}
                    <Link to="/explore">
                        <Button size="lg" className="rounded-full px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                            Explore Gallery
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Community Prompts Section */}
            <section className="py-16 px-4 bg-muted/30">
                <div className="container mx-auto">

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            See what the community is creating and loving right now.
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Every image and video comes with the exact prompt that created it.
                            Skip the guesswork and learn directly from pieces that caught the community's attention.
                        </p>
                    </div>

                    {/* Prompts Grid */}
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prompts.map((prompt) => (
                                <PromptCard key={prompt.id} prompt={prompt} />
                            ))}
                        </div>
                    )}

                    {/* Fallback if no prompts */}
                    {!loading && prompts.length === 0 && (
                        <div className="relative py-32 px-10 glass-card rounded-[40px] border border-white/5 overflow-hidden group max-w-4xl mx-auto shadow-none">
                            <div className="relative z-10 text-center flex flex-col items-center">
                                <div className="mb-12 text-primary/30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-24 w-24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                    </svg>
                                </div>
                                <h3 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-tight italic">
                                    Be the first one to <span className="highlight">share!</span>
                                </h3>
                                <p className="text-muted-foreground text-xl mb-12 max-w-xl mx-auto leading-relaxed font-normal">
                                    Our community gallery is waiting for its first masterpiece.
                                    Join the elite circle of AI artists and inspire the world today.
                                </p>
                                <Link to="/submit">
                                    <Button size="lg" className="shimmer-effect rounded-full px-12 h-16 text-lg font-bold bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-95 transition-all shadow-none">
                                        Submit Your First Prompt
                                        <ArrowRight className="ml-2 h-6 w-6" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-12 mb-20">
                        <Link to="/explore">
                            <Button variant="outline" size="lg" className="rounded-full px-8">
                                View All Prompts
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Community Resources Card (Moved to bottom) */}
                    <div className="mb-12">
                        <CommunityResources />
                    </div>
                </div>
            </section>
        </div>
    )
}
