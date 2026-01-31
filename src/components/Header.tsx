import { Link, useLocation } from "react-router-dom"
import { User, Menu, X } from "lucide-react" /* Removed Sparkles */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { toast } from "react-toastify"
import { Logo } from "@/components/Logo"
import { Sparkles } from "lucide-react" // Keep Sparkles for "Generate Image" button

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Images" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full glass border-b-0">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-semibold tracking-wide text-sm uppercase text-foreground">
            Cognify
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === link.to
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/submit">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Submit Prompt
            </Button>
          </Link>


          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="h-9 w-9 border-2 border-border cursor-pointer hover:border-foreground/30 transition-colors">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <Link to="/sign-in">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === link.to
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Submit Prompt
            </Link>
            <div className="mt-4 pt-4 border-t border-border">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || ""} />
                        <AvatarFallback className="bg-muted text-sm">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => { signOut(); toast.info("You have been signed out."); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-muted rounded-xl"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl">Sign In</Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
