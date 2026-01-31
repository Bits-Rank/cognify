
import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Copy, ArrowLeft, Heart, User, Calendar, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPromptById } from "@/lib/db"
import { toast } from "react-toastify"
import type { Prompt } from "@/lib/data"

export function PromptDetailPage() {
    const { id } = useParams()
    const [prompt, setPrompt] = useState<Prompt | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        async function loadPrompt() {
            if (id) {
                const data = await getPromptById(id)
                if (data) setPrompt(data)
            }
            setLoading(false)
        }
        loadPrompt()
    }, [id])

    const handleCopy = () => {
        if (prompt?.prompt) {
            navigator.clipboard.writeText(prompt.prompt)
            setCopied(true)
            toast.success("Prompt copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!prompt) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Prompt not found</h2>
                <Link to="/explore">
                    <Button>Return to Gallery</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                <Link to="/explore" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Gallery
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Section */}
                    <div className="space-y-6">
                        <div className="relative rounded-3xl overflow-hidden glass-card shadow-2xl group">
                            <img
                                src={prompt.image}
                                alt={prompt.title}
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex justify-between items-center p-4 glass rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created by</p>
                                    <p className="font-semibold">@{prompt.authorUsername}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full border border-white/5">
                                <Heart className="h-4 w-4 text-primary fill-primary/20" />
                                <span>{prompt.likes}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                {prompt.isPremium && (
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary uppercase tracking-wider border border-primary/20">
                                        Premium Prompt
                                    </span>
                                )}
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(prompt.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                                {prompt.title}
                            </h1>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="px-3 py-1 rounded-full bg-white/5 text-sm border border-white/10 flex items-center gap-2">
                                    <Tag className="h-3 w-3 text-primary" />
                                    {prompt.category}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/5 text-sm border border-white/10 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    {prompt.model}
                                </span>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl p-6 relative group border border-primary/20">
                            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Prompt</h3>
                            <div className="relative">
                                <p className="text-lg leading-relaxed text-foreground/90 font-medium font-mono min-h-[120px]">
                                    {prompt.prompt}
                                </p>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    size="lg"
                                    onClick={handleCopy}
                                    className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105"
                                >
                                    {copied ? (
                                        <>Copied!</>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Prompt
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="glass rounded-xl p-6">
                            <h3 className="tex-sm font-semibold mb-2">Technical Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                                <div>Model: <span className="text-foreground block">{prompt.model}</span></div>
                                <div>Width: <span className="text-foreground block">{prompt.width || 1024}px</span></div>
                                <div>Height: <span className="text-foreground block">{prompt.height || 1024}px</span></div>
                                <div>Steps: <span className="text-foreground block">{prompt.steps || 30}</span></div>
                                <div>CFG Scale: <span className="text-foreground block">{prompt.cfgScale || 7.0}</span></div>
                                <div>Seed: <span className="text-foreground block font-mono text-xs">{prompt.seed || "Random"}</span></div>
                                <div>Sampler: <span className="text-foreground block">{prompt.sampler || "Euler a"}</span></div>
                                <div>Scheduler: <span className="text-foreground block">{prompt.scheduler || "Normal"}</span></div>
                            </div>
                        </div>

                        {prompt.negativePrompt && (
                            <div className="glass-card rounded-2xl p-6 border border-red-500/10">
                                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 font-semibold text-red-400">Negative Prompt</h3>
                                <p className="text-sm leading-relaxed text-foreground/80 font-mono">
                                    {prompt.negativePrompt}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
