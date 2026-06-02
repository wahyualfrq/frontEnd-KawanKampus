import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders raw Markdown content as formatted HTML safely,
 * supporting GitHub Flavored Markdown (tables, task lists, etc.)
 */
export default function MarkdownMessage({ content }) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render links securely opening in a new tab
          a: ({ node, ...props }) => (
            <a target="_blank" rel="noopener noreferrer" {...props} />
          ),
          // Wrap tables in a scrollable wrapper to prevent overflow out of the chat bubble
          table: ({ node, ...props }) => (
            <div className="chat-markdown-table-wrapper">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
