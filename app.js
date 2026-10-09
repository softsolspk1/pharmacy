/* Faculty of Pharmacy & Pharmaceutical Sciences — University of Karachi
   Front-end rendering & interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';

  const D = window.FOPS_DATA || (typeof FOPS_DATA !== 'undefined' ? FOPS_DATA : null);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

  const DEPT_ICONS = {
    'pharmaceutics': 'pill',
    'pharmaceutical-chemistry': 'atom',
    'pharmacology': 'heart',
    'pharmacognosy': 'leaf',
    'pharmacy-practice': 'users'
  };
  const DEPT_SHORT = {
    'pharmaceutics': 'Pharmaceutics',
    'pharmaceutical-chemistry': 'Pharmaceutical Chemistry',
    'pharmacology': 'Pharmacology',
    'pharmacognosy': 'Pharmacognosy',
    'pharmacy-practice': 'Pharmacy Practice'
  };

  // Faculty members who also hold appointments in another department
  const ALSO_IN = { 'fac-40': ['Pharmacy Practice'], 'fac-39': ['Pharmacy Practice'] };

  // Pharm.D. (Deficiency) course schedule — Catalogue 2026-27, p. 31
  const DEFICIENCY = [
    { title: 'First semester · 20 Cr. Hrs.', courses: [
      ['PHC-303 (D)', 'Pharmaceutical Chemistry (Organic & Inorganic)', 2], ['PHC-505 (D)', 'Theoretical Basis of Quality Control', 2],
      ['PHT-513 (D)', 'Computer Application in Pharmacy', 2], ['PHT-613 (D)', 'Pharmaceutical Technology', 3],
      ['PHC-707 (D)', 'Pharmaceutical Analysis', 2], ['PHL-711 (D)', 'Clinical Pharmacology', 2],
      ['PHG-713 (D)', 'Clinical Pharmacognosy', 2], ['PHL-715 (D)', 'Anatomy', 2], ['PHL-721 (D)', 'Pathology (Theory & Practical)', 3]] },
    { title: 'Second semester · 23 Cr. Hrs.', courses: [
      ['PHC-406 (D)', 'Physical Chemistry (Lab)', 2], ['PHG-514 (D)', 'Natural Toxicants', 2],
      ['PHT-606 (D)', 'Clinical Pharmacokinetics', 3], ['PHT-614 (D)', 'Pharmaceutical Technology (Practical)', 3],
      ['PHT-702 (D)', 'Clinical Pharmacy', 3], ['PHT-708 (D)', 'Pharmaceutical Quality Control & Assurance', 2],
      ['PHC-710 (D)', 'Medicinal Chemistry', 3], ['PHL-712 (D)', 'Toxicology', 2], ['PHL-718 (D)', 'Physiology, Histology & Biochemistry (Practical)', 3]] }
  ];

  const CLUB_ICONS = ['atom', 'pen', 'trophy', 'palette'];

  /* ---------- Helpers ---------- */
  const initials = (name) => name.replace(/^(Prof\.|Dr\.|Ms\.|Mr\.|Mrs\.)\s*/g, '').replace(/^(Prof\.|Dr\.|Ms\.|Mr\.)\s*/g, '')
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  // Graceful image fallback: swap broken images for an initials avatar / soft panel
  function attachImgFallback(root = document) {
    $$('img', root).forEach((img) => {
      if (img.dataset.fbBound) return;
      img.dataset.fbBound = '1';
      const fail = () => {
        const name = img.dataset.name;
        if (name) {
          const div = document.createElement('div');
          div.className = 'avatar-fallback';
          div.setAttribute('role', 'img');
          div.setAttribute('aria-label', img.alt || name);
          div.textContent = initials(name);
          img.replaceWith(div);
        } else {
          img.style.visibility = 'hidden';
        }
      };
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
      else img.addEventListener('error', fail, { once: true });
    });
  }

  function cleanBio(f) {
    let bio = (f.bio || '').trim();
    if (f.qualification && bio.endsWith(f.qualification)) bio = bio.slice(0, -f.qualification.length).trim();
    return bio;
  }

  function deptOf(f) { return [f.department].concat(ALSO_IN[f.id] || []); }

  function sortFaculty(list) {
    const rank = (d) => /dean/i.test(d) ? 0 : /chair/i.test(d) ? 1 : /coordinator/i.test(d) ? 2 : /^professor/i.test(d) ? 3 : /lecturer/i.test(d) ? 5 : 4;
    return list.slice().sort((a, b) => rank(a.designation) - rank(b.designation));
  }

  /* ---------- Leadership ---------- */
  function renderLeaders() {
    const grid = $('#leadersGrid');
    if (!grid || !D) return;
    const L = D.leadership;
    const items = [
      { key: 'vc', role: 'Vice Chancellor', p: L.vc, sub: L.vc.title, quote: firstSentences(L.vc.message, 2, 1), meta: [['mail', L.vc.email], ['phone', L.vc.phone]] },
      { key: 'dean', role: 'Dean of the Faculty', p: L.dean, sub: L.dean.title, quote: firstSentences(L.dean.message, 2, 3), meta: [['mail', L.dean.email], ['phone', L.dean.directPhone]] }
    ];
    grid.innerHTML = items.map((it) => `
      <article class="leader reveal">
        <div class="leader-photo"><img src="${esc(it.p.image)}" alt="${esc(it.p.name)}" data-name="${esc(it.p.name)}" loading="lazy" width="554" height="554"></div>
        <div class="leader-body">
          <span class="leader-role">${esc(it.role)}</span>
          <h3>${esc(it.p.name)}</h3>
          <div class="leader-title">${esc(it.sub)}</div>
          <blockquote class="leader-quote">“${esc(it.quote)}”</blockquote>
          <div class="leader-actions"><button class="link-arrow" style="background:none;border:0;padding:0" data-msg="${it.key}">Read the full message ${icon('arrow')}</button></div>
          <div class="leader-meta">${it.meta.filter((m) => m[1]).map((m) => `<span>${icon(m[0])}${m[0] === 'mail' ? `<a href="mailto:${esc(m[1])}">${esc(m[1])}</a>` : esc(m[1])}</span>`).join('')}</div>
        </div>
      </article>`).join('');

    $$('[data-msg]', grid).forEach((b) => b.addEventListener('click', () => openMessage(b.dataset.msg)));
  }

  function firstSentences(text, n, paraIndex = 0) {
    const paras = String(text || '').split(/\n+/).filter(Boolean);
    const p = paras[Math.min(paraIndex, paras.length - 1)] || '';
    const s = p.match(/[^.!?]+[.!?]+/g) || [p];
    return s.slice(0, n).join(' ').trim();
  }

  function openMessage(key) {
    const p = D.leadership[key];
    $('#msgContent').innerHTML = `
      <div class="msg-head">
        <img src="${esc(p.image)}" alt="" data-name="${esc(p.name)}">
        <div><span class="leader-role">${key === 'vc' ? 'Message from the Vice Chancellor' : 'Message from the Dean'}</span><h3 id="msgName">${esc(p.name)}</h3><span>${esc(p.title)}</span></div>
      </div>
      <div class="msg-text">${String(p.message).split(/\n+/).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('')}</div>`;
    attachImgFallback($('#msgContent'));
    openModal('#msgModal');
  }

  /* ---------- Departments ---------- */
  function renderDepartments() {
    const tabs = $('#deptTabs');
    if (!tabs || !D) return;
    tabs.innerHTML = D.departments.map((d, i) => `
      <button class="dept-tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-dept="${esc(d.id)}">
        <span class="dot"></span>${esc(DEPT_SHORT[d.id] || d.name)}
      </button>`).join('');
    $$('.dept-tab', tabs).forEach((b) => b.addEventListener('click', () => selectDept(b.dataset.dept)));
    selectDept(D.departments[0].id, false);

    const fd = $('#footerDepts');
    if (fd) fd.innerHTML = D.departments.map((d) => `<li><a href="#departments" data-goto-dept="${esc(d.id)}">${esc(DEPT_SHORT[d.id])}</a></li>`).join('');
    $$('[data-goto-dept]').forEach((a) => a.addEventListener('click', () => selectDept(a.dataset.gotoDept)));
  }

  function selectDept(id) {
    const d = D.departments.find((x) => x.id === id);
    if (!d) return;
    $$('.dept-tab').forEach((b) => { const on = b.dataset.dept === id; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    const short = DEPT_SHORT[d.id];
    const count = D.faculty.filter((f) => deptOf(f).includes(short)).length;
    $('#deptPanel').innerHTML = `
      <div class="dept-panel" role="tabpanel">
        <div class="dept-media">
          <img src="${esc(d.cover_img)}" alt="" loading="lazy">
          <div class="dept-media-cap">
            <small>Established ${esc(d.established)}</small>
            <h3>${esc(d.name)}</h3>
            <div class="dept-chair">
              <img src="${esc(d.chairman_img)}" alt="${esc(d.chairman)}" data-name="${esc(d.chairman)}">
              <div><b>${esc(d.chairman)}</b><span>${esc(d.chairman_title)}</span></div>
            </div>
          </div>
        </div>
        <div class="dept-body">
          <p class="dept-tagline">${esc(d.tagline)}</p>
          <p>${esc(d.overview)}</p>
          <div class="dept-vm">
            <div><h4>Vision</h4><p>${esc(d.vision)}</p></div>
            <div><h4>Mission</h4><p>${esc(d.mission)}</p></div>
          </div>
          <div class="dept-labs">
            <h4>Laboratories &amp; units</h4>
            <ul class="chips">${(d.labs || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </div>
          <div class="dept-foot">
            <div class="contact"><span>${icon('phone').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px;color:var(--brand-600)"')} ${esc(d.phone)}</span><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></div>
            <button class="btn btn-outline btn-sm" data-dept-faculty="${esc(short)}">View ${count} faculty member${count === 1 ? '' : 's'} ${icon('arrow')}</button>
          </div>
        </div>
      </div>`;
    attachImgFallback($('#deptPanel'));
    $('[data-dept-faculty]').addEventListener('click', (e) => {
      setFacultyFilter(e.currentTarget.dataset.deptFaculty);
      $('#faculty').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---------- Curriculum ---------- */
  const PROF = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  function renderCurriculum() {
    const list = $('#semList');
    if (!list || !D) return;
    let html = '';
    D.curriculum.forEach((s, i) => {
      if (i % 2 === 0) html += `<div class="sem-group-label">${PROF[i / 2]} Professional</div>`;
      html += `<button class="sem-btn${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-sem="${i}">${esc(s.short_title)}<small>${esc(s.total_cr)}</small></button>`;
    });
    list.innerHTML = html;
    $$('.sem-btn', list).forEach((b) => b.addEventListener('click', () => selectSem(+b.dataset.sem)));
    selectSem(0);

    const totalCr = D.curriculum.reduce((a, s) => a + (parseInt(s.total_cr, 10) || 0), 0);
    const totalCourses = D.curriculum.reduce((a, s) => a + s.courses.length, 0);
    if (totalCr) $('#totalCredits').textContent = totalCr;
    $('#totalCourses').textContent = totalCourses;

    const def = $('#defGrid');
    if (def) def.innerHTML = DEFICIENCY.map((s) => `<div><h5>${esc(s.title)}</h5><ol>${s.courses.map((c) => `<li>${esc(c[1])} <span>${esc(c[0])} · ${c[2]} cr</span></li>`).join('')}</ol></div>`).join('');
  }

  function catClass(c) {
    const s = String(c || '').toLowerCase();
    if (s.startsWith('gen')) return 'cat cat-gen';
    if (s.startsWith('elec') || s.startsWith('inter')) return 'cat cat-elec';
    return 'cat';
  }

  function selectSem(i) {
    const s = D.curriculum[i];
    $$('.sem-btn').forEach((b) => { const on = +b.dataset.sem === i; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    const hasMarks = s.courses.some((c) => /^\*/.test(c.code));
    $('#currCard').innerHTML = `
      <div class="curr-card-head">
        <div><span class="leader-role">${esc(PROF[Math.floor(i / 2)])} Professional</span><h3>${esc(s.short_title)}</h3></div>
        <span class="pill">${esc(s.total_cr)} · ${s.courses.length} courses</span>
      </div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th style="width:56px">#</th><th>Course code</th><th>Course title</th><th class="num">Cr. Hrs.</th><th>Category</th></tr></thead>
          <tbody>${s.courses.map((c, k) => `
            <tr><td>${k + 1}</td><td class="code">${esc(c.code)}</td><td>${esc(c.title)}</td><td class="num">${esc(c.cr_hrs)}</td><td><span class="${catClass(c.category)}">${esc(c.category)}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${hasMarks ? '<div class="curr-note">* / ** Course codes marked with asterisks follow the footnotes in the official Catalogue 2026–27.</div>' : ''}`;
  }

  /* ---------- Faculty directory ---------- */
  let facFilter = 'All';
  function renderFacultyFilters() {
    const wrap = $('#facFilters');
    if (!wrap || !D) return;
    const names = ['All'].concat(D.departments.map((d) => DEPT_SHORT[d.id]));
    wrap.innerHTML = names.map((n) => {
      const c = n === 'All' ? D.faculty.length : D.faculty.filter((f) => deptOf(f).includes(n)).length;
      return `<button class="fac-filter${n === facFilter ? ' is-active' : ''}" data-filter="${esc(n)}" aria-pressed="${n === facFilter}">${n === 'All' ? 'All departments' : esc(n)}<span class="count">${c}</span></button>`;
    }).join('');
    $$('.fac-filter', wrap).forEach((b) => b.addEventListener('click', () => setFacultyFilter(b.dataset.filter)));
  }

  function setFacultyFilter(name) {
    facFilter = name;
    $$('.fac-filter').forEach((b) => { const on = b.dataset.filter === name; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    renderFacultyGrid();
  }

  function renderFacultyGrid() {
    const grid = $('#facGrid');
    if (!grid || !D) return;
    const q = ($('#facSearch').value || '').trim().toLowerCase();
    let list = D.faculty.filter((f) => facFilter === 'All' || deptOf(f).includes(facFilter));
    if (q) list = list.filter((f) => [f.name, f.designation, f.department, f.bio, f.qualification].join(' ').toLowerCase().includes(q));
    list = sortFaculty(list);
    if (!list.length) {
      grid.innerHTML = `<div class="empty-state">No faculty members match “${esc(q)}”. Try a different name or keyword.</div>`;
      return;
    }
    grid.innerHTML = list.map((f) => {
      const badge = /dean/i.test(f.designation) ? 'Dean' : /chair/i.test(f.designation) ? 'Chair' : /coordinator/i.test(f.designation) ? 'Coordinator' : '';
      return `
      <button class="fac-card" data-fac="${esc(f.id)}" aria-label="View profile of ${esc(f.name)}">
        <div class="fac-photo">
          <img src="${esc(f.image)}" alt="${esc(f.name)}" data-name="${esc(f.name)}" loading="lazy" width="260" height="330">
          ${badge ? `<span class="fac-badge">${badge}</span>` : ''}
        </div>
        <div class="fac-info">
          <b>${esc(f.name)}</b>
          <span class="fac-desig">${esc(f.designation)}</span>
          <span class="fac-dept">${esc(deptOf(f).join(' · '))}</span>
          <span class="fac-more">View profile ${icon('chev-r').replace('<svg', '<svg style="width:14px;height:14px"')}</span>
        </div>
      </button>`;
    }).join('');
    attachImgFallback(grid);
    $$('.fac-card', grid).forEach((c) => c.addEventListener('click', () => openProfile(c.dataset.fac)));
  }

  function openProfile(id) {
    const f = D.faculty.find((x) => x.id === id);
    if (!f) return;
    const emails = String(f.email || '').split(/[,;\s]+/).filter((e) => e.includes('@'));
    $('#profileContent').innerHTML = `
      <div class="profile">
        <div class="profile-photo"><img src="${esc(f.image)}" alt="${esc(f.name)}" data-name="${esc(f.name)}"></div>
        <div class="profile-body">
          <span class="leader-role">${esc(deptOf(f).map((d) => 'Department of ' + d).join(' · '))}</span>
          <h3 id="profileName">${esc(f.name)}</h3>
          <div class="sub">${esc(f.designation)}</div>
          <div class="profile-facts">
            <div><small>Qualification</small><span>${esc(f.qualification || '—')}</span></div>
            <div><small>Associated since</small><span>${esc(f.year_of_association || '—')}</span></div>
            <div><small>Email</small><span>${emails.length ? emails.map((e) => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join('<br>') : '—'}</span></div>
            <div><small>Phone</small><span>${esc(String(f.phone || '—').replace(/,\s*$/, ''))}</span></div>
          </div>
          <div class="profile-bio">${cleanBio(f).split(/\n+/).map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        </div>
      </div>`;
    attachImgFallback($('#profileContent'));
    openModal('#profileModal');
  }

  /* ---------- Medals, clubs, calendar ---------- */
  function renderMisc() {
    const mg = $('#medalGrid');
    if (mg) mg.innerHTML = D.goldMedals.map((m) => `<div class="medal"><span class="medal-icon">${icon('award')}</span><div><b>${esc(m.name)}</b><p>${esc(m.criterion)}</p></div></div>`).join('');

    const cg = $('#clubGrid');
    if (cg) cg.innerHTML = D.studentClubs.map((c, i) => `
      <div class="club reveal"><span class="ql-icon">${icon(CLUB_ICONS[i % CLUB_ICONS.length])}</span><h3>${esc(c.name)}</h3><p>${esc(c.focus)}</p><small>Patrons: ${esc(c.patrons.replace(/\s*\(Patron\)/, ''))}</small></div>`).join('');

    ['morning', 'evening'].forEach((k) => {
      const el = $('#cal-' + k);
      if (!el) return;
      el.innerHTML = `<div class="cal-card"><div class="table-wrap"><table class="data">
        <thead><tr><th>Semester</th><th>Activity</th><th>Dates</th></tr></thead>
        <tbody>${D.academicCalendar[k].map((r) => `<tr><td><span class="term-chip${/second/i.test(r.term) ? ' t2' : ''}">${esc(r.term)}</span></td><td class="cal-row-event">${esc(r.event)}</td><td>${esc(r.date)}</td></tr>`).join('')}</tbody>
      </table></div></div>`;
    });
  }

  /* ---------- Tabs ---------- */
  function initTabs() {
    $$('[data-tabs]').forEach((group) => {
      const btns = $$('.tab', group);
      btns.forEach((b) => b.addEventListener('click', () => {
        btns.forEach((x) => {
          const on = x === b;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-selected', on);
          const p = document.getElementById(x.dataset.target);
          if (p) p.classList.toggle('is-active', on);
        });
      }));
    });
  }

  /* ---------- Modals ---------- */
  let lastFocus = null;
  function openModal(sel) {
    const m = $(sel);
    lastFocus = document.activeElement;
    m.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const f = m.querySelector('input, [data-close]');
    if (f) setTimeout(() => f.focus(), 30);
  }
  function closeModals() {
    $$('.modal.is-open, .lightbox.is-open').forEach((m) => m.classList.remove('is-open'));
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function initModals() {
    $$('.modal, .lightbox').forEach((m) => {
      m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) closeModals(); });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModals();
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName))) {
        e.preventDefault(); openSearch();
      }
      if ($('#lightbox').classList.contains('is-open')) {
        if (e.key === 'ArrowRight') lbStep(1);
        if (e.key === 'ArrowLeft') lbStep(-1);
      }
    });
  }

  /* ---------- Global search ---------- */
  let searchIndex = [];
  function buildIndex() {
    searchIndex = [];
    D.faculty.forEach((f) => searchIndex.push({ type: 'Faculty', title: f.name, sub: `${f.designation} · ${deptOf(f).join(', ')}`, img: f.image, text: [f.name, f.designation, f.department, f.bio].join(' '), go: () => { closeModals(); openProfile(f.id); } }));
    D.departments.forEach((d) => searchIndex.push({ type: 'Department', title: d.name, sub: d.tagline, ico: DEPT_ICONS[d.id], text: [d.name, d.tagline, d.overview, (d.labs || []).join(' ')].join(' '), go: () => { closeModals(); selectDept(d.id); $('#departments').scrollIntoView({ behavior: 'smooth' }); } }));
    D.curriculum.forEach((s, i) => s.courses.forEach((c) => searchIndex.push({ type: 'Course', title: `${c.code.replace(/^\*+/, '')} · ${c.title}`, sub: `${s.title} · ${c.cr_hrs} Cr. Hrs.`, ico: 'book', text: [c.code, c.title, c.category].join(' '), go: () => { closeModals(); selectSem(i); $('#program').scrollIntoView({ behavior: 'smooth' }); } })));
    [
      ['Admissions & merit categories', 'admissions', 'clip'], ['Academic calendar 2027', 'calendar', 'cal'], ['Research facilities: RIPS, BBRF, Tibb-e-Nabavi', 'research', 'flask'],
      ['PJPS & publications', 'publications', 'file'], ['Student clubs (KUPSC)', 'student-life', 'users'], ['Contact the Dean\'s Office', 'contact', 'mail'], ['History & milestones', 'about', 'building']
    ].forEach(([t, id, ico]) => searchIndex.push({ type: 'Page', title: t, sub: 'Jump to section', ico, text: t, go: () => { closeModals(); document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); } }));
  }
  function openSearch() {
    openModal('#searchModal');
    const i = $('#searchInput');
    i.value = ''; runSearch('');
    setTimeout(() => i.focus(), 40);
  }
  let currentResults = [];
  function runSearch(q) {
    const box = $('#searchResults');
    q = q.trim().toLowerCase();
    if (q.length < 2) { box.innerHTML = '<div class="search-hint">Try “pharmacology”, “Harris”, “PHT-301” or “clinical”.</div>'; currentResults = []; return; }
    const terms = q.split(/\s+/);
    currentResults = searchIndex
      .map((r) => {
        const t = r.title.toLowerCase(), x = r.text.toLowerCase();
        if (!terms.every((w) => x.includes(w) || t.includes(w))) return null;
        return { r, score: (t.includes(q) ? 10 : 0) + (t.startsWith(q) ? 5 : 0) + (r.type === 'Faculty' ? 2 : r.type === 'Department' ? 3 : 0) };
      })
      .filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12).map((o) => o.r);
    if (!currentResults.length) { box.innerHTML = `<div class="search-hint">No results for “${esc(q)}”.</div>`; return; }
    box.innerHTML = currentResults.map((r, i) => `
      <button class="sr-item" data-i="${i}">
        ${r.img ? `<img src="${esc(r.img)}" alt="" data-name="${esc(r.title)}">` : `<span class="sr-ico">${icon(r.ico || 'arrow')}</span>`}
        <span><b>${esc(r.title)}</b><small>${esc(r.sub)}</small></span>
        <span class="sr-type">${esc(r.type)}</span>
      </button>`).join('');
    attachImgFallback(box);
    $$('.sr-item', box).forEach((b) => b.addEventListener('click', () => currentResults[+b.dataset.i].go()));
  }
  function initSearch() {
    $('#searchOpen').addEventListener('click', openSearch);
    const i = $('#searchInput');
    i.addEventListener('input', () => runSearch(i.value));
    i.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentResults[0]) currentResults[0].go();
      if (e.key === 'ArrowDown') { const f = $('.sr-item'); if (f) { e.preventDefault(); f.focus(); } }
    });
    $('#searchResults').addEventListener('keydown', (e) => {
      const items = $$('.sr-item'); const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && idx < items.length - 1) { e.preventDefault(); items[idx + 1].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (idx > 0 ? items[idx - 1] : i).focus(); }
    });
  }

  /* ---------- Gallery lightbox ---------- */
  let lbItems = [], lbIndex = 0;
  function initGallery() {
    lbItems = $$('#gallery-grid .g-item');
    lbItems.forEach((b, i) => b.addEventListener('click', () => { lbIndex = i; lbShow(); lastFocus = b; $('#lightbox').classList.add('is-open'); document.body.style.overflow = 'hidden'; }));
    $('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); lbStep(-1); });
    $('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); lbStep(1); });
  }
  function lbShow() {
    const b = lbItems[lbIndex];
    const img = $('img', b);
    $('#lbImg').src = b.dataset.full || img.src;
    $('#lbImg').alt = img.alt;
    $('#lbCap').textContent = $('figcaption', b).textContent.replace(/\s+/g, ' ').trim();
  }
  function lbStep(d) { lbIndex = (lbIndex + d + lbItems.length) % lbItems.length; lbShow(); }

  /* ---------- Header, drawer, reveal, counters ---------- */
  function initChrome() {
    const header = $('#siteHeader');
    const toTop = $('#toTop');
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 10);
      toTop.classList.toggle('is-visible', y > 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const open = () => { document.body.classList.add('drawer-open'); $('#menuOpen').setAttribute('aria-expanded', 'true'); };
    const close = () => { document.body.classList.remove('drawer-open'); $('#menuOpen').setAttribute('aria-expanded', 'false'); };
    $('#menuOpen').addEventListener('click', open);
    $('#menuClose').addEventListener('click', close);
    $('#drawerBackdrop').addEventListener('click', close);
    $$('#drawer nav a, #drawer .btn').forEach((a) => a.addEventListener('click', close));

    // Active nav highlighting
    const links = $$('.main-nav > a');
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && map.has(en.target.id)) {
            links.forEach((l) => l.classList.remove('is-active'));
            map.get(en.target.id).classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }

    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach((e) => io.observe(e));
  }

  function initCounters() {
    const els = $$('[data-count]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = (el) => {
      const target = +el.dataset.count;
      const plain = el.hasAttribute('data-plain');
      if (reduce) return;
      const start = plain ? Math.max(0, target - 60) : 0;
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const v = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
        el.textContent = plain ? v : v.toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Contact form (mailto) ---------- */
  function initContact() {
    const form = $('#contactForm');
    if (!form) return;
    const fb = $('#formFeedback');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim(), email = form.email.value.trim(), to = form.to.value, msg = form.message.value.trim();
      if (!name || !email || !to || !msg || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        fb.className = 'form-feedback err';
        fb.textContent = 'Please fill in every field and enter a valid email address.';
        return;
      }
      const [addr, topic] = to.split('|');
      const subject = `Website enquiry${topic ? ' – ' + topic : ''} – ${name}`;
      const body = `${msg}\n\n—\n${name}\n${email}`;
      window.location.href = `mailto:${addr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      fb.className = 'form-feedback ok';
      fb.textContent = `Your email app should now open with a message to ${addr}. If it doesn't, write to ${addr} directly.`;
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initChrome();
    initTabs();
    initModals();
    initGallery();
    initContact();
    if (D) {
      renderLeaders();
      renderDepartments();
      renderCurriculum();
      renderFacultyFilters();
      renderFacultyGrid();
      renderMisc();
      buildIndex();
      initSearch();
      $('#facSearch').addEventListener('input', renderFacultyGrid);
    } else {
      console.error('FOPS_DATA failed to load — check data.js');
    }
    attachImgFallback();
    initReveal();
    initCounters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
