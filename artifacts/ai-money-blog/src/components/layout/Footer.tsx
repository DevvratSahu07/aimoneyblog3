import { Link } from "wouter";
import { NewsletterForm } from "../NewsletterForm";
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 inline-flex">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">AI Money Info</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              A modern publication helping curious creators and solo founders discover, learn, and monetize AI tools. Turn the AI revolution into a profitable reality.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold tracking-tight">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary transition-colors">All Articles</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link href="/resources" className="hover:text-primary transition-colors">AI Resources</Link></li>
              <li><Link href="/trending" className="hover:text-primary transition-colors">Trending</Link></li>
              <li><Link href="/assistant" className="hover:text-primary transition-colors">AI Assistant</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold tracking-tight">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get the latest AI monetization strategies delivered to your inbox.
            </p>
            <NewsletterForm variant="compact" />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Money Info. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}