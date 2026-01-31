import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Loader2, Upload, HelpCircle, ImagePlus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createPrompt, logUserActivity } from "@/lib/db"
import { categories, aiModels } from "@/lib/data"
import { toast } from "react-toastify"
import type { Category, AIModel } from "@/lib/data"

// Wire connection component
const Wire = ({ from, to, color = "#666", version = 0 }: { from: string; to: string; color?: string; version?: number }) => {
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

            const x1 = fromRect.left + fromRect.width / 2 - containerRect.left
            const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
            const x2 = toRect.left + toRect.width / 2 - containerRect.left
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
    }, [from, to, version])

    if (!path) return null

    return (
        <path
            d={path}
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            className="transition-[stroke] duration-300"
            style={{ filter: `drop-shadow(0 0 4px ${color}40)`, pointerEvents: "none" }}
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
        // Prevent accidental text selection while dragging
        e.preventDefault()

        const startX = e.clientX - position.x
        const startY = e.clientY - position.y

        const handleMouseMove = (moveEvent: MouseEvent) => {
            onDrag(id, {
                x: moveEvent.clientX - startX,
                y: moveEvent.clientY - startY
            })
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
            className={`absolute rounded-xl overflow-visible border border-white/5 ${className} transition-[border-color,box-shadow] duration-300 hover:border-white/10 bg-zinc-900/40 backdrop-blur-md shadow-2xl z-10 w-64 lg:w-72`}
            style={{
                left: position.x,
                top: position.y,
                cursor: 'default',
                userSelect: 'none'
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                className={`px-4 py-2.5 flex items-center gap-2 rounded-t-xl cursor-grab active:cursor-grabbing`}
                style={{ backgroundColor: `${color}30`, borderBottom: `1px solid ${color}40` }}
            >
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="font-semibold text-[11px] tracking-wide uppercase text-white/90">{title}</span>
            </div>
            <div className="p-4">{children}</div>
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
        checkpoint: { x: 0, y: 100 },
        latent: { x: 0, y: 400 },
        positive: { x: 380, y: 50 },
        negative: { x: 380, y: 450 },
        save: { x: 760, y: 150 }
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
        const canvas = document.getElementById("node-canvas")
        const nodeEl = document.getElementById(id)
        if (!canvas || !nodeEl) return

        const canvasRect = canvas.getBoundingClientRect()
        const nodeRect = nodeEl.getBoundingClientRect()

        const clampedX = Math.max(0, Math.min(pos.x, canvasRect.width - nodeRect.width))
        const clampedY = Math.max(0, Math.min(pos.y, canvasRect.height - nodeRect.height))

        setNodePositions(prev => ({ ...prev, [id]: { x: clampedX, y: clampedY } }))
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
            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '10px 10px'
                }}
            />

            <h1 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                <Sparkles className="text-primary h-5 w-5" />
                Submit Workflow
            </h1>

            <div id="node-canvas" className="relative w-full mx-auto min-h-[1000px] border border-white/[0.03] rounded-3xl bg-white/[0.01]">
                {/* SVG Wires Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <Wire from="checkpoint-out-1" to="prompt-in-1" color="#a855f7" version={wireVersion} />
                    <Wire from="checkpoint-out-1" to="negative-in-1" color="#a855f7" version={wireVersion} />
                    <Wire from="checkpoint-out-0" to="save-in-0" color="#a855f7" version={wireVersion} />
                    <Wire from="prompt-out-0" to="save-in-1" color="#22c55e" version={wireVersion} />
                    <Wire from="negative-out-0" to="save-in-2" color="#ef4444" version={wireVersion} />
                    <Wire from="latent-out-0" to="save-in-3" color="#3b82f6" version={wireVersion} />
                </svg>

                <form onSubmit={handleSubmit} className="relative z-10 w-full h-full">
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
                                <select
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value as AIModel })}
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs outline-none focus:border-white/20 transition-colors"
                                >
                                    {aiModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <FieldLabel label="category" tooltip="The category helps users discover your prompt." />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs outline-none focus:border-white/20 transition-colors"
                                >
                                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
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
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/5 p-2 rounded border border-white/10">
                                    <FieldLabel label="width" tooltip="Image width in pixels." />
                                    <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold" />
                                </div>
                                <div className="bg-white/5 p-2 rounded border border-white/10">
                                    <FieldLabel label="height" tooltip="Image height in pixels." />
                                    <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold" />
                                </div>
                            </div>
                            <div className="bg-white/5 p-2 rounded border border-white/10 flex justify-between">
                                <span className="text-[9px] text-zinc-600">batch_size</span>
                                <span className="font-bold">1</span>
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
                                className="w-full h-32 bg-white/5 border border-white/10 resize-none p-3 text-sm outline-none rounded focus:border-white/20 transition-colors"
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
                                <div id="negative-in-1" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 8px #ef444480" }} />
                            </div>
                            <div className="absolute -right-6 top-8">
                                <div id="negative-out-0" className="w-3 h-3 rounded-full bg-red-500/40 border-2 border-red-500" style={{ boxShadow: "0 0 8px #ef444480" }} />
                            </div>
                            <textarea
                                value={formData.negativePrompt}
                                onChange={(e) => setFormData({ ...formData, negativePrompt: e.target.value })}
                                className="w-full h-32 bg-white/5 border border-white/10 resize-none p-3 text-sm outline-none rounded focus:border-white/20 transition-colors"
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
                            <div className="space-y-3">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video bg-black/40 rounded border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-teal-500/50 transition-colors group cursor-pointer relative"
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                                            <span className="text-[10px] text-zinc-400">Uploading...</span>
                                        </div>
                                    ) : formData.image ? (
                                        <>
                                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <ImagePlus className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="absolute top-2 right-2 bg-teal-500 rounded-full p-1">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <ImagePlus className="h-6 w-6 mx-auto mb-1 text-zinc-600 group-hover:text-teal-500 transition-colors" />
                                            <span className="text-[10px] text-zinc-600 group-hover:text-teal-500 transition-colors">Click to upload</span>
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

                                <input
                                    type="text"
                                    placeholder="Title..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-xs outline-none font-bold focus:border-white/20 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                                    className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all ${formData.isPremium
                                        ? 'bg-primary/20 border-primary/40'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className={`h-4 w-4 ${formData.isPremium ? 'text-primary' : 'text-zinc-500'}`} />
                                        <span className={`text-xs font-medium ${formData.isPremium ? 'text-primary' : 'text-zinc-400'}`}>
                                            Premium
                                        </span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${formData.isPremium ? 'bg-primary' : 'bg-white/10'}`}>
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
                </form>
            </div>
        </div>
    )
}
