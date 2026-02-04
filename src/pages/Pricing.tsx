import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PricingPage() {
    const plans = [
        {
            name: "Starter",
            price: "Free",
            description: "Perfect for exploring AI art",
            features: ["10 Free generations/day", "Basic support", "Community access"],
            buttonText: "Get Started",
            popular: false
        },
        {
            name: "Pro",
            price: "$19/mo",
            description: "For serious creators",
            features: ["Unlimited generations", "Priority support", "Early access to features", "No watermarks"],
            buttonText: "Go Pro",
            popular: true
        },
        {
            name: "Team",
            price: "$49/mo",
            description: "Scale your creative team",
            features: ["Shared workspace", "Team analytics", "API access", "Manager support"],
            buttonText: "Contact Sales",
            popular: false
        }
    ];

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground text-lg">Choose the plan that fits your creative journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`flex flex-col p-8 rounded-3xl border ${plan.popular ? 'border-primary ring-1 ring-primary' : 'border-border'
                            } bg-card transition-all hover:scale-[1.02]`}
                    >
                        {plan.popular && (
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full self-start mb-4">
                                MOST POPULAR
                            </span>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            {plan.price !== "Free" && <span className="text-muted-foreground">/mo</span>}
                        </div>
                        <p className="text-muted-foreground mb-8">{plan.description}</p>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button className="w-full rounded-xl" variant={plan.popular ? "default" : "outline"}>
                            {plan.buttonText}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
