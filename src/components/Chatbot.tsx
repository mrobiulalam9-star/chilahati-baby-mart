"use client";

import { useEffect, useRef, useState } from "react";
import { site, waLink } from "@/lib/site";
import { categories } from "@/lib/products";

type Msg = { from: "bot" | "user"; text: string };

const QUICK = [
  "ডেলিভারি চার্জ কত?",
  "খোলার সময় কী?",
  "ঠিকানা কী?",
  "অর্ডার করতে চাই",
];

const SUGGESTIONS = categories
  .slice(0, 4)
  .map((c) => c.name)
  .join(", ");

function botReply(input: string): string {
  const t = input.toLowerCase();

  if (/address|ঠিকানা|কোথায়|location/.test(t)) {
    return `আমাদের ঠিকানা: ${site.addressShort}। Google Maps এ দেখতে চাইলে নিচের WhatsApp লিংকে মেসেজ করুন।`;
  }
  if (/deliver|shipping|ডেলিভারি|চার্জ|ডাক/.test(t)) {
    return "আমরা চিলাহাটি বাজার এলাকায় হোম ডেলিভারি দিয়ে থাকি। ডেলিভারি চার্জ জানতে বা অর্ডার করতে কল করুন 👉 " + site.phoneDisplay;
  }
  if (/hour|time|খোলা|সময়|open|close/.test(t)) {
    return `আমাদের দোকানের সময়:\n${site.hours.map((h) => `${h.days}: ${h.time}`).join("\n")}`;
  }
  if (/order|অর্ডার|কিনতে|কেনা|buy|কি.মু/.test(t)) {
    return `অর্ডার করতে কল অথবা WhatsApp করুন:\n📞 ${site.phoneDisplay}\n\nনিচের "WhatsApp এ চ্যাট" বাটন চেপে সরাসরি মেসেজও পাঠাতে পারবেন।`;
  }
  if (/shop|product|পণ্য|প্রোডাক্ট|what.*sell|আছ[ে]\s*কি/.test(t)) {
    return `আমাদের দোকানে আছে: ${SUGGESTIONS} সহ আরও অনেক কিছু। /shop পেজে ঘুরে দেখুন!`;
  }
  if (/price|দাম|মূল্য/.test(t)) {
    return "সব পণ্যের দাম শপ পেজে দেখানো আছে। আপডেটেড দাম জানতে নিচের WhatsApp বাটনে চাপ দিন।";
  }
  if (/hi|hello|assalam|আসসালাম|হ্যালো|হাই/.test(t)) {
    return `ওয়ালাইকুম আসসালাম! 🙏 চিলাহাটি লেডিস অ্যান্ড বেবি মার্টে স্বাগতম। কীভাবে সাহায্য করতে পারি?`;
  }
  return `আমি বুঝতে পারিনি 😊 দয়া করে নিচের অপশনগুলো থেকে বেছে নিন, অথবা সরাসরি কল করুন ${site.phoneDisplay}। মানুষজন উত্তর দিবে!`;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text: `আসসালামু আলাইকুম! 👋 ${site.nameBn} এ স্বাগতম। পণ্য, ডেলিভারি বা অর্ডার নিয়ে প্রশ্ন থাকলে লিখুন।`,
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { from: "user", text: value }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: botReply(value) }]);
    }, 450);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(88vw,380px)] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 bg-blush px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Chatbot · সহায়তা</p>
                <p className="text-xs text-white/70 leading-tight">সাধারণত সাথে সাথে উত্তর দেয়</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="grid size-8 place-items-center rounded-full hover:bg-white/20 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex h-80 flex-col gap-2.5 overflow-y-auto px-3.5 py-3.5">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${m.from === "bot" ? "self-start rounded-bl-sm bg-cream text-ink" : "self-end rounded-br-sm bg-blush text-white"}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-line px-3.5 py-2.5">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-blush hover:text-blush transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-line px-3.5 py-2.5">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="মেসেজ লিখুন..."
              className="flex-1 rounded-full border border-line px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-blush"
            />
            <button
              type="button"
              aria-label="Send"
              onClick={() => send(input)}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-blush text-white hover:bg-blush-deep transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>

          <a
            href={waLink("আসসালামু আলাইকুম! আমি chatbot থেকে সহায়তা নিতে চাই।")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-t border-line bg-cream py-2.5 text-xs font-semibold text-mint hover:bg-mint hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2z" />
            </svg>
            WhatsApp এ চ্যাট করুন
          </a>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
        onClick={() => setOpen((v) => !v)}
        className="grid size-14 place-items-center rounded-full bg-blush text-white shadow-lg shadow-blush/40 hover:bg-blush-deep transition-colors"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}