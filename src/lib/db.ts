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
    updateDoc
} from "firebase/firestore"
import type { Prompt, User } from "./data"

// Collection references
const PROMPTS_COLLECTION = "prompts"
const USERS_COLLECTION = "users"

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

        const q = query(
            collection(db, PROMPTS_COLLECTION),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
            }
        }) as unknown as Prompt[]
    } catch (error) {
        console.error("Error fetching prompts:", error)

        // If it's a permission error and we're not authenticated, return empty array
        const err = error as any;
        if (err.code === 'permission-denied') {
            console.log("🔒 Permission denied - Firestore security rules require authentication")
            console.log("💡 To fix this:")
            console.log("   1. Sign in at /sign-in")
            console.log("   2. Or update Firestore rules to allow public read access")

            return []
        }

        // For other errors, also return empty array to prevent app crash
        return []
    }
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
    try {
        const docRef = doc(db, PROMPTS_COLLECTION, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            const data = docSnap.data()
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
            } as unknown as Prompt
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
        const q = query(
            collection(db, PROMPTS_COLLECTION),
            where("authorUsername", "==", username),
            orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
            }
        }) as unknown as Prompt[]
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

        const docRef = await addDoc(collection(db, PROMPTS_COLLECTION), {
            ...promptData,
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
            createdAt: serverTimestamp(),
            likes: 0,
            views: 0,
            downloads: 0,
            comments: []
        });
        return docRef.id;
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
