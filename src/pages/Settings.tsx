
import { useState, useEffect, useRef } from "react"
import { useAuth, type User } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User as UserIcon, Lock, Share2, Bell, Trash2, Camera, Loader2, Globe, Instagram, Facebook, Linkedin, Dribbble } from "lucide-react"
import { updateUserProfile } from "@/lib/db"
import { storage, auth } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updatePassword, updateEmail } from "firebase/auth"
import { toast } from "react-toastify"
import { QRCodeSVG } from "qrcode.react"
import * as OTPAuth from "otpauth"
import { logUserActivity, getUserActivity } from "@/lib/db"
import type { ActivityLog } from "@/lib/data"
import { History, CalendarClock, Smartphone, UserCog, ShieldAlert, Globe2 } from "lucide-react"

type Tab = "profile" | "security" | "social" | "notifications" | "activity" | "delete"

export function SettingsPage() {
    const { user, firebaseUser } = useAuth()
    const [activeTab, setActiveTab] = useState<Tab>("profile")
    const [isLoading, setIsLoading] = useState(false)

    // Form States
    const [formData, setFormData] = useState<Partial<User>>({})

    // 2FA State
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
    const [showDisableConfirm, setShowDisableConfirm] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [disableCode, setDisableCode] = useState("")
    const [qrSecret, setQrSecret] = useState("")

    // Derived state for social inputs (to handle nested object updates easier)
    const [socials, setSocials] = useState({
        website: "",
        ui8: "",
        dribbble: "",
        behance: "",
        instagram: "",
        threads: "",
        facebook: "",
        linkedin: ""
    })

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                slogan: user.slogan,
                email: user.email,
                location: user.location,
            })
            if (user.socials) {
                setSocials(prev => ({ ...prev, ...user.socials }))
            }
            setIsTwoFactorEnabled(user.isTwoFactorEnabled || false)
        }
    }, [user])

    const handleProfileUpdate = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            await updateUserProfile(user.id, {
                name: formData.name,
                slogan: formData.slogan,
                location: formData.location,
                // Email is handled separately due to Firebase Auth security
            })

            // If email changed, try to update it in Auth (requires recent login usually)
            if (formData.email !== user.email && firebaseUser) {
                try {
                    await updateEmail(firebaseUser, formData.email!)
                    await updateUserProfile(user.id, { email: formData.email })
                    logUserActivity(user.id, "profile_update", "Updated email address")
                    toast.success("Email updated successfully")
                } catch (error: any) {
                    toast.error("Failed to update email: " + error.message)
                    // Revert email in form if failed
                    setFormData(prev => ({ ...prev, email: user.email }))
                }
            }

            logUserActivity(user.id, "profile_update", "Updated profile details")
            toast.success("Profile updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        setIsLoading(true)
        try {
            const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}_${file.name}`)
            await uploadBytes(storageRef, file)
            const url = await getDownloadURL(storageRef)

            await updateUserProfile(user.id, { avatar: url })
            logUserActivity(user.id, "profile_update", "Updated avatar")
            toast.success("Avatar updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload avatar")
        } finally {
            setIsLoading(false)
        }
    }

    const handleTwoFactorToggle = async () => {
        if (!user) return

        if (isTwoFactorEnabled) {
            // Show disable confirmation with code input
            setShowDisableConfirm(true)
        } else {
            // Start Setup Flow
            // Generate a proper TOTP secret using OTPAuth
            const secret = new OTPAuth.Secret({ size: 20 })
            setQrSecret(secret.base32)
            setShowTwoFactorSetup(true)
        }
    }

    const verifyAndDisableTwoFactor = async () => {
        if (!user || disableCode.length < 6) return

        setIsLoading(true)
        try {
            // Fetch the secret directly from Firestore to ensure we have the latest
            const { doc, getDoc } = await import("firebase/firestore")
            const { db } = await import("@/lib/firebase")
            const userDoc = await getDoc(doc(db, "users", user.id))
            const userData = userDoc.data()
            const storedSecret = userData?.twoFactorSecret

            if (!storedSecret) {
                toast.error("2FA secret not found. Please contact support.")
                return
            }

            // Verify the code before disabling
            const totp = new OTPAuth.TOTP({
                issuer: "Cognify",
                label: user.email,
                algorithm: "SHA1",
                digits: 6,
                period: 30,
                secret: OTPAuth.Secret.fromBase32(storedSecret)
            })

            const delta = totp.validate({ token: disableCode, window: 1 })
            const isValid = delta !== null

            if (!isValid) {
                toast.error("Invalid code. Please try again.")
                setDisableCode("")
                return
            }

            // Code is valid, disable 2FA
            await updateUserProfile(user.id, {
                isTwoFactorEnabled: false,
                twoFactorSecret: ""
            })
            setIsTwoFactorEnabled(false)
            setShowDisableConfirm(false)
            setDisableCode("")
            logUserActivity(user.id, "security_update", "Disabled Two-Factor Authentication")
            toast.success("Two-Factor Authentication disabled")
        } catch (error) {
            console.error(error)
            toast.error("Failed to disable 2FA")
        } finally {
            setIsLoading(false)
        }
    }

    const verifyAndActivateTwoFactor = async () => {
        if (!user || verificationCode.length < 6 || !qrSecret) return

        setIsLoading(true)
        try {
            // Store both the enabled flag AND the secret in Firestore
            await updateUserProfile(user.id, {
                isTwoFactorEnabled: true,
                twoFactorSecret: qrSecret  // Store the secret for future verification
            })
            setIsTwoFactorEnabled(true)
            setShowTwoFactorSetup(false)
            setVerificationCode("")
            logUserActivity(user.id, "security_update", "Enabled Two-Factor Authentication")
            toast.success("Two-Factor Authentication activated successfully!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to activate 2FA")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialsUpdate = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            await updateUserProfile(user.id, { socials })
            toast.success("Social profiles updated successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update social profiles")
        } finally {
            setIsLoading(false)
        }
    }

    const SidebarItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    )

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar */}
                <aside className="w-full md:w-64 space-y-2 shrink-0">
                    <div className="sticky top-24 space-y-2">
                        <SidebarItem tab="profile" icon={UserIcon} label="Profile" />
                        <SidebarItem tab="security" icon={Lock} label="Security" />
                        <SidebarItem tab="social" icon={Share2} label="Social profile" />
                        <SidebarItem tab="notifications" icon={Bell} label="Notifications" />
                        <Separator className="my-4 opacity-50" />
                        <SidebarItem tab="delete" icon={Trash2} label="Delete account" />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Account settings</h1>

                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold mb-6">Profile</h2>

                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-8 p-6 glass-card rounded-2xl border border-border/50">
                                    <div className="relative group shrink-0">
                                        <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-background shadow-xl">
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                                alt="Avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div
                                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="h-8 w-8 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/png, image/jpeg"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-medium">Profile Photo</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Update your avatar by clicking the image. 288x288 px size recommended in PNG or JPG format only.
                                        </p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="display-name">Display name</Label>
                                        <Input
                                            id="display-name"
                                            value={formData.name || ""}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 bg-muted/30"
                                            placeholder="Your Name"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="slogan">Slogan</Label>
                                        <Input
                                            id="slogan"
                                            value={formData.slogan || ""}
                                            onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                                            className="h-12 bg-muted/30"
                                            placeholder="i.e. Daily curated premium assets for startups and creators."
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="designer@example.com"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Select
                                                value={formData.location}
                                                onValueChange={val => setFormData({ ...formData, location: val })}
                                            >
                                                <SelectTrigger className="h-12 bg-muted/30">
                                                    <SelectValue placeholder="Select location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                                                    <SelectItem value="New York, NY">New York, NY</SelectItem>
                                                    <SelectItem value="London, UK">London, UK</SelectItem>
                                                    <SelectItem value="Remote">Remote</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleProfileUpdate}
                                            disabled={isLoading}
                                            className="h-11 px-8"
                                        >
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold mb-6">Security</h2>
                                <div className="max-w-2xl bg-muted/20 rounded-2xl p-8 border border-border/50">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1">
                                            <Lock className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-semibold">Two-Factor Authentication (2FA)</h3>
                                            <p className="text-muted-foreground text-sm">
                                                Add an extra layer of security to your account by using Google Authenticator.
                                            </p>
                                        </div>
                                    </div>

                                    {isTwoFactorEnabled ? (
                                        showDisableConfirm ? (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                                                    <p className="text-sm text-destructive font-medium mb-1">Confirm Disable 2FA</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Enter the 6-digit code from your authenticator app to disable Two-Factor Authentication.
                                                    </p>
                                                </div>
                                                <div className="max-w-xs mx-auto space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Enter 6-digit code</Label>
                                                        <Input
                                                            className="text-center tracking-widest text-lg h-12"
                                                            placeholder="000000"
                                                            value={disableCode}
                                                            onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        />
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            className="flex-1"
                                                            onClick={() => {
                                                                setShowDisableConfirm(false)
                                                                setDisableCode("")
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="flex-1"
                                                            onClick={verifyAndDisableTwoFactor}
                                                            disabled={disableCode.length !== 6 || isLoading}
                                                        >
                                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Disable
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 flex items-center gap-3">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="font-medium">2FA is currently active</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10"
                                                    onClick={handleTwoFactorToggle}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Disable Two-Factor Authentication
                                                </Button>
                                            </div>
                                        )
                                    ) : showTwoFactorSetup ? (
                                        <div className="space-y-6">
                                            <div className="bg-white p-4 rounded-xl w-fit mx-auto shadow-lg">
                                                <QRCodeSVG
                                                    value={`otpauth://totp/Cognify:${user?.email}?secret=${qrSecret}&issuer=Cognify`}
                                                    size={180}
                                                />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <p className="font-medium">Scan this QR code with Google Authenticator</p>
                                                <p className="text-xs text-muted-foreground">or your preferred 2FA app</p>
                                            </div>

                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Enter 6-digit code</Label>
                                                    <Input
                                                        className="text-center tracking-widest text-lg h-12"
                                                        placeholder="000 000"
                                                        value={verificationCode}
                                                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        className="flex-1"
                                                        onClick={() => setShowTwoFactorSetup(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        className="flex-1"
                                                        onClick={verifyAndActivateTwoFactor}
                                                        disabled={verificationCode.length !== 6 || isLoading}
                                                    >
                                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Verify & Activate
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                                                When enabled, you'll need to enter a code from your authentication app every time you sign in.
                                            </div>
                                            <Button
                                                className="w-full sm:w-auto"
                                                onClick={handleTwoFactorToggle}
                                            >
                                                Enable Two-Factor Authentication
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Social Profiles Tab */}
                        {activeTab === "social" && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold mb-6">Social profiles</h2>
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" /> Website
                                            </Label>
                                            <Input
                                                value={socials.website}
                                                onChange={e => setSocials({ ...socials, website: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="https://yoursite.com"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>UI8</Label>
                                            <Input
                                                value={socials.ui8}
                                                onChange={e => setSocials({ ...socials, ui8: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="ui8.net/username"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="flex items-center gap-2">
                                                <Dribbble className="h-4 w-4" /> Dribbble
                                            </Label>
                                            <Input
                                                value={socials.dribbble}
                                                onChange={e => setSocials({ ...socials, dribbble: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="dribbble.com/username"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Behance</Label>
                                            <Input
                                                value={socials.behance}
                                                onChange={e => setSocials({ ...socials, behance: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="behance.net/username"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="flex items-center gap-2">
                                                <Instagram className="h-4 w-4" /> Instagram
                                            </Label>
                                            <Input
                                                value={socials.instagram}
                                                onChange={e => setSocials({ ...socials, instagram: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="instagram.com/username"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Threads</Label>
                                            <Input
                                                value={socials.threads}
                                                onChange={e => setSocials({ ...socials, threads: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="threads.net/username"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label className="flex items-center gap-2">
                                                <Facebook className="h-4 w-4" /> Facebook
                                            </Label>
                                            <Input
                                                value={socials.facebook}
                                                onChange={e => setSocials({ ...socials, facebook: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="facebook.com/username"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="flex items-center gap-2">
                                                <Linkedin className="h-4 w-4" /> LinkedIn
                                            </Label>
                                            <Input
                                                value={socials.linkedin}
                                                onChange={e => setSocials({ ...socials, linkedin: e.target.value })}
                                                className="h-12 bg-muted/30"
                                                placeholder="linkedin.com/username"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSocialsUpdate}
                                            disabled={isLoading}
                                            className="h-11 px-8"
                                        >
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Social Profiles
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab Placeholder */}
                        {activeTab === "notifications" && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold mb-6">Notifications</h2>
                                <div className="glass-card p-8 rounded-2xl text-center text-muted-foreground">
                                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Notification settings coming soon.</p>
                                </div>
                            </div>
                        )}



                        {/* Activity History Tab */}
                        {activeTab === "activity" && <ActivityHistoryTab userId={user?.id} />}

                        {/* Delete Account Tab Placeholder */}
                        {activeTab === "delete" && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-semibold mb-6 text-destructive">Delete Account</h2>
                                <div className="border border-destructive/20 bg-destructive/5 p-6 rounded-2xl">
                                    <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <Button variant="destructive">Delete Account</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

function ActivityHistoryTab({ userId }: { userId?: string }) {
    const [activities, setActivities] = useState<ActivityLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!userId) return

        const fetchHistory = async () => {
            const logs = await getUserActivity(userId)

            // Cast the fetched data to ActivityLog[]
            // We need to ensure the data matches the interface
            const typedLogs = logs.map((log: any) => ({
                id: log.id,
                action: log.action as any,
                details: log.details,
                device: log.device,
                ip: log.ip,
                createdAt: log.createdAt
            })) as ActivityLog[]

            setActivities(typedLogs)
            setIsLoading(false)
        }

        fetchHistory()
    }, [userId])

    const getIcon = (action: string) => {
        switch (action) {
            case "login": return <Smartphone className="h-4 w-4 text-blue-500" />
            case "profile_update": return <UserCog className="h-4 w-4 text-purple-500" />
            case "security_update": return <ShieldAlert className="h-4 w-4 text-orange-500" />
            case "socials_update": return <Globe2 className="h-4 w-4 text-pink-500" />
            default: return <History className="h-4 w-4 text-gray-500" />
        }
    }

    const formatAction = (action: string) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (e) {
            return dateString
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <History className="h-5 w-5" /> Activity History
            </h2>

            <div className="bg-muted/20 border border-border/50 rounded-2xl overflow-hidden">
                {activities.length > 0 ? (
                    <div className="divide-y divide-border/50">
                        {activities.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-4">
                                <div className="p-2 bg-background rounded-full border border-border/50 shadow-sm mt-1">
                                    {getIcon(log.action)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <p className="font-medium text-sm text-foreground truncate">
                                            {formatAction(log.action)}
                                        </p>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                            <CalendarClock className="h-3 w-3" />
                                            {formatDate(log.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {log.details}
                                    </p>
                                    {log.device && (
                                        <p className="text-xs text-muted-foreground/60 mt-1 truncate">
                                            Device: {log.device}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No activity history found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

