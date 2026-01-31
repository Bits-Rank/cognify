export type SubscriptionTier = "free" | "pro" | "creator"

export interface SubscriptionPlan {
    id: SubscriptionTier
    name: string
    description: string
    monthlyPrice: number
    yearlyPrice: number
    features: string[]
    highlighted?: boolean
    promptsPerMonth: number | "unlimited"
    generationsPerMonth: number
    premiumAccess: boolean
}

export const subscriptionPlans: SubscriptionPlan[] = [
    {
        id: "free",
        name: "Free",
        description: "Perfect for exploring AI prompts",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: ["Browse free prompts", "10 image generations/month", "Basic prompt search", "Community support"],
        promptsPerMonth: 10,
        generationsPerMonth: 10,
        premiumAccess: false,
    },
    {
        id: "pro",
        name: "Pro",
        description: "For serious AI artists and creators",
        monthlyPrice: 12,
        yearlyPrice: 99,
        features: [
            "Unlimited free prompts",
            "Access all premium prompts",
            "100 image generations/month",
            "Advanced filters & search",
            "Download high-res images",
            "Priority support",
            "No watermarks",
        ],
        highlighted: true,
        promptsPerMonth: "unlimited",
        generationsPerMonth: 100,
        premiumAccess: true,
    },
    {
        id: "creator",
        name: "Creator",
        description: "For professionals monetizing their prompts",
        monthlyPrice: 29,
        yearlyPrice: 249,
        features: [
            "Everything in Pro",
            "Unlimited generations",
            "Sell your own prompts",
            "Creator analytics dashboard",
            "Revenue share (80/20)",
            "Verified creator badge",
            "API access",
            "Dedicated support",
        ],
        promptsPerMonth: "unlimited",
        generationsPerMonth: Number.POSITIVE_INFINITY,
        premiumAccess: true,
    },
]

export function getPlanById(id: SubscriptionTier): SubscriptionPlan | undefined {
    return subscriptionPlans.find((plan) => plan.id === id)
}
