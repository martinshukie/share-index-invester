// Small render helpers shared by data.js and app.js. No dependencies.

function ul(items) {
  return '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';
}

function ol(items) {
  return '<ol>' + items.map((i) => `<li>${i}</li>`).join('') + '</ol>';
}

function table(headers, rows) {
  const head = '<tr>' + headers.map((h) => `<th>${h}</th>`).join('') + '</tr>';
  const body = rows
    .map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>')
    .join('');
  return `<table class="doc-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}

// Escapes text for safe use inside HTML content or an HTML attribute value.
function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Replace {{TOKEN}} placeholders with values from a settings object.
function fillTokens(html, settings) {
  const map = {
    BUSINESS_NAME: settings.businessName || 'Martin Shukie Independent NDIS Sole Trader Support Services',
    PROVIDER_NAME: settings.providerName || 'Martin Shukie',
    ABN: settings.abn || '[ABN]',
    ADDRESS: settings.address || '[Business Address]',
    PHONE: settings.phone || '[Phone Number]',
    EMAIL: settings.email || '[Email Address]',
    NDIS_REG_NUMBER: settings.ndisRegNumber || '[NDIS Registration Number, once issued]',
    DATE: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
  return html.replace(/{{\s*([A-Z_]+)\s*}}/g, (m, key) => (key in map ? map[key] : m));
}
