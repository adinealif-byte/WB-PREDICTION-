/**
 * wb_data.js — WongBagus Prediction · Shared Data Module
 * ========================================================
 * Dipakai oleh SEMUA halaman: index.html, rekap_2d-1.html,
 * bola_merah.html, rekap_3d.html, rekap_4d.html, pola_sgp.html,
 * kalender_togel.html, bank_rumus.html, dll.
 *
 * CARA PAKAI (di tiap halaman, sebelum script utama):
 *   <script src="./wb_data.js"></script>
 *
 * ── FILTER & SUMBER DATA ─────────────────────────────────────
 * Sumber  : result.json (cascade URL, lihat RESULT_JSON_URLS)
 * Filter  : Hanya pasaran dalam ALLOWED_IDS yang disimpan.
 *           Default = ['hk'] (Hongkong Pools).
 * Refresh : Otomatis setiap 30 menit (CACHE_TTL).
 *           Paito-harian TIDAK digunakan.
 * Tambah  : Ubah ALLOWED_IDS misal ['hk','sgp'] untuk multi-pasaran.
 *
 * API publik:
 *   WBData.getAll()            → { hk:{result,status,updated,name,...}, ..., _meta:{} }
 *   WBData.get(id)             → entry untuk 1 pasaran, atau null
 *   WBData.getResult(id)       → string 4-digit / '----' / null
 *   WBData.onUpdate(callback)  → register listener; dipanggil setiap data berubah
 *   WBData.offUpdate(callback) → hapus listener
 *   WBData.isFresh()           → true jika cache < 90 menit
 *   WBData.metaUpdated()       → string timestamp terakhir update
 *   WBData.MARKETS             → array definisi 65 pasaran (readonly)
 *   WBData.KEYWORD_MAP         → array keyword→id mapping
 *
 * index.html memanggil WBData._write(rj) setelah dapat data
 * dari result.json / paito-harian. Halaman lain HANYA membaca.
 */

(function(global) {
  'use strict';

  // ── Storage key ─────────────────────────────────────────────
  const CACHE_KEY   = 'wb_rj_v3';        // sama dg index.html lama
  const SHARED_KEY  = 'wb_shared_v1';    // kunci baru yg dipakai halaman lain
  const CACHE_TTL   = 30 * 60 * 1000;   // 30 menit (sesuai update result.json)

  // ── Filter pasaran — ubah di sini untuk tambah/kurangi ──────
  // Contoh multi: const ALLOWED_IDS = ['hk', 'sgp', 'sdy'];
  const ALLOWED_IDS = ['hk'];

  // ── Internal state ──────────────────────────────────────────
  let _data   = null;   // object result.json terakhir
  let _ts     = 0;      // epoch ms saat data ditulis
  let _listeners = [];

  // ── 65 PASARAN definisi (difilter ke ALLOWED_IDS saja) ──────
  const MARKETS = [
    // ASIA UTAMA
    {id:'hk',   flag:'🇭🇰',name:'Hongkong',       short:'HK',    time:'23:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-hongkong-pools/',         wb:'hongkong-pools'},
    {id:'hkl',  flag:'🇭🇰',name:'HK Lotto',       short:'HKL',   time:'23:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-hklotto/',                 wb:''},
    {id:'sgp',  flag:'🇸🇬',name:'Singapore',      short:'SGP',   time:'17:40',days:'Sen,Rab,Kam,Sab,Min', an:'/data-pengeluaran-togel-singapore/',       wb:'singapore'},
    {id:'sdy',  flag:'🇦🇺',name:'Sydney Pools',   short:'SDY',   time:'13:45',days:'Setiap Hari', an:'/data-pengeluaran-togel-sydney-pools/',           wb:'sydney-pools'},
    {id:'sdl',  flag:'🇦🇺',name:'Sydney Lotto',   short:'SDL',   time:'13:45',days:'Sen-Sab',      an:'/data-pengeluaran-togel-sdlotto/',                wb:'sdlotto'},
    {id:'kam',  flag:'🇰🇭',name:'Kamboja',        short:'KAM',   time:'11:50',days:'Setiap Hari', an:'/data-pengeluaran-togel-magnum-cambodia/',         wb:'magnum-cambodia'},
    {id:'bull', flag:'🇳🇿',name:'Bullseye NZ',    short:'BULL',  time:'13:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-bullseye/',                wb:'bullseye'},
    {id:'chn',  flag:'🇨🇳',name:'China Pools',    short:'CHN',   time:'15:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-chinapools/',              wb:'chinapools'},
    {id:'jpn',  flag:'🇯🇵',name:'Japan',          short:'JPN',   time:'17:20',days:'Setiap Hari', an:'/data-pengeluaran-togel-japan/',                   wb:'japan'},
    {id:'twn',  flag:'🇹🇼',name:'Taiwan',         short:'TWN',   time:'20:45',days:'Setiap Hari', an:'/data-pengeluaran-togel-taiwan/',                  wb:'taiwan'},
    {id:'pcso', flag:'🇵🇭',name:'PCSO',           short:'PCSO',  time:'20:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-pcso/',                    wb:''},
    // TOTO MACAU
    {id:'mac1', flag:'🇲🇴',name:'Toto Macau 13',  short:'MAC13', time:'13:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-toto-macau-1/',            wb:''},
    {id:'mac2', flag:'🇲🇴',name:'Toto Macau 16',  short:'MAC16', time:'16:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-toto-macau-2/',            wb:''},
    {id:'mac3', flag:'🇲🇴',name:'Toto Macau 19',  short:'MAC19', time:'19:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-toto-macau-3/',            wb:''},
    {id:'mac4', flag:'🇲🇴',name:'Toto Macau 22',  short:'MAC22', time:'22:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-toto-macau-4/',            wb:''},
    {id:'mac5', flag:'🇲🇴',name:'Toto Macau 00',  short:'MAC00', time:'00:11',days:'Setiap Hari', an:'/data-pengeluaran-togel-toto-macau-5/',            wb:''},
    {id:'mac6', flag:'🇲🇴',name:'Toto Macau 23',  short:'MAC23', time:'23:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-toto-macau-6/',            wb:''},
    // MOROCCO
    {id:'mrq3',  flag:'🇲🇦',name:'Morocco 03:00', short:'MRQ3',  time:'03:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-morocco-quatro-03-00-wib/', wb:''},
    {id:'mrq18', flag:'🇲🇦',name:'Morocco 18:00', short:'MRQ18', time:'18:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-morocco-quatro-18-00-wib/', wb:''},
    {id:'mrq21', flag:'🇲🇦',name:'Morocco 21:00', short:'MRQ21', time:'21:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-morocco-quatro-21-00-wib/', wb:''},
    {id:'mrq23', flag:'🇲🇦',name:'Morocco 23:59', short:'MRQ23', time:'23:59',days:'Setiap Hari', an:'/data-pengeluaran-togel-morocco-quatro-23-59-wib/', wb:''},
    // GERMANY
    {id:'ger',  flag:'🇩🇪',name:'Germany Plus5',  short:'GER',   time:'01:10',days:'Setiap Hari', an:'/data-pengeluaran-togel-germany-plus5/',           wb:''},
    // OREGON
    {id:'or4',  flag:'🇺🇸',name:'Oregon 04:00',   short:'OR4',   time:'04:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-oregon-04-00-wib/',        wb:''},
    {id:'or7',  flag:'🇺🇸',name:'Oregon 07:00',   short:'OR7',   time:'07:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-oregon-07-00-wib/',        wb:''},
    {id:'or10', flag:'🇺🇸',name:'Oregon 10:00',   short:'OR10',  time:'10:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-oregon-10-00-wib/',        wb:''},
    {id:'or13', flag:'🇺🇸',name:'Oregon 13:00',   short:'OR13',  time:'13:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-oregon-13-00-wib/',        wb:''},
    // NORTH CAROLINA
    {id:'ncd',  flag:'🇺🇸',name:'NC Day',         short:'NCD',   time:'03:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-north-carolina-day/',      wb:'north-carolina-day'},
    {id:'nce',  flag:'🇺🇸',name:'NC Evening',     short:'NCE',   time:'11:22',days:'Setiap Hari', an:'/data-pengeluaran-togel-north-carolina-evening/',  wb:''},
    // GEORGIA
    {id:'geom', flag:'🇺🇸',name:'Georgia Mid',    short:'GEOM',  time:'00:29',days:'Setiap Hari', an:'/data-pengeluaran-togel-georgia-midday/',          wb:''},
    {id:'geoe', flag:'🇺🇸',name:'Georgia Eve',    short:'GEOE',  time:'07:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-georgia-evening/',         wb:''},
    {id:'geon', flag:'🇺🇸',name:'Georgia Night',  short:'GEON',  time:'11:34',days:'Setiap Hari', an:'/data-pengeluaran-togel-georgia-night/',           wb:''},
    // TEXAS
    {id:'txd',  flag:'🇺🇸',name:'Texas Day',      short:'TXD',   time:'01:27',days:'Setiap Hari', an:'/data-pengeluaran-togel-texas-day/',               wb:''},
    {id:'txmr', flag:'🇺🇸',name:'Texas Morning',  short:'TXMR',  time:'22:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-texas-morning/',           wb:''},
    {id:'txe',  flag:'🇺🇸',name:'Texas Evening',  short:'TXE',   time:'09:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-texas-evening/',           wb:''},
    {id:'txn',  flag:'🇺🇸',name:'Texas Night',    short:'TXN',   time:'14:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-texas-night/',             wb:''},
    // NEW YORK
    {id:'nyd',  flag:'🇺🇸',name:'New York Mid',   short:'NYD',   time:'01:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-new-york-midday/',         wb:''},
    {id:'nye',  flag:'🇺🇸',name:'New York Eve',   short:'NYE',   time:'10:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-new-york-evening/',        wb:''},
    // NEW JERSEY
    {id:'njm',  flag:'🇺🇸',name:'NJ Midday',      short:'NJM',   time:'01:57',days:'Setiap Hari', an:'/data-pengeluaran-togel-new-jersey-midday/',       wb:''},
    {id:'nje',  flag:'🇺🇸',name:'NJ Evening',     short:'NJE',   time:'10:57',days:'Setiap Hari', an:'/data-pengeluaran-togel-new-jersey-evening/',      wb:''},
    // FLORIDA
    {id:'flm',  flag:'🇺🇸',name:'Florida Mid',    short:'FLM',   time:'01:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-florida-midday/',          wb:''},
    {id:'fle',  flag:'🇺🇸',name:'Florida Eve',    short:'FLE',   time:'11:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-florida-evening/',         wb:''},
    // ILLINOIS
    {id:'ilm',  flag:'🇺🇸',name:'Illinois Mid',   short:'ILM',   time:'02:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-illinois-midday/',         wb:''},
    {id:'ile',  flag:'🇺🇸',name:'Illinois Eve',   short:'ILE',   time:'11:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-illinois-evening/',        wb:''},
    // INDIANA
    {id:'indm', flag:'🇺🇸',name:'Indiana Mid',    short:'INDM',  time:'02:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-indiana-midday/',          wb:''},
    {id:'inde', flag:'🇺🇸',name:'Indiana Eve',    short:'INDE',  time:'11:29',days:'Setiap Hari', an:'/data-pengeluaran-togel-indiana-evening/',         wb:''},
    // KENTUCKY
    {id:'kym',  flag:'🇺🇸',name:'Kentucky Mid',   short:'KYM',   time:'01:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-kentucky-midday/',         wb:''},
    {id:'kye',  flag:'🇺🇸',name:'Kentucky Eve',   short:'KYE',   time:'10:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-kentucky-evening/',        wb:''},
    // MARYLAND
    {id:'mdm',  flag:'🇺🇸',name:'Maryland Mid',   short:'MDM',   time:'01:55',days:'Setiap Hari', an:'/data-pengeluaran-togel-maryland-midday/',         wb:''},
    {id:'mde',  flag:'🇺🇸',name:'Maryland Eve',   short:'MDE',   time:'10:57',days:'Setiap Hari', an:'/data-pengeluaran-togel-maryland-evening/',        wb:''},
    // MICHIGAN
    {id:'mim',  flag:'🇺🇸',name:'Michigan Mid',   short:'MIM',   time:'01:28',days:'Setiap Hari', an:'/data-pengeluaran-togel-michigan-midday/',         wb:''},
    {id:'mie',  flag:'🇺🇸',name:'Michigan Eve',   short:'MIE',   time:'10:28',days:'Setiap Hari', an:'/data-pengeluaran-togel-michigan-evening/',        wb:''},
    // MISSOURI
    {id:'mom',  flag:'🇺🇸',name:'Missouri Mid',   short:'MOM',   time:'01:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-missouri-midday/',         wb:''},
    {id:'moe',  flag:'🇺🇸',name:'Missouri Eve',   short:'MOE',   time:'10:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-missouri-evening/',        wb:''},
    // WASHINGTON DC
    {id:'wdm',  flag:'🇺🇸',name:'WDC Midday',     short:'WDM',   time:'01:50',days:'Setiap Hari', an:'/data-pengeluaran-togel-washington-dc-midday/',    wb:''},
    {id:'wde',  flag:'🇺🇸',name:'WDC Evening',    short:'WDE',   time:'10:50',days:'Setiap Hari', an:'/data-pengeluaran-togel-washington-dc-evening/',   wb:''},
    // CONNECTICUT
    {id:'ctd',  flag:'🇺🇸',name:'Connecticut Day', short:'CTD',  time:'02:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-connecticut-day/',         wb:''},
    {id:'ctn',  flag:'🇺🇸',name:'Connecticut Night',short:'CTN', time:'11:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-connecticut-night/',        wb:''},
    // VIRGINIA
    {id:'vad',  flag:'🇺🇸',name:'Virginia Day',   short:'VAD',   time:'02:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-virginia-day/',            wb:''},
    {id:'van',  flag:'🇺🇸',name:'Virginia Night', short:'VAN',   time:'11:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-virginia-night/',           wb:''},
    // TENNESSEE
    {id:'tnm',  flag:'🇺🇸',name:'Tennessee Mid',  short:'TNM',   time:'01:29',days:'Setiap Hari', an:'/data-pengeluaran-togel-tennesse-midday/',         wb:''},
    {id:'tne',  flag:'🇺🇸',name:'Tennessee Eve',  short:'TNE',   time:'10:29',days:'Setiap Hari', an:'/data-pengeluaran-togel-tennesse-evening/',        wb:''},
    {id:'tnmr', flag:'🇺🇸',name:'Tennessee Morning',short:'TNMR',time:'22:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-tennesse-morning/',        wb:''},
    // LAINNYA
    {id:'cal',  flag:'🇺🇸',name:'California',     short:'CAL',   time:'10:00',days:'Setiap Hari', an:'/data-pengeluaran-togel-california/',              wb:''},
    {id:'wie',  flag:'🇺🇸',name:'Wisconsin Eve',  short:'WIE',   time:'10:30',days:'Setiap Hari', an:'/data-pengeluaran-togel-wisconsin-evening/',       wb:''},
  ].filter(m => ALLOWED_IDS.includes(m.id));

  // ── KEYWORD MAP (untuk parse paito-harian) ──────────────────
  const KEYWORD_MAP = [
    ['hongkong pool','hk'],['hk pools','hk'],['hk lotto','hkl'],['hklotto','hkl'],
    ['singapore','sgp'],
    ['sydney pools','sdy'],['sydney pool','sdy'],['sydney lotto','sdl'],['sdlotto','sdl'],
    ['magnum cambodia','kam'],['kamboja','kam'],['cambodia','kam'],
    ['bullseye','bull'],
    ['china pool','chn'],['chinapool','chn'],
    ['japan','jpn'],['taiwan','twn'],['pcso','pcso'],
    ['toto macau 1','mac1'],['macau 13','mac1'],
    ['toto macau 2','mac2'],['macau 16','mac2'],
    ['toto macau 3','mac3'],['macau 19','mac3'],
    ['toto macau 4','mac4'],['macau 22','mac4'],
    ['toto macau 5','mac5'],['macau 00','mac5'],
    ['toto macau 6','mac6'],['macau 23','mac6'],
    ['morocco quatro 03','mrq3'],['morocco 03','mrq3'],
    ['morocco quatro 18','mrq18'],['morocco 18','mrq18'],
    ['morocco quatro 21','mrq21'],['morocco 21','mrq21'],
    ['morocco quatro 23','mrq23'],['morocco 23','mrq23'],
    ['germany','ger'],
    ['oregon 04','or4'],['oregon 07','or7'],['oregon 10','or10'],['oregon 13','or13'],
    ['north carolina day','ncd'],['nc day','ncd'],
    ['north carolina evening','nce'],['nc evening','nce'],
    ['georgia midday','geom'],['georgia mid','geom'],
    ['georgia evening','geoe'],['georgia eve','geoe'],
    ['georgia night','geon'],
    ['texas morning','txmr'],['texas day','txd'],['texas evening','txe'],['texas night','txn'],
    ['new york midday','nyd'],['new york evening','nye'],
    ['new jersey midday','njm'],['nj midday','njm'],
    ['new jersey evening','nje'],['nj evening','nje'],
    ['florida midday','flm'],['florida evening','fle'],
    ['illinois midday','ilm'],['illinois evening','ile'],
    ['indiana midday','indm'],['indiana evening','inde'],
    ['kentucky midday','kym'],['kentucky evening','kye'],
    ['maryland midday','mdm'],['maryland evening','mde'],
    ['michigan midday','mim'],['michigan evening','mie'],
    ['missouri midday','mom'],['missouri evening','moe'],
    ['washington dc midday','wdm'],['wdc midday','wdm'],
    ['washington dc evening','wde'],['wdc evening','wde'],
    ['connecticut day','ctd'],['connecticut night','ctn'],
    ['virginia day','vad'],['virginia night','van'],
    ['tennesse midday','tnm'],['tennessee midday','tnm'],
    ['tennesse evening','tne'],['tennessee evening','tne'],
    ['tennesse morning','tnmr'],['tennessee morning','tnmr'],
    ['california','cal'],['wisconsin evening','wie'],
  ];

  // ── Result.json URLs (fallback cascade) ─────────────────────
  const RESULT_JSON_URLS = [
    './result.json',
    'https://alifavif-cmd.github.io/-WONGBAGUS-PREDICTION-/result.json',
    'https://raw.githubusercontent.com/alifavif-cmd/-WONGBAGUS-PREDICTION-/main/result.json',
  ];

  // ── Paito Harian URL ─────────────────────────────────────────
  const PAITO_HARIAN_URL = 'https://angkanet18.com/paito-harian/';

  // ── CORS proxy list ──────────────────────────────────────────
  const PROXIES = [
    u => 'https://api.allorigins.win/get?url=' + encodeURIComponent(u),
    u => 'https://corsproxy.io/?' + encodeURIComponent(u),
    u => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u),
  ];

  // ── Helpers ──────────────────────────────────────────────────
  const FAKE_PAT = [
    /^1234$/,/^2345$/,/^3456$/,/^4567$/,/^5678$/,
    /^6789$/,/^7890$/,/^8901$/,/^9012$/,/^0123$/,/^(\d)\1{3}$/,
  ];

  function isFake(r) {
    if (!/^\d{4}$/.test(r)) return true;
    const n = parseInt(r, 10);
    if (n >= 1800 && n <= 2099) return true;
    return FAKE_PAT.some(p => p.test(r));
  }

  function matchMarket(text) {
    const tl = text.toLowerCase();
    for (const [kw, key] of KEYWORD_MAP) { if (tl.includes(kw)) return key; }
    return null;
  }

  // ── localStorage helpers ─────────────────────────────────────
  function _save(rj) {
    try {
      const payload = { ts: Date.now(), rj };
      localStorage.setItem(CACHE_KEY,  JSON.stringify(payload));
      localStorage.setItem(SHARED_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function _load() {
    // Coba SHARED_KEY dulu (lebih fresh), lalu CACHE_KEY lama
    for (const key of [SHARED_KEY, CACHE_KEY]) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const { ts, rj } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL) continue;
        return { ts, rj };
      } catch (e) {}
    }
    return null;
  }

  // ── Internal write (dipanggil index.html) ────────────────────
  function _write(rj) {
    if (!rj || typeof rj !== 'object') return;
    // Simpan hanya _meta + pasaran dalam ALLOWED_IDS
    const filtered = {};
    if (rj._meta) filtered._meta = rj._meta;
    for (const id of ALLOWED_IDS) {
      if (rj[id]) filtered[id] = rj[id];
    }
    _data = filtered;
    _ts   = Date.now();
    _save(filtered);
    _notifyListeners();
  }

  // ── Notifikasi listeners ─────────────────────────────────────
  function _notifyListeners() {
    for (const cb of _listeners) {
      try { cb(_data); } catch (e) {}
    }
  }

  // ── Fetch result.json ─────────────────────────────────────────
  async function _fetchResultJson(url) {
    try {
      const res = await Promise.race([
        fetch(url, { cache: 'no-cache' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000)),
      ]);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  }

  // ── Fetch via CORS proxy ──────────────────────────────────────
  async function _proxyFetch(url) {
    for (const makeProxy of PROXIES) {
      try {
        const res = await Promise.race([
          fetch(makeProxy(url)),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000)),
        ]);
        if (!res.ok) continue;
        const data = await res.json();
        const html = typeof data === 'string' ? data : (data.contents || data.data || '');
        if (html && html.length > 100) return html;
      } catch (e) {}
    }
    return null;
  }

  // ── Parse paito-harian HTML → {id: result4digit} ─────────────
  function _parsePaitoHarian(html) {
    const found = {};
    if (!html || html.length < 500) return found;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Strategy 1: container dengan heading
    const containers = [...doc.querySelectorAll('section,div,article,li')].filter(el => {
      const cls = (el.className || '').toLowerCase();
      return /market|pasaran|paito|result|item|card|pool/.test(cls);
    });
    for (const sec of containers) {
      const hEl = sec.querySelector('h1,h2,h3,h4,h5,strong');
      if (!hEl) continue;
      const key = matchMarket(hEl.textContent || '');
      if (!key || found[key]) continue;
      for (const tag of sec.querySelectorAll('span,td,div,b,p')) {
        const t = (tag.textContent || '').trim();
        if (/^\d{4}$/.test(t) && !isFake(t)) { found[key] = t; break; }
      }
    }

    // Strategy 2: .paito-row-item grouped by parent
    if (Object.keys(found).length < 10) {
      const rowMap = new Map();
      for (const item of doc.querySelectorAll('.paito-row-item')) {
        const pid = item.parentElement;
        if (!rowMap.has(pid)) rowMap.set(pid, { texts: [], result: null });
        const t = (item.textContent || '').trim();
        rowMap.get(pid).texts.push(t);
        if (!rowMap.get(pid).result && /^\d{4}$/.test(t) && !isFake(t))
          rowMap.get(pid).result = t;
      }
      for (const [, info] of rowMap) {
        if (!info.result) continue;
        const key = matchMarket(info.texts.join(' '));
        if (key && !found[key]) found[key] = info.result;
      }
    }

    // Strategy 3: scan tr/li
    if (Object.keys(found).length < 5) {
      let count = 0;
      for (const block of doc.querySelectorAll('tr,li')) {
        if (++count > 3000) break;
        const t = (block.textContent || '').trim();
        if (!/^\d{4}$/.test(t) || isFake(t)) continue;
        const pTxt = block.parentElement ? (block.parentElement.textContent || '') : '';
        const key = matchMarket(pTxt);
        if (key && !found[key]) found[key] = t;
      }
    }
    return found;
  }

  /**
   * fetchResultJson — ambil data dari result.json (cascade URL).
   * Hanya pasaran dalam ALLOWED_IDS yang disimpan ke cache.
   * Dipanggil saat init (cache kosong/expired) dan setiap 30 menit otomatis.
   */
  async function fetchResultJson() {
    console.log('[WBData] Fetching result.json (HK only)...');
    for (const url of RESULT_JSON_URLS) {
      const rj = await _fetchResultJson(url + '?t=' + Date.now());
      if (rj && (rj._meta || ALLOWED_IDS.some(id => rj[id]))) {
        _write(rj);  // _write sudah filter ke ALLOWED_IDS
        console.log('[WBData] result.json OK:', url,
          '— HK result:', rj['hk'] ? rj['hk'].result : 'tidak ada');
        return _data;
      }
    }
    console.warn('[WBData] Semua result.json URL gagal, pakai cache lama.');
    return _data;
  }

  // ── Auto-refresh setiap CACHE_TTL (30 menit) ────────────────
  let _autoRefreshTimer = null;
  function _startAutoRefresh() {
    if (_autoRefreshTimer) return;
    _autoRefreshTimer = setInterval(async () => {
      console.log('[WBData] Auto-refresh 30 menit...');
      await fetchResultJson();
    }, CACHE_TTL);
  }

  // ── Init: muat cache saat script dimuat ─────────────────────
  (function _init() {
    const cached = _load();
    if (cached) {
      _data = cached.rj;
      _ts   = cached.ts;
      console.log('[WBData] Cache loaded, age:', Math.round((Date.now() - _ts) / 60000), 'menit');
    }

    // Kalau cache kosong atau sudah expired, fetch sekarang
    if (!_data || !WBData_isFresh()) {
      fetchResultJson();
    }

    // Auto-refresh setiap 30 menit
    _startAutoRefresh();

    // Listen untuk update dari tab lain (index.html di tab berbeda)
    try {
      window.addEventListener('storage', function(e) {
        if (e.key !== SHARED_KEY) return;
        try {
          const { ts, rj } = JSON.parse(e.newValue);
          if (ts > _ts) {
            _data = rj;
            _ts   = ts;
            console.log('[WBData] Data updated from another tab');
            _notifyListeners();
          }
        } catch (err) {}
      });
    } catch (e) {}
  })();

  function WBData_isFresh() { return !!_data && (Date.now() - _ts < CACHE_TTL); }

  // ── Public API ───────────────────────────────────────────────
  global.WBData = {
    /** Semua data result.json terakhir */
    getAll() { return _data; },

    /** Entry untuk 1 pasaran, atau null */
    get(id) { return _data ? (_data[id] || null) : null; },

    /** Result 4-digit untuk 1 pasaran, atau '----' / null */
    getResult(id) {
      const e = this.get(id);
      if (!e) return null;
      const r = String(e.result || '');
      return /^\d{4}$/.test(r) ? r : '----';
    },

    /** Register listener dipanggil setiap data berubah */
    onUpdate(cb) {
      if (typeof cb === 'function' && !_listeners.includes(cb))
        _listeners.push(cb);
    },

    /** Hapus listener */
    offUpdate(cb) {
      _listeners = _listeners.filter(x => x !== cb);
    },

    /** true jika cache ada dan < 30 menit */
    isFresh() { return WBData_isFresh(); },

    /** Timestamp update terakhir */
    metaUpdated() { return _data && _data._meta ? _data._meta.updated : ''; },

    /** Fetch ulang result.json sekarang (HK only) */
    async refresh() { return fetchResultJson(); },

    /** Internal: dipakai index.html untuk push data segar */
    _write,

    /** Definisi pasaran (sudah difilter ke ALLOWED_IDS) */
    MARKETS,

    /** Keyword map untuk parse paito-harian (tetap ada untuk kompatibilitas) */
    KEYWORD_MAP,

    /** CORS proxy fetch */
    _proxyFetch,

    /** Parse paito-harian HTML (tetap ada untuk kompatibilitas) */
    _parsePaitoHarian,

    /** Helper isFake */
    isFake,

    /** Helper matchMarket */
    matchMarket,

    // ── BIJI PRIMBON ─────────────────────────────────────────────

    /** Tabel Biji per pasaran Jawa */
    BIJI_TABLE: {
      LEGI: {
        1:['82','28','37','73','55','46','64','10','01'],
        2:['74','47','56','65','29','92','20','02','11'],
        3:['75','57','48','84','39','93','12','21','66'],
        4:['76','67','58','85','94','49','22','40','04'],
        5:['86','68','59','95','77','14','41','50','05'],
        6:['15','51','60','06','78','87','24','42','96','69'],
        7:['16','61','70','07','34','43','25','52','79','97'],
        8:['26','62','53','35','89','98','71','17','44','80','08'],
        9:['18','81','54','45','36','63','72','27','90','09'],
      },
      PAHING: {
        1:['01','10','37','73','46','64','82','28'],
        2:['74','47','65','56','29','92','20','02','11'],
        3:['75','57','39','93','03','30','66','48','84'],
        4:['67','76','58','85','94','49','22','04','40'],
        5:['59','95','68','86','32','23','14','41','50','05'],
        6:['78','87','33','96','69','06','60','24','42'],
        7:['88','70','07','61','16','79','97','52','25'],
        8:['98','89','71','17','53','35','26','62','80','08'],
        9:['99','18','81','72','27','54','45'],
      },
      PON: {
        1:['91','19','46','64','10','01','55','28','82','37','73'],
        2:['29','92','38','83','20','02','11','47','74'],
        3:['75','57','12','21','93','39','03','30','66','48','84'],
        4:['67','76','85','58','94','49','04','40'],
        5:['95','59','68','86','05','50','23','32'],
        6:['60','06','15','51','33','42','24','78','87'],
        7:['43','34','79','97','70','07','88','25','52','61','16'],
        8:['08','80','71','17','35','53','26','62'],
        9:['45','54','90','09','36','63','27','72'],
      },
      WAGE: {
        1:['19','91','46','64','10','01','55','73','37'],
        2:['02','20','56','65','83','38','11','47','74'],
        3:['57','75','21','12','93','39','30','03','84','48'],
        4:['67','76','94','49','04','40','13','31'],
        5:['14','41','59','95','23','32','05','50'],
        6:['87','78','60','06','69','96','33','42','24','15','51'],
        7:['43','34','79','97','70','07','88','25','52','61','16'],
        8:['80','08','53','35','71','17','89','98'],
        9:['81','18','09','90','54','45','63','36','27','72'],
      },
      KLIWON: {
        1:['01','10','46','64','55','82','28','73','37'],
        2:['74','47','56','65','02','20','38','83','11'],
        3:['12','21','93','39','30','03','84','48','66'],
        4:['67','76','22','94','49','58','85','40','04'],
        5:['86','68','59','95','41','14','32','23','50','05'],
        6:['15','51','60','06','42','24','33','96','69'],
        7:['43','34','70','07','16','61','97','79','25','52'],
        8:['08','80','89','98','44','17','71'],
        9:['36','63','54','45','90','09','18','81','27','72'],
      },
    },

    /** Deteksi hari pasaran Jawa dari Date object */
    getHariPasaran(date) {
      const d = date || new Date();
      // Referensi: 1 Januari 2000 = Sabtu Kliwon
      const ref = new Date(2000, 0, 1);
      const diff = Math.floor((d - ref) / 86400000);
      const pasaran = ['KLIWON','LEGI','PAHING','PON','WAGE'];
      return pasaran[((diff % 5) + 5) % 5];
    },

    /** Dapat nomor Biji dari 2D result + nama pasaran */
    getBiji(result2d, pasaran) {
      const tbl = this.BIJI_TABLE[pasaran];
      if (!tbl) return null;
      for (const [biji, nums] of Object.entries(tbl)) {
        if (nums.includes(result2d)) return parseInt(biji);
      }
      return null;
    },

    /** Dapat semua angka dari Biji tertentu di pasaran tertentu */
    getBijiAngka(biji, pasaran) {
      const tbl = this.BIJI_TABLE[pasaran];
      if (!tbl || !tbl[biji]) return [];
      return tbl[biji];
    },

    /** Info lengkap Biji untuk 1 pasaran berdasarkan result & tanggal */
    getBijiInfo(resultStr, date) {
      if (!resultStr || resultStr === '----' || resultStr.length < 4) return null;
      const pasaran = this.getHariPasaran(date || new Date());
      const r2d = resultStr.slice(2, 4);
      const biji = this.getBiji(r2d, pasaran);
      if (!biji) return null;
      const angka = this.getBijiAngka(biji, pasaran);
      return { pasaran, biji, r2d, angka };
    },

    /** Buat teks ringkasan Biji untuk prompt AI */
    getBijiPrompt(resultStr, date) {
      const info = this.getBijiInfo(resultStr, date);
      if (!info) return '';
      return `Hari ini pasaran Jawa: ${info.pasaran}. Result 2D: ${info.r2d} = Biji ${info.biji}. Angka sekelompok Biji ${info.biji} (${info.pasaran}): ${info.angka.join(', ')}. Gunakan angka Biji ini sebagai DASAR prediksi.`;
    },
  };

})(window);
