#!/usr/bin/env python3
"""Disegna le icone dell'app (una mini console a pixel) e le salva in icons/."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BG = (27, 31, 36)
PAL = {
    'g': (207, 204, 196),   # scocca
    'G': (150, 146, 138),   # bordo in ombra
    'k': (87, 92, 105),     # cornice dello schermo
    'l': (180, 228, 246),   # cielo dello schermo
    'r': (224, 42, 24), 'R': (138, 18, 9), 'w': (255, 255, 255),   # pallina rossa
    'b': (200, 58, 36), 'B': (110, 26, 14),                         # mattoni
    'd': (43, 46, 53),      # croce direzionale
    'm': (176, 48, 106),    # tasti A e B
    's': (142, 143, 153),   # START e SELECT
    'n': (44, 58, 122),     # scritta
}
SCREEN = ['llllllllll', 'llllllllll', 'lllrrlllll', 'llrwrrllll', 'llrrrRllll', 'lllRRlllll',
          'llllllllll', 'bbbBbbbbBb', 'bBbbbbBbbb']
BODY = (['.gggggggggggggg.', 'gggggggggggggggg', 'ggkkkkkkkkkkkkgg']
        + ['ggk' + s + 'kgg' for s in SCREEN]
        + ['ggkkkkkkkkkkkggg', 'gggggggggggggggg', 'gnnnnggggggggggg', 'gggggggggggggggg',
           'ggggggggggggmmgg', 'ggggdgggggggmmgg', 'gggdddgggmmggggg', 'ggggdggggmmggggg',
           'gggggggggggggggg', 'gggggssgssgggggg', 'gggggggggggggggg', 'gggggggggggggGgG',
           'ggggggggggggGgGg', 'gggggggggggGgGgg', 'ggggggggggggggg.', '.gggggggggggggg..'[:16]])


def grid():
    rows = [['.'] * 32 for _ in range(32)]
    for j, r in enumerate(BODY):
        for i, ch in enumerate(r):
            rows[2 + j][8 + i] = ch
    # bordo destro e inferiore della scocca più scuro, per staccarla dallo sfondo
    for y in range(32):
        for x in range(32):
            if rows[y][x] == 'g' and (x == 31 or rows[y][x + 1] == '.' or y == 31 or rows[y + 1][x] == '.'):
                rows[y][x] = 'G'
    return rows


def render(cell, size, bg=BG):
    rows = grid()
    art = Image.new('RGB', (32, 32), bg)
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch != '.':
                art.putpixel((x, y), PAL[ch])
    big = art.resize((32 * cell, 32 * cell), Image.NEAREST)
    out = Image.new('RGB', (size, size), bg)
    off = (size - 32 * cell) // 2
    out.paste(big, (off, off))
    return out


if __name__ == '__main__':
    d = ROOT / 'icons'
    d.mkdir(exist_ok=True)
    render(6, 192).save(d / 'icon-192.png')
    render(16, 512).save(d / 'icon-512.png')
    render(12, 512).save(d / 'icon-maskable-512.png')   # più piccola: resta nella zona sicura
    render(5, 180).save(d / 'apple-touch-icon.png')
    print('icone salvate in', d)
