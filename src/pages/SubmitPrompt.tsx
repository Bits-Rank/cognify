import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Loader2, Upload, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createPrompt, logUserActivity } from "@/lib/db"
import { categories, aiModels } from "@/lib/data"
import { toast } from "react-toastify"
import type { Category, AIModel } from "@/lib/data"

// Wire connection component
const Wire = ({ from, to, color = "#666" }: { from: string; to: string; color?: string }) => {
    const [path, setPath] = useState("")

    useEffect(() => {
        const updatePath = () => {
            const fromEl = document.getElementById(from)
            const toEl = document.getElementById(to)
            if (!fromEl || !toEl) return

            const container = document.getElementById("node-canvas")
            if (!container) return

            const containerRect = container.getBoundingClientRect()
            const fromRect = fromEl.getBoundingClientRect()
            const toRect = toEl.getBoundingClientRect()

            const x1 = fromRect.right - containerRect.left
            const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
            const x2 = toRect.left - containerRect.left
            const y2 = toRect.top + toRect.height / 2 - containerRect.top

            // Bezier curve control points
            const cx1 = x1 + Math.abs(x2 - x1) * 0.5
            const cx2 = x2 - Math.abs(x2 - x1) * 0.5

            setPath(`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`)
        }

        updatePath()
        window.addEventListener("resize", updatePath)
        // Small delay to ensure DOM is ready
        const timer = setTimeout(updatePath, 100)

        return () => {
            window.removeEventListener("resize", updatePath)
            clearTimeout(timer)
        }
    }, [from, to])

    if (!path) return null

    return (
        <path
            d={path}
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
    )
}

// Tooltip component for field explanations
const Tooltip = ({ text }: { text: string }) => (
    <div className="group/tip relative inline-flex items-center ml-1">
        <HelpCircle className="h-3 w-3 text-zinc-600 hover:text-zinc-400 cursor-help transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-[11px] text-zinc-300 leading-relaxed w-64 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-600" />
        </div>
    </div>
)

// Field label with tooltip
const FieldLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <div className="flex items-center gap-1 mb-1">
        <span className="text-[10px] text-zinc-500 uppercase">{label}</span>
        <Tooltip text={tooltip} />
    </div>
)

// Node component - MUST be outside render function to prevent focus loss
const Node = ({ title, color, children, className = "" }: any) => (
    <div className={`rounded-xl overflow-visible shadow-2xl border border-white/10 ${className} relative transition-all duration-300 hover:border-white/20`}
        style={{ backgroundColor: "#1a1a1a" }}>
        <div className={`px-4 py-2.5 flex items-center gap-2 rounded-t-xl`} style={{ backgroundColor: color }}>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="font-semibold text-[11px] tracking-wide uppercase text-white/90">{title}</span>
        </div>
        <div className="p-4">{children}</div>
    </div>
)

export function SubmitPromptPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        category: "portraits" as Category,
        image: "",
        isPremium: false,
        prompt: "",
        negativePrompt: "",
        model: "midjourney" as AIModel,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000000),
        steps: 30,
        cfgScale: 7.0,
        sampler: "Euler a",
        scheduler: "Normal"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!formData.title || !formData.prompt || !formData.image) {
            toast.error("Please fill in all required fields (Title, Positive Prompt, Image URL)")
            return
        }

        setIsSubmitting(true)
        try {
            const newPromptId = await createPrompt({
                ...formData,
                author: user.name,
                authorUsername: (user as any).username || (user.email?.split('@')[0]) || "anonymous",
                authorAvatar: user.avatar || ""
            } as any, user)

            navigate(`/prompt/${newPromptId}`)
            logUserActivity(user.id, "prompt_create", `Created prompt: ${formData.title}`)
            toast.success("Your prompt has been submitted successfully!")
        } catch (error) {
            console.error("Error creating prompt:", error)
            toast.error("Failed to create prompt. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-4">Sign in to Submit</h2>
                <Button onClick={() => navigate("/sign-in")} size="lg" className="rounded-full px-8">
                    Sign In to Continue
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-zinc-200 p-6 font-mono text-sm">
            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            <h1 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                <Sparkles className="text-primary h-5 w-5" />
                Submit Workflow
            </h1>

            <div id="node-canvas" className="relative max-w-6xl mx-auto">
                {/* SVG Wires Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block" style={{ overflow: "visible" }}>
                    <Wire from="checkpoint-out-1" to="prompt-in-1" color="#a855f7" />
                    <Wire from="checkpoint-out-1" to="negative-in-1" color="#a855f7" />
                    <Wire from="checkpoint-out-0" to="ksampler-in-0" color="#a855f7" />
                    <Wire from="prompt-out-0" to="ksampler-in-1" color="#22c55e" />
                    <Wire from="negative-out-0" to="ksampler-in-2" color="#ef4444" />
                    <Wire from="latent-out-0" to="ksampler-in-3" color="#3b82f6" />
                    <Wire from="ksampler-out-0" to="save-in-0" color="#f97316" />
                </svg>

                <form onSubmit={handleSubmit} className="relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">

                        {/* Column 1 */}
                        <div className="space-y-8 lg:pt-16">
                            {/* Checkpoint Node */}
                            <Node title="Load Checkpoint" color="#581c87">
                                <div className="space-y-3 relative">
                                    <div className="absolute -right-6 top-4 space-y-4">
                                        <div id="checkpoint-out-0" className="w-3 h-3 rounded-full bg-purple-500/40 border-2 border-purple-500" style={{ boxShadow: "0 0 8px #a855f780" }} />
                                        <div id="checkpoint-out-1" className="w-3 h-3 rounded-full bg-purple-500/40 border-2 border-purple-500" style={{ boxShadow: "0 0 8px #a855f780" }} />
                                    </div>
                                    <div>
                                        <FieldLabel label="ckpt_name" tooltip="The AI model/checkpoint used to generate the image. Different models have different styles and capabilities." />
                                        <select
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value as AIModel })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs outline-none"
                                        >
                                            {aiModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <FieldLabel label="category" tooltip="The category helps users discover your prompt. Choose the one that best describes your image content." />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs outline-none"
                                        >
                                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </Node>

                            {/* Empty Latent Image Node */}
                            <Node title="Empty Latent Image" color="#1e3a5f">
                                <div className="space-y-3 relative">
                                    <div className="absolute -right-6 top-8">
                                        <div id="latent-out-0" className="w-3 h-3 rounded-full bg-blue-500/40 border-2 border-blue-500" style={{ boxShadow: "0 0 8px #3b82f680" }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                            <FieldLabel label="width" tooltip="Image width in pixels. Common sizes: 512, 768, 1024. Larger = more detail but slower generation." />
                                            <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold" />
                                        </div>
                                        <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                                            <FieldLabel label="height" tooltip="Image height in pixels. Square (1:1) or portrait/landscape ratios work best with most models." />
                                            <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold" />
                                        </div>
                                    </div>
                                    <div className="bg-zinc-900 p-2 rounded border border-zinc-800 flex justify-between">
                                        <span className="text-[9px] text-zinc-600">batch_size</span>
                                        <span className="font-bold">1</span>
                                    </div>
                                </div>
                            </Node>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-8 lg:pt-8">
                            {/* Positive Prompt Node */}
                            <Node title="CLIP Text Encode (Positive)" color="#14532d">
                                <div className="relative">
                                    <div className="absolute -left-6 top-8">
                                        <div id="prompt-in-1" className="w-3 h-3 rounded-full bg-green-500/40 border-2 border-green-500" style={{ boxShadow: "0 0 8px #22c55e80" }} />
                                    </div>
                                    <div className="absolute -right-6 top-8">
                                        <div id="prompt-out-0" className="w-3 h-3 rounded-full bg-green-500/40 border-2 border-green-500" style={{ boxShadow: "0 0 8px #22c55e80" }} />
                                    </div>
                                    <textarea
                                        value={formData.prompt}
                                        onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                        className="w-full h-32 bg-zinc-900 border border-zinc-800 resize-none p-3 text-sm outline-none rounded"
                                        placeholder="photorealistic, visionary portrait..."
                                    />
                                </div>
                            </Node>

                            {/* Negative Prompt Node */}
                            <Node title="CLIP Text Encode (Negative)" color="#7f1d1d">
                                <div className="relative">
                                    <div className="absolute -left-6 top-8">
                                        <div id="negative-in-1" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 8px #ef444480" }} />
                                    </div>
                                    <div className="absolute -right-6 top-8">
                                        <div id="negative-out-0" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 8px #ef444480" }} />
                                    </div>
                                    <textarea
                                        value={formData.negativePrompt}
                                        onChange={(e) => setFormData({ ...formData, negativePrompt: e.target.value })}
                                        className="w-full h-32 bg-zinc-900 border border-zinc-800 resize-none p-3 text-sm outline-none rounded"
                                        placeholder="ugly, boring, bad anatomy..."
                                    />
                                </div>
                            </Node>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-8">
                            {/* KSampler Node */}
                            <Node title="KSampler" color="#78350f">
                                <div className="relative">
                                    <div className="absolute -left-6 top-2 space-y-3">
                                        <div id="ksampler-in-0" className="w-3 h-3 rounded-full bg-orange-500/40 border-2 border-orange-500" style={{ boxShadow: "0 0 8px #f9731680" }} />
                                        <div id="ksampler-in-1" className="w-3 h-3 rounded-full bg-orange-500/40 border-2 border-orange-500" style={{ boxShadow: "0 0 8px #f9731680" }} />
                                        <div id="ksampler-in-2" className="w-3 h-3 rounded-full bg-orange-500/40 border-2 border-orange-500" style={{ boxShadow: "0 0 8px #f9731680" }} />
                                        <div id="ksampler-in-3" className="w-3 h-3 rounded-full bg-orange-500/40 border-2 border-orange-500" style={{ boxShadow: "0 0 8px #f9731680" }} />
                                    </div>
                                    <div className="absolute -right-6 top-12">
                                        <div id="ksampler-out-0" className="w-3 h-3 rounded-full bg-orange-500/40 border-2 border-orange-500" style={{ boxShadow: "0 0 8px #f9731680" }} />
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                                            <FieldLabel label="seed" tooltip="Random seed number. Same seed + same settings = same image. Use for reproducibility or set random for variety." />
                                            <input type="number" value={formData.seed} onChange={e => setFormData({ ...formData, seed: parseInt(e.target.value) })} className="bg-transparent w-28 text-right outline-none text-orange-300" />
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                                            <FieldLabel label="steps" tooltip="Number of denoising steps. More steps = higher quality but slower. 20-50 is typical." />
                                            <input type="number" value={formData.steps} onChange={e => setFormData({ ...formData, steps: parseInt(e.target.value) })} className="bg-transparent w-16 text-right outline-none" />
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                                            <FieldLabel label="cfg" tooltip="Classifier Free Guidance scale. Higher = follows prompt more strictly. 5-12 is typical. Too high can look artificial." />
                                            <input type="number" step="0.1" value={formData.cfgScale} onChange={e => setFormData({ ...formData, cfgScale: parseFloat(e.target.value) })} className="bg-transparent w-16 text-right outline-none" />
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                                            <FieldLabel label="sampler_name" tooltip="Algorithm used for denoising. Euler, DPM++, and DDIM are popular choices. Each gives slightly different results." />
                                            <input type="text" value={formData.sampler} onChange={e => setFormData({ ...formData, sampler: e.target.value })} className="bg-transparent w-24 text-right outline-none" />
                                        </div>
                                        <div className="flex justify-between items-center bg-zinc-900 p-2 rounded">
                                            <FieldLabel label="scheduler" tooltip="Controls how noise is reduced over steps. Normal, Karras, and Exponential are common. Affects smoothness and detail." />
                                            <input type="text" value={formData.scheduler} onChange={e => setFormData({ ...formData, scheduler: e.target.value })} className="bg-transparent w-24 text-right outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </Node>

                            {/* Save / Submit Node */}
                            <Node title="Save Image" color="#134e4a">
                                <div className="relative">
                                    <div className="absolute -left-6 top-20">
                                        <div id="save-in-0" className="w-3 h-3 rounded-full bg-teal-500/40 border-2 border-teal-500" style={{ boxShadow: "0 0 8px #14b8a680" }} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="aspect-video bg-black rounded border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden hover:border-teal-500/50 transition-colors">
                                            {formData.image ? (
                                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <Upload className="h-6 w-6 mx-auto mb-1 text-zinc-600" />
                                                    <span className="text-[10px] text-zinc-600">Preview</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="Image URL..."
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Title..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs outline-none font-bold"
                                        />
                                        {/* Premium Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                                            className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all ${formData.isPremium
                                                ? 'bg-primary/10 border-primary/50'
                                                : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Sparkles className={`h-4 w-4 ${formData.isPremium ? 'text-primary' : 'text-zinc-500'}`} />
                                                <span className={`text-xs font-medium ${formData.isPremium ? 'text-primary' : 'text-zinc-400'}`}>
                                                    Premium
                                                </span>
                                            </div>
                                            {/* Toggle Switch */}
                                            <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${formData.isPremium ? 'bg-primary' : 'bg-zinc-700'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.isPremium ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-primary hover:bg-primary/90 font-bold"
                                        >
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Queue Prompt"}
                                        </Button>
                                    </div>
                                </div>
                            </Node>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
