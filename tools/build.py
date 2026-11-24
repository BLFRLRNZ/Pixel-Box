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
         'sg_gl.js', 'sg_art.js', 'sg_dun.js', 'sg_deep.js', 'sg_decor.js', 'sg_world.js', 'sg_town.js', 'sg_city.js', 'sg_lands.js', 'sg_nord.js', 'sg_bosco.js', 'sg_santi.js', 'sg_shop.js', 'sv_lumen.js', 'sv_lumen2.js', 'sv_lumen3.js', 'sv_lumen4.js', 'sv_lumen5.js', 'sv_lumen6.js', 'sv_lumen7.js', 'sv_lumen8.js', 'sg_jobs.js', 'sg_fauna.js', 'sg_music.js', 'sg_class.js', 'g_saga.js', 'g_viaggio.js', 'g_pastelli.js', 'sys_main.js']

MONDO = ['sg_world.js', 'sg_town.js', 'sg_city.js', 'sg_lands.js', 'sg_nord.js', 'sg_bosco.js', 'sg_santi.js', 'sg_shop.js']

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
    # il mondo di Pixel Saga è una fabbrica: i suoi file stanno dentro SG.mondo(), così se ne può far nascere più d'uno (le terre del mondo nuovo)
    i0 = PARTS.index(MONDO[0]); assert PARTS[i0:i0 + len(MONDO)] == MONDO, 'i file del mondo devono stare di fila'
    def parte(p):
        t = (SRC / p).read_text(encoding='utf-8')
        if p == MONDO[0]: t = 'SG.mondo = function () {\n' + t
        if p == MONDO[-1]: t += r"""
return { world: SG.world, town: SG.town, city: SG.city, shop: SG.shop };
};
SG.mondo();
// un altro mondo, lasciando al loro posto i pezzi di quello che c'è
SG.dentro = (m, f) => { const k = [SG.world, SG.town, SG.city, SG.shop]; SG.world = m.world; SG.town = m.town; SG.city = m.city; SG.shop = m.shop; try { return f(); } finally { SG.world = k[0]; SG.town = k[1]; SG.city = k[2]; SG.shop = k[3]; } };
SG.altroMondo = () => { const k = { world: SG.world, town: SG.town, city: SG.city, shop: SG.shop }, m = SG.mondo(); return SG.dentro(k, () => m); };
// lo fa nascere a passi: mentre lavora, i pezzi del mondo in vista sono i suoi
SG.nasce = function* (m, atlas, sprites) { const g = m.world.build(atlas, sprites); for (;;) { const r = SG.dentro(m, () => g.next()); if (r.done) return; yield r.value; } };
"""
        return t
    code = '\n'.join(parte(p) for p in PARTS)
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
