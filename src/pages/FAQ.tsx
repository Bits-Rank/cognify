import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
                {/* Header */}
                <div className="mb-16 max-w-3xl">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-border text-xs font-bold tracking-widest uppercase mb-6 bg-background">
                        FAQ
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground">
                        Common questions.
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                        Everything you need to know about prompt sharing, submitting to the gallery, and using Cognify.
                    </p>
                </div>

                <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm p-8 md:p-12">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b-border/50 px-4">
                            <AccordionTrigger className="text-lg md:text-xl font-medium py-6 hover:no-underline hover:text-primary transition-colors">What is Cognify?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                Cognify is a community-driven platform for sharing and discovering AI art prompts. Users can upload their AI-generated images along with the exact prompts and settings used to create them, helping others learn and get inspired.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-b-border/50 px-4">
                            <AccordionTrigger className="text-lg md:text-xl font-medium py-6 hover:no-underline hover:text-primary transition-colors">Is it free to use?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                Yes, browsing the gallery and submitting your own prompts is completely free. We believe in open knowledge sharing to advance the AI art community.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-b-border/50 px-4">
                            <AccordionTrigger className="text-lg md:text-xl font-medium py-6 hover:no-underline hover:text-primary transition-colors">How do I submit a prompt?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                While logged in, click on the "Submit" button in the navigation bar. You'll need to provide your generated image, the prompt text, and any specific model settings you used (like seed, steps, or CFG scale).
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-b-0 px-4">
                            <AccordionTrigger className="text-lg md:text-xl font-medium py-6 hover:no-underline hover:text-primary transition-colors">Can I use the prompts for commercial work?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                                Prompts shared on Cognify are intended for educational and inspirational purposes. While the prompts themselves are generally not copyrightable, please respect any specific usage terms requested by the original creator if noted.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}
