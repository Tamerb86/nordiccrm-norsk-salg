import { ChartBar, Heart, Shield, Lock, Book, Globe } from '@phosphor-icons/react'
import { useLanguage } from '@/lib/language-context'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Footer() {
  const { t, language, setLanguage } = useLanguage()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: t.footer.features, href: '#features' },
      { label: t.footer.pricing, href: '#pricing' },
      { label: t.footer.documentation, href: '#docs' },
      { label: t.api.apiDocs, href: '#api' },
    ],
    company: [
      { label: t.footer.about, href: '#about' },
      { label: t.footer.blog, href: '#blog' },
      { label: t.footer.contact, href: '#contact' },
    ],
    support: [
      { label: t.footer.helpCenter, href: '#help' },
      { label: t.footer.communityForum, href: '#community' },
      { label: t.api.apiDocs, href: '#api-docs' },
    ],
    legal: [
      { label: t.footer.privacy, href: '#privacy' },
      { label: t.footer.terms, href: '#terms' },
      { label: t.footer.gdpr, href: '#gdpr' },
      { label: t.footer.security, href: '#security' },
    ],
  }

  return (
    <footer className="mt-auto bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <ChartBar size={24} weight="duotone" className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t.app.title}</h3>
                <p className="text-xs text-muted-foreground">{t.app.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.product}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.company}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.support}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t.footer.legal}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {link.label === t.footer.gdpr && <Shield size={14} />}
                    {link.label === t.footer.security && <Lock size={14} />}
                    {link.label === t.footer.privacy && <Book size={14} />}
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>© {currentYear} {t.app.title}. {t.footer.allRightsReserved}.</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-2">
              {t.footer.madeIn} <Heart size={14} weight="fill" className="text-destructive" />
            </span>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe size={16} weight="duotone" />
                  <span className="text-xs font-medium">{language === 'no' ? '🇳🇴 Norsk' : '🇬🇧 English'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('no')} className="gap-2">
                  <span>🇳🇴</span>
                  <span>Norsk</span>
                  {language === 'no' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="gap-2">
                  <span>🇬🇧</span>
                  <span>English</span>
                  {language === 'en' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
              <Shield size={16} className="text-accent" weight="duotone" />
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'no' ? 'GDPR-kompatibel' : 'GDPR Compliant'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
              <Lock size={16} className="text-accent" weight="duotone" />
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'no' ? 'SSL Sikker' : 'SSL Secure'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
