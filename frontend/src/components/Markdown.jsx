import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Markdown = ({ children }) => (
  <div className="markdown-body text-zinc-100 font-light leading-relaxed">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...p }) => <h1 className="font-heading text-xl text-white mt-4 mb-2 tracking-tight" {...p} />,
        h2: ({ node, ...p }) => <h2 className="font-heading text-lg text-white mt-4 mb-2 tracking-tight" {...p} />,
        h3: ({ node, ...p }) => (
          <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase mt-4 mb-2" style={{ color: "var(--theme-accent)" }} {...p} />
        ),
        p: ({ node, ...p }) => <p className="mb-3" {...p} />,
        ul: ({ node, ...p }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...p} />,
        ol: ({ node, ...p }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...p} />,
        li: ({ node, ...p }) => <li className="text-zinc-200" {...p} />,
        strong: ({ node, ...p }) => <strong className="text-white font-medium" {...p} />,
        a: ({ node, ...p }) => <a className="underline" style={{ color: "var(--theme-accent)" }} target="_blank" rel="noreferrer" {...p} />,
        code: ({ node, inline, ...p }) =>
          inline ? (
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-white/10 text-zinc-100" {...p} />
          ) : (
            <code className="font-mono text-sm block p-3 rounded-lg bg-black/40 overflow-x-auto" {...p} />
          ),
        hr: ({ node, ...p }) => <hr className="border-white/10 my-4" {...p} />,
        blockquote: ({ node, ...p }) => <blockquote className="border-l-2 border-white/20 pl-4 italic text-zinc-300 my-3" {...p} />,
        table: ({ node, ...p }) => <table className="w-full text-sm border-collapse my-3" {...p} />,
        th: ({ node, ...p }) => <th className="text-left border border-white/10 px-3 py-2 text-white" {...p} />,
        td: ({ node, ...p }) => <td className="border border-white/10 px-3 py-2 text-zinc-200" {...p} />,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);
