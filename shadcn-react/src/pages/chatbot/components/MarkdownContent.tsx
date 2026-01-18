import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content || content.trim() === '') {
    return null;
  }

  try {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="ml-4">{children}</li>
            ),
            code: ({ inline, children, className: customClassName }) => (
            <code 
              className={`bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono ${inline ? '' : 'block'} ${customClassName || ''}`}
              style={{
                display: inline ? 'inline' : 'block',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                backgroundColor: 'rgb(229 231 235)',
                color: 'rgb(31 41 55)',
                border: '1px solid rgb(209 213 219)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre 
              className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgb(17 24 39)',
                color: 'rgb(243 244 246)',
                overflowX: 'auto',
                overflowY: 'auto',
                border: '1px solid rgb(55 65 81)'
              }}
            >
              {children}
            </pre>
          ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody>{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-gray-300">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left font-semibold">{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2">{children}</td>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    console.error('Markdown渲染错误:', error);
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <p className="text-red-500">内容渲染失败，请刷新重试</p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
          {content}
        </pre>
      </div>
    );
  }
}