import { Link } from "wouter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, ShieldCheck, Mail } from "lucide-react";

export default function About() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-4xl">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-6">
          About AI Money Info
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We help curious creators, side-hustlers, and solo founders navigate the noise and build profitable businesses with AI.
        </p>
      </div>

      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none mb-16">
        <p className="lead text-xl md:text-2xl text-foreground font-serif">
          The AI revolution isn't just about faster workflows or cooler tech demos. It's the greatest wealth creation opportunity of our generation. But finding actionable, tested strategies in a sea of hype is exhausting.
        </p>
        
        <p>
          That's why we built AI Money Info. We believe that with the right tools and strategies, anyone can build a profitable digital business or side hustle. Our mission is to cut through the fluff and provide deep-dives, case studies, and resources that actually work.
        </p>

        <h3>What you'll find here</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
          <div className="bg-muted/30 border rounded-xl p-6">
            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold mb-2">Tested Strategies</h4>
            <p className="text-sm text-muted-foreground">We analyze what's working right now in the creator economy and SaaS space.</p>
          </div>
          <div className="bg-muted/30 border rounded-xl p-6">
            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold mb-2">Tool Deep Dives</h4>
            <p className="text-sm text-muted-foreground">Honest reviews of the AI tools that actually justify their monthly subscriptions.</p>
          </div>
          <div className="bg-muted/30 border rounded-xl p-6">
            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold mb-2">Founder Case Studies</h4>
            <p className="text-sm text-muted-foreground">Interviews and breakdowns of solo founders making money with AI.</p>
          </div>
          <div className="bg-muted/30 border rounded-xl p-6">
            <CheckCircle2 className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold mb-2">Actionable Blueprints</h4>
            <p className="text-sm text-muted-foreground">Step-by-step guides you can implement this weekend.</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 my-12 not-prose">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold m-0">Our Monetization Disclosure</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Trust is our most valuable asset. We want to be completely transparent about how we make money:
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary">•</span> We may earn an affiliate commission when you purchase through some of the links on our site, at no extra cost to you.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> We never recommend a tool solely for the commission. If it's on our site, we've tested it and believe it provides real value.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Some of our deep-dive content is available exclusively to premium subscribers.</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Sponsored posts are strictly labeled as such.</li>
          </ul>
        </div>
      </div>

      <div className="text-center py-12 border-t">
        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-6 opacity-50" />
        <h2 className="text-2xl font-serif font-bold mb-4">Ready to start earning?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Join our newsletter to get our best strategies delivered straight to your inbox every week.
        </p>
        <div className="max-w-md mx-auto">
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}