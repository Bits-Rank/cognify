import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";

export function PricingPage() {
    const plans = [
        {
            name: "Creator Pack",
            price: "Coming Soon",
            period: "",
            description: "More credits and advanced features for active creators.",
            features: [
                "150 images/mo",
                "100 video credits",
                "Prioritized support",
                "Save 17% per image",
                "No watermarks (Image & Video)",
                "Premium prompts included"
            ],
            buttonText: "Coming Soon",
            popular: false,
            comingSoon: true
        },
        {
            name: "Starter Pack",
            price: "Free",
            period: "forever",
            description: "Perfect for casual creators starting their journey.",
            features: [
                "5 free premium prompt",
                "Basic support",
                "No watermarks",
                "Community access",
                "Standard processing"
            ],
            buttonText: "Join for Free",
            popular: true,
            comingSoon: false
        },
        {
            name: "Pro Pack",
            price: "Coming Soon",
            period: "",
            description: "The ultimate power for professional studios.",
            features: [
                "400 images/mo",
                "600 video credits",
                "Prioritized support",
                "Save 25% per image",
                "No watermarks (Image & Video)",
                "Premium prompts included"
            ],
            buttonText: "Coming Soon",
            popular: false,
            comingSoon: true
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-20 max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Simple credits for image generation
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Get started for free or upgrade to a premium plan to unlock more generations and exclusive features.
                    </p>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-8 rounded-[2.5rem] border ${plan.popular
                                ? 'border-primary shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.3)] bg-primary/5'
                                : 'border-border bg-card/50'
                                } glass transition-all duration-300 hover:translate-y-[-8px] hover:shadow-2xl ${plan.comingSoon ? 'opacity-80' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-4">
                                    <span className={`${plan.comingSoon ? 'text-3xl' : 'text-5xl'} font-bold tracking-tight`}>{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-muted-foreground text-sm font-medium">/{plan.period}</span>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm mt-4 leading-relaxed font-medium min-h-[40px]">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-1 space-y-4 mb-10">
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">What's included</div>
                                <ul className="space-y-3.5">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 group text-sm font-medium">
                                            <div className="mt-1 rounded-full p-0.5 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <Check className="h-3 w-3" strokeWidth={3} />
                                            </div>
                                            <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                disabled={plan.comingSoon}
                                className={`w-full h-14 rounded-2xl text-base font-bold transition-all ${plan.popular
                                    ? 'bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border/50'
                                    } ${plan.comingSoon ? 'cursor-not-allowed grayscale' : ''}`}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Custom Bundle Section */}
                <div className="rounded-[3rem] p-12 lg:p-16 border border-border glass bg-secondary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all group-hover:bg-primary/10" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-xl text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-4">Need a custom bundle?</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                If you're rolling out Banana Prompts to a larger studio or need invoicing support,
                                we can help craft a plan with shared balances and dedicated onboarding.
                            </p>
                        </div>

                        <a
                            href="mailto:support@bananaprompts.xyz"
                            className="inline-flex items-center gap-3 px-8 h-16 rounded-2xl bg-foreground text-background font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                        >
                            <Mail className="h-5 w-5" />
                            Message our team
                        </a>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-16 text-center text-muted-foreground/60 text-sm max-w-2xl mx-auto italic font-medium">
                    Note: Prompts are free to browse and share. Credits are used only when generating images
                    (and future video features). All prices in INR. Taxes calculated at checkout.
                </div>
            </div>
        </div>
    );
}
