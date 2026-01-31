import { Link } from "react-router-dom"
import { Logo } from "@/components/Logo"

export function Footer() {
  return (
    <footer className="py-10 mt-auto bg-muted/30 text-muted-foreground border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="h-10 w-10" />
            <span className="font-bold text-2xl tracking-tight text-foreground">Cognify</span>
          </Link>
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          <p className="text-sm text-muted-foreground">
            © 2026 Cognify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
