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
        <div className="min-h-screen py-12 px-4">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-2">Explore Gallery</h1>
                <p className="text-muted-foreground mb-8">Discover the best prompts from the community.</p>

                {loading ? (
                    <div className="flex justify-center py-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-border">
                        <p className="text-xl mb-2">No prompts found</p>
                        <p>Be the first to create a prompt!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {prompts.map((prompt) => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
