import { useState, useRef, useEffect } from "react";
import { useAiChat, ChatTurn } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Bot, User, X, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage, isPending } = useAiChat();
  const [, setLocation] = useLocation();

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

  const handleExpand = () => {
    setIsOpen(false);
    setLocation("/assistant");
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all"
              onClick={() => setIsOpen(true)}
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px]"
          >
            <Card className="flex flex-col h-[500px] shadow-2xl border-primary/20 overflow-hidden">
              <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold">AI Money Assistant</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={handleExpand}>
                    <Minimize2 className="h-4 w-4 rotate-180" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {history.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Hi! I'm your AI money assistant. Ask me anything about monetizing AI tools, side hustles, or digital products.</p>
                      <div className="mt-6 space-y-2 flex flex-col items-center">
                        <button onClick={() => handleSend("What are the best AI side hustles right now?")} className="text-xs bg-muted hover:bg-muted/80 px-3 py-2 rounded-full transition-colors w-max">
                          What are the best AI side hustles right now?
                        </button>
                        <button onClick={() => handleSend("How can I start a newsletter?")} className="text-xs bg-muted hover:bg-muted/80 px-3 py-2 rounded-full transition-colors w-max">
                          How can I start a newsletter?
                        </button>
                      </div>
                    </div>
                  )}

                  {history.map((turn, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${
                        turn.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        turn.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        {turn.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${
                          turn.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {turn.content}
                      </div>
                    </div>
                  ))}

                  {isPending && (
                    <div className="flex gap-3">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl px-4 py-2 bg-muted text-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 border-t bg-background">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2 relative"
                >
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask anything..."
                    disabled={isPending}
                    className="pr-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || isPending}
                    className="absolute right-1 top-1 h-8 w-8 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
