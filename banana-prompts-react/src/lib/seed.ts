import { db } from "./firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import type { Prompt, Category, AIModel } from "./data"

const MOCK_PROMPTS: Partial<Prompt>[] = [
    {
        id: "seed-1",
        title: "Urban Reflection in Dramatic Light",
        image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=1000&auto=format&fit=crop",
        likes: 1240,
        author: "Tariq Hasan",
        authorUsername: "tariqHasanSyed",
        authorAvatar: "https://i.pravatar.cc/150?u=tariq",
        prompt: "Dramatic, ultra-realistic close-up in black and white with high-contrast cinematic lighting from the side, highlighting the contours of his face and beard, casting deep shadows. He wears round, reflective sunglasses. He gazes confidently upward into a dark void. The sunglasses reflect a city's towering skyline. The atmosphere is mysterious with a minimalist black background.",
        isPremium: false,
        category: "portraits" as Category,
        model: "midjourney" as AIModel,
        views: 5200,
        downloads: 340,
        comments: []
    },
    {
        id: "seed-2",
        title: "Neon Cyberpunk Cityscape",
        image: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1000&auto=format&fit=crop",
        likes: 980,
        author: "CyberArtist",
        authorUsername: "cyber_art",
        authorAvatar: "https://i.pravatar.cc/150?u=cyber",
        prompt: "Futuristic cyberpunk city street at night, rain slicked pavement reflecting neon signs in pink and blue, towering skyscrapers, flying cars, dense atmosphere, cinematic lighting, volumetric fog, high detail, 8k resolution, unreal engine 5 render style.",
        isPremium: true,
        category: "sci-fi" as Category,
        model: "dalle-3" as AIModel,
        views: 4100,
        downloads: 210,
        comments: []
    },
    {
        id: "seed-3",
        title: "Ethereal Forest Spirit",
        image: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop",
        likes: 1560,
        author: "NatureWhisperer",
        authorUsername: "nature_w",
        authorAvatar: "https://i.pravatar.cc/150?u=nature",
        prompt: "Double exposure photography of a female silhouette and a misty forest, ethereal atmosphere, dreamlike quality, soft diffused lighting, cool color palette of greens and blues, mystery, connection with nature.",
        isPremium: false,
        category: "abstract" as Category,
        model: "stable-diffusion" as AIModel,
        views: 6300,
        downloads: 580,
        comments: []
    },
    {
        id: "seed-4",
        title: "Isometric Tiny Home",
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        likes: 720,
        author: "ArchVizPro",
        authorUsername: "archviz",
        authorAvatar: "https://i.pravatar.cc/150?u=arch",
        prompt: "Isometric 3D render of a cozy modern tiny home in a forest setting, cutaway view showing interior details, warm lighting, cute and colorful style, low poly aesthetic, blender cycles render.",
        isPremium: false,
        category: "architecture" as Category,
        model: "blender" as unknown as AIModel, // Fallback for other
        views: 2800,
        downloads: 150,
        comments: []
    },
    {
        id: "seed-5",
        title: "Golden Hour Lion",
        image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1000&auto=format&fit=crop",
        likes: 2100,
        author: "WildLifeLens",
        authorUsername: "wildlife_lens",
        authorAvatar: "https://i.pravatar.cc/150?u=lion",
        prompt: "Majestic male lion portrait during golden hour, sun backlighting the mane creating a halo effect, intense gaze, dust particles in the air, savannah background, national geographic style photography, sharp focus.",
        isPremium: true,
        category: "animals" as Category,
        model: "midjourney" as AIModel,
        views: 8900,
        downloads: 920,
        comments: []
    },
    {
        id: "seed-6",
        title: "Minimalist Pastel Clouds",
        image: "https://images.unsplash.com/photo-1505566373809-90693a7d252a?q=80&w=1000&auto=format&fit=crop",
        likes: 450,
        author: "DreamySkies",
        authorUsername: "dreamy",
        authorAvatar: "https://i.pravatar.cc/150?u=dreamy",
        prompt: "Minimalist wallpaper of fluffy pastel clouds against a soft pink and blue gradient sky, dreamy aesthetic, soft edges, vector art style, clean composition.",
        isPremium: false,
        category: "abstract" as Category,
        model: "firefly" as AIModel,
        views: 1200,
        downloads: 80,
        comments: []
    }
]

export async function seedDatabase() {
    console.log("Starting seed...")
    try {
        const batchPromises = MOCK_PROMPTS.map((prompt) => {
            const promptRef = doc(db, "prompts", prompt.id!)
            return setDoc(promptRef, {
                ...prompt,
                createdAt: serverTimestamp()
            })
        })

        await Promise.all(batchPromises)
        console.log("Database seeded successfully!")
        return true
    } catch (error) {
        console.error("Error seeding database:", error)
        return false
    }
}
