import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, X } from "lucide-react"
import { toast } from "react-toastify"

export function TwoFactorModal() {
    const { pendingTwoFactorAuth, verifyTwoFactorCode, cancelTwoFactorAuth } = useAuth()
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    if (!pendingTwoFactorAuth) return null

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError("Please enter a 6-digit code")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const isValid = await verifyTwoFactorCode(code)
            if (isValid) {
                toast.success("Two-Factor Authentication verified!")
            } else {
                setError("Invalid code. Please try again.")
                setCode("")
            }
        } catch (err) {
            setError("Verification failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        cancelTwoFactorAuth()
        toast.info("Login cancelled")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && code.length === 6) {
            handleVerify()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                >
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
                    <p className="text-muted-foreground mt-2">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                {/* Code Input */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="2fa-code" className="sr-only">Verification Code</Label>
                        <Input
                            id="2fa-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="000000"
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                setCode(value)
                                setError("")
                            }}
                            onKeyDown={handleKeyDown}
                            className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                            autoFocus
                            autoComplete="one-time-code"
                        />
                    </div>

                    {error && (
                        <p className="text-destructive text-sm text-center animate-in fade-in">
                            {error}
                        </p>
                    )}

                    <Button
                        onClick={handleVerify}
                        disabled={code.length !== 6 || isLoading}
                        className="w-full h-12 text-base"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Code"
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Open your authenticator app (Google Authenticator, Authy, etc.)
                        to view your verification code.
                    </p>
                </div>
            </div>
        </div>
    )
}
