import React, { useState, useEffect, useRef, useCallback, memo } from "react"
import { useNavigate } from "react-router-dom"
import { Sparkles, Loader2, Upload, HelpCircle, ImagePlus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { createPrompt, logUserActivity, getAiModels, getUserProfile } from "@/lib/db"
import { categories, aiModels as defaultAiModels } from "@/lib/data"
import { toast } from "react-toastify"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Category, AIModel } from "@/lib/data"
import { useTheme } from "@/components/ThemeProvider"

// Wire connection component
const Wire = memo(({ from, to, color = "#666", version = 0 }: { from: string; to: string; color?: string; version?: number }) => {
    const pathRef = useRef<SVGPathElement>(null)
    const { theme } = useTheme()
    const isDark = theme === "dark"

    useEffect(() => {
        const updatePath = () => {
            const fromEl = document.getElementById(from)
            const toEl = document.getElementById(to)
            const container = document.getElementById("node-canvas")
            const pathEl = pathRef.current

            if (!fromEl || !toEl || !container || !pathEl) return

            const containerRect = container.getBoundingClientRect()
            const fromRect = fromEl.getBoundingClientRect()
            const toRect = toEl.getBoundingClientRect()

            const x1 = fromRect.left + fromRect.width / 2 - containerRect.left
            const y1 = fromRect.top + fromRect.height / 2 - containerRect.top
            const x2 = toRect.left + toRect.width / 2 - containerRect.left
            const y2 = toRect.top + toRect.height / 2 - containerRect.top

            const cx1 = x1 + Math.abs(x2 - x1) * 0.5
            const cx2 = x2 - Math.abs(x2 - x1) * 0.5

            pathEl.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`)
        }

        updatePath()
        window.addEventListener("resize", updatePath)
        window.addEventListener("node-dragging", updatePath)
        const timer = setTimeout(updatePath, 50)

        return () => {
            window.removeEventListener("resize", updatePath)
            window.removeEventListener("node-dragging", updatePath)
            clearTimeout(timer)
        }
    }, [from, to, version])

    return (
        <path
            ref={pathRef}
            data-from={from}
            data-to={to}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{
                filter: isDark ? `drop-shadow(0 0 3px ${color}40)` : `none`,
                pointerEvents: "none",
                opacity: isDark ? 0.35 : 0.5,
                willChange: 'd'
            }}
        />
    )
})

// Tooltip component for field explanations
const Tooltip = ({ text }: { text: string }) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    return (
        <div className="group/tip relative inline-flex items-center ml-2">
            <HelpCircle className="h-3 w-3 text-muted-foreground/30 hover:text-primary cursor-help transition-colors" />
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 ${isDark ? 'bg-zinc-900 border-white/5 text-muted-foreground/80' : 'bg-white border-zinc-200 text-zinc-600 shadow-2xl'} border rounded-2xl text-[10px] font-bold leading-relaxed w-64 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-300 z-50 pointer-events-none backdrop-blur-xl`}>
                {text}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent ${isDark ? 'border-t-zinc-900' : 'border-t-white'}`} />
            </div>
        </div>
    )
}

const FieldLabel = ({ label, tooltip }: { label: string; tooltip: string }) => {
    return (
        <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">{label}</span>
            <Tooltip text={tooltip} />
        </div>
    )
}

const Node = memo(({ title, color, children, className = "", id, position, onDrag }: any) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const [isDragging, setIsDragging] = useState(false)
    const nodeRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (window.innerWidth < 1024) return;
        e.preventDefault()

        const canvas = document.getElementById("node-canvas")
        const nodeEl = nodeRef.current
        if (!canvas || !nodeEl) return

        setIsDragging(true)
        const canvasRect = canvas.getBoundingClientRect()
        const nodeRect = nodeEl.getBoundingClientRect()

        const startX = e.clientX - position.x
        const startY = e.clientY - position.y

        let currentX = position.x
        let currentY = position.y
        let frameId: number;

        document.body.classList.add('dragging-active')

        const connectedWires: { el: SVGPathElement, from: HTMLElement, to: HTMLElement, fromIsStorey: boolean, toIsStorey: boolean, staticRect?: DOMRect }[] = []
        const wires = document.querySelectorAll(`path[data-from^="${id}"], path[data-to^="${id}"]`)

        wires.forEach(wire => {
            const w = wire as SVGPathElement
            const fromId = w.getAttribute('data-from')!
            const toId = w.getAttribute('data-to')!
            const fEl = document.getElementById(fromId)
            const tEl = document.getElementById(toId)

            if (fEl && tEl) {
                const fIsMoving = fromId.startsWith(id)
                const tIsMoving = toId.startsWith(id)

                connectedWires.push({
                    el: w,
                    from: fEl,
                    to: tEl,
                    fromIsStorey: fIsMoving,
                    toIsStorey: tIsMoving,
                    staticRect: !fIsMoving ? fEl.getBoundingClientRect() : (!tIsMoving ? tEl.getBoundingClientRect() : undefined)
                })
            }
        })

        const handleMouseMove = (moveEvent: MouseEvent) => {
            cancelAnimationFrame(frameId)
            frameId = requestAnimationFrame(() => {
                const newX = moveEvent.clientX - startX
                const newY = moveEvent.clientY - startY

                currentX = Math.max(0, Math.min(newX, canvasRect.width - nodeRect.width))
                currentY = Math.max(0, Math.min(newY, canvasRect.height - nodeRect.height))

                if (nodeRef.current) {
                    nodeRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
                }

                for (let i = 0; i < connectedWires.length; i++) {
                    const { el, from, to, fromIsStorey, toIsStorey, staticRect } = connectedWires[i]
                    let x1, y1, x2, y2;
                    if (fromIsStorey) {
                        const fR = from.getBoundingClientRect()
                        x1 = fR.left + fR.width / 2 - canvasRect.left
                        y1 = fR.top + fR.height / 2 - canvasRect.top
                        const tR = staticRect || to.getBoundingClientRect()
                        x2 = tR.left + tR.width / 2 - canvasRect.left
                        y2 = tR.top + tR.height / 2 - canvasRect.top
                    } else {
                        const fR = staticRect || from.getBoundingClientRect()
                        x1 = fR.left + fR.width / 2 - canvasRect.left
                        y1 = fR.top + fR.height / 2 - canvasRect.top
                        const tR = to.getBoundingClientRect()
                        x2 = tR.left + tR.width / 2 - canvasRect.left
                        y2 = tR.top + tR.height / 2 - canvasRect.top
                    }
                    const cx1 = x1 + Math.abs(x2 - x1) * 0.5
                    const cx2 = x2 - Math.abs(x2 - x1) * 0.5
                    el.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`)
                }
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            document.body.classList.remove('dragging-active')
            cancelAnimationFrame(frameId)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            onDrag(id, { x: currentX, y: currentY })
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    return (
        <div
            id={id}
            ref={nodeRef}
            className={`rounded-[2.5rem] overflow-visible border-white/5 border glass-card ${className} ${isDragging ? 'z-50 scale-[1.01]' : 'z-10'} w-[calc(100%-48px)] mx-auto lg:w-[320px] lg:absolute touch-none relative group/node shadow-none`}
            style={{
                transform: window.innerWidth >= 1024 ? `translate3d(${position.x}px, ${position.y}px, 0)` : undefined,
                cursor: window.innerWidth >= 1024 ? (isDragging ? 'grabbing' : 'default') : 'inherit',
                userSelect: 'none',
                willChange: 'transform',
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            <div
                onMouseDown={handleMouseDown}
                className={`px-8 py-4 flex items-center justify-between rounded-t-[2.5rem] lg:cursor-grab active:lg:cursor-grabbing border-b border-white/5`}
                style={{
                    background: isDark
                        ? `linear-gradient(to bottom right, ${color}15, transparent)`
                        : `linear-gradient(to bottom right, ${color}10, transparent)`,
                }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]" style={{ backgroundColor: color }} />
                    <span className={`font-bold text-[9px] tracking-[0.2em] uppercase ${isDark ? 'text-white/40' : 'text-zinc-400'}`}>{title}</span>
                </div>
                <div className="flex gap-1.5 opacity-20">
                    <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                    <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                </div>
            </div>
            <div className="p-8">{children}</div>
        </div>
    )
})

export function SubmitPromptPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { theme } = useTheme()
    const isDark = theme === "dark"
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        category: "portraits" as Category,
        image: "",
        isPremium: false,
        prompt: "",
        negativePrompt: "",
        model: "midjourney" as any,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000000),
        steps: 30,
        cfgScale: 7.0,
        sampler: "Euler a",
        scheduler: "Normal"
    })

    const [availableModels, setAvailableModels] = useState<{ label: string; value: string }[]>([])
    const [loadingModels, setLoadingModels] = useState(true)

    // Check for user restriction on mount
    useEffect(() => {
        const checkRestriction = async () => {
            if (user?.id) {
                const profile = await getUserProfile(user.id)
                if (profile?.isBlocked) {
                    toast.error("Your account is restricted from creating new prompts.")
                    navigate('/')
                }
            }
        }
        checkRestriction()
    }, [user, navigate])

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await getAiModels()
                if (data.length > 0) {
                    setAvailableModels(data)
                    // If current model is not in new list, update it to the first one available
                    if (!data.some(m => m.value === formData.model)) {
                        setFormData(prev => ({ ...prev, model: data[0].value }))
                    }
                } else {
                    setAvailableModels(defaultAiModels)
                }
            } catch (error) {
                console.error("Failed to fetch models", error)
                setAvailableModels(defaultAiModels)
            } finally {
                setLoadingModels(false)
            }
        }
        fetchModels()
    }, [])

    const [nodePositions, setNodePositions] = useState({
        checkpoint: { x: 20, y: 100 },
        latent: { x: 20, y: 400 },
        positive: { x: 360, y: 50 },
        negative: { x: 360, y: 450 },
        save: { x: 740, y: 150 }
    })
    const [wireVersion, setWireVersion] = useState(0)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file")
            return
        }

        setSelectedFile(file)
        // Store a local preview URL in formData.image for instant feedback
        const previewUrl = URL.createObjectURL(file)
        setFormData(prev => ({ ...prev, image: previewUrl }))
    }

    // Actual Cloudinary upload logic moved to a helper
    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'ml_default')
        formData.append('folder', 'prompts')

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'drksnjhgi'}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        )

        const data = await response.json()
        if (data.secure_url) return data.secure_url
        throw new Error(data.error?.message || "Upload failed")
    }

    const handleNodeDrag = useCallback((id: string, pos: { x: number, y: number }) => {
        setNodePositions(prev => ({ ...prev, [id]: pos }))
    }, [])

    // Clipboard Paste Support
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items
            if (!items) return

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const file = items[i].getAsFile()
                    if (file) {
                        setSelectedFile(file)
                        const previewUrl = URL.createObjectURL(file)
                        setFormData(prev => ({ ...prev, image: previewUrl }))
                        toast.success("Image pasted from clipboard")
                    }
                }
            }
        }

        window.addEventListener("paste", handlePaste)
        return () => window.removeEventListener("paste", handlePaste)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!formData.title || !formData.prompt || !formData.image) {
            toast.error("Please fill in all required fields (Title, Positive Prompt, Image)")
            return
        }

        setIsSubmitting(true)
        const toastId = toast.loading("Finalizing your workflow...")

        try {
            // Final restriction check before upload
            const profile = await getUserProfile(user.id || (user as any).uid)
            if (profile?.isBlocked) {
                toast.dismiss(toastId)
                toast.error("Account restricted. Submission aborted.")
                setIsSubmitting(false)
                navigate('/')
                return
            }

            let finalImageId = formData.image

            // Only upload to Cloudinary if we have a new local file selected
            if (selectedFile) {
                toast.update(toastId, { render: "Uploading image to Cloudinary..." })
                finalImageId = await uploadToCloudinary(selectedFile)
            }

            toast.update(toastId, { render: "Saving to database..." })
            const newPromptId = await createPrompt({
                ...formData,
                image: finalImageId // Ensure we use the remote URL
            } as any, user)

            toast.update(toastId, {
                render: "Your prompt has been submitted successfully!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            })

            navigate(`/prompt/${newPromptId}`)
            logUserActivity(user.id, "prompt_create", `Created prompt: ${formData.title}`)
        } catch (error: any) {
            console.error("Submission error:", error)
            toast.update(toastId, {
                render: error.message || "Failed to submit. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 3000
            })
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
        <div className={`min-h-screen ${isDark ? 'text-zinc-200' : 'text-zinc-800'} py-20 px-6 font-mono text-sm mesh-gradient overflow-x-hidden`}>
            {/* Global Performance Overrides during Drag */}
            <style dangerouslySetInnerHTML={{
                __html: `
                body.dragging-active * {
                    pointer-events: none !important;
                    transition: none !important;
                    animation-play-state: paused !important;
                }
                body.dragging-active #node-canvas * {
                    pointer-events: auto !important;
                }
                body.dragging-active .backdrop-blur-xl,
                body.dragging-active .backdrop-blur-sm,
                body.dragging-active .glass-card {
                    backdrop-filter: none !important;
                    background-color: ${isDark ? 'rgba(10, 10, 12, 0.98)' : 'rgba(255, 255, 255, 0.98)'} !important;
                    border-color: rgba(255,255,255,0.02) !important;
                }
                body.dragging-active .shadow-xl,
                body.dragging-active .shadow-2xl {
                    box-shadow: none !important;
                }
                body.dragging-active path {
                    filter: none !important;
                    opacity: 0.15 !important;
                }
            `}} />

            <div className="flex justify-center mb-16 relative z-10">
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Submit <span className="highlight">Workflow</span></h1>
                    <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-[0.2em] text-[10px] backdrop-blur-xl group hover:scale-105 transition-all">
                        <Sparkles className="h-4 w-4" />
                        Relay Node Protocol
                    </div>
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
                                        onValueChange={(value) => setFormData({ ...formData, model: value })}
                                    >
                                        <SelectTrigger className={`w-full ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-800'} rounded-lg h-10 text-xs hover:border-primary/30 transition-all`}>
                                            <SelectValue placeholder={loadingModels ? "Connecting..." : "Select model"} />
                                        </SelectTrigger>
                                        <SelectContent className={`${isDark ? 'bg-zinc-900/90 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'} backdrop-blur-xl`}>
                                            {loadingModels ? (
                                                <div className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 animate-pulse">Syncing models...</div>
                                            ) : (
                                                availableModels.map(m => (
                                                    <SelectItem key={m.value} value={m.value} className="text-xs focus:bg-primary/20 focus:text-primary cursor-pointer py-2">
                                                        {m.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <FieldLabel label="category" tooltip="The category helps users discover your prompt." />
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
                                    >
                                        <SelectTrigger className={`w-full ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-800'} rounded-lg h-10 text-xs hover:border-primary/30 transition-all`}>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className={`${isDark ? 'bg-zinc-900/90 border-white/10 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'} backdrop-blur-xl`}>
                                            {categories.map(c => (
                                                <SelectItem key={c.value} value={c.value} className="text-xs focus:bg-primary/20 focus:text-primary cursor-pointer py-2">
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
                                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/10 focus-within:border-blue-500/50' : 'bg-zinc-100 border-zinc-200 focus-within:border-blue-500/50'} transition-all`}>
                                        <FieldLabel label="width" tooltip="Image width in pixels." />
                                        <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold text-inherit" />
                                    </div>
                                    <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/10 focus-within:border-blue-500/50' : 'bg-zinc-100 border-zinc-200 focus-within:border-blue-500/50'} transition-all`}>
                                        <FieldLabel label="height" tooltip="Image height in pixels." />
                                        <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: parseInt(e.target.value) })} className="bg-transparent w-full outline-none text-sm font-bold text-inherit" />
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/10' : 'bg-zinc-100 border-zinc-200'} flex justify-between items-center`}>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">batch_size</span>
                                    <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>1</span>
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
                                    className={`w-full h-32 ${isDark ? 'bg-black/20 border-white/10 focus:border-green-500/50 placeholder:text-zinc-600' : 'bg-zinc-100 border-zinc-200 focus:border-green-500/30 placeholder:text-zinc-400'} border resize-none p-4 text-sm outline-none rounded-lg transition-all text-inherit`}
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
                                    className={`w-full h-32 ${isDark ? 'bg-black/20 border-white/10 focus:border-red-500/50 placeholder:text-zinc-600' : 'bg-zinc-100 border-zinc-200 focus:border-red-500/30 placeholder:text-zinc-400'} border resize-none p-4 text-sm outline-none rounded-lg transition-all text-inherit`}
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
                                        className={`aspect-video rounded-lg border-2 border-dashed ${isDark ? 'bg-black/40 border-white/10 hover:border-teal-500/50 hover:bg-black/60' : 'bg-zinc-100 border-zinc-200 hover:border-teal-500/40 hover:bg-zinc-200/50'} flex items-center justify-center overflow-hidden transition-all group cursor-pointer relative`}
                                    >
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                                                <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'} font-bold uppercase tracking-widest`}>Uploading...</span>
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
                                                <div className={`${isDark ? 'bg-white/5 border-white/5 group-hover:bg-teal-500/10' : 'bg-white border-zinc-200 group-hover:bg-teal-500/5'} p-4 rounded-full inline-block border group-hover:border-teal-500/30 transition-all`}>
                                                    <ImagePlus className={`h-8 w-8 ${isDark ? 'text-zinc-600' : 'text-zinc-400'} group-hover:text-teal-500 transition-colors`} />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'} group-hover:text-teal-500 transition-colors font-bold uppercase tracking-widest`}>Select Image</span>
                                                    <span className="text-[9px] text-zinc-400">JPG, PNG, WebP up to 10MB</span>
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

                                    <div className="space-y-4">
                                        <div className={`p-5 rounded-3xl border ${isDark ? 'bg-white/[0.01] border-white/5 focus-within:border-teal-500/30' : 'bg-zinc-50 border-zinc-200 focus-within:border-teal-500/20'} transition-all`}>
                                            <FieldLabel label="image_title" tooltip="Give your masterpiece a name." />
                                            <input
                                                type="text"
                                                placeholder="Ethereal Landscapes..."
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className={`w-full bg-transparent outline-none font-semibold text-base text-inherit ${isDark ? 'placeholder:text-zinc-800' : 'placeholder:text-zinc-300'}`}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, isPremium: !formData.isPremium })}
                                            className={`flex items-center justify-between w-full p-5 rounded-[2rem] border transition-all duration-500 ${formData.isPremium
                                                ? isDark ? 'border-primary/20 bg-primary/5' : 'bg-primary/5 border-primary/20'
                                                : isDark ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                                                } glass-card shadow-none`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-xl ${formData.isPremium ? 'bg-primary/20 text-primary' : isDark ? 'bg-white/5 text-zinc-600' : 'bg-white text-zinc-400 border border-zinc-100'}`}>
                                                    <Sparkles className="h-5 w-5" />
                                                </div>
                                                <div className="text-left">
                                                    <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${formData.isPremium ? 'text-primary' : 'text-zinc-500'}`}>
                                                        Premium Mode
                                                    </div>
                                                    <div className="text-[9px] text-muted-foreground/40 font-semibold uppercase tracking-widest mt-0.5">Relay Status</div>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-7 rounded-full p-1.5 transition-colors duration-500 ${formData.isPremium ? 'bg-primary' : isDark ? 'bg-white/10' : 'bg-zinc-200'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-500 ${formData.isPremium ? 'translate-x-5 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'translate-x-0'}`} />
                                            </div>
                                        </button>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full h-14 rounded-full font-semibold text-base transition-all duration-500 shadow-none ${isSubmitting
                                                ? 'bg-zinc-900 border-white/5 opacity-50'
                                                : 'bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.01] active:scale-95'
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span className="tracking-tight">Initializing...</span>
                                                </div>
                                            ) : (
                                                <span className="tracking-tight">Queue Relay</span>
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
