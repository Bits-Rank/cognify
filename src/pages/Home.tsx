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
                        <div className="text-center py-12 bg-card rounded-lg border">
                            <h3 className="text-xl font-semibold mb-4">Ready to explore amazing prompts?</h3>
                            {!user ? (
                                <div>
                                    <p className="text-muted-foreground mb-6">
                                        Sign in to view the community gallery and discover trending AI prompts.
                                    </p>
                                    <div className="flex gap-4 justify-center">
                                        <Link to="/sign-in">
                                            <Button>Sign In to View Prompts</Button>
                                        </Link>
                                        <Link to="/seed">
                                            <Button variant="outline">Seed Database</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-muted-foreground mb-6">
                                        No prompts in the database yet. Add some sample data to get started!
                                    </p>
                                    <Link to="/seed">
                                        <Button>Add Sample Prompts</Button>
                                    </Link>
                                </div>
                            )}
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
