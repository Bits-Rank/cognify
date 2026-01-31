export interface Prompt {
    id: string
    title: string
    image: string
    likes: number
    author: string
    authorUsername: string
    authorAvatar?: string
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
    { value: "other", label: "Other" },
]
