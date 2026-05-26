import { useState, useMemo } from "react";

const BASE_PASARAN = [
  { id:'HK',    name:'Hongkong Pools',        slug:'hongkong-pools',         flag:'🇭🇰', region:'Asia'  },
  { id:'HKL',   name:'Hongkong Lotto',         slug:'hklotto',                flag:'🇭🇰', region:'Asia'  },
  { id:'SGP',   name:'Singapore',              slug:'singapore',              flag:'🇸🇬', region:'Asia'  },
  { id:'SDY',   name:'Sydney Pools',           slug:'sydney-pools',           flag:'🇦🇺', region:'Asia'  },
  { id:'SYDL',  name:'Sydney Lotto',           slug:'sydney-lotto',           flag:'🇦🇺', region:'Asia'  },
  { id:'TWN',   name:'Taiwan',                 slug:'taiwan',                 flag:'🇹🇼', region:'Asia'  },
  { id:'JPN',   name:'Japan',                  slug:'japan',                  flag:'🇯🇵', region:'Asia'  },
  { id:'CAM',   name:'Magnum Cambodia',        slug:'magnum-cambodia',        flag:'🇰🇭', region:'Asia'  },
  { id:'PCSO',  name:'PCSO',                   slug:'pcso',                   flag:'🇵🇭', region:'Asia'  },
  { id:'CHN',   name:'China Pools',            slug:'chinapools',             flag:'🇨🇳', region:'Asia'  },
  { id:'BULL',  name:'Bullseye',               slug:'bullseye',               flag:'🇳🇿', region:'Asia'  },
  { id:'MCO0',  name:'Toto Macau 00',          slug:'toto-macau',             flag:'🇲🇴', region:'Macau' },
  { id:'MCO13', name:'Toto Macau 13',          slug:'toto-macau-13',          flag:'🇲🇴', region:'Macau' },
  { id:'MCO16', name:'Toto Macau 16',          slug:'toto-macau-16',          flag:'🇲🇴', region:'Macau' },
  { id:'MCO19', name:'Toto Macau 19',          slug:'toto-macau-19',          flag:'🇲🇴', region:'Macau' },
  { id:'MCO22', name:'Toto Macau 22',          slug:'toto-macau-22',          flag:'🇲🇴', region:'Macau' },
  { id:'MCO23', name:'Toto Macau 23',          slug:'toto-macau-23',          flag:'🇲🇴', region:'Macau' },
  { id:'GER',   name:'Germany Plus5',          slug:'germany-plus5',          flag:'🇩🇪', region:'Eropa' },
  { id:'MOR3',  name:'Morocco Quatro 03:00',   slug:'morocco-quatro',         flag:'🇲🇦', region:'Eropa' },
  { id:'MOR18', name:'Morocco Quatro 18:00',   slug:'morocco-quatro-18',      flag:'🇲🇦', region:'Eropa' },
  { id:'MOR21', name:'Morocco Quatro 21:00',   slug:'morocco-quatro-21',      flag:'🇲🇦', region:'Eropa' },
  { id:'MOR59', name:'Morocco Quatro 23:59',   slug:'morocco-quatro-2359',    flag:'🇲🇦', region:'Eropa' },
  { id:'NCAD',  name:'North Carolina Day',     slug:'north-carolina-day',     flag:'🇺🇸', region:'USA'   },
  { id:'NCAE',  name:'North Carolina Evening', slug:'north-carolina-evening', flag:'🇺🇸', region:'USA'   },
  { id:'GEOM',  name:'Georgia Midday',         slug:'georgia-midday',         flag:'🇺🇸', region:'USA'   },
  { id:'GEOE',  name:'Georgia Evening',        slug:'georgia-evening',        flag:'🇺🇸', region:'USA'   },
  { id:'GEON',  name:'Georgia Night',          slug:'georgia-night',          flag:'🇺🇸', region:'USA'   },
  { id:'NJYM',  name:'New Jersey Midday',      slug:'new-jersey-midday',      flag:'🇺🇸', region:'USA'   },
  { id:'NJYE',  name:'New Jersey Evening',     slug:'new-jersey-evening',     flag:'🇺🇸', region:'USA'   },
  { id:'INDM',  name:'Indiana Midday',         slug:'indiana-midday',         flag:'🇺🇸', region:'USA'   },
  { id:'INDE',  name:'Indiana Evening',        slug:'indiana-evening',        flag:'🇺🇸', region:'USA'   },
  { id:'TNMM',  name:'Tennessee Midday',       slug:'tennesse-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'TNME',  name:'Tennessee Evening',      slug:'tennesse-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'TNMN',  name:'Tennessee Morning',      slug:'tennesse-morning',       flag:'🇺🇸', region:'USA'   },
  { id:'KYTM',  name:'Kentucky Midday',        slug:'kentucky-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'KYTE',  name:'Kentucky Evening',       slug:'kentucky-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'TXSD',  name:'Texas Day',              slug:'texas-day',              flag:'🇺🇸', region:'USA'   },
  { id:'TXSE',  name:'Texas Evening',          slug:'texas-evening',          flag:'🇺🇸', region:'USA'   },
  { id:'TXSN',  name:'Texas Night',            slug:'texas-night',            flag:'🇺🇸', region:'USA'   },
  { id:'TXSM',  name:'Texas Morning',          slug:'texas-morning',          flag:'🇺🇸', region:'USA'   },
  { id:'FLOM',  name:'Florida Midday',         slug:'florida-midday',         flag:'🇺🇸', region:'USA'   },
  { id:'FLOE',  name:'Florida Evening',        slug:'florida-evening',        flag:'🇺🇸', region:'USA'   },
  { id:'ILSM',  name:'Illinois Midday',        slug:'illinois-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'ILSE',  name:'Illinois Evening',       slug:'illinois-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'MISM',  name:'Missouri Midday',        slug:'missouri-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'MISE',  name:'Missouri Evening',       slug:'missouri-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'DCIM',  name:'Washington DC Midday',   slug:'washington-dc-midday',   flag:'🇺🇸', region:'USA'   },
  { id:'DCIE',  name:'Washington DC Evening',  slug:'washington-dc-evening',  flag:'🇺🇸', region:'USA'   },
  { id:'CTCD',  name:'Connecticut Day',        slug:'connecticut-day',        flag:'🇺🇸', region:'USA'   },
  { id:'CTCN',  name:'Connecticut Night',      slug:'connecticut-night',      flag:'🇺🇸', region:'USA'   },
  { id:'VRGD',  name:'Virginia Day',           slug:'virginia-day',           flag:'🇺🇸', region:'USA'   },
  { id:'VRGN',  name:'Virginia Night',         slug:'virginia-night',         flag:'🇺🇸', region:'USA'   },
  { id:'NYM',   name:'New York Midday',        slug:'new-york-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'NYE',   name:'New York Evening',       slug:'new-york-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'MCHM',  name:'Michigan Midday',        slug:'michigan-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'MCHE',  name:'Michigan Evening',       slug:'michigan-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'MRLM',  name:'Maryland Midday',        slug:'maryland-midday',        flag:'🇺🇸', region:'USA'   },
  { id:'MRLE',  name:'Maryland Evening',       slug:'maryland-evening',       flag:'🇺🇸', region:'USA'   },
  { id:'WISN',  name:'Wisconsin Evening',      slug:'wisconsin-evening',      flag:'🇺🇸', region:'USA'   },
  { id:'CALF',  name:'California',             slug:'california',             flag:'🇺🇸', region:'USA'   },
  { id:'ORE4',  name:'Oregon 04:00',           slug:'oregon',                 flag:'🇺🇸', region:'USA'   },
  { id:'ORE7',  name:'Oregon 07:00',           slug:'oregon-07',              flag:'🇺🇸', region:'USA'   },
  { id:'ORE10', name:'Oregon 10:00',           slug:'oregon-10',              flag:'🇺🇸', region:'USA'   },
  { id:'ORE13', name:'Oregon 13:00',           slug:'oregon-13',              flag:'🇺🇸', region:'USA'   },
];

const REGIONS = ['Semua','Asia','Macau','Eropa','USA'];
const REG_COLOR = { Asia:'#f0a500', Macau:'#a78bfa', Eropa:'#34d399', USA:'#60a5fa' };

// Keywords untuk auto-match slug per pasaran
const MATCH_HINTS = {
  HK:'hongkong-pools', HKL:'hklotto', SGP:'singapore', SDY:'sydney-pools',
  SYDL:'sydney-lotto', TWN:'taiwan', JPN:'japan', CAM:'magnum-cambodia',
  PCSO:'pcso', CHN:'chinapools', BULL:'bullseye',
  MCO0:'toto-macau', MCO13:'toto-macau-13', MCO16:'toto-macau-16',
  MCO19:'toto-macau-19', MCO22:'toto-macau-22', MCO23:'toto-macau-23',
  GER:'germany',
  MOR3:['morocco','quatro'], MOR18:['morocco','18'], MOR21:['morocco','21'], MOR59:['morocco','59'],
  NCAD:['north-carolina','day'], NCAE:['north-carolina','evening'],
  GEOM:['georgia','midday'], GEOE:['georgia','evening'], GEON:['georgia','night'],
  NJYM:['new-jersey','midday'], NJYE:['new-jersey','evening'],
  INDM:['indiana','midday'], INDE:['indiana','evening'],
  TNMM:['tennesse','midday'], TNME:['tennesse','evening'], TNMN:['tennesse','morning'],
  KYTM:['kentucky','midday'], KYTE:['kentucky','evening'],
  TXSD:['texas','day'], TXSE:['texas','evening'], TXSN:['texas','night'], TXSM:['texas','morning'],
  FLOM:['florida','midday'], FLOE:['florida','evening'],
  ILSM:['illinois','midday'], ILSE:['illinois','evening'],
  MISM:['missouri','midday'], MISE:['missouri','evening'],
  DCIM:['washington-dc','midday'], DCIE:['washington-dc','evening'],
  CTCD:['connecticut','day'], CTCN:['connecticut','night'],
  VRGD:['virginia','day'], VRGN:['virginia','night'],
  NYM:['new-york','midday'], NYE:['new-york','evening'],
  MCHM:['michigan','midday'], MCHE:['michigan','evening'],
  MRLM:['maryland','midday'], MRLE:['maryland','evening'],
  WISN:'wisconsin', CALF:'california',
  ORE4:['oregon'], ORE7:['oregon','07'], ORE10:['oregon','10'], ORE13:['oregon','13'],
};

async function doFetch(slug, proxy) {
  const target = `https://angkanet18.com/data-pengeluaran-togel-${slug}/`;
  const url = proxy ? `${proxy.replace(/\?$/,'')}?url=${encodeURIComponent(target)}` : target;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = [];
  doc.querySelectorAll('.paito-line').forEach(line => {
    line.querySelectorAll('.paito-row-item').forEach(item => {
      const d = [...item.querySelectorAll('.paito-digit')].map(x=>x.textContent.trim()).join('');
      if (/^\d{4}$/.test(d)) out.push(d);
    });
  });
  if (out.length === 0) {
    doc.querySelectorAll('table tr').forEach(tr => {
      const cells = [...tr.querySelectorAll('td')];
      if (cells.length < 2) return;
      if (!/\d{2}-\d{2}-\d{4}/.test(cells[0].textContent)) return;
      const m = cells[1].textContent.replace(/\s+/g,'').match(/\d{4}/);
      if (m) out.push(m[0]);
    });
  }
  return out.slice(0, 30);
}

// Scrape semua slug dari halaman paito-harian
async function scrapeAllSlugs(proxy) {
  const target = 'https://angkanet18.com/paito-harian/';
  const url = proxy ? `${proxy.replace(/\?$/,'')}?url=${encodeURIComponent(target)}` : target;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const slugSet = new Set();
  doc.querySelectorAll('a[href]').forEach(a => {
    const m = a.getAttribute('href').match(/\/data-pengeluaran-togel-([^/]+)\/?/);
    if (m) slugSet.add(m[1]);
  });
  // Also check paito-harian links
  doc.querySelectorAll('a[href]').forEach(a => {
    const m = a.getAttribute('href').match(/\/paito-harian\/([^/]+)\/?/);
    if (m && m[1] && m[1] !== 'page') slugSet.add(m[1]);
  });
  return [...slugSet].sort();
}

// Cari slug terbaik dari daftar untuk pasaran tertentu
function findBestSlug(pasaranId, allSlugs) {
  const hints = MATCH_HINTS[pasaranId];
  if (!hints) return null;
  const keywords = Array.isArray(hints) ? hints : [hints];

  // Exact match first
  const exact = keywords.length === 1 ? allSlugs.find(s => s === keywords[0]) : null;
  if (exact) return { slug: exact, confidence: 'exact' };

  // All keywords must appear in slug
  const matches = allSlugs.filter(s => keywords.every(k => s.includes(k)));
  if (matches.length === 1) return { slug: matches[0], confidence: 'sure' };
  if (matches.length > 1)   return { slug: matches[0], confidence: 'ambiguous', alternatives: matches };

  // Partial: at least first keyword
  const partial = allSlugs.filter(s => s.includes(keywords[0]));
  if (partial.length > 0)   return { slug: partial[0], confidence: 'partial', alternatives: partial };

  return null;
}

export default function App() {
  const [proxy, setProxy] = useState('https://corsproxy.io/?');
  const [search, setSearch] = useState('');
  const [regFilter, setRegFilter] = useState('Semua');
  const [statuses, setStatuses] = useState({});
  const [slugs, setSlugs] = useState({});
  const [running, setRunning] = useState(false);
  const [stopFlag, setStopFlag] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-detect state
  const [detectState, setDetectState] = useState('idle'); // idle | loading | done | error
  const [detectMsg, setDetectMsg] = useState('');
  const [allSlugs, setAllSlugs] = useState([]);
  const [detectResults, setDetectResults] = useState({}); // id → { slug, confidence, alternatives }
  const [showDetectPanel, setShowDetectPanel] = useState(false);

  const getSlug = (p) => slugs[p.id] ?? p.slug;

  const filtered = useMemo(() => BASE_PASARAN.filter(p => {
    if (regFilter !== 'Semua' && p.region !== regFilter) return false;
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || getSlug(p).includes(q);
  }), [regFilter, search, slugs]);

  const setOne = (id, val) => setStatuses(prev => ({ ...prev, [id]: val }));

  async function testOne(p) {
    setOne(p.id, { st:'loading' });
    try {
      const data = await doFetch(getSlug(p), proxy);
      setOne(p.id, { st: data.length > 0 ? 'ok' : 'empty', count: data.length, sample: data.slice(0,3).join(' · ') });
    } catch(e) {
      setOne(p.id, { st:'error', err: e.message.slice(0,40) });
    }
  }

  async function testAll() {
    setRunning(true);
    setStopFlag(false);
    for (const p of filtered) {
      if (stopFlag) break;
      await testOne(p);
      await new Promise(r => setTimeout(r, 400));
    }
    setRunning(false);
  }

  // ── AUTO DETECT ──────────────────────────────────────────
  async function autoDetect() {
    setDetectState('loading');
    setDetectMsg('Fetching angkanet18.com/paito-harian/ …');
    setShowDetectPanel(true);
    try {
      const found = await scrapeAllSlugs(proxy);
      setAllSlugs(found);
      setDetectMsg(`✓ ${found.length} slug ditemukan. Mencocokkan…`);

      const results = {};
      let autoApplied = 0;

      for (const p of BASE_PASARAN) {
        const currentSlug = getSlug(p);
        // If current slug already in list → confirmed, no change needed
        if (found.includes(currentSlug)) {
          results[p.id] = { slug: currentSlug, confidence: 'confirmed' };
        } else {
          // Try to find replacement
          const best = findBestSlug(p.id, found);
          if (best) {
            results[p.id] = { ...best, wasDefault: currentSlug };
            if (best.confidence === 'exact' || best.confidence === 'sure') {
              // Auto-apply confident matches
              setSlugs(prev => ({ ...prev, [p.id]: best.slug }));
              autoApplied++;
            }
          } else {
            results[p.id] = { slug: currentSlug, confidence: 'notfound', wasDefault: currentSlug };
          }
        }
      }

      setDetectResults(results);
      const changed = Object.values(results).filter(r => r.confidence !== 'confirmed').length;
      const notfound = Object.values(results).filter(r => r.confidence === 'notfound').length;
      setDetectMsg(`✓ Selesai · ${found.length} slug tersedia · ${autoApplied} auto-apply · ${changed - autoApplied} perlu manual · ${notfound} tidak ditemukan`);
      setDetectState('done');
    } catch(e) {
      setDetectState('error');
      setDetectMsg(`✗ Gagal: ${e.message}`);
    }
  }

  function applySlug(id, slug) {
    setSlugs(prev => ({ ...prev, [id]: slug }));
    setDetectResults(prev => ({ ...prev, [id]: { ...prev[id], slug, confidence: 'confirmed', applied: true } }));
  }

  function resetAll() {
    setStatuses({});
    setSlugs({});
    setDetectResults({});
    setDetectState('idle');
    setDetectMsg('');
    setAllSlugs([]);
  }

  function getConfigJS() {
    const cfg = BASE_PASARAN.map(p => ({ id:p.id, name:p.name, slug:getSlug(p), flag:p.flag, region:p.region }));
    return `// === 65 PASARAN CONFIG — angkanet18.com ===
const PASARAN_65 = ${JSON.stringify(cfg, null, 2)};

async function fetchHistory(pasaranId, corsProxy = '') {
  const p = PASARAN_65.find(x => x.id === pasaranId);
  if (!p) return [];
  const target = \`https://angkanet18.com/data-pengeluaran-togel-\${p.slug}/\`;
  const url = corsProxy ? corsProxy + encodeURIComponent(target) : target;
  const html = await (await fetch(url)).text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = [];
  doc.querySelectorAll('.paito-line').forEach(line => {
    line.querySelectorAll('.paito-row-item').forEach(item => {
      const d = [...item.querySelectorAll('.paito-digit')].map(x => x.textContent.trim()).join('');
      if (/^\\d{4}$/.test(d)) out.push(d);
    });
  });
  return out.slice(0, 30);
}`;
  }

  function copyConfig() {
    navigator.clipboard.writeText(getConfigJS()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const okCount    = Object.values(statuses).filter(s => s.st === 'ok').length;
  const errorCount = Object.values(statuses).filter(s => s.st === 'error').length;
  const emptyCount = Object.values(statuses).filter(s => s.st === 'empty').length;
  const loadCount  = Object.values(statuses).filter(s => s.st === 'loading').length;
  const totalDone  = okCount + emptyCount + errorCount;

  const S = {
    wrap:  { background:'#0d1117', minHeight:'100vh', color:'#e6edf3', fontFamily:"'Courier New',monospace", padding:'14px 16px', fontSize:'12px' },
    card:  { background:'#161b22', borderRadius:'8px', padding:'12px', marginBottom:'12px', border:'1px solid #30363d' },
    input: { background:'#0d1117', border:'1px solid #30363d', color:'#e6edf3', padding:'7px 10px', borderRadius:'6px', fontSize:'12px', fontFamily:"'Courier New',monospace", outline:'none' },
    btn:   (bg, fg='#000') => ({ background:bg, color:fg, border:'none', padding:'7px 13px', borderRadius:'6px', fontWeight:'bold', fontSize:'11px', cursor:'pointer', whiteSpace:'nowrap' }),
    chip:  (active, col) => ({ background: active ? col : '#161b22', color: active ? '#000' : '#888', border:`1px solid ${active ? col : '#30363d'}`, padding:'4px 11px', borderRadius:'20px', fontSize:'11px', cursor:'pointer', fontWeight: active ? 'bold' : 'normal' }),
    th:    { padding:'6px 8px', textAlign:'left', color:'#555', borderBottom:'1px solid #21262d', fontWeight:'normal', whiteSpace:'nowrap' },
    td:    { padding:'5px 7px', borderBottom:'1px solid #1a1f27', verticalAlign:'middle' },
  };

  const confColor = { confirmed:'#22c55e', exact:'#22c55e', sure:'#22c55e', ambiguous:'#f97316', partial:'#f97316', notfound:'#ef4444', applied:'#22c55e' };

  // Non-confirmed pasaran for the detect panel
  const needsAttention = BASE_PASARAN.filter(p => {
    const r = detectResults[p.id];
    return r && r.confidence !== 'confirmed' && !r.applied;
  });

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:'16px' }}>
        <div style={{ fontSize:'18px', fontWeight:'bold', color:'#f0a500', letterSpacing:'2px' }}>📡 65 PASARAN CONFIG & TESTER</div>
        <div style={{ fontSize:'10px', color:'#555', marginTop:'3px' }}>angkanet18.com · /data-pengeluaran-togel-{'{slug}'}/</div>
      </div>

      {/* CORS Proxy + Actions */}
      <div style={S.card}>
        <div style={{ fontSize:'10px', color:'#555', marginBottom:'6px', letterSpacing:'1px' }}>🔗 CORS PROXY (wajib untuk browser)</div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <input value={proxy} onChange={e => setProxy(e.target.value)}
            placeholder="https://corsproxy.io/?" style={{ ...S.input, flex:1, minWidth:'180px' }} />

          {/* AUTO DETECT button */}
          <button onClick={autoDetect} disabled={detectState === 'loading'}
            style={S.btn(detectState === 'loading' ? '#333' : detectState === 'done' ? '#22c55e' : '#7c3aed', '#fff')}>
            {detectState === 'loading' ? '⟳ Scanning…' : detectState === 'done' ? '✓ Re-scan' : '🔍 Auto-detect Slugs'}
          </button>

          <button onClick={testAll} disabled={running} style={S.btn(running ? '#333':'#f0a500')}>
            {running ? `⟳ Testing… (${loadCount})` : `⚡ Test ${filtered.length}`}
          </button>
          {running && <button onClick={() => setStopFlag(true)} style={S.btn('#ef4444','#fff')}>⏹</button>}
          <button onClick={copyConfig} style={S.btn(copied ? '#22c55e':'#1f6feb','#fff')}>
            {copied ? '✓ Copied!' : '📋 Copy JS'}
          </button>
          <button onClick={() => setShowCode(!showCode)} style={S.btn('#2a2a3a','#ccc')}>
            {showCode ? 'Tutup' : '👁 JS'}
          </button>
          <button onClick={resetAll} style={S.btn('#2a2a3a','#666')}>🔄</button>
        </div>
        <div style={{ display:'flex', gap:'10px', marginTop:'8px', flexWrap:'wrap' }}>
          {['https://corsproxy.io/?','https://api.allorigins.win/raw?url=','https://thingproxy.freeboard.io/fetch/'].map(p => (
            <span key={p} onClick={() => setProxy(p)}
              style={{ fontSize:'10px', color: proxy===p ? '#f0a500':'#555', cursor:'pointer', textDecoration:'underline' }}>
              {p.split('/')[2]}
            </span>
          ))}
        </div>
      </div>

      {/* AUTO-DETECT PANEL */}
      {showDetectPanel && (
        <div style={{ ...S.card, borderColor: detectState==='error' ? '#ef4444' : detectState==='done' ? '#22c55e33' : '#30363d' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px' }}>🔍 AUTO-DETECT SLUGS</div>
            <span onClick={() => setShowDetectPanel(false)} style={{ color:'#444', cursor:'pointer', fontSize:'12px' }}>✕</span>
          </div>

          {/* Status msg */}
          <div style={{ fontSize:'11px', color: detectState==='error' ? '#ef4444' : '#79c0ff', marginBottom:'10px', lineHeight:'1.5' }}>
            {detectMsg || 'Klik Auto-detect untuk mulai scan halaman paito-harian.'}
          </div>

          {/* Confirmed stats */}
          {detectState === 'done' && (
            <div style={{ display:'flex', gap:'12px', marginBottom:'10px', fontSize:'11px', flexWrap:'wrap' }}>
              <span style={{ color:'#22c55e' }}>✓ Confirmed: {Object.values(detectResults).filter(r=>r.confidence==='confirmed').length}</span>
              <span style={{ color:'#22c55e' }}>⚡ Auto-apply: {Object.values(detectResults).filter(r=>r.confidence==='exact'||r.confidence==='sure').length}</span>
              <span style={{ color:'#f97316' }}>⚠ Ambiguous: {Object.values(detectResults).filter(r=>r.confidence==='ambiguous'||r.confidence==='partial').length}</span>
              <span style={{ color:'#ef4444' }}>✗ Not found: {Object.values(detectResults).filter(r=>r.confidence==='notfound').length}</span>
            </div>
          )}

          {/* Items needing manual attention */}
          {needsAttention.length > 0 && (
            <div>
              <div style={{ fontSize:'10px', color:'#f97316', marginBottom:'6px' }}>⚠ Perlu konfirmasi manual ({needsAttention.length}):</div>
              {needsAttention.map(p => {
                const r = detectResults[p.id];
                return (
                  <div key={p.id} style={{ display:'flex', gap:'8px', alignItems:'flex-start', padding:'6px 0', borderBottom:'1px solid #1a1f27', flexWrap:'wrap' }}>
                    <span style={{ color: REG_COLOR[p.region], fontWeight:'bold', fontSize:'11px', minWidth:'52px' }}>{p.id}</span>
                    <span style={{ color:'#555', fontSize:'11px', minWidth:'160px' }}>{p.name}</span>
                    <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', flex:1 }}>
                      {(r.alternatives || (r.slug !== r.wasDefault ? [r.slug] : [])).map(alt => (
                        <span key={alt} onClick={() => applySlug(p.id, alt)}
                          style={{ background:'#1a1f27', border:'1px solid #30363d', color:'#79c0ff', padding:'2px 7px', borderRadius:'4px', fontSize:'10px', cursor:'pointer' }}
                          title="Klik untuk apply">
                          {alt}
                        </span>
                      ))}
                      {r.confidence === 'notfound' && (
                        <span style={{ color:'#ef444480', fontSize:'10px' }}>tidak ada di halaman paito-harian</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All slugs raw list toggle */}
          {allSlugs.length > 0 && (
            <details style={{ marginTop:'10px' }}>
              <summary style={{ fontSize:'10px', color:'#444', cursor:'pointer' }}>📋 Semua slug ({allSlugs.length})</summary>
              <div style={{ fontSize:'10px', color:'#444', marginTop:'6px', maxHeight:'120px', overflowY:'auto', lineHeight:'1.8', columns:'3' }}>
                {allSlugs.map(s => <span key={s} style={{ display:'block', color: BASE_PASARAN.some(p => getSlug(p)===s) ? '#22c55e55' : '#333' }}>{s}</span>)}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Stats bar */}
      {Object.keys(statuses).length > 0 && (
        <div style={{ display:'flex', gap:'14px', marginBottom:'10px', fontSize:'11px', alignItems:'center', flexWrap:'wrap' }}>
          {okCount > 0    && <span style={{ color:'#22c55e' }}>✓ OK: {okCount}</span>}
          {emptyCount > 0 && <span style={{ color:'#f97316' }}>○ Kosong: {emptyCount}</span>}
          {errorCount > 0 && <span style={{ color:'#ef4444' }}>✗ Error: {errorCount}</span>}
          {loadCount > 0  && <span style={{ color:'#f0a500' }}>⟳ Loading: {loadCount}</span>}
          <div style={{ flex:1, minWidth:'80px', height:'4px', background:'#21262d', borderRadius:'4px', overflow:'hidden' }}>
            <div style={{ width:`${(totalDone/BASE_PASARAN.length)*100}%`, height:'100%', background:'#22c55e', transition:'width 0.3s' }} />
          </div>
          <span style={{ color:'#333' }}>{totalDone}/{BASE_PASARAN.length}</span>
        </div>
      )}

      {/* Region Filter + Search */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'10px', flexWrap:'wrap', alignItems:'center' }}>
        {REGIONS.map(r => {
          const cnt = r==='Semua' ? BASE_PASARAN.length : BASE_PASARAN.filter(p=>p.region===r).length;
          return <button key={r} onClick={() => setRegFilter(r)} style={S.chip(regFilter===r, REG_COLOR[r]||'#f0a500')}>
            {r} <span style={{ opacity:0.6 }}>({cnt})</span>
          </button>;
        })}
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 cari…" style={{ ...S.input, marginLeft:'auto', width:'170px', padding:'4px 8px' }} />
      </div>

      {/* Table */}
      <div style={{ overflowX:'auto', borderRadius:'8px', border:'1px solid #30363d' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#0d1117' }}>
              <th style={S.th}>#</th>
              <th style={S.th}>ID</th>
              <th style={S.th}>Nama Pasaran</th>
              <th style={S.th}>Slug (editable)</th>
              <th style={{ ...S.th, textAlign:'center' }}>Status / Data</th>
              <th style={{ ...S.th, textAlign:'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const s = statuses[p.id];
              const curSlug = getSlug(p);
              const isOverridden = slugs[p.id] !== undefined;
              const dr = detectResults[p.id];
              const slugBorderColor = dr ? (confColor[dr.confidence] || '#30363d') + '55' : '#30363d';
              return (
                <tr key={p.id} style={{ background: i%2===0 ? 'transparent' : '#0a0e14' }}>
                  <td style={{ ...S.td, color:'#333', width:'28px' }}>{i+1}</td>
                  <td style={{ ...S.td, width:'60px' }}>
                    <span style={{ color: REG_COLOR[p.region]||'#f0a500', fontWeight:'bold', fontSize:'11px' }}>{p.id}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ marginRight:'5px' }}>{p.flag}</span>
                    <span style={{ color:'#c9d1d9' }}>{p.name}</span>
                  </td>
                  <td style={{ ...S.td, width:'245px' }}>
                    <input
                      value={curSlug}
                      onChange={e => setSlugs(prev => ({ ...prev, [p.id]: e.target.value }))}
                      style={{ ...S.input, width:'100%', padding:'3px 6px', fontSize:'11px',
                        color: isOverridden ? '#fcd34d' : '#79c0ff',
                        borderColor: slugBorderColor
                      }}
                    />
                    {/* Detect alternatives inline */}
                    {dr && dr.confidence !== 'confirmed' && dr.alternatives && dr.alternatives.filter(a=>a!==curSlug).length > 0 && (
                      <div style={{ display:'flex', gap:'4px', marginTop:'3px', flexWrap:'wrap' }}>
                        {dr.alternatives.filter(a=>a!==curSlug).slice(0,4).map(alt => (
                          <span key={alt} onClick={() => applySlug(p.id, alt)}
                            title={`Apply: ${alt}`}
                            style={{ background:'#1a1f27', border:`1px solid ${confColor[dr.confidence]}44`, color: confColor[dr.confidence], padding:'1px 5px', borderRadius:'3px', fontSize:'10px', cursor:'pointer' }}>
                            {alt}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ ...S.td, textAlign:'center', width:'140px' }}>
                    {!s && <span style={{ color:'#333' }}>—</span>}
                    {s?.st==='loading' && <span style={{ color:'#f0a500' }}>⟳ loading…</span>}
                    {s?.st==='ok' && (
                      <div>
                        <span style={{ color:'#22c55e', fontWeight:'bold' }}>✓ {s.count} data</span>
                        {s.sample && <div style={{ color:'#555', fontSize:'10px', marginTop:'1px' }}>{s.sample}</div>}
                      </div>
                    )}
                    {s?.st==='empty' && <span style={{ color:'#f97316' }}>○ 0 data</span>}
                    {s?.st==='error' && (
                      <div>
                        <span style={{ color:'#ef4444' }}>✗ error</span>
                        <div style={{ color:'#ef444480', fontSize:'10px', maxWidth:'130px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.err}</div>
                      </div>
                    )}
                  </td>
                  <td style={{ ...S.td, textAlign:'center', width:'58px' }}>
                    <button onClick={() => testOne(p)}
                      style={{ ...S.btn('#1a1f27','#aaa'), fontSize:'10px', padding:'3px 8px', border:'1px solid #30363d' }}>
                      Test
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign:'center', color:'#333', fontSize:'10px', marginTop:'8px' }}>
        {filtered.length} dari {BASE_PASARAN.length} pasaran ·{' '}
        Asia:{BASE_PASARAN.filter(p=>p.region==='Asia').length} ·{' '}
        Macau:{BASE_PASARAN.filter(p=>p.region==='Macau').length} ·{' '}
        Eropa:{BASE_PASARAN.filter(p=>p.region==='Eropa').length} ·{' '}
        USA:{BASE_PASARAN.filter(p=>p.region==='USA').length}
      </div>

      {/* JS Code Preview */}
      {showCode && (
        <div style={{ ...S.card, marginTop:'12px' }}>
          <div style={{ fontSize:'10px', color:'#555', marginBottom:'8px', letterSpacing:'1px' }}>
            💾 PASTE KE &lt;script&gt; smart_paito_hk.html
          </div>
          <pre style={{ fontSize:'10px', color:'#79c0ff', overflowX:'auto', margin:0, whiteSpace:'pre-wrap', maxHeight:'320px', overflowY:'auto', lineHeight:'1.5' }}>
            {getConfigJS()}
          </pre>
        </div>
      )}
    </div>
  );
}
