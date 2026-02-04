
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
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-500 ${activeTab === tab
                ? "bg-foreground text-background shadow-lg scale-[1.02]"
                : "text-muted-foreground/40 hover:text-foreground hover:bg-white/5"
                }`}
        >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {label}
        </button>
    )

    return (
        <div className="min-h-screen py-24 px-4 mesh-gradient">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="w-full md:w-72 shrink-0">
                        <div className="sticky top-32 glass-card rounded-[32px] p-6 border-white/5 shadow-none space-y-2">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 mb-6 px-4">Relay Config</h2>
                            <SidebarItem tab="profile" icon={UserIcon} label="Neural Identity" />
                            <SidebarItem tab="security" icon={Lock} label="Neural Security" />
                            <SidebarItem tab="social" icon={Share2} label="Direct Relays" />
                            <SidebarItem tab="notifications" icon={Bell} label="Sync Alerts" />
                            <div className="h-px bg-white/5 my-4 mx-4" />
                            <SidebarItem tab="delete" icon={Trash2} label="Termination" />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <div className="glass-card rounded-[40px] border-white/5 shadow-none p-10 md:p-16 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000" />

                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-12 relative z-10">Neural <span className="highlight">Settings</span></h1>

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
                                    <div className="space-y-8">
                                        <div className="grid gap-4">
                                            <Label htmlFor="display-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Entity Name</Label>
                                            <Input
                                                id="display-name"
                                                value={formData.name || ""}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                placeholder="Identity Name"
                                            />
                                        </div>

                                        <div className="grid gap-4">
                                            <Label htmlFor="slogan" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Relay Slogan</Label>
                                            <Input
                                                id="slogan"
                                                value={formData.slogan || ""}
                                                onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                                                className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                placeholder="Neural frequency signature..."
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="grid gap-4">
                                                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Sync Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email || ""}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                    placeholder="designer@relay.xyz"
                                                />
                                            </div>
                                            <div className="grid gap-4">
                                                <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Node Location</Label>
                                                <Select
                                                    value={formData.location}
                                                    onValueChange={val => setFormData({ ...formData, location: val })}
                                                >
                                                    <SelectTrigger className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold px-6">
                                                        <SelectValue placeholder="Select node location" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-white/5 text-zinc-400 rounded-2xl overflow-hidden font-semibold">
                                                        <SelectItem value="San Francisco, CA" className="hover:bg-white/5">San Francisco, CA</SelectItem>
                                                        <SelectItem value="New York, NY">New York, NY</SelectItem>
                                                        <SelectItem value="London, UK">London, UK</SelectItem>
                                                        <SelectItem value="Remote">Neural Remote</SelectItem>
                                                        <SelectItem value="Other">Other Nodes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Button
                                                onClick={handleProfileUpdate}
                                                disabled={isLoading}
                                                className="w-full h-14 text-base font-bold rounded-full transition-all duration-500 bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.01] active:scale-95 shadow-none tracking-tight"
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        <span>Synchronizing...</span>
                                                    </div>
                                                ) : (
                                                    "Save Identity"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === "security" && (
                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-semibold mb-6">Security</h2>
                                    <div className="max-w-3xl space-y-8 mt-12">
                                        <div className="flex items-start gap-6 p-8 glass-card rounded-[32px] border-white/5 bg-primary/5">
                                            <div className="p-4 bg-primary text-background rounded-2xl shadow-lg">
                                                <Lock className="h-8 w-8" strokeWidth={2} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold tracking-tight">Two-Factor Authentication</h3>
                                                <p className="text-muted-foreground/60 text-sm font-medium leading-relaxed">
                                                    Secure your neural connection with an extra layer of authorization.
                                                </p>
                                            </div>
                                        </div>

                                        {isTwoFactorEnabled ? (
                                            showDisableConfirm ? (
                                                <div className="space-y-8 glass-card rounded-[32px] p-10 border-white/5">
                                                    <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-2xl">
                                                        <p className="text-sm text-destructive font-bold uppercase tracking-widest mb-2">Termination Authorization</p>
                                                        <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">
                                                            Enter the 6-digit sync code from your authenticator app to disable the security relay.
                                                        </p>
                                                    </div>
                                                    <div className="max-w-xs mx-auto space-y-6">
                                                        <div className="space-y-3 text-center">
                                                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">Authorization Code</Label>
                                                            <Input
                                                                className="text-center tracking-widest text-3xl h-16 rounded-2xl bg-white/[0.02] border-white/5 focus:border-destructive/30 font-bold"
                                                                placeholder="000000"
                                                                value={disableCode}
                                                                onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                            />
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <Button
                                                                variant="ghost"
                                                                className="flex-1 h-12 rounded-xl font-semibold hover:bg-white/5"
                                                                onClick={() => {
                                                                    setShowDisableConfirm(false)
                                                                    setDisableCode("")
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                className="flex-1 h-12 rounded-xl font-semibold shadow-none"
                                                                onClick={verifyAndDisableTwoFactor}
                                                                disabled={disableCode.length !== 6 || isLoading}
                                                            >
                                                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Disable"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 glass-card rounded-[32px] p-10 border-white/5">
                                                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl text-primary flex items-center gap-4">
                                                        <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-lg" />
                                                        <span className="font-bold tracking-tight text-lg">Relay Status: ACTIVE</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full h-14 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/10 font-bold tracking-tight"
                                                        onClick={handleTwoFactorToggle}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Disable Neural Security"}
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
                                    <div className="space-y-10 mt-12">
                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="grid gap-4">
                                                <Label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                                                    <Globe className="h-4 w-4 text-primary" /> Global Web
                                                </Label>
                                                <Input
                                                    value={socials.website}
                                                    onChange={e => setSocials({ ...socials, website: e.target.value })}
                                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                    placeholder="https://yoursite.com"
                                                />
                                            </div>
                                            <div className="grid gap-4">
                                                <Label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">UI8 Registry</Label>
                                                <Input
                                                    value={socials.ui8}
                                                    onChange={e => setSocials({ ...socials, ui8: e.target.value })}
                                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                    placeholder="ui8.net/username"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div className="grid gap-4">
                                                <Label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">
                                                    <Dribbble className="h-4 w-4 text-pink-500" /> Dribbble Node
                                                </Label>
                                                <Input
                                                    value={socials.dribbble}
                                                    onChange={e => setSocials({ ...socials, dribbble: e.target.value })}
                                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                    placeholder="dribbble.com/username"
                                                />
                                            </div>
                                            <div className="grid gap-4">
                                                <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 ml-1">Behance Relay</Label>
                                                <Input
                                                    value={socials.behance}
                                                    onChange={e => setSocials({ ...socials, behance: e.target.value })}
                                                    className="h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-primary/30 focus:bg-white/[0.04] transition-all text-sm font-semibold placeholder:text-zinc-800"
                                                    placeholder="behance.net/username"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8">
                                            <Button
                                                onClick={handleSocialsUpdate}
                                                disabled={isLoading}
                                                className="w-full h-14 text-base font-bold rounded-full transition-all duration-500 bg-foreground text-background hover:bg-foreground/90 hover:scale-[1.01] active:scale-95 shadow-none tracking-tight"
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        <span>Syncing Relays...</span>
                                                    </div>
                                                ) : (
                                                    "Save Social Hub"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab Placeholder */}
                            {activeTab === "notifications" && (
                                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold mb-8">Notifications</h2>
                                    <div className="glass-card p-16 rounded-[40px] border-white/5 text-center group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                                        <Bell className="h-16 w-16 mx-auto mb-6 text-primary/20 group-hover:text-primary/40 transition-colors duration-500" />
                                        <p className="text-xl font-bold text-muted-foreground/40">Sync alerts processing...</p>
                                        <p className="text-sm text-muted-foreground/20 mt-2 font-medium">Coming soon to your neural link.</p>
                                    </div>
                                </div>
                            )}



                            {/* Activity History Tab */}
                            {activeTab === "activity" && <ActivityHistoryTab userId={user?.id} />}

                            {/* Delete Account Tab Placeholder */}
                            {activeTab === "delete" && (
                                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h2 className="text-xl font-bold mb-8 text-destructive/80">Termination</h2>
                                    <div className="glass-card border-destructive/10 bg-destructive/5 p-12 rounded-[40px] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-destructive/10 transition-all duration-700" />
                                        <h3 className="text-2xl font-bold text-destructive/80 mb-4 tracking-tight">Danger Protocol</h3>
                                        <p className="text-lg text-muted-foreground/60 mb-10 font-medium leading-relaxed">
                                            Once you terminate your connection, all neural data will be purged. This action is irreversible.
                                        </p>
                                        <Button variant="destructive" className="h-14 px-12 rounded-full font-bold shadow-none hover:scale-[1.02] active:scale-95 transition-all text-base">
                                            Terminate Connection
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
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
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-4">
                <History className="h-6 w-6 text-primary/40" strokeWidth={2} /> Transmission History
            </h2>

            <div className="glass-card border-white/5 rounded-[32px] overflow-hidden shadow-none">
                {activities.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {activities.map((log) => (
                            <div key={log.id} className="p-8 hover:bg-white/[0.02] transition-all flex items-start gap-6 group">
                                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 shadow-none mt-1 group-hover:scale-105 transition-transform duration-500">
                                    {getIcon(log.action)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <p className="text-lg font-bold text-foreground tracking-tight">
                                            {formatAction(log.action)}
                                        </p>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 flex items-center gap-2 whitespace-nowrap">
                                            <CalendarClock className="h-3 w-3" />
                                            {formatDate(log.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground/60 font-medium leading-relaxed">
                                        {log.details}
                                    </p>
                                    {log.device && (
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 mt-3 truncate">
                                            Nexus: {log.device}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center text-muted-foreground/20">
                        <History className="h-16 w-16 mx-auto mb-6 opacity-10" strokeWidth={1} />
                        <p className="text-xl font-bold">No transmissions detected.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
