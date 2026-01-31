import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowRight } from "lucide-react"

export function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
                {/* Header */}
                <div className="mb-16 max-w-3xl">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-border text-xs font-bold tracking-widest uppercase mb-6 bg-background">
                        Contact Support
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground">
                        Get in touch.
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                        Have questions, feedback, or need help with your account? We're here to help you get back to creating.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Contact Form Card */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-12 border border-border/50 shadow-sm relative overflow-hidden">
                        <form className="space-y-8 relative z-10" onSubmit={(e) => e.preventDefault()}>
                            <div className="space-y-4">
                                <Label htmlFor="name" className="text-base font-semibold">Name</Label>
                                <Input id="name" placeholder="Your name" className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors" />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors" />
                            </div>

                            <div className="space-y-4">
                                <Label htmlFor="message" className="text-base font-semibold">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="How can we help?"
                                    className="min-h-[200px] resize-none bg-background/50 border-border/50 focus:border-primary transition-colors p-4"
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12 text-base rounded-xl">
                                Send Message
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    {/* Additional Info / Direct Email */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-muted/30 rounded-[2rem] p-10 flex flex-col justify-center h-full border border-border/50">
                            <h3 className="text-2xl font-bold mb-4">Direct Email</h3>
                            <p className="text-muted-foreground mb-8 text-lg">
                                Prefer email? Reach out to us directly and we'll get back to you as soon as possible.
                            </p>
                            <a href="mailto:support@cognify.com" className="text-2xl font-bold text-primary hover:underline">
                                support@cognify.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
