import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

export function ContactPage() {
    return (
        <div className="min-h-screen py-24 px-4 mesh-gradient overflow-x-hidden">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-20 max-w-4xl">
                    <span className="inline-block px-5 py-2 rounded-full border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 bg-primary/5 text-primary backdrop-blur-xl">
                        Relay Terminal
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-10 text-foreground">
                        Get in <span className="highlight">touch.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/60 leading-relaxed font-medium border-l-2 border-primary/20 pl-8">
                        Have questions, feedback, or need help with your account? We're here to help you get back to creating.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form Card */}
                    <div className="glass-card rounded-[40px] p-10 md:p-16 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000" />

                        <form className="space-y-10 relative z-10" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Identity Name</Label>
                                <Input id="name" placeholder="Your name" className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800" />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Relay Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800" />
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Transmission</Label>
                                <Textarea
                                    id="message"
                                    placeholder="How can we help?"
                                    className="min-h-[220px] rounded-[32px] resize-none bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all p-6 text-sm font-semibold placeholder:text-zinc-800"
                                />
                            </div>

                            <Button type="submit" className="w-full h-14 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.01] active:scale-95 transition-all shadow-none tracking-tight">
                                Send Transmission
                                <ArrowRight className="ml-3 h-5 w-5" />
                            </Button>
                        </form>
                    </div>

                    {/* Additional Info / Direct Email */}
                    <div className="flex flex-col gap-8 justify-center">
                        <div className="glass-card rounded-[40px] p-12 md:p-16 flex flex-col justify-center border-white/5 shadow-none group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />

                            <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">Secure Relay</h3>
                            <p className="text-muted-foreground/60 mb-12 text-lg font-medium leading-relaxed relative z-10">
                                Prefer direct communication? Reach out to our neural support team and we'll get back to you as soon as the signal is clear.
                            </p>
                            <a href="mailto:support@cognify.xyz" className="text-2xl font-bold text-foreground hover:text-primary transition-colors tracking-tight relative z-10 highlight self-start pb-2">
                                support@cognify.xyz
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
