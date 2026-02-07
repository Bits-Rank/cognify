export interface Prompt {
    id: string
    title: string
    image: string
    likes: number
    author: string
    authorUsername: string
    authorAvatar?: string
    authorDetails?: {
        id: string
        name: string
        username: string
        avatar?: string
    }
    prompt?: string
    negativePrompt?: string
    steps?: number
    cfgScale?: number
    seed?: number
    sampler?: string
    scheduler?: string
    width?: number
    height?: number
    isPremium: boolean
    category: Category
    model: AIModel
    createdAt: string
    views: number
    downloads: number
    comments: Comment[]
    isHidden?: boolean
    authorId?: string
    likedBy?: string[]
}

export interface Comment {
    id: string
    author: string
    authorAvatar?: string
    content: string
    createdAt: string
    likes: number
}

export type ActivityAction =
    | "login"
    | "profile_update"
    | "security_update"
    | "socials_update"
    | "prompt_create"
    | "other"

export interface ActivityLog {
    id: string
    action: ActivityAction
    details: string
    ip?: string
    device?: string
    createdAt: string
}

export interface User {
    id: string
    username: string
    displayName: string
    avatar?: string
    bio?: string
    website?: string
    twitter?: string
    instagram?: string
    followers: number
    following: number
    totalLikes: number
    promptsCount: number
    joinedAt: string
    isVerified: boolean
    isPremiumCreator: boolean
    // Auth/Settings fields compatibility
    name?: string
    email?: string
    subscription?: string
    slogan?: string
    location?: string
    socials?: {
        website?: string
        ui8?: string
        dribbble?: string
        behance?: string
        instagram?: string
        threads?: string
        facebook?: string
        linkedin?: string
    }
    isTwoFactorEnabled?: boolean
    twoFactorSecret?: string
    isBlocked?: boolean
    promptsUnlocked?: string[]
    generationsUsed?: number
    followerIds?: string[]
    followingIds?: string[]
    followersCount?: number
    followingCount?: number
    likedPrompts?: string[]
}

export type Category =
    | "portraits"
    | "landscapes"
    | "abstract"
    | "fantasy"
    | "sci-fi"
    | "architecture"
    | "animals"
    | "fashion"
    | "food"
    | "other"

export type AIModel =
    | "midjourney"
    | "dalle-3"
    | "stable-diffusion"
    | "flux"
    | "leonardo"
    | "ideogram"
    | "firefly"
    | "claude-3-5"
    | "gpt-4o"
    | "sdxl"
    | "sd-3"
    | "playground"
    | "krea"
    | "magnific"
    | "sana"
    | "gemini-1-5-pro"
    | "gemini-1-5-flash"
    | "grok-1"
    | "grok-2"
    | "gpt-4-turbo"
    | "gpt-3-5-turbo"
    | "o1-preview"
    | "other"

export const categories: { value: Category; label: string }[] = [
    { value: "portraits", label: "Portraits" },
    { value: "landscapes", label: "Landscapes" },
    { value: "abstract", label: "Abstract" },
    { value: "fantasy", label: "Fantasy" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "architecture", label: "Architecture" },
    { value: "animals", label: "Animals" },
    { value: "fashion", label: "Fashion" },
    { value: "food", label: "Food" },
    { value: "other", label: "Other" },
]

export const aiModels: { value: AIModel; label: string }[] = [
    { value: "midjourney", label: "Midjourney" },
    { value: "dalle-3", label: "DALL·E 3" },
    { value: "stable-diffusion", label: "Stable Diffusion" },
    { value: "flux", label: "Flux" },
    { value: "leonardo", label: "Leonardo AI" },
    { value: "ideogram", label: "Ideogram" },
    { value: "firefly", label: "Adobe Firefly" },
    { value: "claude-3-5", label: "Claude 3.5 Sonnet" },
    { value: "gpt-4o", label: "GPT-4o (DALL·E 3)" },
    { value: "sdxl", label: "Stable Diffusion XL" },
    { value: "sd-3", label: "Stable Diffusion 3" },
    { value: "playground", label: "Playground AI" },
    { value: "krea", label: "Krea AI" },
    { value: "magnific", label: "Magnific AI" },
    { value: "sana", label: "Sana" },
    { value: "gemini-1-5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1-5-flash", label: "Gemini 1.5 Flash" },
    { value: "grok-1", label: "Grok-1" },
    { value: "grok-2", label: "Grok-2" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3-5-turbo", label: "GPT-3.5 Turbo" },
    { value: "o1-preview", label: "OpenAI o1-preview" },
    { value: "other", label: "Other" },
]
