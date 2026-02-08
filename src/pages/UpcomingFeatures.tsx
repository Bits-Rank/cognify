
import React, { useEffect, useState } from 'react';
import { getUpcomingFeatures, subscribeToFeature, unsubscribeFromFeature, checkSubscriptionStatus, type UpcomingFeature } from '@/lib/db';
import { Loader2, Rocket, Calendar, CheckCircle2, CircleDashed, Clock, ArrowRight, Sparkles, X, Bell, BellOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'react-toastify';

export const UpcomingFeaturesPage = () => {
    const { user } = useAuth();
    const [features, setFeatures] = useState<UpcomingFeature[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<UpcomingFeature | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subLoading, setSubLoading] = useState(false);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const data = await getUpcomingFeatures();
                setFeatures(data);
            } catch (error) {
                console.error("Failed to fetch upcoming features", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatures();
    }, []);

    // Check subscription status when selectedFeature changes
    useEffect(() => {
        const checkStatus = async () => {
            if (selectedFeature && user) {
                try {
                    const status = await checkSubscriptionStatus(selectedFeature.id, user.id);
                    setIsSubscribed(status);
                } catch (error) {
                    console.error("Error checking subscription status", error);
                }
            } else {
                setIsSubscribed(false);
            }
        };
        checkStatus();
    }, [selectedFeature, user]);


    const handleSubscriptionToggle = async () => {
        if (!user) {
            toast.info("Please sign in to subscribe to notifications");
            return;
        }

        if (!selectedFeature) return;

        setSubLoading(true);
        try {
            if (isSubscribed) {
                await unsubscribeFromFeature(selectedFeature.id, user.id);
                setIsSubscribed(false);
                toast.success("Unsubscribed from updates for this feature");
            } else {
                await subscribeToFeature(selectedFeature.id, user.id, user.email || "");
                setIsSubscribed(true);
                toast.success("You'll be notified when this feature drops!");
            }
        } catch (error) {
            console.error("Error toggling subscription:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Completed':
                return { label: "Launched", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" };
            case 'In Progress':
                return { label: "In Progress", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
            default:
                return { label: "Planned", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" };
        }
    };

    const HeroFeature = ({ feature }: { feature: UpcomingFeature }) => {
        const status = getStatusConfig(feature.status);
        return (
            <div className="w-full bg-black text-white rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden group shadow-2xl">
                {/* Background Gradient/Mesh */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                    {/* Content Section */}
                    <div className="flex-1 space-y-6 text-left">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
                                {feature.title}
                            </h2>
                            <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
                                {feature.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex items-center gap-3 bg-white/5 rounded-full px-2 pr-4 py-2 border border-white/10 backdrop-blur-md">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Rocket className="h-4 w-4" />

                                </div>
                                <span className="text-sm font-medium">By Cognify Team</span>
                            </div>
                        </div>

                        {/* Status / CTA Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 mt-8 border-t border-white/10 w-full">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Status:</span>
                                <span className={cn("text-sm font-bold", status.color)}>{status.label}</span>
                            </div>

                            <Button
                                onClick={() => setSelectedFeature(feature)}
                                className="rounded-xl bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 transition-all hover:scale-105 active:scale-95"
                            >
                                View Details
                            </Button>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="flex-1 w-full max-w-xl">
                        <div className="aspect-[4/3] rounded-[2rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-700">
                            {feature.image ? (
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                    <Sparkles className="h-16 w-16 text-zinc-700" />
                                </div>
                            )}

                            {/* Floating Elements (Mock) */}
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {status.label}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ListItem = ({ feature }: { feature: UpcomingFeature }) => {
        const status = getStatusConfig(feature.status);

        return (
            <div className="group flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-8 p-4 rounded-[2rem] bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                {/* Image Thumbnail */}
                <div className="w-full md:w-32 h-32 md:h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 bg-muted relative">
                    {feature.image ? (
                        <img
                            src={feature.image}
                            alt={feature.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-muted-foreground/30" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <h3 className="text-xl font-bold truncate pr-4">{feature.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                            C
                        </div>
                        <span className="font-medium">Cognify Team</span>
                        {feature.createdAt && (
                            <>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="text-xs">{format(new Date(feature.createdAt), 'MMM d')}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center md:justify-end gap-6 mt-2 md:mt-0 border-t md:border-t-0 border-border/50 pt-4 md:pt-0">
                    <div className="flex flex-col items-start md:items-end gap-0.5 min-w-[100px]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</span>
                        <span className={cn("text-xs font-bold", status.color)}>{status.label}</span>
                    </div>

                    <Button
                        onClick={() => setSelectedFeature(feature)}
                        variant="default"
                        className="rounded-xl h-10 px-6 font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                    >
                        Details
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-8 sm:pt-12 px-4 sm:px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8 sm:mb-12">
                    <h1 className="text-3xl font-black tracking-tight">Upcoming Features</h1>
                    <div className="px-4 py-2 rounded-full bg-muted font-bold text-xs uppercase tracking-widest text-muted-foreground">
                        Roadmap
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium animate-pulse">Loading amazing things...</p>
                    </div>
                ) : features.length === 0 ? (
                    <div className="text-center py-40 rounded-[3rem] bg-muted/20 border border-dashed border-border/50">
                        <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
                            <Rocket className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Roadmap is empty</h2>
                        <p className="text-muted-foreground">Stay tuned for future updates!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Hero Section (First Item) */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <HeroFeature feature={features[0]} />
                        </div>

                        {/* List Section (Remaining Items) */}
                        {features.length > 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                <h2 className="text-xl font-bold pl-2">More Upcoming</h2>
                                <div className="grid gap-4">
                                    {features.slice(1).map((feature) => (
                                        <ListItem key={feature.id} feature={feature} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Feature Detail Dialog */}
                <Dialog open={!!selectedFeature} onOpenChange={(open) => !open && setSelectedFeature(null)}>
                    <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background border-none shadow-2xl">
                        {selectedFeature && (
                            <>
                                <div className="relative h-64 w-full">
                                    {selectedFeature.image ? (
                                        <img
                                            src={selectedFeature.image}
                                            alt={selectedFeature.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <Sparkles className="h-16 w-16 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                    <button
                                        onClick={() => setSelectedFeature(null)}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors z-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    <div className="absolute bottom-6 left-6 right-6 z-10">
                                        <Badge className={cn("mb-3 pointer-events-none", getStatusConfig(selectedFeature.status).bg, getStatusConfig(selectedFeature.status).color, "border-none backdrop-blur-md")}>
                                            {getStatusConfig(selectedFeature.status).label}
                                        </Badge>
                                        <DialogTitle className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
                                            {selectedFeature.title}
                                        </DialogTitle>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Added {selectedFeature.createdAt ? format(new Date(selectedFeature.createdAt), 'MMMM d, yyyy') : 'Recently'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                                                C
                                            </div>
                                            <span>Cognify Team</span>
                                        </div>
                                    </div>

                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="text-lg leading-relaxed text-muted-foreground">
                                            {selectedFeature.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 flex items-center justify-between border-t border-border/50">
                                        <Button variant="ghost" onClick={() => setSelectedFeature(null)}>
                                            Close
                                        </Button>
                                        <Button
                                            onClick={handleSubscriptionToggle}
                                            disabled={subLoading}
                                            className={cn(
                                                "font-bold gap-2 min-w-[140px] transition-all",
                                                isSubscribed
                                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                            )}
                                        >
                                            {subLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isSubscribed ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Subscribed
                                                </>
                                            ) : (
                                                <>
                                                    <Bell className="h-4 w-4" />
                                                    Notify Me
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
