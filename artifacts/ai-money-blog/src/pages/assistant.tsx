import { useState, useRef, useEffect } from "react";
import { useAiChat, ChatTurn } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Assistant() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage, isPending } = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isPending]);

  const handleSend = (text: string = message) => {
    if (!text.trim() || isPending) return;

    const userMsg: ChatTurn = { role: "user", content: text };
    setHistory((prev) => [...prev, userMsg]);
    setMessage("");

    sendMessage(
      { data: { message: text, history } },
      {
        onSuccess: (data) => {
          setHistory((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">AI Money Assistant</h1>
            <p className="text-muted-foreground text-sm">Your personal guide to monetizing AI</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Minimize2 className="w-4 h-4" /> Back to Blog
          </Button>
        </Link>
      </div>

      <div className="flex-1 bg-card border rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {history.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-serif font-bold mb-3">How can I help you earn with AI?</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-10">
                  I'm trained on the best strategies for AI side hustles, content creation, and digital products. Ask me anything.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button 
                    onClick={() => handleSend("What are the most profitable AI side hustles for beginners?")} 
                    className="text-left p-4 rounded-xl border bg-muted/30 hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">Beginner Friendly</div>
                    <div className="text-xs text-muted-foreground">Most profitable AI side hustles to start today</div>
                  </button>
                  <button 
                    onClick={() => handleSend("How can I build an AI newsletter audience?")} 
                    className="text-left p-4 rounded-xl border bg-muted/30 hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">Content Creation</div>
                    <div className="text-xs text-muted-foreground">Building and monetizing an AI newsletter</div>
                  </button>
                  <button 
                    onClick={() => handleSend("Give me a step-by-step plan to create an AI-powered SaaS without coding")} 
                    className="text-left p-4 rounded-xl border bg-muted/30 hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">No-Code SaaS</div>
                    <div className="text-xs text-muted-foreground">Step-by-step plan to build without coding</div>
                  </button>
                  <button 
                    onClick={() => handleSend("How do I price my AI consulting services?")} 
                    className="text-left p-4 rounded-xl border bg-muted/30 hover:bg-muted transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">Consulting</div>
                    <div className="text-xs text-muted-foreground">Pricing strategies for AI services</div>
                  </button>
                </div>
              </motion.div>
            )}

            {history.map((turn, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex gap-4 ${
                  turn.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                  turn.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
                }`}>
                  {turn.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-foreground" />}
                </div>
                <div
                  className={`rounded-2xl px-6 py-4 max-w-[85%] ${
                    turn.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground border prose prose-sm dark:prose-invert prose-p:leading-relaxed"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{turn.content}</div>
                </div>
              </motion.div>
            ))}

            {isPending && (
              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 rounded-full bg-muted border flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5 text-foreground" />
                </div>
                <div className="rounded-2xl px-6 py-5 bg-muted/50 text-foreground border flex items-center gap-2 h-[52px]">
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 md:p-6 bg-background border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3 relative max-w-3xl mx-auto"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me how to monetize AI..."
              disabled={isPending}
              className="pr-14 h-14 rounded-full text-base bg-muted/30 focus-visible:bg-background"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || isPending}
              className="absolute right-2 top-2 h-10 w-10 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground">
              AI can make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
