import { useEffect, useState } from "react"
import { getPrompts } from "@/lib/db"
import type { Prompt } from "@/lib/data"
import { PromptCard } from "@/components/PromptCard"

export function BrowsePage() {
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
        <div className="min-h-screen py-20 px-4 mesh-gradient">
            <div className="container mx-auto">
                <div className="mb-16 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic">Explore <span className="highlight">Gallery</span></h1>
                    <p className="text-xl text-muted-foreground/60 max-w-2xl mx-auto font-medium">Discover the best prompts from the community.</p>
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
