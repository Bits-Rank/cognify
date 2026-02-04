
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"

export function AboutPage() {
    return (
        <div className="min-h-screen py-20 px-4 mesh-gradient">
            <div className="container mx-auto max-w-4xl text-center">
                <div className="flex justify-center mb-8">
                    <div className="p-4 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl group hover:scale-110 transition-transform duration-500">
                        <Logo className="h-16 w-16" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-10 tracking-tight">About <span className="highlight">Cognify</span></h1>

                <div className="glass-card rounded-[40px] p-8 md:p-16 mb-16 text-left border-white/5 shadow-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />

                    <p className="text-xl leading-relaxed text-muted-foreground/80 mb-8 font-semibold">
                        <span className="highlight text-foreground">Cognify</span> is a next-generation AI art community.
                        We believe that the future of creativity is collaborative.
                    </p>
                    <p className="text-lg text-muted-foreground/60 mb-8 leading-relaxed">
                        Our platform is designed to help artists share not just their final creations, but the
                        <span className="highlight text-primary font-bold"> exact recipes</span> (prompts) that created them.
                        Whether you use Midjourney, DALL-E, or Stable Diffusion, this is your home.
                    </p>
                    <p className="text-lg text-muted-foreground/60 leading-relaxed border-l-2 border-primary/20 pl-6 py-2">
                        Cognify represents our commitment to constant discovery and recovery of lost creative potential.
                        Join us in exploring the infinite latent space.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="glass-card p-8 rounded-[32px] border-white/5">
                        <span className="text-4xl font-bold highlight block mb-3">10k+</span>
                        <span className="text-muted-foreground/60 font-semibold uppercase tracking-widest text-xs">Curated Prompts</span>
                    </div>
                    <div className="glass-card p-8 rounded-[32px] border-white/5">
                        <span className="text-4xl font-bold highlight block mb-3">50k+</span>
                        <span className="text-muted-foreground/60 font-semibold uppercase tracking-widest text-xs">Generations</span>
                    </div>
                    <div className="glass-card p-8 rounded-[32px] border-white/5">
                        <span className="text-4xl font-bold highlight block mb-3">Free</span>
                        <span className="text-muted-foreground/60 font-semibold uppercase tracking-widest text-xs">Forever for Artists</span>
                    </div>
                </div>

                <Link to="/explore">
                    <Button size="lg" className="rounded-full px-16 h-14 text-base font-bold bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.02] active:scale-95 transition-all shadow-none">
                        Start Exploring
                    </Button>
                </Link>
            </div>
        </div>
    )
}
