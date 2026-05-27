"""debug_extract.py v2 - fokus ke paito-text-container dan row1"""
import requests, re, urllib3
urllib3.disable_warnings()
from bs4 import BeautifulSoup

URL = 'https://angkanet18.com/data-pengeluaran-togel-hongkong-pools/'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

r = requests.get(URL, headers=HEADERS, timeout=20, verify=False)
soup = BeautifulSoup(r.text, 'html.parser')
print(f"Status: {r.status_code}, Size: {len(r.text):,} chars\n")

# Cek isi paito-text-container
print("=== paito-text-container (5 pertama) ===")
for i, el in enumerate(soup.find_all(class_='paito-text-container')[:5]):
    print(f"[{i}] text='{el.get_text(strip=True)}' html={str(el)[:150]}")
print()

# Cek isi row1
print("=== class row1 (5 pertama) ===")
for i, el in enumerate(soup.find_all(class_='row1')[:5]):
    print(f"[{i}] text='{el.get_text(strip=True)[:50]}' html={str(el)[:200]}")
print()

# Cek paito-line pertama secara lengkap
print("=== paito-line pertama (HTML lengkap) ===")
lines = soup.find_all(class_='paito-line')
print(f"Total paito-line: {len(lines)}")
if lines:
    print(f"HTML line[0]:\n{str(lines[0])[:500]}")
    print()
    print(f"HTML line[1]:\n{str(lines[1])[:500]}")
print()

# Cek semua teks pendek (tanggal kandidat) di dalam paito-line[0]
print("=== Semua teks di paito-line[0] ===")
if lines:
    for el in lines[0].find_all(True):
        t = el.get_text(strip=True)
        if t and len(t) <= 15:
            print(f"  tag={el.name} class={el.get('class')} text='{t}'")
