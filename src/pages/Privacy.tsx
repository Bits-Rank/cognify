import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-7xl">
                {/* Header */}
                <div className="mb-16 max-w-3xl">
                    <span className="inline-block px-4 py-1.5 rounded-full border border-border text-xs font-bold tracking-widest uppercase mb-6 bg-background">
                        Privacy Policy
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground">
                        Your privacy matters to us.
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                        This Privacy Policy explains how Banana Prompts collects, uses, and protects your personal information. We believe in transparency and giving you control over your data.
                    </p>
                    <p className="mt-8 text-sm text-muted-foreground">
                        Effective date: October 12, 2025
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Information We Collect */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Information We Collect</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            When you use Banana Prompts, we collect information to provide and improve our services. This includes information you provide directly and data collected automatically.
                        </p>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Account information: email address, username, and authentication credentials (via Google OAuth)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Content you submit: AI-generated images, prompts, tags, and metadata</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Usage data: pages visited, features used, and interactions with content</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Device information: browser type, IP address, and operating system</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Payment information: processed securely through Creem (we do not store credit card details)</span>
                            </li>
                        </ul>
                    </div>

                    {/* How We Use Your Information */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            We use the information we collect to operate, maintain, and improve Banana Prompts. Your data helps us provide a better experience for the entire community.
                        </p>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Authentication and account management</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Storing and displaying your submitted content in the gallery</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Processing payments and managing subscriptions</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Analyzing usage patterns to improve features and performance</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Communicating important updates about the service</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Preventing abuse, spam, and security threats</span>
                            </li>
                        </ul>
                    </div>

                    {/* Third-Party Services */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Third-Party Services</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            Banana Prompts integrates with trusted third-party services to provide core functionality. These services have their own privacy policies and data practices.
                        </p>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Supabase: Authentication, database, and user management</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Cloudflare R2: Image storage and content delivery</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Creem: Payment processing and subscription management</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>OpenAI: AI video generation via Sora 2 API</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Vercel: Web hosting and infrastructure</span>
                            </li>
                        </ul>
                    </div>

                    {/* Data Sharing and Disclosure */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6">Data Sharing and Disclosure</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            We do not sell your personal information. We only share data in limited circumstances necessary to operate the service or comply with legal obligations.
                        </p>
                        <ul className="space-y-4 text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Public content: Images and prompts you submit are visible to all users</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Service providers: Third-party services listed above that help operate the platform</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Legal compliance: When required by law or to protect our rights and users</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>Business transfers: In the event of a merger, acquisition, or sale of assets</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us (Small) */}
                    <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            If you have questions about this Privacy Policy or how we handle your data, please reach out to us. We're committed to addressing your privacy concerns.
                        </p>
                        <a href="mailto:support@cognify.com" className="inline-flex items-center text-primary font-bold hover:opacity-80 transition-opacity">
                            Email support@cognify.com <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </div>

                </div>

                {/* Quick Summary (Wide) */}
                <div className="bg-card text-card-foreground rounded-[2rem] p-8 md:p-10 border border-border/50 shadow-sm mt-6">
                    <h2 className="text-2xl font-bold mb-4">Quick Summary</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        We collect information necessary to operate Banana Prompts and provide you with a great experience. Your submitted content is public, but we never sell your personal information. You can request access, correction, or deletion of your information at any time. Questions? Contact us at support@cognify.com.
                    </p>
                </div>

            </div>
        </div>
    )
}
