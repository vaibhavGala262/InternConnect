import Link from "next/link"
import { Github, Twitter, Linkedin, Instagram, BookOpen } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="app-footer">
      <div className="container mx-auto px-4">
        <div className="footer-content">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>InternConnect</span>
          </div>

          <div className="footer-links">
            <Link href="/about" className="footer-link">
              About
            </Link>
            <Link href="/privacy" className="footer-link">
              Privacy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms
            </Link>
            <Link href="/contact-us" className="footer-link">
              Contact
            </Link>
            <Link href="/faq" className="footer-link">
              FAQ
            </Link>
          </div>

          <div className="footer-social">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} InternConnect. All rights reserved.</p>
          <p className="mt-1">Connecting students with opportunities.</p>
        </div>
      </div>
    </footer>
  )
}
