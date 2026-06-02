const fs = require('fs');
const path = require('path');

// Read the markdown file
const mdContent = fs.readFileSync(path.join(__dirname, 'backend_api_requirements.md'), 'utf-8');

// Convert markdown to styled HTML
function mdToHtml(md) {
  let html = md;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)*)/gm, (match, header, sep, body) => {
    const headers = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('\n');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr/>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs - wrap remaining text lines
  html = html.replace(/^(?!<[hupoltb]|<hr|<pre|<block|<li)(.+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

const htmlBody = mdToHtml(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>DearGiver — Backend API Integration Requirements</title>
<style>
  @page { size: A4; margin: 20mm; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 { font-size: 22px; color: #2d5a4e; border-bottom: 3px solid #2d5a4e; padding-bottom: 8px; margin-top: 30px; }
  h2 { font-size: 17px; color: #c4724a; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-top: 28px; }
  h3 { font-size: 14px; color: #333; margin-top: 20px; }
  p { margin: 6px 0; }
  code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: 'SF Mono', Consolas, monospace; font-size: 10px; }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 12px 16px; border-radius: 6px; overflow-x: auto; margin: 12px 0; }
  pre code { background: none; color: #d4d4d4; padding: 0; font-size: 10px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10.5px; }
  th { background: #2d5a4e; color: white; padding: 8px 12px; text-align: left; font-weight: 600; }
  td { padding: 7px 12px; border-bottom: 1px solid #e0e0e0; }
  tr:nth-child(even) { background: #f8f8f8; }
  blockquote { border-left: 3px solid #c4724a; margin: 12px 0; padding: 8px 16px; background: #fef7f3; color: #555; font-style: italic; }
  hr { border: none; border-top: 2px solid #e0e0e0; margin: 24px 0; }
  ul { padding-left: 20px; }
  li { margin: 3px 0; }
  strong { color: #1a1a1a; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
${htmlBody}
</body>
</html>`;

// Write HTML file (can be opened in browser and printed to PDF)
fs.writeFileSync(path.join(__dirname, 'backend_api_requirements.html'), fullHtml);
console.log('HTML generated: docs/backend_api_requirements.html');
console.log('Open in browser → Print → Save as PDF');
