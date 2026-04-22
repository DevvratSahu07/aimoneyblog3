import { useState } from "react";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

interface NewsletterFormProps {
  variant?: "default" | "compact";
}

export function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const { mutate: subscribe, isPending } = useSubscribeNewsletter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    subscribe(
      { data: { email } },
      {
        onSuccess: () => {
          toast({
            title: "Subscribed successfully!",
            description: "Check your inbox for the latest AI money insights.",
          });
          setEmail("");
        },
        onError: () => {
          toast({
            title: "Failed to subscribe",
            description: "Please try again later.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-background"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          placeholder="hello@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 h-12 text-base"
        />
        <Button type="submit" size="lg" disabled={isPending} className="h-12 px-8">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
          Get Updates
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
}