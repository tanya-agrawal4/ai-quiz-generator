import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

export default function FormattedText({ children, className = '' }) {
  if (children == null) return null
  const content = String(children)

  return (
    <div className={`prose prose-slate max-w-none dark:prose-invert text-left ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          // Customize code blocks for styled dark containers
          code({ node, inline, className: codeClassName, children: codeChildren, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '')
            if (!inline && match) {
              return (
                <div className="relative my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 shadow-md">
                  <div className="flex items-center justify-between px-4 py-1.5 bg-slate-850 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span>{match[1]}</span>
                  </div>
                  <pre className="p-4 text-xs md:text-sm overflow-x-auto font-mono leading-relaxed">
                    <code className={codeClassName} {...props}>
                      {codeChildren}
                    </code>
                  </pre>
                </div>
              )
            }
            return (
              <code
                className="rounded bg-indigo-50 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-indigo-700 dark:text-indigo-300 font-semibold"
                {...props}
              >
                {codeChildren}
              </code>
            )
          },
          p({ children: pChildren }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{pChildren}</p>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
