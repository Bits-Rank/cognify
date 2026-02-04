export function TermsPage() {
    return (
        <div className="min-h-screen py-24 px-4 mesh-gradient">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-20 max-w-4xl">
                    <span className="inline-block px-5 py-2 rounded-full border border-primary/20 text-[10px] font-bold tracking-[0.3em] uppercase mb-8 bg-primary/5 text-primary backdrop-blur-xl">
                        Community Guidelines v2.0
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-10 text-foreground">
                        Rules of <span className="highlight">the road.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground/60 leading-relaxed font-medium border-l-2 border-primary/20 pl-8 mb-10">
                        By using Cognify, you agree to these terms. We want to keep this community safe, creative, and respectful for everyone.
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                        Effective date: January 31, 2026
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 1. Acceptance */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">1. Acceptance</h2>
                        <p className="text-muted-foreground/80 relative z-10 font-medium text-base leading-relaxed">
                            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                        </p>
                    </div>

                    {/* 2. Content */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">2. Responsibility</h2>
                        <p className="text-muted-foreground/80 relative z-10 font-medium text-base leading-relaxed">
                            You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                        </p>
                    </div>

                    {/* 3. Accounts */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">3. Identity</h2>
                        <p className="text-muted-foreground/80 relative z-10 font-medium text-base leading-relaxed">
                            Account information must be accurate and current. Failure to do so constitutes a breach of the Terms, resulting in potential termination.
                        </p>
                    </div>

                    {/* 4. Intellectual Property */}
                    <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-all duration-700" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-muted-foreground/40 mb-8 relative z-10">4. Neural IP</h2>
                        <p className="text-muted-foreground/80 relative z-10 font-medium text-base leading-relaxed">
                            The Service and its original features remain the exclusive property of Cognify and its licensors.
                        </p>
                    </div>

                    {/* 5. Termination */}
                    <div className="glass-card rounded-[40px] p-12 border-white/5 shadow-none md:col-span-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/10 transition-all duration-1000" />
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-primary/40 mb-8 relative z-10">5. Termination Relay</h2>
                        <p className="text-xl text-muted-foreground/80 relative z-10 font-bold tracking-tight leading-snug">
                            We may terminate or suspend access to our Service immediately, without prior notice, for any reason whatsoever, including breach of Terms.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}
