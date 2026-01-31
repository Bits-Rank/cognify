
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"

export function AboutPage() {
    return (
        <div className="min-h-screen py-16 px-4">
            <div className="container mx-auto max-w-4xl text-center">
                <div className="flex justify-center mb-6">
                    <Logo className="h-16 w-16" />
                </div>
                <h1 className="text-5xl font-bold mb-6">About Cognify</h1>

                <div className="glass-card rounded-3xl p-8 md:p-12 mb-12 text-left">
                    <p className="text-xl leading-relaxed text-muted-foreground mb-6">
                        <span className="text-foreground font-semibold">Cognify</span> is a next-generation AI art community.
                        We believe that the future of creativity is collaborative.
                    </p>
                    <p className="text-lg text-muted-foreground mb-6">
                        Our platform is designed to help artists share not just their final creations, but the
                        <span className="text-primary font-medium"> exact recipes</span> (prompts) that created them.
                        Whether you use Midjourney, DALL-E, or Stable Diffusion, this is your home.
                    </p>
                    <p className="text-lg text-muted-foreground">
                        "Rovary" represents our commitment to constant discovery and recovery of lost creative potential.
                        Join us in exploring the infinite latent space.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass p-6 rounded-2xl">
                        <span className="text-4xl font-bold text-primary block mb-2">10k+</span>
                        <span className="text-muted-foreground">Curated Prompts</span>
                    </div>
                    <div className="glass p-6 rounded-2xl">
                        <span className="text-4xl font-bold text-primary block mb-2">50k+</span>
                        <span className="text-muted-foreground">Generations</span>
                    </div>
                    <div className="glass p-6 rounded-2xl">
                        <span className="text-4xl font-bold text-primary block mb-2">Free</span>
                        <span className="text-muted-foreground">Forever for Artists</span>
                    </div>
                </div>

                <Link to="/explore">
                    <Button size="lg" className="rounded-full px-12 py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                        Start Exploring
                    </Button>
                </Link>
            </div>
        </div>
    )
}
