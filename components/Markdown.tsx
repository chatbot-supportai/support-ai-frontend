import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks: ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-sm text-slate-200">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Code block
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "code";
          const codeText = match ? match[2].trim() : part.replace(/```/g, "").trim();

          return (
            <div key={index} className="my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner font-mono text-xs">
              {/* Code header bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-900 bg-slate-900/60 text-slate-400 select-none">
                <span className="text-xs uppercase tracking-wider font-semibold">{lang || "code"}</span>
                <button
                  onClick={() => copyToClipboard(codeText, index)}
                  className="flex items-center gap-1.5 hover:text-indigo-400 active:scale-95 transition-all text-xs cursor-pointer"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-300 whitespace-pre scrollbar-thin">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        } else {
          // Regular text (with inline formatting: bold, inline code, lists)
          const lines = part.split("\n");
          return (
            <div key={index} className="space-y-2">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                
                // Bullet point lists
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                  return (
                    <ul key={lIdx} className="list-disc pl-5 my-1 text-slate-300">
                      <li>{parseInline(trimmed.substring(2))}</li>
                    </ul>
                  );
                }
                
                // Numbered lists
                const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
                if (numMatch) {
                  return (
                    <ol key={lIdx} className="list-decimal pl-5 my-1 text-slate-300">
                      <li>{parseInline(numMatch[2])}</li>
                    </ol>
                  );
                }

                // Headers
                if (trimmed.startsWith("# ")) {
                  return <h1 key={lIdx} className="text-xl font-bold text-white mt-4 mb-2">{parseInline(trimmed.substring(2))}</h1>;
                }
                if (trimmed.startsWith("## ")) {
                  return <h2 key={lIdx} className="text-lg font-bold text-white mt-3 mb-2">{parseInline(trimmed.substring(3))}</h2>;
                }
                if (trimmed.startsWith("### ")) {
                  return <h3 key={lIdx} className="text-base font-semibold text-white mt-2 mb-1">{parseInline(trimmed.substring(4))}</h3>;
                }

                // Empty line
                if (trimmed === "") {
                  return <div key={lIdx} className="h-2" />;
                }

                return <p key={lIdx} className="text-slate-300">{parseInline(line)}</p>;
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

// Simple parser for bold **text** and inline `code`
function parseInline(text: string) {
  // Regex split for **bold** and `code`
  const inlineParts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return inlineParts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400 font-mono text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
