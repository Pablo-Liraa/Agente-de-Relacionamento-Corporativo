import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/ChatMessage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const SUGGESTIONS = [
  "Como dar feedback negativo sem causar constrangimento?",
  "Modelo de e-mail para advertir um funcionário sobre atrasos.",
  "Como abordar queda de desempenho de um colaborador?",
  "Script para conversa sobre conflito entre membros da equipe.",
];

const Index = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m,
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (resp.status === 429) {
        toast.error("Muitas requisições. Aguarde alguns segundos e tente novamente.");
        setMessages(nextMessages);
        return;
      }
      if (resp.status === 402) {
        toast.error("Créditos do workspace esgotados. Adicione créditos no Lovable.");
        setMessages(nextMessages);
        return;
      }
      if (!resp.ok || !resp.body) {
        throw new Error("Falha ao iniciar a conversa");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível obter a resposta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[image:var(--gradient-subtle)]">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Agente de Relacionamento Corporativo</h1>
              <p className="text-xs text-muted-foreground">
                Assistente para gestores em conversas sensíveis com colaboradores
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-6 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-2 max-w-xl">
                <h2 className="text-2xl font-semibold text-foreground">
                  Como posso ajudar você hoje?
                </h2>
                <p className="text-muted-foreground">
                  Descreva o contexto e eu sugiro um diálogo, mensagem ou e-mail apropriado — com
                  linguagem formal, empática e segura juridicamente.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-2 mt-4">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left rounded-xl border border-border bg-card p-4 text-sm text-card-foreground transition-all hover:border-primary hover:shadow-[var(--shadow-message)] hover:-translate-y-0.5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((m, i) => (
                <ChatMessage key={i} role={m.role} content={m.content} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm pl-12">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pensando...
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card/60 backdrop-blur-sm">
        <div className="container max-w-3xl py-4">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-message)] focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva a situação com seu colaborador..."
              rows={1}
              className="min-h-[44px] max-h-40 resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="shrink-0 h-11 w-11 rounded-xl bg-[image:var(--gradient-primary)] hover:opacity-90 transition-opacity"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            As respostas seguem as melhores práticas sobre assédio moral (TST, Hirigoyen, Leymann, Barreto).
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
