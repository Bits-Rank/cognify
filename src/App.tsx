import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import CardNav from './components/CardNav'
import { Logo } from './components/Logo'
import { Footer } from './components/Footer'
import { HomePage } from './pages/Home'
import { BrowsePage } from './pages/Browse'
import { SignInPage } from './pages/SignIn'
import { ProfilePage } from './pages/Profile'
import { PricingPage } from './pages/Pricing'

import { PromptDetailPage } from './pages/PromptDetail'
import { SettingsPage } from './pages/Settings'
import { AboutPage } from './pages/About'
import { SubmitPromptPage } from './pages/SubmitPrompt'
import { TermsPage } from './pages/Terms'
import { PrivacyPage } from './pages/Privacy'
import { FAQPage } from './pages/FAQ'
import { ContactPage } from './pages/Contact'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { ThemeProvider } from './components/ThemeProvider'
import { TwoFactorModal } from './components/TwoFactorModal'
import { AdminGuard } from './components/AdminGuard'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UserManagement } from './pages/admin/UserManagement'
import { PromptManagement } from './pages/admin/PromptManagement'


function App() {
  const items = [
    {
      label: "Discover",
      bgColor: "var(--card)",
      textColor: "var(--foreground)",
      links: [
        { label: "Explore", ariaLabel: "Explore Images", href: "/explore" },
      ]
    },
    {
      label: "Community",
      bgColor: "var(--secondary)",
      textColor: "var(--secondary-foreground)",
      links: [
        { label: "Submit Prompt", ariaLabel: "Submit Prompt", href: "/submit" },
        { label: "About", ariaLabel: "About Us", href: "/about" }
      ]
    },
    {
      label: "Pricing",
      bgColor: "var(--accent)",
      textColor: "var(--accent-foreground)",
      links: [
        { label: "Plans", ariaLabel: "View Pricing Plans", href: "/pricing" }
      ]
    },
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
            <CardNav
              logo={<Logo className="h-10 w-auto" />}
              items={items}
              baseColor="var(--background)"
              menuColor="var(--foreground)"
              buttonBgColor="var(--primary)"
              buttonTextColor="var(--primary-foreground)"
              ease="back.out(1.7)"
            />
            <main className="flex-1 pt-24">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<BrowsePage />} />
                <Route path="/prompt/:id" element={<PromptDetailPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/pricing" element={<PricingPage />} />

                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/submit" element={<SubmitPromptPage />} />
                <Route path="/pricing" element={<AboutPage />} /> {/* Placeholder */}
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminDashboard />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminGuard>
                      <UserManagement />
                    </AdminGuard>
                  }
                />
                <Route
                  path="/admin/prompts"
                  element={
                    <AdminGuard>
                      <PromptManagement />
                    </AdminGuard>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <TwoFactorModal />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider >
  )
}

export default App
