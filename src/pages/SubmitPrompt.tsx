import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Loader2, Upload, HelpCircle, ImagePlus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createPrompt, logUserActivity } from "@/lib/db"
import { categories, aiModels } from "@/lib/data"
import { toast } from "react-toastify"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Category, AIModel } from "@/lib/data"

// Wire connection component
const Wire = ({ from, to, color = "#666", version = 0 }: { from: string; to: string; color?: string; version?: number }) => {
    const [path, setPath] = useState("")

    useEffect(() => {
        let frameId: number;
        const updatePath = () => {
            frameId = requestAnimationFrame(() => {
                const fromEl = document.getElementById(from)
                const toEl = document.getElementById(to)
                if (!fromEl || !toEl) return

                const container = document.getElementById("node-canvas")
                if (!container) return

                const containerRect = container.getBoundingClientRect()
                const fromRect = fromEl.getBoundingClientRect()
                const toRect = toEl.getBoundingClientRect()

                const x1 = fromRect.left + fromRect.width / 2 - containerRect.left
                const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
                const x2 = toRect.left + toRect.width / 2 - containerRect.left
                const y2 = toRect.top + toRect.height / 2 - containerRect.top

                // Bezier curve control points
                const cx1 = x1 + Math.abs(x2 - x1) * 0.5
                const cx2 = x2 - Math.abs(x2 - x1) * 0.5

                setPath(`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`)
            })
        }

        updatePath()
        window.addEventListener("resize", updatePath)

        // Initial sync
        const timer = setTimeout(updatePath, 100)

        return () => {
            window.removeEventListener("resize", updatePath)
            clearTimeout(timer)
            cancelAnimationFrame(frameId)
        }
    }, [from, to, version])

    if (!path) return null

    return (
        <path
            d={path}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="transition-[stroke] duration-300"
            style={{
                filter: `drop-shadow(0 0 4px ${color}80)`,
                pointerEvents: "none",
                opacity: 0.6
            }}
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

const Node = ({ title, color, children, className = "", id, position, onDrag }: any) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        // Disable dragging on small screens
        if (window.innerWidth < 1024) return;

        // Prevent accidental text selection while dragging
        e.preventDefault()

        const canvas = document.getElementById("node-canvas")
        const nodeEl = document.getElementById(id)
        if (!canvas || !nodeEl) return

        const canvasRect = canvas.getBoundingClientRect()
        const nodeRect = nodeEl.getBoundingClientRect()

        const startX = e.clientX - position.x
        const startY = e.clientY - position.y

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newX = moveEvent.clientX - startX
            const newY = moveEvent.clientY - startY

            // Use cached rects for clamping
            const clampedX = Math.max(0, Math.min(newX, canvasRect.width - nodeRect.width))
            const clampedY = Math.max(0, Math.min(newY, canvasRect.height - nodeRect.height))

            onDrag(id, { x: clampedX, y: clampedY })
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div
            id={id}
            className={`rounded-[1.25rem] overflow-visible border border-white/10 ${className} hover:border-white/20 bg-zinc-900/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] z-10 w-[calc(100%-48px)] mx-auto lg:w-[320px] lg:absolute touch-none relative group/node`}
            style={{
                transform: window.innerWidth >= 1024 ? `translate3d(${position.x}px, ${position.y}px, 0)` : undefined,
                cursor: window.innerWidth >= 1024 ? 'default' : 'inherit',
                userSelect: 'none',
                willChange: 'transform'
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                className={`px-5 py-3 flex items-center justify-between rounded-t-[1.25rem] lg:cursor-grab active:lg:cursor-grabbing border-b border-white/5`}
                style={{
                    background: `linear-gradient(to bottom right, ${color}25, ${color}10)`,
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                    <span className="font-bold text-[10px] tracking-[0.1em] uppercase text-white/70">{title}</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                </div>
            </div>
            <div className="p-5">{children}</div>
        </div>
    )
}

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

    const [nodePositions, setNodePositions] = useState({
        checkpoint: { x: 20, y: 100 },
        latent: { x: 20, y: 400 },
        positive: { x: 360, y: 50 },
        negative: { x: 360, y: 450 },
        save: { x: 740, y: 150 }
    })
    const [wireVersion, setWireVersion] = useState(0)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file")
            return
        }

        setUploading(true)
        const toastId = toast.loading("Uploading image to Cloudinary...")

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', 'ml_default') // Default unsigned preset
            formData.append('folder', 'prompts')

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drksnjhgi'}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            const data = await response.json()

            if (data.secure_url) {
                setFormData(prev => ({ ...prev, image: data.secure_url }))
                toast.update(toastId, {
                    render: "Image uploaded successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                })
            } else {
                throw new Error(data.error?.message || "Upload failed")
            }
        } catch (error) {
            console.error("Cloudinary upload error:", error)
            toast.update(toastId, {
                render: "Failed to upload image. Please check your connection.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            })
        } finally {
            setUploading(false)
        }
    }

    const handleNodeDrag = (id: string, pos: { x: number, y: number }) => {
        setNodePositions(prev => ({ ...prev, [id]: pos }))
        setWireVersion(v => v + 1)
    }

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
                ...formData
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
        <div className="min-h-screen text-zinc-200 p-6 font-mono text-sm">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
            </div>

            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.015]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                }}
            />

            <div className="flex justify-center mb-12 relative z-10">
                <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-[0.15em] text-[10px] shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Submit Workflow
                </div>
            </div>

            <div className="relative w-full">
                <div id="node-canvas" className="relative w-full mx-auto min-h-[900px] lg:border lg:border-white/[0.03] lg:rounded-3xl lg:bg-white/[0.01] flex flex-col lg:block gap-12 py-8 lg:p-0">
                    {/* SVG Wires Layer */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                        <Wire from="checkpoint-out-1" to="prompt-in-1" color="#a855f7" version={wireVersion} />
                        <Wire from="checkpoint-out-1" to="negative-in-1" color="#a855f7" version={wireVersion} />
                        <Wire from="checkpoint-out-0" to="save-in-0" color="#a855f7" version={wireVersion} />
                        <Wire from="prompt-out-0" to="save-in-1" color="#22c55e" version={wireVersion} />
                        <Wire from="negative-out-0" to="save-in-2" color="#ef4444" version={wireVersion} />
                        <Wire from="latent-out-0" to="save-in-3" color="#3b82f6" version={wireVersion} />
                    </svg>

                    <form onSubmit={handleSubmit} className="relative z-10 w-full h-full flex flex-col lg:block gap-6">
                        {/* Checkpoint Node */}
                        <Node
                            id="checkpoint"
                            title="Load Checkpoint"
                            color="#581c87"
                            position={nodePositions.checkpoint}
                            onDrag={handleNodeDrag}
                        >
                            <div className="space-y-3 relative">
                                <div className="absolute -right-6 top-4 space-y-4">
                                    <div id="checkpoint-out-0" className="w-3 h-3 rounded-full bg-purple-500/40 border-2 border-purple-500" style={{ boxShadow: "0 0 8px #a855f780" }} />
                                    <div id="checkpoint-out-1" className="w-3 h-3 rounded-full bg-purple-500/40 border-2 border-purple-500" style={{ boxShadow: "0 0 8px #a855f780" }} />
                                </div>
                                <div>
                                    <FieldLabel label="ckpt_name" tooltip="The AI model/checkpoint used to generate the image." />
                                    <Select
                                        value={formData.model}
                                        onValueChange={(value) => setFormData({ ...formData, model: value as AIModel })}
                                    >
                                        <SelectTrigger className="w-full bg-black/20 border-white/10 rounded-lg h-10 text-xs hover:border-white/20 hover:bg-black/30 transition-all">
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/90 backdrop-blur-xl border-white/10 text-zinc-200">
                                            {aiModels.map(m => (
                                                <SelectItem key={m.value} value={m.value} className="text-xs focus:bg-primary/20 focus:text-white cursor-pointer py-2">
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel label="category" tooltip="The category helps users discover your prompt." />
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                                    >
                                        <SelectTrigger className="w-full bg-black/20 border-white/10 rounded-lg h-10 text-xs hover:border-white/20 hover:bg-black/30 transition-all">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900/90 backdrop-blur-xl border-white/10 text-zinc-200">
                                            {categories.map(c => (
                                                <SelectItem key={c.value} value={c.value} className="text-xs focus:bg-primary/20 focus:text-white cursor-pointer py-2">
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Node>

                        {/* Empty Latent Image Node */}
                        <Node
                            id="latent"
                            title="Empty Latent Image"
                            color="#1e3a5f"
                            position={nodePositions.latent}
                            onDrag={handleNodeDrag}
                        >
                            <div className="space-y-3 relative">
                                <div className="absolute -right-6 top-8">
                                    <div id="latent-out-0" className="w-3 h-3 rounded-full bg-blue-500/40 border-2 border-blue-500" style={{ boxShadow: "0 0 8px #3b82f680" }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/10 focus-within:border-blue-500/50 transition-all">
                                        <FieldLabel label="width" tooltip="Image width in pixels." />
                                        <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold text-white" />
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/10 focus-within:border-blue-500/50 transition-all">
                                        <FieldLabel label="height" tooltip="Image height in pixels." />
                                        <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold text-white" />
                                    </div>
                                </div>
                                <div className="bg-black/20 p-3 rounded-lg border border-white/10 flex justify-between items-center">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">batch_size</span>
                                    <span className="font-bold text-blue-400">1</span>
                                </div>
                            </div>
                        </Node>

                        {/* Positive Prompt Node */}
                        <Node
                            id="positive"
                            title="CLIP Text Encode (Positive)"
                            color="#14532d"
                            position={nodePositions.positive}
                            onDrag={handleNodeDrag}
                        >
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
                                    className="w-full h-32 bg-black/20 border border-white/10 resize-none p-4 text-sm outline-none rounded-lg focus:border-green-500/50 focus:bg-black/30 transition-all text-white placeholder:text-zinc-600"
                                    placeholder="photorealistic, visionary portrait..."
                                />
                            </div>
                        </Node>

                        {/* Negative Prompt Node */}
                        <Node
                            id="negative"
                            title="CLIP Text Encode (Negative)"
                            color="#7f1d1d"
                            position={nodePositions.negative}
                            onDrag={handleNodeDrag}
                        >
                            <div className="relative">
                                <div className="absolute -left-6 top-8">
                                    <div id="negative-in-1" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 10px #ef4444" }} />
                                </div>
                                <div className="absolute -right-6 top-8">
                                    <div id="negative-out-0" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 10px #ef4444" }} />
                                </div>
                                <textarea
                                    value={formData.negativePrompt}
                                    onChange={(e) => setFormData({ ...formData, negativePrompt: e.target.value })}
                                    className="w-full h-32 bg-black/20 border border-white/10 resize-none p-4 text-sm outline-none rounded-lg focus:border-red-500/50 focus:bg-black/30 transition-all text-white placeholder:text-zinc-600"
                                    placeholder="ugly, boring, bad anatomy..."
                                />
                            </div>
                        </Node>

                        {/* Save / Submit Node */}
                        <Node
                            id="save"
                            title="Save Image"
                            color="#134e4a"
                            position={nodePositions.save}
                            onDrag={handleNodeDrag}
                        >
                            <div className="relative">
                                <div className="absolute -left-6 top-4 space-y-4">
                                    <div id="save-in-0" className="w-3 h-3 rounded-full bg-purple-500/40 border-2 border-purple-500" style={{ boxShadow: "0 0 8px #a855f780" }} />
                                    <div id="save-in-1" className="w-3 h-3 rounded-full bg-green-500/40 border-2 border-green-500" style={{ boxShadow: "0 0 8px #22c55e80" }} />
                                    <div id="save-in-2" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 8px #ef444480" }} />
                                    <div id="save-in-3" className="w-3 h-3 rounded-full bg-blue-500/40 border-2 border-blue-500" style={{ boxShadow: "0 0 8px #3b82f680" }} />
                                </div>
                                <div className="space-y-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-video bg-black/40 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-teal-500/50 hover:bg-black/60 transition-all group cursor-pointer relative"
                                    >
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Uploading...</span>
                                            </div>
                                        ) : formData.image ? (
                                            <>
                                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                                                    <div className="bg-white/10 p-3 rounded-full border border-white/20">
                                                        <ImagePlus className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-3 right-3 bg-teal-500 text-white rounded-full p-1 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6 space-y-3 transition-transform group-hover:scale-110 duration-300">
                                                <div className="bg-white/5 p-4 rounded-full inline-block border border-white/5 group-hover:border-teal-500/30 group-hover:bg-teal-500/10 transition-all">
                                                    <ImagePlus className="h-8 w-8 text-zinc-600 group-hover:text-teal-500 transition-colors" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-zinc-500 group-hover:text-teal-500 transition-colors font-bold uppercase tracking-widest">Select Image</span>
                                                    <span className="text-[9px] text-zinc-600">JPG, PNG, WebP up to 10MB</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />

                                    <div className="space-y-3">
                                        <div className="bg-black/20 p-3 rounded-lg border border-white/10 focus-within:border-teal-500/50 transition-all">
                                            <FieldLabel label="image_title" tooltip="Give your masterpiece a name." />
                                            <input
                                                type="text"
                                                placeholder="Ethereal Landscapes..."
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-transparent outline-none font-bold text-sm text-white placeholder:text-zinc-700"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                                            className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all duration-300 ${formData.isPremium
                                                ? 'bg-primary/20 border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'
                                                : 'bg-black/20 border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${formData.isPremium ? 'bg-primary/20 text-primary' : 'bg-white/5 text-zinc-500'}`}>
                                                    <Sparkles className="h-4 w-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${formData.isPremium ? 'text-primary' : 'text-zinc-500'}`}>
                                                        Premium Mode
                                                    </div>
                                                    <div className="text-[9px] text-zinc-600">Exclusive feature list</div>
                                                </div>
                                            </div>
                                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isPremium ? 'bg-primary' : 'bg-white/10'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-lg transition-transform duration-300 ${formData.isPremium ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                        </button>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl ${isSubmitting
                                                ? 'bg-zinc-800'
                                                : 'bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-primary/20'
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Processing...</span>
                                                </div>
                                            ) : (
                                                "Queue Prompt"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Node>
                    </form>
                </div>
            </div>
        </div>
    )
}
