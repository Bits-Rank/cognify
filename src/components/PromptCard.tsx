import { Link } from "react-router-dom"
import { useState } from "react"
import { Copy, Heart } from "lucide-react"
import { toast } from "react-toastify"
import type { Prompt } from "@/lib/data"

export function PromptCard({ prompt }: { prompt: Prompt }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (prompt.prompt) {
            navigator.clipboard.writeText(prompt.prompt)
            setCopied(true)
            toast.success("Prompt copied to clipboard!", { position: "bottom-center", theme: "dark" })
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Link to={`/prompt/${prompt.id}`} className="block h-full">
            <div className="group relative rounded-[32px] overflow-hidden glass-card hover-lift cursor-pointer h-full border-0 shadow-lg">
                {/* Image */}
                <div className="aspect-[4/5] relative w-full h-full">
                    <img
                        src={prompt.image}
                        alt={prompt.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Dark Gradient Overlay - Always visible for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                    {/* Top Section */}
                    <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 truncate max-w-[65%] shadow-sm">
                            {prompt.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-white bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                            <Heart className="h-3 w-3 fill-white/20" />
                            <span className="text-[10px] font-bold">{prompt.likes}</span>
                        </div>
                    </div>

                    {/* Middle/Bottom Content - Prompt Text */}
                    <div className="absolute inset-x-5 bottom-20 z-10 flex flex-col justify-end">
                        <p className="text-white/90 text-sm font-medium leading-relaxed line-clamp-4 tracking-wide dropshadow-md">
                            {prompt.prompt || "No prompt available"}
                        </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="absolute bottom-5 left-5 right-5 z-20 flex justify-between items-end">
                        {/* Left Action: Copy or Premium */}
                        {prompt.isPremium ? (
                            <div className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform active:scale-95">
                                <span className="text-[10px] font-black uppercase tracking-widest">Premium</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-95 hover:border-white/20 group/btn"
                            >
                                <Copy className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                    {copied ? "Copied" : "Copy"}
                                </span>
                            </button>
                        )}

                        {/* Right Action: Author */}
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-white/60 font-medium mb-0.5">by {prompt.authorUsername || "Unknown"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
