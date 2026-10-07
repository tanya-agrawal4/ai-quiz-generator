import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

export default function FormattedText({ children, className = '' }) {
  if (children == null) return null
  const content = String(children)

  return (
    <div className={`prose prose-slate max-w-none text-left ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={{
          code({ node: _node, inline, className: codeClassName, children: codeChildren, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || '')
            if (!inline && match) {
              return (
                <div className="relative my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 shadow-sm text-left">
                  <div className="flex items-center justify-between px-4 py-1.5 bg-slate-850 border-b border-slate-800 text-[11px] font-mono text-slate-400 font-medium">
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
                className="rounded-md bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 font-mono text-xs text-indigo-700 font-semibold"
                {...props}
              >
                {codeChildren}
              </code>
            )
          },
          p({ children: pChildren }) {
            return <p className="mb-2 last:mb-0 leading-relaxed text-slate-800">{pChildren}</p>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
