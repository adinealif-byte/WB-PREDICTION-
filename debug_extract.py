"""
debug_extract.py - jalankan sekali via GitHub Actions untuk lihat struktur HTML
Tambah step sementara di fetch_results.yml:
  - name: Debug HTML
    run: python debug_extract.py
    env:
      TZ: Asia/Jakarta
"""
import requests, re, urllib3
urllib3.disable_warnings()
from bs4 import BeautifulSoup

URL = 'https://angkanet18.com/data-pengeluaran-togel-hongkong-pools/'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
}

r = requests.get(URL, headers=HEADERS, timeout=20, verify=False)
soup = BeautifulSoup(r.text, 'html.parser')

print(f"Status: {r.status_code}, Size: {len(r.text):,} chars")
print()

# Cek semua class yang ada
all_classes = set()
for el in soup.find_all(True):
    for c in (el.get('class') or []):
        all_classes.add(c)
relevant = [c for c in sorted(all_classes) if any(k in c.lower() for k in ['paito','result','data','row','table','togel','angka','nomor','number'])]
print("Relevant classes:", relevant[:30])
print()

# Cek <tr> pertama yang punya tanggal
print("=== 5 TR pertama dengan tanggal ===")
date_pat = re.compile(r'\d{2}[-/]\d{2}[-/]\d{4}')
count = 0
for tr in soup.find_all('tr'):
    text = tr.get_text(' ', strip=True)
    if date_pat.search(text):
        tds = [td.get_text(strip=True) for td in tr.find_all('td')]
        print(f"TDs: {tds[:10]}")
        # Print raw HTML
        print(f"HTML: {str(tr)[:300]}")
        print()
        count += 1
        if count >= 5:
            break

if count == 0:
    print("TIDAK ADA <tr> dengan tanggal!")
    # Cek div/span
    print()
    print("=== Cari tanggal di semua elemen ===")
    found = 0
    for el in soup.find_all(True):
        t = el.get_text(strip=True)
        if date_pat.match(t) and len(t) <= 12:
            print(f"Tag: {el.name}, Class: {el.get('class')}, Text: {t}")
            print(f"Parent: {el.parent.name}, ParentClass: {el.parent.get('class')}")
            print(f"Parent HTML: {str(el.parent)[:200]}")
            print()
            found += 1
            if found >= 5:
                break
