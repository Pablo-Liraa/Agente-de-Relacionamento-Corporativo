import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-message)]">
          <Bot className="h-5 w-5" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-[var(--shadow-message)]",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card text-card-foreground border border-border rounded-tl-sm",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 text-sm leading-relaxed">
            <ReactMarkdown>{content || "..."}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-message)]">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};