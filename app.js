(function () {
  'use strict';

  const STATUS_KEY = 'ndisAudit.status.v1';
  const SETTINGS_KEY = 'ndisAudit.settings.v1';
  const STATUSES = ['not-started', 'drafted', 'reviewed', 'adopted'];
  const STATUS_LABEL = { 'not-started': 'Not started', drafted: 'Drafted', reviewed: 'Reviewed', adopted: 'Adopted' };

  const formsById = Object.fromEntries(FORMS.map((f) => [f.id, f]));
  const policiesById = Object.fromEntries(POLICIES.map((p) => [p.id, p]));

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  const DEFAULT_SETTINGS = {
    businessName: 'Martin Shukie Independent NDIS Sole Trader Support Services',
    providerName: 'Martin Shukie',
  };

  let statusMap = loadJSON(STATUS_KEY, {});
  let settings = loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS);

  function getStatus(key) {
    return statusMap[key] || 'not-started';
  }
  function setStatus(key, val) {
    statusMap[key] = val;
    saveJSON(STATUS_KEY, statusMap);
  }

  function currentHash() {
    const h = window.location.hash.replace(/^#\/?/, '');
    return h || 'home';
  }

  const sidebarEl = document.getElementById('sidebar-nav');
  const mainEl = document.getElementById('main-content');
  const searchInput = document.getElementById('search-input');

  const CATEGORIES = ['Governance & Operations', 'Rights & Safeguarding', 'Provision of Supports'];

  function renderSidebar(filter) {
    const q = (filter || '').trim().toLowerCase();
    const route = currentHash();
    let html = '';

    html += navSection('Overview', [{ key: 'home', label: 'Audit Readiness Dashboard' }], route, q);

    // Policies grouped by category
    html += `<div class="nav-section"><div class="nav-section-title">Policies & Procedures</div>`;
    CATEGORIES.forEach((cat) => {
      const items = POLICIES.filter((p) => p.category === cat && (!q || p.title.toLowerCase().includes(q)));
      if (!items.length) return;
      html += `<div class="nav-cat">${cat}</div>`;
      items.forEach((p) => {
        html += navItem(`policy:${p.id}`, p.title, route, `policy:${p.id}`);
      });
    });
    html += `</div>`;

    // Forms
    const formItems = FORMS.filter((f) => !q || f.title.toLowerCase().includes(q));
    if (formItems.length) {
      html += `<div class="nav-section"><div class="nav-section-title">Forms, Registers & Templates</div>`;
      formItems.forEach((f) => {
        html += navItem(`form:${f.id}`, f.title, route, `form:${f.id}`);
      });
      html += `</div>`;
    }

    // Synopsis
    html += navSection('Audit Reference', [{ key: 'synopsis', label: 'Policy Audit Synopsis (all)' }], route, q);

    // Onboarding
    const onboardItems = [...ONBOARDING].sort((a, b) => a.order - b.order).filter((o) => !q || o.title.toLowerCase().includes(q));
    if (onboardItems.length) {
      html += `<div class="nav-section"><div class="nav-section-title">Client Onboarding</div>`;
      onboardItems.forEach((o) => {
        html += navItem(`onboard:${o.id}`, o.title, route, `onboard:${o.id}`);
      });
      html += `</div>`;
    }

    html += navSection('Setup', [{ key: 'settings', label: 'Provider Details' }], route, q);

    sidebarEl.innerHTML = html;
  }

  function navSection(title, items, route, q) {
    const filtered = items.filter((i) => !q || i.label.toLowerCase().includes(q));
    if (!filtered.length) return '';
    return `<div class="nav-section"><div class="nav-section-title">${title}</div>${filtered
      .map((i) => navItem(i.key, i.label, route))
      .join('')}</div>`;
  }

  function navItem(key, label, route, statusKey) {
    const active = route === key ? ' active' : '';
    let dot = '';
    if (statusKey) {
      const s = getStatus(statusKey);
      const cls = s === 'adopted' || s === 'reviewed' ? 'done' : s === 'drafted' ? 'progress' : '';
      dot = `<span class="dot ${cls}"></span>`;
    }
    return `<div class="nav-item${active}" data-route="${key}">${dot}<span>${label}</span></div>`;
  }

  function go(route) {
    window.location.hash = '#/' + route;
  }

  sidebarEl.addEventListener('click', (e) => {
    const item = e.target.closest('.nav-item');
    if (item) go(item.dataset.route);
  });

  searchInput.addEventListener('input', () => renderSidebar(searchInput.value));

  // ---------- Renderers ----------

  function statusRow(key) {
    const s = getStatus(key);
    return `<div class="status-row"><label>Audit status:</label>${STATUSES.map(
      (st) => `<button class="status-pill ${st === s ? 'selected ' + st : ''}" data-status="${st}" data-statuskey="${key}">${STATUS_LABEL[st]}</button>`
    ).join('')}</div>`;
  }

  function docHeader(eyebrow, title, ref) {
    return `<div class="doc-eyebrow">${eyebrow}</div><h2 class="doc-title">${title}</h2>${
      ref ? `<div class="doc-ref">${ref}</div>` : ''
    }`;
  }

  function renderPolicy(id) {
    const p = policiesById[id];
    if (!p) return renderNotFound();
    const key = `policy:${p.id}`;
    const relatedForms = (p.forms || []).map((fid) => formsById[fid]).filter(Boolean);
    mainEl.innerHTML = `
      <div class="topbar">
        <button class="btn" id="view-synopsis">View audit synopsis</button>
        <button class="btn primary" id="print-doc">Print / Save PDF</button>
      </div>
      <div class="doc-card">
        ${docHeader(p.category, fillTokens(p.title, settings), p.standardRef)}
        ${statusRow(key)}
        <div class="doc-body">${fillTokens(p.bodyHtml, settings)}</div>
        ${
          relatedForms.length
            ? `<div class="related-forms"><div class="label">Related forms &amp; registers</div><div class="chip-row">${relatedForms
                .map((f) => `<span class="chip" data-route="form:${f.id}">${f.title}</span>`)
                .join('')}</div></div>`
            : ''
        }
      </div>`;
    mainEl.querySelector('#view-synopsis').addEventListener('click', () => go(`synopsis:${p.id}`));
    mainEl.querySelector('#print-doc').addEventListener('click', () => window.print());
    mainEl.querySelectorAll('.chip[data-route]').forEach((el) => el.addEventListener('click', () => go(el.dataset.route)));
    wireStatusPills();
  }

  function renderForm(id) {
    const f = formsById[id];
    if (!f) return renderNotFound();
    const key = `form:${f.id}`;
    const related = (f.policyIds || []).map((pid) => policiesById[pid]).filter(Boolean);
    mainEl.innerHTML = `
      <div class="topbar"><button class="btn primary" id="print-doc">Print / Save PDF</button></div>
      <div class="doc-card">
        ${docHeader('Form / Register', fillTokens(f.title, settings), '')}
        ${statusRow(key)}
        <div class="doc-body">${fillTokens(f.bodyHtml, settings)}</div>
        ${
          related.length
            ? `<div class="related-forms"><div class="label">Used by policy</div><div class="chip-row">${related
                .map((p) => `<span class="chip" data-route="policy:${p.id}">${p.title}</span>`)
                .join('')}</div></div>`
            : ''
        }
      </div>`;
    mainEl.querySelector('#print-doc').addEventListener('click', () => window.print());
    mainEl.querySelectorAll('.chip[data-route]').forEach((el) => el.addEventListener('click', () => go(el.dataset.route)));
    wireStatusPills();
  }

  function renderOnboard(id) {
    const o = ONBOARDING.find((x) => x.id === id);
    if (!o) return renderNotFound();
    const key = `onboard:${o.id}`;
    mainEl.innerHTML = `
      <div class="topbar"><button class="btn primary" id="print-doc">Print / Save PDF</button></div>
      <div class="doc-card">
        ${docHeader('Client Onboarding', fillTokens(o.title, settings), '')}
        ${statusRow(key)}
        <div class="doc-body">${fillTokens(o.bodyHtml, settings)}</div>
      </div>`;
    mainEl.querySelector('#print-doc').addEventListener('click', () => window.print());
    wireStatusPills();
  }

  function synopsisCard(p) {
    const s = p.synopsis;
    return `<div class="synopsis-card">
      <h3>${fillTokens(p.title, settings)}</h3>
      <div class="ref">${p.standardRef}</div>
      <div class="purpose">${s.purpose}</div>
      <div class="synopsis-row"><div class="k">Key controls</div><div>${s.keyControls.join(' &middot; ')}</div></div>
      <div class="synopsis-row"><div class="k">Evidence</div><div>${s.evidence.join(', ')}</div></div>
      <div class="synopsis-row"><div class="k">Review cycle</div><div>${s.reviewCycle}</div></div>
      <div class="chip-row" style="margin-top:10px"><span class="chip" data-route="policy:${p.id}">Open full policy</span></div>
    </div>`;
  }

  function renderSynopsisAll() {
    mainEl.innerHTML = `
      <div class="doc-eyebrow">Audit Reference</div>
      <h2 class="doc-title">Policy Audit Synopsis</h2>
      <p class="empty-hint" style="margin-bottom:18px">One compact page per policy — purpose, key controls, and where the evidence lives. Hand this to your auditor as a quick-reference index.</p>
      <div class="synopsis-grid">${POLICIES.map(synopsisCard).join('')}</div>`;
    mainEl.querySelectorAll('.chip[data-route]').forEach((el) => el.addEventListener('click', () => go(el.dataset.route)));
  }

  function renderSynopsisOne(id) {
    const p = policiesById[id];
    if (!p) return renderNotFound();
    mainEl.innerHTML = `
      <div class="doc-eyebrow">Audit Reference</div>
      <h2 class="doc-title">Synopsis: ${fillTokens(p.title, settings)}</h2>
      <div class="synopsis-grid">${synopsisCard(p)}</div>`;
    mainEl.querySelectorAll('.chip[data-route]').forEach((el) => el.addEventListener('click', () => go(el.dataset.route)));
  }

  function renderHome() {
    const total = POLICIES.length;
    const adopted = POLICIES.filter((p) => getStatus(`policy:${p.id}`) === 'adopted').length;
    const reviewed = POLICIES.filter((p) => getStatus(`policy:${p.id}`) === 'reviewed').length;
    const notStarted = POLICIES.filter((p) => getStatus(`policy:${p.id}`) === 'not-started').length;
    const missingSettings = !settings.businessName || !settings.providerName || !settings.abn;

    mainEl.innerHTML = `
      <div class="doc-eyebrow">Overview</div>
      <h2 class="doc-title">NDIS Sole Trader Audit Readiness</h2>
      <p class="empty-hint" style="margin-bottom:20px">This pack is built for the <strong>Verification</strong> pathway (Core Practice Standards, document-based review). Every document is a template &mdash; review, tailor and formally adopt each one before relying on it for your audit.</p>
      ${
        missingSettings
          ? `<div class="callout"><strong>Set up your provider details</strong> so your name, ABN and contact details are automatically filled into every document. <span class="chip" data-route="settings" style="margin-left:6px">Go to Provider Details</span></div>`
          : ''
      }
      <div class="callout"><strong>Regulatory currency (as at August 2026):</strong> reflects the National Disability Insurance Scheme Amendment (Integrity and Safeguarding) Act 2026 (Royal Assent 8 April 2026, sharply higher civil penalties for Code of Conduct/registration breaches) and the NDIS Pricing Schedule 2026-27 (effective 1 July 2026, replacing the former "Pricing Arrangements and Price Limits"). The Verification/Certification registration model used throughout this pack is still current, though a broader graduated risk-based registration model has been recommended and is expected to start rolling out from 2027 — recheck ndiscommission.gov.au if you're reading this well after August 2026, and again before any further NDIS Practice Standards or registration changes take effect.</div>
      <div class="dash-grid">
        <div class="stat-tile"><div class="num">${total}</div><div class="lbl">Policies &amp; procedures</div></div>
        <div class="stat-tile"><div class="num">${adopted}</div><div class="lbl">Adopted</div></div>
        <div class="stat-tile"><div class="num">${reviewed}</div><div class="lbl">Reviewed, not yet adopted</div></div>
        <div class="stat-tile"><div class="num">${notStarted}</div><div class="lbl">Not started</div></div>
        <div class="stat-tile"><div class="num">${FORMS.length}</div><div class="lbl">Forms &amp; registers</div></div>
        <div class="stat-tile"><div class="num">${ONBOARDING.length}</div><div class="lbl">Onboarding documents</div></div>
      </div>
      <h4 style="margin:0 0 10px">Where to start</h4>
      ${ol([
        'Open <strong>Provider Details</strong> and fill in your business name, ABN and contact info once — it auto-fills every document.',
        'Work through <strong>Policies &amp; Procedures</strong> by category, mark each Reviewed once you\'ve tailored it, then Adopted once it\'s final.',
        'Use <strong>Forms, Registers &amp; Templates</strong> as your day-to-day implementation evidence &mdash; print or copy them for real use.',
        'Give your auditor the <strong>Policy Audit Synopsis</strong> page as a one-glance index.',
        'Use the <strong>Client Onboarding Checklist</strong> for every new participant, referencing the linked policy at each step.',
      ])}
      <p class="empty-hint" style="margin-top:20px">These are template documents to help you organise for an NDIS Verification audit. They are not legal advice — confirm current requirements against the NDIS Practice Standards and your approved quality auditor before relying on them.</p>
    `;
    mainEl.querySelectorAll('.chip[data-route]').forEach((el) => el.addEventListener('click', () => go(el.dataset.route)));
  }

  function renderSettings() {
    const s = settings;
    mainEl.innerHTML = `
      <div class="doc-eyebrow">Setup</div>
      <h2 class="doc-title">Provider Details</h2>
      <p class="empty-hint" style="margin-bottom:18px">Saved on this device only (browser local storage). Used to auto-fill every document.</p>
      <div class="doc-card" style="max-width:520px">
        <div class="modal-field-group">
          ${field('businessName', 'Business / trading name', s.businessName)}
          ${field('providerName', 'Your full name', s.providerName)}
          ${field('abn', 'ABN', s.abn)}
          ${field('ndisRegNumber', 'NDIS Registration Number (once issued)', s.ndisRegNumber)}
          ${field('address', 'Business address', s.address)}
          ${field('phone', 'Phone number', s.phone)}
          ${field('email', 'Email address', s.email)}
        </div>
        <div class="modal-actions"><button class="btn primary" id="save-settings">Save</button></div>
      </div>
    `;
    function field(name, label, val) {
      return `<div class="field"><label>${label}</label><input id="f-${name}" value="${val ? String(val).replace(/"/g, '&quot;') : ''}" /></div>`;
    }
    mainEl.querySelector('#save-settings').addEventListener('click', () => {
      ['businessName', 'providerName', 'abn', 'ndisRegNumber', 'address', 'phone', 'email'].forEach((n) => {
        settings[n] = mainEl.querySelector(`#f-${n}`).value.trim();
      });
      saveJSON(SETTINGS_KEY, settings);
      go('home');
    });
  }

  function renderNotFound() {
    mainEl.innerHTML = `<p class="empty-hint">Not found. <span class="chip" data-route="home">Go home</span></p>`;
    mainEl.querySelectorAll('.chip[data-route]').forEach((el) => el.addEventListener('click', () => go(el.dataset.route)));
  }

  function wireStatusPills() {
    mainEl.querySelectorAll('.status-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        setStatus(btn.dataset.statuskey, btn.dataset.status);
        route();
      });
    });
  }

  function route() {
    const r = currentHash();
    renderSidebar(searchInput.value);
    const [type, id] = r.split(':');
    if (r === 'home') renderHome();
    else if (r === 'settings') renderSettings();
    else if (r === 'synopsis') renderSynopsisAll();
    else if (type === 'synopsis') renderSynopsisOne(id);
    else if (type === 'policy') renderPolicy(id);
    else if (type === 'form') renderForm(id);
    else if (type === 'onboard') renderOnboard(id);
    else renderHome();
    mainEl.scrollTop = 0;
  }

  window.addEventListener('hashchange', route);
  route();
})();
