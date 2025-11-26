import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// Configure marked for consistent output
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Converts markdown text to sanitized HTML safe for email rendering
 *
 * @param markdown - Raw markdown string (may contain user-generated or AI-generated content)
 * @returns Sanitized HTML string safe for email injection
 */
export function markdownToSafeHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  // Convert markdown to HTML
  const rawHtml = marked.parse(markdown) as string;

  // Sanitize HTML to prevent XSS and ensure email client compatibility
  const cleanHtml = sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'ul',
      'ol',
      'li',
      'blockquote',
      'hr',
      'code',
      'pre',
      'a',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });

  return cleanHtml;
}
