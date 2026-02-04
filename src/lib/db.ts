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
    deleteDoc
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

        // Sort by createdAt descending
        return allPrompts.sort((a, b) => {
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

export async function getPromptsByUser(username: string): Promise<Prompt[]> {
    try {
        // First find user by username to get their ID
        const user = await getUserByUsername(username);
        if (!user) return [];

        const docRef = doc(db, PROMPTS_COLLECTION, user.id)
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
            comments: []
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
