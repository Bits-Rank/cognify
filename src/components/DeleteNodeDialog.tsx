import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, AlertTriangle } from 'lucide-react'

import { useTheme } from "@/components/ThemeProvider"

interface DeleteNodeDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    description?: string
}

export const DeleteNodeDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Prompt?",
    description = "This action will permanently delete this prompt. This cannot be undone."
}: DeleteNodeDialogProps) => {
    const { theme } = useTheme()
    const isDark = theme === "dark"

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className={`max-w-md rounded-[3rem] p-10 border transition-all duration-500 backdrop-blur-3xl overflow-hidden ${isDark ? 'glass-card border-destructive/20 bg-black/40 text-white' : 'bg-white/95 border-zinc-200 text-black shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]'}`}>
                <AlertDialogHeader>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${isDark ? 'bg-destructive/20 text-destructive' : 'bg-destructive/10 text-destructive'}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <AlertDialogTitle className={`text-2xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-950'}`}>{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className={`text-base leading-relaxed font-bold transition-colors ${isDark ? 'text-zinc-400' : 'text-zinc-900'}`}>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-10 gap-4">
                    <AlertDialogCancel
                        onClick={onClose}
                        className={`rounded-2xl h-14 px-8 font-extrabold transition-all border-2 ${isDark ? 'border-white/5 hover:bg-white/5 text-white' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-800'}`}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="rounded-2xl h-14 px-8 font-extrabold bg-destructive text-white hover:bg-destructive/90 transition-all gap-2 border-0 shadow-lg shadow-destructive/20"
                    >
                        <Trash2 className="h-5 w-5" /> Delete Prompt
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
