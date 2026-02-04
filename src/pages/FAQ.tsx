import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQPage() {
    return (
        <div className="min-h-screen py-24 px-4 mesh-gradient">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-20 max-w-4xl">
                    <span className="inline-block px-5 py-2 rounded-full border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 bg-primary/5 text-primary backdrop-blur-xl">
                        Support Relay
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-10 text-foreground">
                        Common <span className="highlight">questions.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/60 leading-relaxed font-medium border-l-2 border-primary/20 pl-8">
                        Everything you need to know about prompt sharing, submitting to the gallery, and using Cognify.
                    </p>
                </div>

                <div className="glass-card rounded-[40px] border-white/5 shadow-none p-8 md:p-16 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000" />

                    <Accordion type="single" collapsible className="w-full relative z-10">
                        <AccordionItem value="item-1" className="border-b border-white/5 px-4 mb-4">
                            <AccordionTrigger className="text-lg md:text-xl font-bold py-8 hover:no-underline hover:text-primary transition-all tracking-tight text-left">What is Cognify?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground/60 text-base leading-relaxed pb-8 font-normal">
                                Cognify is a community-driven platform for sharing and discovering AI art prompts. Users can upload their AI-generated images along with the exact prompts and settings used to create them, helping others learn and get inspired.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-b border-white/5 px-4 mb-4">
                            <AccordionTrigger className="text-lg md:text-xl font-bold py-8 hover:no-underline hover:text-primary transition-all tracking-tight text-left">Is it free to use?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground/60 text-base leading-relaxed pb-8 font-normal">
                                Yes, browsing the gallery and submitting your own prompts is completely free. We believe in open knowledge sharing to advance the AI art community.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-b border-white/5 px-4 mb-4">
                            <AccordionTrigger className="text-lg md:text-xl font-bold py-8 hover:no-underline hover:text-primary transition-all tracking-tight text-left">How do I submit a prompt?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground/60 text-base leading-relaxed pb-8 font-normal">
                                While logged in, click on the "Submit" button in the navigation bar. You'll need to provide your generated image, the prompt text, and any specific model settings you used (like seed, steps, or CFG scale).
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-none px-4">
                            <AccordionTrigger className="text-lg md:text-xl font-bold py-8 hover:no-underline hover:text-primary transition-all tracking-tight text-left">Can I use the prompts for commercial work?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground/60 text-base leading-relaxed pb-8 font-normal">
                                Prompts shared on Cognify are intended for educational and inspirational purposes. While the prompts themselves are generally not copyrightable, please respect any specific usage terms requested by the original creator if noted.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}
