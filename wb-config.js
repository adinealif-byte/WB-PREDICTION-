// Config penyimpanan (Cloudflare Worker) - SITUS adinealif-byte
// Satu Worker dipakai semua akun; data tiap akun dipisah lewat nama "account".
// system:'legacy' = index.html versi satu halaman (kunci wb_logged_member / wb_admin_cred).
window.WB_STORE = {
  worker: 'https://steep-resonance-6a71.kjago7822.workers.dev',
  account: 'adinealif-byte',
  system: 'legacy',
  bank: { prefix: 'wbidx_bank__', field: 'bankBin', app: 'scan2', defaultLimit: 100 }
};
