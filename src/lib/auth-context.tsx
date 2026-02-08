import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useDispatch } from "react-redux"
import { setUser as setReduxUser, clearUser as clearReduxUser, setLoading as setReduxLoading } from "../redux/features/authSlice"
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    type User as FirebaseUser
} from "firebase/auth"
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { SubscriptionTier } from "./subscription"
import * as OTPAuth from "otpauth"
import { logUserActivity } from "./db"

export interface User {
    id: string
    email: string
    name: string
    avatar?: string
    subscription: SubscriptionTier
    credits: number
    promptsUnlocked: string[]
    generationsUsed: number
    generationsReset: string
    createdAt: string
    // Profile fields
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
    isTwoFactorEnabled: boolean
    twoFactorSecret?: string
    role?: 'admin' | 'user'
    isAdmin: boolean
    username?: string
}

interface AuthContextType {
    user: User | null
    firebaseUser: FirebaseUser | null
    isLoading: boolean
    isAdmin: boolean
    pendingTwoFactorAuth: boolean
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
    verifyTwoFactorCode: (code: string) => Promise<boolean>
    cancelTwoFactorAuth: () => void
    updateSubscription: (tier: SubscriptionTier) => Promise<void>
    unlockPrompt: (promptId: string) => Promise<void>
    hasUnlockedPrompt: (promptId: string) => boolean
    canAccessPremium: () => boolean
    useGeneration: () => Promise<boolean>
    generationsRemaining: () => number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [pendingTwoFactorAuth, setPendingTwoFactorAuth] = useState(false)
    const [pendingUserData, setPendingUserData] = useState<{ user: User, firebaseUser: FirebaseUser, isAdmin: boolean } | null>(null)
    const dispatch = useDispatch()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                try {
                    // Add a small delay to ensure Firebase is ready
                    await new Promise(resolve => setTimeout(resolve, 500))

                    // 1. Check Admin Status First (against 'admin_panel' collection)
                    const adminRef = doc(db, "admin_panel", authUser.uid)
                    const adminSnap = await getDoc(adminRef)
                    const userIsAdmin = adminSnap.exists()

                    // 2. Fetch/create Firestore user doc
                    const userRef = doc(db, "users", authUser.uid)
                    const docSnap = await getDoc(userRef)

                    if (docSnap.exists()) {
                        const data = docSnap.data()
                        const fetchedUser: User = {
                            id: authUser.uid,
                            email: authUser.email || "",
                            name: data.name || authUser.displayName || "User",
                            avatar: data.avatar || authUser.photoURL || undefined,
                            subscription: data.subscription || "free",
                            credits: data.credits || 0,
                            promptsUnlocked: data.promptsUnlocked || [],
                            generationsUsed: data.generationsUsed || 0,
                            generationsReset: data.generationsReset || new Date().toISOString(),
                            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                            slogan: data.slogan || "",
                            location: data.location || "",
                            socials: data.socials || {},
                            isTwoFactorEnabled: data.isTwoFactorEnabled || false,
                            twoFactorSecret: data.twoFactorSecret || "",
                            role: userIsAdmin ? 'admin' : 'user',
                            isAdmin: userIsAdmin,
                            username: data.username || ""
                        }

                        // Check if 2FA is enabled
                        if (fetchedUser.isTwoFactorEnabled && fetchedUser.twoFactorSecret) {
                            setPendingUserData({ user: fetchedUser, firebaseUser: authUser, isAdmin: userIsAdmin })
                            setPendingTwoFactorAuth(true)
                            setFirebaseUser(authUser)
                            setIsLoading(false)
                        } else {
                            setFirebaseUser(authUser)
                            setUser(fetchedUser)
                            setIsAdmin(userIsAdmin)
                            dispatch(setReduxUser(fetchedUser))
                            setIsLoading(false)
                            logUserActivity(authUser.uid, "login", `Logged in via Google ${userIsAdmin ? '(Admin)' : ''}`)
                        }
                    } else {
                        // Create user doc if it doesn't exist
                        const username = authUser.displayName
                            ? authUser.displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                            : authUser.email?.split('@')[0] || `user_${authUser.uid.slice(0, 8)}`

                        const newUserData = {
                            email: authUser.email || "",
                            name: authUser.displayName || "",
                            username: username,
                            subscription: "free" as SubscriptionTier,
                            credits: 5,
                            promptsUnlocked: [],
                            generationsUsed: 0,
                            generationsReset: new Date().toISOString(),
                            createdAt: serverTimestamp(),
                            slogan: "",
                            location: "",
                            socials: {},
                            isTwoFactorEnabled: false
                        }
                        await setDoc(userRef, newUserData)

                        const newUser: User = {
                            id: authUser.uid,
                            email: authUser.email || "",
                            name: authUser.displayName || "User",
                            avatar: authUser.photoURL || `https://ui-avatars.com/api/?name=${authUser.displayName || 'User'}&background=random`,
                            subscription: "free",
                            credits: 5,
                            promptsUnlocked: [],
                            generationsUsed: 0,
                            generationsReset: new Date().toISOString(),
                            createdAt: new Date().toISOString(),
                            slogan: "",
                            location: "",
                            socials: {},
                            isTwoFactorEnabled: false,
                            role: userIsAdmin ? 'admin' : 'user',
                            isAdmin: userIsAdmin,
                            username: username
                        }
                        setFirebaseUser(authUser)
                        setUser(newUser)
                        setIsAdmin(userIsAdmin)
                        dispatch(setReduxUser(newUser))
                        setIsLoading(false)
                    }
                } catch (error) {
                    console.error("Error in auth flow:", error)
                    // Fallback to basic auth on error
                    const tempUser = {
                        id: authUser.uid,
                        email: authUser.email || "",
                        name: authUser.displayName || "User",
                        isAdmin: false,
                        subscription: "free" as SubscriptionTier,
                        credits: 0,
                        promptsUnlocked: [],
                        generationsUsed: 0,
                        generationsReset: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        isTwoFactorEnabled: false
                    } as User
                    setFirebaseUser(authUser)
                    setUser(tempUser)
                    setIsAdmin(false)
                    setIsLoading(false)
                }
            } else {
                setUser(null)
                setFirebaseUser(null)
                setIsAdmin(false)
                setPendingTwoFactorAuth(false)
                setPendingUserData(null)
                dispatch(clearReduxUser())
                setIsLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    const signOut = async () => {
        setPendingTwoFactorAuth(false)
        setPendingUserData(null)
        await firebaseSignOut(auth)
    }

    const verifyTwoFactorCode = async (code: string): Promise<boolean> => {
        if (!pendingUserData) return false

        const { user: pendingUser, firebaseUser: pendingFirebaseUser } = pendingUserData
        const secret = pendingUser.twoFactorSecret

        if (!secret) return false

        try {
            // Create a TOTP instance with the stored secret
            const totp = new OTPAuth.TOTP({
                issuer: "Cognify",
                label: pendingUser.email,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(secret)
            })

            // Verify the code (with a window of 1 to account for timing drift)
            const delta = totp.validate({ token: code, window: 1 })
            const isValid = delta !== null

            if (isValid) {
                // Code is valid, complete the login
                setUser(pendingUser)
                setIsAdmin(pendingUserData.isAdmin)
                dispatch(setReduxUser(pendingUser))
                setPendingTwoFactorAuth(false)
                setPendingUserData(null)

                // Log 2FA login activity
                logUserActivity(pendingUser.id, "login", `Logged in with 2FA verification ${pendingUserData.isAdmin ? '(Admin)' : ''}`)

                return true
            } else {
                return false
            }
        } catch (error) {
            console.error("Error verifying 2FA code:", error)
            return false
        }
    }

    const cancelTwoFactorAuth = () => {
        // User cancelled 2FA verification, sign them out
        setPendingTwoFactorAuth(false)
        setPendingUserData(null)
        firebaseSignOut(auth)
    }

    const updateSubscription = async (tier: SubscriptionTier) => {
        if (!firebaseUser) return
        await updateDoc(doc(db, "users", firebaseUser.uid), {
            subscription: tier
        })
    }

    const unlockPrompt = async (promptId: string) => {
        if (!firebaseUser || !user) return

        try {
            const { unlockPremiumPrompt } = await import("./db")
            const result = await unlockPremiumPrompt(user.id, promptId)

            if (result.success) {
                setUser({
                    ...user,
                    credits: result.credits ?? user.credits,
                    promptsUnlocked: [...user.promptsUnlocked, promptId]
                })
            }
        } catch (error: any) {
            console.error("Failed to unlock prompt:", error)
            throw error
        }
    }

    const hasUnlockedPrompt = (promptId: string) => {
        return user?.promptsUnlocked.includes(promptId) || false
    }

    const canAccessPremium = () => {
        return user?.subscription === "pro" || user?.subscription === "creator"
    }

    const useGeneration = async () => {
        if (!user || !firebaseUser) return false

        const limit = user.subscription === "free" ? 10 : user.subscription === "pro" ? 100 : Infinity
        if (user.generationsUsed >= limit) return false

        const newCount = user.generationsUsed + 1
        await updateDoc(doc(db, "users", firebaseUser.uid), {
            generationsUsed: newCount
        })
        setUser({ ...user, generationsUsed: newCount })
        return true
    }

    const generationsRemaining = () => {
        if (!user) return 0
        const limit = user.subscription === "free" ? 10 : user.subscription === "pro" ? 100 : Infinity
        return Math.max(0, limit - user.generationsUsed)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                firebaseUser,
                isLoading,
                isAdmin,
                pendingTwoFactorAuth,
                signInWithGoogle,
                signOut,
                verifyTwoFactorCode,
                cancelTwoFactorAuth,
                updateSubscription,
                unlockPrompt,
                hasUnlockedPrompt,
                canAccessPremium,
                useGeneration,
                generationsRemaining,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
