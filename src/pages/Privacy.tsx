import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function PrivacyPage() {
    return (
        <div className="min-h-screen py-24 px-4 mesh-gradient">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-20 max-w-4xl">
                    <span className="inline-block px-5 py-2 rounded-full border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 bg-primary/5 text-primary backdrop-blur-xl">
                        Protocol v1.2
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-10 text-foreground">
                        Your <span className="highlight">privacy</span> matters.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/60 leading-relaxed font-medium border-l-2 border-primary/20 pl-8 mb-10">
                        This Privacy Policy explains how Cognify collects, uses, and protects your personal information. We believe in transparency and giving you control over your data.
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                        Last Synchronized: October 12, 2025
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Information We Collect */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">Data Acquisition</h2>
                        <ul className="space-y-6 text-muted-foreground/80 relative z-10 font-medium">
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Account relay: email, username, and OAuth tokens</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Neural content: images, prompts, and metadata</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>usage harmonics: interactions and feature patterns</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Relay intel: browser, IP, and hardware schema</span>
                            </li>
                        </ul>
                    </div>

                    {/* How We Use Your Information */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">Usage Protocol</h2>
                        <ul className="space-y-6 text-muted-foreground/80 relative z-10 font-medium">
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Authentication and secure relay management</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Global gallery synchronization and display</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Vault security and abuse prevention</span>
                            </li>
                        </ul>
                    </div>

                    {/* Third-Party Services */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">External Nodes</h2>
                        <ul className="space-y-6 text-muted-foreground/80 relative z-10 font-medium">
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Supabase: Identity and neural database</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shadow-sm flex-shrink-0" />
                                <span>Cloudinary: Image relay and optimization</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us (Small) */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">Terminal</h2>
                        <p className="text-muted-foreground/60 mb-10 leading-relaxed font-medium">
                            If you have questions about this Privacy Policy or how we handle your data, please reach out via the secure channel.
                        </p>
                        <a href="mailto:support@cognify.xyz" className="inline-flex items-center px-8 h-10 rounded-full bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            support@cognify.xyz <ArrowRight className="ml-3 h-4 w-4" />
                        </a>
                    </div>

                </div>

                {/* Quick Summary (Wide) */}
                <div className="glass-card rounded-[40px] p-12 border-white/5 shadow-none mt-8 relative overflow-hidden">
                    <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-primary/40 mb-6">Relay Overview</h2>
                    <p className="text-lg text-muted-foreground/60 leading-relaxed font-medium">
                        We collect information necessary to operate Cognify and provide you with a great experience. Your submitted content is public, but we never sell your personal information. Questions? Contact us at support@cognify.xyz.
                    </p>
                </div>

            </div>
        </div>
    )
}
