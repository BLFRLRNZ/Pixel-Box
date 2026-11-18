#!/usr/bin/env python3
"""Costruisce Pixel Box in un unico file HTML.

    python3 tools/build.py                    # index.html installabile (GitHub Pages)
    python3 tools/build.py --artifact out.html  # versione per l'artifact di Claude (senza PWA)
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
# l'ordine conta: prima il nucleo, poi i giochi (si registrano in GAMES), infine menu e ciclo
PARTS = ['sys_core.js', 'g_palline.js', 'g_rimbalzo.js', 'g_astro.js', 'g_snake.js',
         'g_roll.js', 'g_ovetto.js', 'g_kart.js', 'sys_main.js']

PWA_HEAD = '''<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#1b1f24">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="Pixel Box">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
'''
PWA_BODY = '''<script>
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
'''


def build(pwa: bool) -> str:
    code = '\n'.join((SRC / p).read_text(encoding='utf-8') for p in PARTS)
    html = (SRC / 'shell.html').read_text(encoding='utf-8')
    assert '/*__CODE__*/' in html, 'segnaposto del codice mancante in shell.html'
    html = html.replace('/*__CODE__*/', code)
    if pwa:
        html = html.replace('<title>Pixel Box</title>\n', '<title>Pixel Box</title>\n' + PWA_HEAD, 1)
        html = html.replace('</body>', PWA_BODY + '</body>', 1)
        assert 'rel="manifest"' in html and 'serviceWorker' in html
    return html


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == '--artifact':
        out = Path(sys.argv[2])
        out.write_text(build(pwa=False), encoding='utf-8')
    else:
        out = ROOT / 'index.html'
        out.write_text(build(pwa=True), encoding='utf-8')
    print('scritto', out, f'({out.stat().st_size // 1024} KB)')
