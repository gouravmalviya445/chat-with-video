"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content text-sm leading-relaxed text-ink", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="font-handwritten text-xl font-bold mt-3 mb-1.5 text-ink border-b border-dashed border-neutral-300 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-handwritten text-lg font-bold mt-2.5 mb-1 text-ink">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-handwritten text-base font-bold mt-2 mb-1 text-ink">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 my-1.5 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 my-1.5 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-neutral-950">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-marker-yellow bg-amber-50/60 pl-3 py-1 my-2 rounded-r italic text-neutral-800">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const contentStr = String(children);
            const isInline = !codeClassName && !contentStr.includes("\n");

            if (isInline) {
              return (
                <code
                  className="bg-neutral-200/70 text-ink font-mono text-[12px] px-1.5 py-0.5 rounded border border-neutral-300/80"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="bg-neutral-900 text-neutral-100 font-mono text-xs p-3 my-2.5 rounded-lg overflow-x-auto border-2 border-neutral-800 shadow-xs">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900 font-medium"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-xs border-collapse border border-neutral-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-neutral-300 bg-amber-100/70 px-2.5 py-1.5 text-left font-bold text-ink">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-neutral-300 px-2.5 py-1.5">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-3 border-t-2 border-dashed border-neutral-300" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
