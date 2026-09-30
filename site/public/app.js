const API = 'https://www.eporner.com/api/v2/';
const $ = s => document.querySelector(s), app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SORTS = {'most-popular':'Most popular','latest':'Latest','top-rated':'Top rated','top-weekly':'Top weekly','top-monthly':'Top monthly','longest':'Longest','shortest':'Shortest'};
const CATS = ['4k','amateur','anal','asian','babe','bbw','big tits','blonde','blowjob','brunette','creampie','cosplay','couple','ebony','fetish','hardcore','hd','japanese','latina','lesbian','massage','milf','mature','pov','redhead','russian','solo','squirt','teen','threesome','vintage','webcam'];
const PERFORMERS = ['Angela White','Riley Reid','Mia Khalifa','Lana Rhoades','Abella Danger','Eva Elfie','Adriana Chechik','Emily Willis','Jia Lissa','Kendra Lust','Lexi Luna','Mia Malkova','Nicole Aniston','Sasha Grey','Sophie Dee','Stella Cox'];
const hue = s => [...s].reduce((a, c) => a + c.charCodeAt(0) * 7, 0) % 360;
let useProxy = false;

async function api(method, params) {
  const qs = new URLSearchParams({ format: 'json', ...params }).toString();
  const attempts = useProxy ? ['/api/', API] : [API, '/api/'];
  let err;
  for (const base of attempts) {
    try {
      const r = await fetch(`${base}video/${method}/?${qs}`);
      if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      useProxy = base === '/api/';
      return j;
    } catch (e) { err = e; }
  }
  throw err;
}
const cache = new Map();
const search = p => { const k = JSON.stringify(p); if (!cache.has(k)) cache.set(k, api('search', p).catch(e => { cache.delete(k); throw e; })); return cache.get(k); };

const card = v => `<a class="card" href="#/watch/${esc(v.id)}"><div class="th"><img loading="lazy" src="${esc(v.default_thumb?.src)}" alt="${esc(v.title)}"><span class="dur">${esc(v.length_min)}</span></div><div class="ci"><div class="ct">${esc(v.title)}</div><div class="meta">${Number(v.views).toLocaleString()} views · ★ ${esc(v.rate)}</div></div></a>`;
const skel = n => `<div class="grid">${'<div class="skel"></div>'.repeat(n)}</div>`;
const fail = () => `<div class="msg">Couldn't load videos. <button class="btn" onclick="route()">Retry</button></div>`;

function hash() { const [p, ...r] = location.hash.slice(2).split('/'); return { p: p || 'home', r: r.map(decodeURIComponent), q: new URLSearchParams(location.hash.split('?')[1] || '') }; }
const link = (path, o) => `#/${path}?${new URLSearchParams(o)}`;

async function route() {
  const { p, r, q } = hash();
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.r === p));
  $('#nav').classList.remove('open'); scrollTo(0, 0);
  const page = +q.get('page') || 1, order = q.get('order') || 'most-popular';
  try {
    if (p === 'watch') return await watch(r[0]);
    if (p === 'categories') return categories();
    if (p === 'performers') return performers();
    if (p === 'tag' || p === 'search') return await listing(p === 'tag' ? r[0] : r[0] || '', p, { page, order, title: p === 'tag' ? r[0] : `Results for “${r[0] || ''}”` });
    return await home(page, order);
  } catch (e) { app.innerHTML = fail(); }
}

function sortBar(base, order) {
  return `<label class="meta">Sort <select onchange="location.hash='${base}?order='+this.value">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}" ${k === order ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`;
}
function pager(base, page, total, order) {
  return `<div class="pager"><a class="btn" ${page <= 1 ? 'disabled' : `href="${base}?order=${order}&page=${page - 1}"`}>← Prev</a><span class="meta">Page ${page} of ${total || 1}</span><a class="btn" ${page >= total ? 'disabled' : `href="${base}?order=${order}&page=${page + 1}"`}>Next →</a></div>`;
}
async function home(page, order) {
  app.innerHTML = `<div class="skel" style="height:380px"></div>${skel(8)}`;
  const [top, list] = await Promise.all([search({ query: 'all', per_page: 1, order: 'top-weekly', thumbsize: 'big' }), search({ query: 'all', per_page: 24, page, order, thumbsize: 'big' })]);
  const h = top.videos?.[0];
  app.innerHTML = (h && page === 1 ? `<section class="hero" style="background-image:url('${esc(h.default_thumb.src)}')"><div class="hero-in"><span class="tag">TOP THIS WEEK</span><h1>${esc(h.title)}</h1><p class="meta">${esc(h.length_min)} · ${Number(h.views).toLocaleString()} views</p><a class="btn primary" href="#/watch/${esc(h.id)}">▶ Watch now</a></div></section>` : '')
    + `<div class="chips">${CATS.slice(0, 14).map(c => `<a class="chip" href="#/tag/${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}<a class="chip" href="#/categories">All →</a></div>`
    + `<div class="bar"><h2>Videos</h2>${sortBar('#/', order)}</div><div class="grid">${list.videos.map(card).join('')}</div>${pager('#/', page, list.total_pages, order)}`;
}
async function listing(query, kind, { page, order, title }) {
  app.innerHTML = `<div class="bar"><h2>${esc(title)}</h2></div>${skel(8)}`;
  const d = await search({ query: query || 'all', per_page: 24, page, order, thumbsize: 'big' });
  const base = `#/${kind}/${encodeURIComponent(query)}`;
  app.innerHTML = `<div class="bar"><h2 style="text-transform:capitalize">${esc(title)} <span class="meta">${Number(d.total_count || 0).toLocaleString()} videos</span></h2>${sortBar(base, order)}</div>`
    + (d.videos?.length ? `<div class="grid">${d.videos.map(card).join('')}</div>${pager(base, page, d.total_pages, order)}` : '<div class="msg">No videos found.</div>');
}
function categories() {
  app.innerHTML = `<div class="bar"><h2>Categories</h2></div><div class="grid">${CATS.map(c => `<a class="cat" style="--h:${hue(c)}" href="#/tag/${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>`;
}
async function performers() {
  app.innerHTML = `<div class="bar"><h2>Performers</h2></div><div class="grid" id="pg" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${PERFORMERS.map(n => `<a class="perf" href="#/search/${encodeURIComponent(n)}"><div class="av" data-n="${esc(n)}" style="background-color:hsl(${hue(n)},50%,30%)"></div><div>${esc(n)}</div></a>`).join('')}</div>`;
  // fill avatars with the top video thumbnail for each performer
  for (const el of document.querySelectorAll('.av')) {
    search({ query: el.dataset.n, per_page: 1, order: 'top-rated', thumbsize: 'medium' }).then(d => { const t = d.videos?.[0]?.default_thumb?.src; if (t) el.style.backgroundImage = `url('${t}')`; }).catch(() => {});
  }
}
async function watch(id) {
  app.innerHTML = skel(2);
  const v = await api('id', { id, thumbsize: 'big' });
  if (!v || !v.id) { app.innerHTML = '<div class="msg">Video unavailable.</div>'; return; }
  document.title = v.title + ' – Streamly';
  const tags = (v.keywords || '').split(',').map(s => s.trim()).filter(Boolean);
  app.innerHTML = `<div class="watch"><div><iframe class="player" src="https://www.eporner.com/embed/${encodeURIComponent(v.id)}/" allowfullscreen loading="lazy"></iframe><h1>${esc(v.title)}</h1><div class="meta">${esc(v.length_min)} · ${Number(v.views).toLocaleString()} views · ★ ${esc(v.rate)} · ${esc(v.added)}</div><div class="tags">${tags.slice(0, 20).map(t => `<a class="chip" href="#/tag/${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div></div><aside class="side" id="rel"><h3>Related</h3></aside></div>`;
  if (tags[0]) search({ query: tags[0], per_page: 10, order: 'top-rated', thumbsize: 'medium' }).then(d => {
    $('#rel').insertAdjacentHTML('beforeend', d.videos.filter(x => x.id !== v.id).slice(0, 8).map(card).join(''));
  }).catch(() => {});
}

$('#searchForm').onsubmit = e => { e.preventDefault(); const v = $('#q').value.trim(); location.hash = v ? `#/search/${encodeURIComponent(v)}` : '#/'; };
$('#menuBtn').onclick = () => $('#nav').classList.toggle('open');
$('#enter').onclick = () => { localStorage.setItem('age', '1'); $('#gate').classList.add('off'); };
if (localStorage.getItem('age')) $('#gate').classList.add('off');
addEventListener('hashchange', route); route();
