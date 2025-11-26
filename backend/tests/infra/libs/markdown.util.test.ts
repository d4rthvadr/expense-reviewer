import { markdownToSafeHtml } from '@infra/libs/markdown.util';

// Mock marked module
jest.mock('marked');

describe('markdownToSafeHtml', () => {
  it('should convert basic markdown headings to HTML', () => {
    const markdown = '# Main Title\n## Subtitle';
    const html = markdownToSafeHtml(markdown);

    expect(html).toContain('<h1>');
    expect(html).toContain('Main Title');
    expect(html).toContain('<h2>');
    expect(html).toContain('Subtitle');
  });

  it('should convert markdown lists to HTML', () => {
    const markdown = '- Item 1\n- Item 2\n- Item 3';
    const html = markdownToSafeHtml(markdown);

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
    expect(html).toContain('Item 1');
  });

  it('should convert markdown emphasis to HTML', () => {
    const markdown = '**bold text** and *italic text*';
    const html = markdownToSafeHtml(markdown);

    expect(html).toContain('<strong>');
    expect(html).toContain('bold text');
    expect(html).toContain('<em>');
    expect(html).toContain('italic text');
  });

  it('should sanitize dangerous HTML content', () => {
    const markdown = '<script>alert("xss")</script>\n# Safe Heading';
    const html = markdownToSafeHtml(markdown);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert');
    expect(html).toContain('<h1>');
    expect(html).toContain('Safe Heading');
  });

  it('should handle complex review-style markdown', () => {
    const markdown = `# Spending Analysis Report

## 📊 Summary
Your spending for this period totals **$2,450.25**.

## ⚠️ Categories Over Budget
- **Groceries**: 45% over target
- **Entertainment**: 30% over target

## ✅ Categories On Track
- Transportation
- Utilities

---

Keep up the good work!`;

    const html = markdownToSafeHtml(markdown);

    expect(html).toContain('<h1>');
    expect(html).toContain('Spending Analysis Report');
    expect(html).toContain('<h2>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<hr');
    expect(html).not.toContain('undefined');
  });

  it('should handle empty or invalid input', () => {
    expect(markdownToSafeHtml('')).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(markdownToSafeHtml(null as any)).toBe('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(markdownToSafeHtml(undefined as any)).toBe('');
  });

  it('should preserve emojis', () => {
    const markdown = '✅ Success! 🎉';
    const html = markdownToSafeHtml(markdown);

    expect(html).toContain('✅');
    expect(html).toContain('🎉');
  });

  it('should allow safe links but sanitize href', () => {
    const markdown = '[Safe Link](https://example.com)';
    const html = markdownToSafeHtml(markdown);

    expect(html).toContain('<a');
    expect(html).toContain('href="https://example.com"');
  });

  it('should remove javascript: protocol from links', () => {
    const markdown = '[Malicious](javascript:alert("xss"))';
    const html = markdownToSafeHtml(markdown);

    expect(html).not.toContain('javascript:');
  });
});
