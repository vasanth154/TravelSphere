"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, MessageCircle } from "lucide-react";
import { travelChat, ChatResponse } from "../lib/api";
import { Button } from "./ui/Button";

interface Message {
  role: "user" | "assistant";
  content: string;
  generated?: boolean;
}

const SUGGESTIONS = [
  "Best food in Goa",
  "Plan my evening in Kochi",
  "Where should I go for a beach trip?",
  "What should I pack for Ooty?",
  "Recommend a hotel in Paris",
];

export function ChatWidget({ defaultCity }: { defaultCity?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your TravelSphere buddy. Ask me about food, places, scheduling, packing or hotels in any city.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setBusy(true);
    try {
      const res: ChatResponse = await travelChat(text);
      setMessages((m) => [...m, { role: "assistant", content: res.answer, generated: res.is_ai_generated }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the assistant right now. Try again in a moment, or explore the Discover tab for ideas.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-pop transition-transform hover:scale-105"
        aria-label="Open travel assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[520px] max-h-[70vh] w-[92vw] max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-pop">
          <div className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-cyan-500 px-4 py-3 text-white">
            <Sparkles className="h-5 w-5" />
            <div>
              <div className="text-sm font-bold">TravelSphere AI</div>
              <div className="text-[11px] text-brand-100">Ask me anything about your trip</div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-brand-600 text-white"
                      : m.generated
                      ? "bg-slate-100 text-slate-800"
                      : "border border-brand-200 bg-brand-50 text-slate-800"
                  }`}
                >
                  {m.content}
                  {m.role === "assistant" && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      {m.generated ? "AI-generated · not live data" : "curated recommendations"}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">Thinking…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 pb-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s.replace("Goa", defaultCity ?? "Goa"))}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="field flex-1"
                placeholder="Ask about food, places, packing, hotels…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void send(input)}
              />
              <Button size="sm" onClick={() => void send(input)} loading={busy}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}