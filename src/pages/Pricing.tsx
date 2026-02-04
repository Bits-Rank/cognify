import { Button } from "@/components/ui/button";
import { Check, Mail } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

export function PricingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleAction = (plan: any) => {
        if (plan.comingSoon) return;
        if (user) {
            navigate('/explore');
        } else {
            navigate('/sign-in');
        }
    };

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
        <div className="min-h-screen py-24 px-4 mesh-gradient">
            <div className="container mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
                        Simple <span className="highlight">credits</span> for imagination
                    </h1>
                    <p className="text-lg text-muted-foreground/60 font-medium leading-relaxed px-8">
                        Get started for free or upgrade to a premium plan to unlock more generations and exclusive features.
                    </p>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-28">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col p-10 rounded-[40px] border transition-all duration-500 hover:scale-[1.02] ${plan.popular
                                ? 'border-primary/20 bg-primary/[0.02] shadow-none'
                                : 'border-white/5 bg-white/[0.01]'
                                } glass-card ${plan.comingSoon ? 'opacity-60' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background text-[10px] font-bold tracking-[0.2em] uppercase px-5 py-2 rounded-full shadow-2xl">
                                    Popular Choice
                                </div>
                            )}

                            <div className="mb-10">
                                <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-6">{plan.name}</h3>
                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className={`${plan.comingSoon ? 'text-4xl' : 'text-6xl'} font-bold tracking-tight`}>{plan.price}</span>
                                    {plan.period && (
                                        <span className="text-muted-foreground/40 text-sm font-semibold lowercase tracking-widest">/{plan.period}</span>
                                    )}
                                </div>
                                <p className="text-muted-foreground/60 text-sm mt-6 leading-relaxed font-medium min-h-[48px]">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-1 space-y-6 mb-12">
                                <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-4">Core Benefits</div>
                                <ul className="space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-4 group text-xs font-bold transition-all">
                                            <div className="rounded-full p-1 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background transition-colors duration-300">
                                                <Check className="h-3 w-3" strokeWidth={4} />
                                            </div>
                                            <span className="text-foreground/60 group-hover:text-foreground italic tracking-wide transition-colors">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={() => handleAction(plan)}
                                disabled={plan.comingSoon}
                                className={`w-full h-14 rounded-full text-base font-semibold transition-all shadow-none ${plan.popular
                                    ? 'bg-foreground text-background hover:bg-foreground/90'
                                    : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'
                                    } ${plan.comingSoon ? 'cursor-not-allowed hidden' : ''}`}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Custom Bundle Section */}
                <div className="glass-card rounded-[56px] p-12 lg:p-20 border-white/5 shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48 transition-all group-hover:bg-primary/10" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Need a <span className="highlight">custom</span> relay?</h2>
                            <p className="text-lg text-muted-foreground/60 leading-relaxed font-medium">
                                If you're rolling out Banana Prompts to a larger studio or need invoicing support,
                                we can help craft a plan with shared balances and dedicated onboarding.
                            </p>
                        </div>

                        <a
                            href="mailto:support@bananaprompts.xyz"
                            className="inline-flex items-center gap-4 px-10 h-14 rounded-full bg-foreground text-background font-bold text-base hover:scale-[1.02] active:scale-95 transition-all shadow-none"
                        >
                            <Mail className="h-5 w-5" />
                            Relay Support
                        </a>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-20 text-center text-muted-foreground/30 text-xs max-w-2xl mx-auto italic font-bold uppercase tracking-[0.2em] leading-loose">
                    Prompts are free to browse and share. Credits are used only when generating images. All prices in INR.
                </div>
            </div>
        </div>
    );
}
