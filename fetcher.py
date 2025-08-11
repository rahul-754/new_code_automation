from urllib.parse import urljoin
from bs4 import BeautifulSoup
import requests

def fetch_html(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    html = resp.text

    # Rewrite asset URLs for scripts, links, images to be absolute
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(["script", "link", "img"], src=True):
        tag['src'] = urljoin(url, tag['src'])
    for tag in soup.find_all("link", href=True):
        tag['href'] = urljoin(url, tag['href'])
    return str(soup)
