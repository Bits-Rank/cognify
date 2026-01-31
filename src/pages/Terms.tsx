export function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
                {/* Header */}
                <div className="mb-16 max-w-3xl">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-border text-xs font-bold tracking-widest uppercase mb-6 bg-background">
                        Terms of Service
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground">
                        Rules of the road.
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                        By using Cognify, you agree to these terms. We want to keep this community safe, creative, and respectful for everyone.
                    </p>
                    <p className="mt-8 text-sm text-muted-foreground">
                        Effective date: January 31, 2026
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* 1. Acceptance */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                        </p>
                    </div>

                    {/* 2. Content */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">2. Content & Responsibility</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                        </p>
                    </div>

                    {/* 3. Accounts */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">3. Accounts</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                    </div>

                    {/* 4. IP */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">4. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Cognify and its licensors.
                        </p>
                    </div>

                    {/* 5. Termination */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm md:col-span-2">
                        <h2 className="text-2xl font-bold mb-6">5. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}
