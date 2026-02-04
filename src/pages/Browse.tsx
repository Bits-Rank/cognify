import { useEffect, useState } from "react"
import { getPrompts } from "@/lib/db"
import type { Prompt } from "@/lib/data"
import { PromptCard } from "@/components/PromptCard"
import { useAuth } from "@/lib/auth-context"
import { Sparkles } from "lucide-react"

export function BrowsePage() {
    const { user } = useAuth()
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPrompts() {
            try {
                const data = await getPrompts(20)
                setPrompts(data)
            } catch (error) {
                console.error("Error loading prompts:", error)
            }
            setLoading(false)
        }
        loadPrompts()
    }, [])

    return (
        <div className="min-h-screen py-24 px-4 mesh-gradient overflow-x-hidden">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-20 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] pointer-events-none" />
                    <span className="inline-block px-5 py-2 rounded-full border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 bg-primary/5 text-primary backdrop-blur-xl relative z-10">
                        Visual Registry
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-10 tracking-tight relative z-10">
                        Explore <span className="highlight">Gallery.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground/60 max-w-3xl mx-auto font-medium relative z-10">
                        Discover the neural peaks of human <span className="text-foreground">imagination.</span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/50"></div>
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 px-8 glass-card rounded-[40px] border-white/5 relative overflow-hidden group">
                        <div className="relative z-10 text-center flex flex-col items-center">
                            <div className="mb-10 text-primary/40 group-hover:text-primary/60 transition-colors duration-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-20 w-20"
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

                            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tighter">
                                No <span className="highlight">prompts</span> found
                            </h2>
                            <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
                                Our gallery is waiting for its first spark.
                                Share your best AI masterpieces.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {prompts.map((prompt) => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
