#!/usr/bin/env python3
"""Costruisce Pixel Box in un unico file HTML.

    python3 tools/build.py                    # index.html installabile (GitHub Pages)
    python3 tools/build.py --artifact out.html  # versione per l'artifact di Claude (senza PWA)
"""
import datetime
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
# l'ordine conta: prima il nucleo, poi i giochi (si registrano in GAMES), infine menu e ciclo
PARTS = ['sys_core.js', 'g_palline.js', 'g_rimbalzo.js', 'g_astro.js', 'g_snake.js',
         'g_roll.js', 'g_ovetto.js', 'g_kart.js',
         'sg_gl.js', 'sg_art.js', 'sg_world.js', 'sg_town.js', 'sg_city.js', 'sg_lands.js', 'sg_nord.js', 'sg_bosco.js', 'sg_dun.js', 'sg_deep.js', 'sg_shop.js', 'sg_jobs.js', 'sg_fauna.js', 'sg_music.js', 'sg_class.js', 'g_saga.js', 'sys_main.js']

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
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {}));
</script>
'''


def build(pwa: bool):
    code = '\n'.join((SRC / p).read_text(encoding='utf-8') for p in PARTS)
    html = (SRC / 'shell.html').read_text(encoding='utf-8')
    assert '/*__CODE__*/' in html, 'segnaposto del codice mancante in shell.html'
    # la versione: numero scritto in VERSION + impronta del codice (cambia a ogni modifica)
    ver = (ROOT / 'VERSION').read_text(encoding='utf-8').strip()
    app = {'v': ver, 'id': ver + '-' + hashlib.sha1((code + html).encode('utf-8')).hexdigest()[:8],
           'date': datetime.date.today().strftime('%d/%m/%Y'), 'pwa': pwa}
    html = html.replace('/*__CODE__*/', 'const APP = ' + json.dumps(app) + ';\n' + code)
    if pwa:
        html = html.replace('<title>Pixel Box</title>\n', '<title>Pixel Box</title>\n' + PWA_HEAD, 1)
        html = html.replace('</body>', PWA_BODY + '</body>', 1)
        assert 'rel="manifest"' in html and 'serviceWorker' in html
    return html, app


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == '--artifact':
        out = Path(sys.argv[2])
        html, app = build(pwa=False)
        out.write_text(html, encoding='utf-8')
    else:
        out = ROOT / 'index.html'
        html, app = build(pwa=True)
        out.write_text(html, encoding='utf-8')
        # l'app installata confronta questo file con la propria versione
        (ROOT / 'version.json').write_text(json.dumps({k: app[k] for k in ('v', 'id', 'date')}) + '\n', encoding='utf-8')
    print('scritto', out, f'({out.stat().st_size // 1024} KB)', 'versione', app['id'])
