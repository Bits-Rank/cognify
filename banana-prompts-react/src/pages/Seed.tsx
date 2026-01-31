import { useState } from "react"
import { seedDatabase } from "@/lib/seed"
import { Button } from "@/components/ui/button"

export function SeedPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

    const handleSeed = async () => {
        setStatus("loading")
        const success = await seedDatabase()
        setStatus(success ? "success" : "error")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-8 bg-card border border-border rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
                <p className="mb-6 text-muted-foreground">
                    Click below to populate Firestore with mock prompts.
                </p>

                <Button
                    onClick={handleSeed}
                    disabled={status === "loading" || status === "success"}
                    className="w-full"
                >
                    {status === "loading" ? "Seeding..." :
                        status === "success" ? "Done!" :
                            "Seed Database"}
                </Button>

                {status === "success" && (
                    <p className="mt-4 text-green-500 font-medium">
                        Success! Go to <a href="/" className="underline">Home</a>
                    </p>
                )}
                {status === "error" && (
                    <p className="mt-4 text-red-500 font-medium">
                        Error seeding database. Check console.
                    </p>
                )}
            </div>
        </div>
    )
}
