import { Link } from 'react-router-dom';

export function CommunityResources() {
    return (
        <div className="bg-card text-card-foreground rounded-[1.5rem] p-6 md:p-8 shadow-sm border border-border/50 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left Column */}
                <div className="flex flex-col items-start gap-3">
                    <span className="bg-[#1a1a2e] dark:bg-zinc-800 text-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-full uppercase">
                        Community Resources
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
                        Why we share every prompt
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        Banana Prompts exists to make the craft behind AI visuals transparent. We publish settings, pacing notes, and lessons learned so everyone—from curious fans to pro directors—can turn inspiration into their own story.
                    </p>
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-start gap-3">
                    <span className="bg-[#fde047] text-black text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-full uppercase">
                        Share Your Art
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
                        Submit your prompt and teach the community
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        Send your latest render with the prompt, settings, and story behind it. We feature the most helpful breakdowns and credit every creator.
                    </p>
                    <Link
                        to="/submit"
                        className="inline-flex items-center font-bold text-foreground mt-1 hover:opacity-70 transition-opacity text-sm md:text-base"
                    >
                        Submit to the gallery
                    </Link>
                </div>
            </div>
        </div>
    );
}
