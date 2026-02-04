
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
        <div className="min-h-screen py-12 px-4 mesh-gradient">
            <div className="container mx-auto max-w-6xl">
                <Link to="/explore" className="inline-flex items-center text-muted-foreground/60 hover:text-primary mb-10 transition-colors font-medium">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Gallery
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    {/* Image Section */}
                    <div className="space-y-8">
                        <div className="relative rounded-[40px] overflow-hidden glass-card border-white/5 shadow-2xl group">
                            <img
                                src={prompt.image}
                                alt={prompt.title}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex justify-between items-center p-6 glass-card rounded-[32px] border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 border border-white/10 flex items-center justify-center font-bold text-primary backdrop-blur-xl">
                                    {(prompt.authorDetails?.avatar || prompt.authorAvatar) ? (
                                        <img src={prompt.authorDetails?.avatar || prompt.authorAvatar} className="w-full h-full object-cover" alt={prompt.authorUsername} />
                                    ) : (
                                        <User className="h-6 w-6" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground/60 font-bold uppercase tracking-widest">Creator</p>
                                    <p className="font-bold text-lg">@{prompt.authorDetails?.username || prompt.authorUsername}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group/heart">
                                <Heart className="h-5 w-5 text-primary group-hover:fill-primary transition-all" />
                                <span className="font-bold">{prompt.likes}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-10">
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                {prompt.isPremium && (
                                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-primary/10 text-primary uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-xl">
                                        Premium Member
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground/60 font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(prompt.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter italic">
                                {prompt.title.split(' ').map((word, i) => i === 0 ? <span key={i}>{word} </span> : <span key={i} className="highlight">{word} </span>)}
                            </h1>

                            <div className="flex flex-wrap gap-3">
                                <span className="px-5 py-2 rounded-full glass-card text-xs font-bold border-white/5 flex items-center gap-2 tracking-wide uppercase">
                                    <Tag className="h-3.5 w-3.5 text-primary" />
                                    {prompt.category}
                                </span>
                                <span className="px-5 py-2 rounded-full glass-card text-xs font-bold border-white/5 flex items-center gap-2 tracking-wide uppercase">
                                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    {prompt.model}
                                </span>
                            </div>
                        </div>

                        <div className="glass-card rounded-[32px] p-8 border-white/5 relative group overflow-hidden shadow-none">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-[60px] -ml-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                            <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 font-black">Prompt Recipe</h3>
                            <div className="relative">
                                <p className="text-xl leading-relaxed text-foreground/80 font-medium font-mono min-h-[140px] italic">
                                    {prompt.prompt}
                                </p>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    size="lg"
                                    onClick={handleCopy}
                                    className="shimmer-effect rounded-full px-10 h-14 text-base font-black bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-[1.03] active:scale-95 shadow-none"
                                >
                                    {copied ? (
                                        <>Copied!</>
                                    ) : (
                                        <>
                                            <Copy className="h-5 w-5 mr-3" />
                                            Copy Prompt
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="glass-card rounded-[24px] p-8 border-white/5 shadow-none">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-6">Technical Schema</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 text-xs">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground/60 font-bold uppercase block tracking-widest">Model</span>
                                    <span className="text-foreground font-black text-sm">{prompt.model}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground/60 font-bold uppercase block tracking-widest">Width</span>
                                    <span className="text-foreground font-black text-sm">{prompt.width || 1024}px</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground/60 font-bold uppercase block tracking-widest">Height</span>
                                    <span className="text-foreground font-black text-sm">{prompt.height || 1024}px</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground/60 font-bold uppercase block tracking-widest">Steps</span>
                                    <span className="text-foreground font-black text-sm">{prompt.steps || 30}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground/60 font-bold uppercase block tracking-widest">CFG Scale</span>
                                    <span className="text-foreground font-black text-sm">{prompt.cfgScale || 7.0}</span>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <span className="text-muted-foreground/60 font-bold uppercase block tracking-widest">Seed</span>
                                    <span className="text-foreground font-black font-mono text-xs truncate max-w-full block">{prompt.seed || "Random"}</span>
                                </div>
                            </div>
                        </div>

                        {prompt.negativePrompt && (
                            <div className="glass-card rounded-[24px] p-8 border-red-500/10 shadow-none">
                                <h3 className="text-xs uppercase tracking-[0.3em] text-red-500/40 mb-4 font-black">Excluded Patterns</h3>
                                <p className="text-sm leading-relaxed text-red-500/60 font-mono italic">
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
