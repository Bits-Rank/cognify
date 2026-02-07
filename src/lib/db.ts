import { db, auth } from "./firebase"
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy,
    limit,
    setDoc,
    addDoc,
    updateDoc,
    arrayUnion,
    deleteDoc,
    onSnapshot,
    getCountFromServer,
    collectionGroup
} from "firebase/firestore"
import type { Prompt, User, AIModel } from "./data"

// Collection references
const PROMPTS_COLLECTION = "prompts"
const USERS_COLLECTION = "users"
const MODELS_COLLECTION = "models"

// Helper function to check if user is authenticated
function isAuthenticated(): boolean {
    return !!auth.currentUser
}

export async function getPrompts(limitCount = 20): Promise<Prompt[]> {
    try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            console.log("⚠️ User not authenticated - prompts may not be accessible")
            console.log("💡 Sign in at /sign-in to view prompts")
        }

        const querySnapshot = await getDocs(collection(db, PROMPTS_COLLECTION))
        const allPrompts: Prompt[] = []

        querySnapshot.forEach(doc => {
            const data = doc.data()
            const { prompts, ...userInfo } = data
            if (prompts && Array.isArray(prompts)) {
                const normalizedPrompts = prompts.map((p: any) => ({
                    ...p,
                    ...userInfo // Merge root user info into each prompt
                }))
                allPrompts.push(...normalizedPrompts)
            }
        })

        // Filter out hidden prompts
        const visiblePrompts = allPrompts.filter(p => !p.isHidden)

        // Sort by createdAt descending
        return visiblePrompts.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return dateB - dateA
        }).slice(0, limitCount)
    } catch (error) {
        console.error("Error fetching prompts:", error)

        // If it's a permission error and we're not authenticated, return empty array
        return []
    }
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
    try {
        const querySnapshot = await getDocs(collection(db, PROMPTS_COLLECTION))
        for (const doc of querySnapshot.docs) {
            const data = doc.data()
            const { prompts, ...userInfo } = data
            if (prompts && Array.isArray(prompts)) {
                const found = prompts.find((p: any) => p.id === id)
                if (found) {
                    return { ...found, ...userInfo } as Prompt
                }
            }
        }
        return undefined
    } catch (error) {
        console.error("Error fetching prompt:", error)
        return undefined
    }
}

export async function getUserProfile(userId: string): Promise<User | undefined> {
    try {
        const docRef = doc(db, USERS_COLLECTION, userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const data = docSnap.data()
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                joinedAt: data.joinedAt?.toDate?.()?.toISOString() || data.joinedAt
            } as unknown as User
        }
        return undefined
    } catch (error) {
        console.error("Error fetching user:", error)
        return undefined
    }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("username", "==", username), limit(1))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0]
            const data = docSnap.data()
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                joinedAt: data.joinedAt?.toDate?.()?.toISOString() || data.joinedAt
            } as unknown as User
        }
        return undefined
    } catch (error) {
        console.error("Error fetching user by username:", error)
        return undefined
    }
}

export async function getPromptsByUser(userId: string): Promise<Prompt[]> {
    try {
        const docRef = doc(db, PROMPTS_COLLECTION, userId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            const { prompts, ...userInfo } = data
            return (prompts || []).map((p: any) => ({
                ...p,
                ...userInfo
            })).sort((a: any, b: any) => {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return dateB - dateA
            })
        }
        return []
    } catch (error) {
        console.error("Error fetching prompts by user:", error)
        return []
    }
}

export async function createUserDocument(user: any) {
    if (!user) return

    const userRef = doc(db, USERS_COLLECTION, user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
        try {
            // Generate username from display name or email
            const username = user.displayName
                ? user.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                : user.email?.split('@')[0] || `user_${user.uid.slice(0, 8)}`

            await setDoc(userRef, {
                email: user.email,
                name: user.displayName || "Anonymous",
                username: username,
                avatar: user.photoURL,
                createdAt: serverTimestamp(),
                subscription: "free",
                credits: 5, // Grant 5 initial credits
                generationsUsed: 0,
                promptsUnlocked: []
            })
        } catch (error) {
            console.error("Error creating user document", error)
        }
    }
}

export async function createPrompt(promptData: Omit<Prompt, "id" | "createdAt" | "likes" | "views" | "downloads" | "comments">, user: any): Promise<string> {
    try {
        // Extract correct user properties based on search results
        const authorId = user.uid || user.id;

        // Check if user is blocked
        const userDoc = await getDoc(doc(db, USERS_COLLECTION, authorId));
        if (userDoc.exists() && userDoc.data().isBlocked) {
            throw new Error("Your account has been restricted from creating new prompts by a moderator.");
        }

        const authorName = user.displayName || user.name || "Anonymous";
        const authorAvatar = user.photoURL || user.avatar || "";
        const authorUsername = user.username || authorName.toLowerCase().replace(/\s+/g, '_') || "anonymous";

        const promptId = `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const newPrompt = {
            ...promptData,
            id: promptId,
            createdAt: new Date().toISOString(),
            likes: 0,
            views: 0,
            downloads: 0,
            comments: [],
            isHidden: false // Default to visible
        };

        const docRef = doc(db, PROMPTS_COLLECTION, authorId);
        await setDoc(docRef, {
            // Store user info once at the root
            authorId: authorId,
            author: authorName,
            authorUsername: authorUsername,
            authorAvatar: authorAvatar,
            authorDetails: {
                id: authorId,
                name: authorName,
                username: authorUsername,
                avatar: authorAvatar
            },
            // Add prompt to the array
            prompts: arrayUnion(newPrompt)
        }, { merge: true });

        return promptId;
    } catch (error) {
        console.error("Error creating prompt:", error);
        throw error;
    }
}

export async function updateUserProfile(userId: string, data: Partial<User>) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId)
        await updateDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
        })
        return true
    } catch (error) {
        console.error("Error updating user profile:", error)
        throw error
    }
}

export async function unlockPremiumPrompt(userId: string, promptId: string) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) throw new Error("User not found")

        const userData = userSnap.data()
        const currentCredits = userData.credits || 0
        const unlocked = userData.promptsUnlocked || []

        if (unlocked.includes(promptId)) {
            return { success: true, message: "Already unlocked" }
        }

        if (currentCredits < 1) {
            throw new Error("Insufficient credits. Purchase more to unlock.")
        }

        // Atomic-ish update (not a transaction but good enough for this scale)
        await updateDoc(userRef, {
            credits: currentCredits - 1,
            promptsUnlocked: arrayUnion(promptId),
            updatedAt: serverTimestamp()
        })

        // Log the activity
        await logUserActivity(userId, "unlock_prompt", `Unlocked premium prompt: ${promptId}`)

        return { success: true, credits: currentCredits - 1 }
    } catch (error: any) {
        console.error("Error unlocking prompt:", error)
        throw error
    }
}

export async function logUserActivity(userId: string, action: string, details: string) {
    try {
        const historyRef = collection(db, USERS_COLLECTION, userId, "history")
        await addDoc(historyRef, {
            action,
            details,
            device: navigator.userAgent,
            createdAt: serverTimestamp()
        })
    } catch (error) {
        console.error("Error logging activity:", error)
        // Don't throw, just log error so it doesn't block the main action
    }
}

export async function getUserActivity(userId: string, limitCount = 50) {
    try {
        const historyRef = collection(db, USERS_COLLECTION, userId, "history")
        const q = query(historyRef, orderBy("createdAt", "desc"), limit(limitCount))
        const snapshot = await getDocs(q)

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }))
    } catch (error) {
        console.error("Error fetching activity:", error)
        return []
    }
}

// AI Model CRUD
export function subscribeToAiModels(callback: (models: { label: string; value: string }[]) => void) {
    const q = collection(db, MODELS_COLLECTION)
    return onSnapshot(q, (snapshot) => {
        const models = snapshot.docs.map(doc => ({
            label: doc.data().label,
            value: doc.data().value
        })).sort((a, b) => a.label.localeCompare(b.label))
        callback(models)
    }, (error) => {
        console.error("Error subscribing to models:", error)
    })
}

export async function getAiModels(): Promise<{ label: string; value: string }[]> {
    try {
        const querySnapshot = await getDocs(collection(db, MODELS_COLLECTION))
        return querySnapshot.docs.map(doc => ({
            label: doc.data().label,
            value: doc.data().value
        })).sort((a, b) => a.label.localeCompare(b.label))
    } catch (error) {
        console.error("Error fetching models:", error)
        return []
    }
}

export async function addAiModel(label: string, value: string) {
    try {
        const modelRef = doc(db, MODELS_COLLECTION, value)
        await setDoc(modelRef, {
            label,
            value,
            createdAt: serverTimestamp()
        })
        return true
    } catch (error) {
        console.error("Error adding model:", error)
        throw error
    }
}

export async function updateAiModel(oldValue: string, label: string, newValue: string) {
    try {
        // If the identifier (value) changed, we need to delete the old doc and create a new one
        if (oldValue !== newValue) {
            await deleteAiModel(oldValue)
            await addAiModel(label, newValue)
        } else {
            const modelRef = doc(db, MODELS_COLLECTION, oldValue)
            await updateDoc(modelRef, {
                label,
                updatedAt: serverTimestamp()
            })
        }
        return true
    } catch (error) {
        console.error("Error updating model:", error)
        throw error
    }
}

export async function deleteAiModel(value: string) {
    try {
        const modelRef = doc(db, MODELS_COLLECTION, value)
        await deleteDoc(modelRef)
        return true
    } catch (error) {
        console.error("Error deleting model:", error)
        throw error
    }
}

// System Stats & Activity (Admin)
export async function getSystemStats() {
    try {
        const usersCount = await getCountFromServer(collection(db, USERS_COLLECTION))
        const promptsSnapshot = await getDocs(collection(db, PROMPTS_COLLECTION))

        let totalPrompts = 0
        let totalLikes = 0

        promptsSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.prompts && Array.isArray(data.prompts)) {
                totalPrompts += data.prompts.length
                data.prompts.forEach((p: any) => {
                    totalLikes += (p.likes || 0)
                })
            }
        })

        return {
            totalUsers: usersCount.data().count,
            totalPrompts,
            totalLikes,
            revenue: 1200000 // Mock for now until payment system is added
        }
    } catch (error) {
        console.error("Error fetching system stats:", error)
        return { totalUsers: 0, totalPrompts: 0, totalLikes: 0, revenue: 0 }
    }
}

export async function getSystemRecentActivity(limitCount = 10) {
    try {
        const q = query(
            collectionGroup(db, "history"),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        )
        const snapshot = await getDocs(q)

        const activities = await Promise.all(snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data()
            const userId = docSnap.ref.parent.parent?.id // collectionGroup parent.parent is the doc ID (user ID)

            let authorName = "System"
            if (userId) {
                const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId))
                if (userDoc.exists()) {
                    authorName = userDoc.data().name || userDoc.data().username || "User"
                }
            }

            return {
                id: docSnap.id,
                ...data,
                userId,
                authorName,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }
        }))

        return activities
    } catch (error: any) {
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
            console.error("CRITICAL: Missing Firestore Index for Activity Feed. Follow the link in the console to create it.")
        }
        console.error("Error fetching system activity:", error)
        return []
    }
}

export async function getAllUsersList(filters?: { search?: string; status?: string }) {
    try {
        let q = query(collection(db, USERS_COLLECTION));

        // Note: Firestore doesn't support complex "contains" queries for strings easily
        // so we fetch and filter locally for search, but apply status filters via query if possible
        // For simplicity and matching the user request for "all data" search:
        const querySnapshot = await getDocs(q);
        let users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })) as any[];

        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            users = users.filter(u =>
                (u.name || "").toLowerCase().includes(searchLower) ||
                (u.email || "").toLowerCase().includes(searchLower) ||
                (u.username || "").toLowerCase().includes(searchLower)
            );
        }

        if (filters?.status) {
            if (filters.status === 'blocked') users = users.filter(u => u.isBlocked);
            if (filters.status === 'pro') users = users.filter(u => u.subscription === 'pro');
            if (filters.status === 'verified') users = users.filter(u => u.isVerified);
        }

        return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

export async function getAllPromptsList(filters?: { search?: string; status?: string }) {
    try {
        const querySnapshot = await getDocs(collection(db, PROMPTS_COLLECTION))
        let allPrompts: any[] = []

        querySnapshot.forEach(doc => {
            const data = doc.data()
            const { prompts, ...userInfo } = data
            if (prompts && Array.isArray(prompts)) {
                prompts.forEach((p: any) => {
                    allPrompts.push({
                        ...p,
                        authorDetails: {
                            id: userInfo.authorId || doc.id,
                            name: userInfo.author || "Anonymous",
                            username: userInfo.authorUsername || "anonymous",
                            avatar: userInfo.authorAvatar || ""
                        }
                    })
                })
            }
        })

        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            allPrompts = allPrompts.filter(p =>
                (p.title || "").toLowerCase().includes(searchLower) ||
                (p.authorDetails.name || "").toLowerCase().includes(searchLower) ||
                (p.authorDetails.username || "").toLowerCase().includes(searchLower)
            );
        }

        if (filters?.status) {
            if (filters.status === 'hidden') allPrompts = allPrompts.filter(p => p.isHidden);
            if (filters.status === 'premium') allPrompts = allPrompts.filter(p => p.isPremium);
            if (filters.status === 'visible') allPrompts = allPrompts.filter(p => !p.isHidden);
        }

        return allPrompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Error fetching all prompts list:", error)
        return []
    }
}

// Admin Write Operations
export async function adminUpdateUser(userId: string, data: Partial<User>) {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId)
        await updateDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
        })
    } catch (error) {
        console.error("Error updating user (admin):", error)
        throw error
    }
}

export async function adminDeleteUser(userId: string) {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, userId))
        // Also delete their prompts record
        await deleteDoc(doc(db, PROMPTS_COLLECTION, userId))
    } catch (error) {
        console.error("Error deleting user (admin):", error)
        throw error
    }
}

export async function adminUpdatePrompt(userId: string, promptId: string, data: Partial<any>) {
    try {
        const userPromptsRef = doc(db, PROMPTS_COLLECTION, userId)
        const userPromptsDoc = await getDoc(userPromptsRef)

        if (userPromptsDoc.exists()) {
            const prompts = userPromptsDoc.data().prompts || []
            const updatedPrompts = prompts.map((p: any) =>
                p.id === promptId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
            )
            await updateDoc(userPromptsRef, { prompts: updatedPrompts })
        }
    } catch (error) {
        console.error("Error updating prompt (admin):", error)
        throw error
    }
}

export async function adminDeletePrompt(userId: string, promptId: string) {
    try {
        const userPromptsRef = doc(db, PROMPTS_COLLECTION, userId)
        const userPromptsDoc = await getDoc(userPromptsRef)

        if (userPromptsDoc.exists()) {
            const prompts = userPromptsDoc.data().prompts || []
            const updatedPrompts = prompts.filter((p: any) => p.id !== promptId)
            await updateDoc(userPromptsRef, { prompts: updatedPrompts })
        }
    } catch (error) {
        console.error("Error deleting prompt (admin):", error)
        throw error
    }
}

export async function getPromptsByIds(ids: string[]): Promise<Prompt[]> {
    try {
        if (!ids.length) return []
        const querySnapshot = await getDocs(collection(db, PROMPTS_COLLECTION))
        const foundPrompts: Prompt[] = []

        querySnapshot.forEach(doc => {
            const data = doc.data()
            const { prompts, ...userInfo } = data
            if (prompts && Array.isArray(prompts)) {
                const matches = prompts.filter((p: any) => ids.includes(p.id))
                matches.forEach((p: any) => {
                    foundPrompts.push({ ...p, ...userInfo } as Prompt)
                })
            }
        })

        return foundPrompts.sort((a, b) => ids.indexOf(b.id) - ids.indexOf(a.id))
    } catch (error) {
        console.error("Error fetching prompts by IDs:", error)
        return []
    }
}

export async function updateUserPrompt(userId: string, promptId: string, data: Partial<any>) {
    try {
        const userPromptsRef = doc(db, PROMPTS_COLLECTION, userId)
        const userPromptsDoc = await getDoc(userPromptsRef)

        if (userPromptsDoc.exists()) {
            const prompts = userPromptsDoc.data().prompts || []
            const updatedPrompts = prompts.map((p: any) =>
                p.id === promptId ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
            )
            await updateDoc(userPromptsRef, { prompts: updatedPrompts })
        }
    } catch (error) {
        console.error("Error updating prompt:", error)
        throw error
    }
}

export async function togglePromptPremium(userId: string, promptId: string, isPremium: boolean) {
    return updateUserPrompt(userId, promptId, { isPremium })
}
