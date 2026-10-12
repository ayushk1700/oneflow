/** Read Markdown checkboxes without changing ordinary or legacy note text. */
export function checklistItems(text) {
  const lines = text.split('\n');
  if (!lines.length || !lines.every(line => /^- \[[ xX]\] /.test(line))) return null;
  return lines.map(line => ({checked:line[3].toLowerCase() === 'x',text:line.slice(6)}));
}

/** Keep checklists portable through the existing note and backup schema. */
export function checklistText(items) {
  return items.map(item => `- [${item.checked ? 'x' : ' '}] ${item.text.replace(/[\r\n]/g,' ')}`).join('\n');
}
