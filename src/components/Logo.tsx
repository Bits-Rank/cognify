import logo from "@/assets/logo-removebg-preview.png"

interface LogoProps {
    className?: string
    alt?: string
    forceDark?: boolean // Kept for API compatibility, but unused for now
}

export function Logo({ className = "h-6 w-6", alt = "Cognify", forceDark = false }: LogoProps) {
    return <img src={logo} alt={alt} className={className} />
}
