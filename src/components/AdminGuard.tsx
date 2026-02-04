import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isAdmin, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Verifying Authorization...</p>
                </div>
            </div>
        )
    }

    if (!user || !isAdmin) {
        // Redirect non-admins to home page
        return <Navigate to="/" state={{ from: location }} replace />
    }

    return <>{children}</>
}
