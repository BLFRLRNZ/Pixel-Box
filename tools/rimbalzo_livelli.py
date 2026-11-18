#!/usr/bin/env python3
"""Livelli 5-15 di Rimbalzo, disegnati come mappe ASCII.

    python3 tools/rimbalzo_livelli.py          # controlla le mappe
    python3 tools/rimbalzo_livelli.py -p       # le stampa con il righello delle colonne
    python3 tools/rimbalzo_livelli.py --scrivi # le copia dentro src/g_rimbalzo.js
    node tools/rbbot.js 5 6 7                  # un bot verifica che i livelli si possano finire

I livelli 1-4 sono scritti direttamente in src/g_rimbalzo.js.
"""
# Legenda: # mattone, B gomma, ^ spine, v spine dal soffitto, ~ acqua, x spine sott'acqua,
# S partenza, O anello (cella alta, occupa anche quella sotto), E uscita (2 celle), C salvataggio,
# L vita, I gonfia, D sgonfia, h nemico orizzontale (limiti | o muro), k nemico verticale (limiti : o muro), . vuoto
import json, sys
from pathlib import Path

class G:
    def __init__(s, name, W, H, es=2.4):
        s.name, s.W, s.H, s.es = name, W, H, es
        s.g = [['.'] * W for _ in range(H)]
        s.r(0, 0, W - 1, 0).r(0, H - 1, W - 1, H - 1).r(0, 0, 0, H - 1).r(W - 1, 0, W - 1, H - 1)
    def r(s, x0, y0, x1, y1, c='#'):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                s.g[y][x] = c
        return s
    def p(s, x, y, c):
        s.g[y][x] = c
        return s
    def h(s, x, y, a=None, b=None):
        if a is not None: s.p(a, y, '|')
        if b is not None: s.p(b, y, '|')
        return s.p(x, y, 'h')
    def k(s, x, y, a=None, b=None):
        if a is not None: s.p(x, a, ':')
        if b is not None: s.p(x, b, ':')
        return s.p(x, y, 'k')
    def rows(s):
        return [''.join(r) for r in s.g]

L = []

# ---------------- 5 · MOLLE BLU ----------------
g = G('Molle blu', 80, 14)
g.r(1, 12, 78, 12)
g.p(2, 11, 'S').p(6, 10, 'O')
g.r(10, 12, 11, 12, 'B')
g.r(13, 8, 17, 11).p(15, 5, 'O').p(19, 12, 'B')
g.r(21, 11, 23, 11, '^').r(24, 11, 25, 11, 'B').r(26, 11, 28, 11, '^').p(24, 5, 'O')
g.p(31, 11, 'C')
g.h(37, 11, 34, 41)
g.p(43, 12, 'B').r(45, 8, 47, 8).p(46, 7, 'L')
g.p(49, 10, 'O')
g.r(52, 11, 54, 11, '^')
g.r(57, 12, 58, 12, 'B')
g.r(60, 8, 78, 11)
g.p(62, 7, 'C').p(64, 6, 'O')
g.h(68, 7, 66, 71)
g.p(75, 6, 'E')
L.append(g)

# ---------------- 6 · IL POZZO (discesa: anelli in gallerie, impossibili da saltare) ----------------
g = G('Il pozzo', 20, 38)
for y, hole in [(6, 'R'), (12, 'L'), (18, 'R'), (24, 'L'), (30, 'R')]:
    g.r(1, y, 18, y)
    if hole == 'R': g.r(16, y, 18, y, '.')
    else: g.r(1, y, 3, y, '.')
g.r(1, 36, 18, 36)
g.p(2, 5, 'S').r(5, 1, 8, 3).p(6, 4, 'O').r(11, 5, 12, 5, '^')                     # stanza 0
g.h(11, 11, 8, 14).r(4, 7, 7, 9).p(5, 10, 'O')                                      # stanza 1
g.p(3, 17, 'C').r(6, 13, 10, 14).r(6, 15, 10, 15, 'v').p(8, 16, 'O').r(13, 17, 14, 17, '^')   # stanza 2
g.k(12, 21, 19, 23).r(6, 19, 9, 21).p(7, 22, 'O').p(2, 23, 'L')                    # stanza 3
g.p(4, 29, 'C').r(7, 29, 8, 29, '^').r(10, 25, 13, 27).p(11, 28, 'O').p(15, 29, '^')   # stanza 4
g.r(12, 35, 13, 35, '^').h(8, 35, 5, 10).p(6, 32, 'O').p(2, 34, 'E')                # stanza 5
L.append(g)

# ---------------- 7 · SOTTO IL MARE ----------------
g = G('Sotto il mare', 88, 18)
g.r(1, 12, 86, 16)
g.p(2, 11, 'S').p(5, 10, 'O').p(8, 11, 'I')
g.r(11, 12, 24, 15, '~').r(11, 16, 24, 16, 'x').p(17, 11, 'O')
g.p(25, 11, 'I').p(27, 11, 'C').p(29, 11, 'D')
g.r(31, 1, 36, 10)                                          # galleria bassa
g.r(37, 12, 44, 15, '~').r(44, 14, 44, 15).r(37, 14, 37, 15).p(40, 14, 'O')   # pozza con gradini ai due lati
g.p(45, 11, 'D').p(47, 11, 'I')
g.r(51, 4, 51, 9).r(51, 10, 54, 11, '~').r(52, 3, 54, 9, '~').r(55, 4, 55, 11)   # ascensore d'acqua
g.p(53, 2, 'O')
g.r(56, 4, 65, 5).p(60, 3, 'L').p(62, 2, 'O')
g.r(69, 12, 80, 15, '~').r(69, 16, 80, 16, 'x').p(75, 11, 'O')
g.p(82, 11, 'C').p(85, 10, 'E')
L.append(g)

# ---------------- 8 · SPINE SUL SOFFITTO ----------------
g = G('Spine sul soffitto', 90, 14)
g.r(1, 12, 88, 12)
g.p(2, 11, 'S').p(4, 10, 'O').p(7, 11, '^')
g.r(11, 1, 18, 8).r(11, 9, 18, 9, 'v').p(14, 10, 'O')
g.r(22, 11, 24, 11, '^')
g.p(26, 11, 'C')
g.r(29, 1, 46, 5).r(29, 6, 46, 6, 'v')
g.k(32, 9, 7, 11).k(37, 8, 7, 11).k(42, 10, 7, 11).p(39, 8, 'O')
g.r(49, 12, 50, 12, 'B').r(52, 11, 54, 11, '^').p(53, 5, 'O')
g.r(62, 1, 72, 8).r(62, 9, 72, 9, 'v').p(67, 10, 'O')
g.p(74, 11, 'L').p(75, 11, 'C')
g.r(78, 10, 88, 11).r(80, 9, 81, 9, '^').p(84, 6, 'O').p(86, 8, 'E')
L.append(g)

# ---------------- 9 · LA SCALATA (salita) ----------------
g = G('La scalata', 22, 44)
g.r(1, 42, 20, 42)
g.p(2, 41, 'S')
g.r(6, 40, 9, 40)
g.r(12, 38, 15, 38).p(13, 36, 'O')
g.r(17, 36, 20, 36).p(18, 36, 'B')
g.r(10, 32, 14, 32).r(10, 33, 14, 33, 'v').p(11, 30, 'O')
g.r(3, 30, 7, 30).p(4, 30, 'B')
g.r(8, 26, 13, 26).r(8, 27, 13, 27, 'v').p(11, 25, 'L')
g.r(16, 24, 20, 24).p(19, 24, 'B').p(18, 22, 'O')
g.r(10, 20, 16, 20).r(10, 21, 16, 21, 'v').p(11, 19, 'C')
g.r(2, 18, 6, 18).p(5, 18, 'B').p(3, 16, 'O')
g.r(8, 14, 12, 14).r(8, 15, 12, 15, 'v')
g.r(14, 12, 20, 12).p(18, 12, 'B')
g.r(9, 8, 15, 8).r(9, 9, 15, 9, 'v').p(11, 6, 'O')
g.r(1, 6, 6, 6).p(2, 4, 'E')
L.append(g)

# ---------------- 10 · LE GROTTE ----------------
g = G('Le grotte', 74, 24)
g.r(1, 20, 72, 22)
g.r(1, 11, 72, 12)
g.p(2, 10, 'S').p(6, 9, 'O').r(9, 10, 10, 10, '^')
g.r(14, 11, 16, 12, '.')
g.p(5, 18, 'O')
g.p(18, 19, 'C')
g.r(20, 20, 24, 22, '~').r(25, 21, 25, 22).p(25, 20, '~').p(22, 21, 'O')
g.k(27, 16, 13, 19)
g.r(29, 18, 31, 19).r(33, 16, 35, 19)
g.r(37, 15, 39, 19).p(38, 15, 'B')
g.r(37, 11, 39, 12, '.')
g.r(42, 1, 52, 7).r(42, 8, 52, 8, 'v').r(46, 1, 48, 8, '.')
g.p(47, 10, 'B').p(47, 4, 'O')
g.r(58, 11, 60, 12, '.')
g.p(66, 10, 'L')
g.p(54, 20, 'B').r(56, 16, 57, 16).p(56, 14, 'O')
g.r(62, 19, 64, 19, '^').p(66, 19, 'C').p(70, 18, 'E')
L.append(g)

# ---------------- 11 · GUARDIANI ----------------
g = G('Guardiani', 92, 14)
g.r(1, 12, 90, 12)
g.p(2, 11, 'S').p(5, 10, 'O')
g.h(10, 11, 7, 14)
g.r(16, 11, 17, 11, '^')
g.k(20, 9, 5, 11).k(23, 6, 5, 11)
g.p(26, 8, 'O').p(28, 11, 'C')
g.r(31, 10, 40, 11).h(35, 9, 32, 39)
g.r(43, 11, 45, 11, '^')
g.r(48, 12, 49, 12, 'B').h(51, 6, 45, 53).p(49, 5, 'O')
g.p(55, 11, 'L').p(58, 11, 'C')
g.k(62, 8, 6, 11).k(65, 10, 6, 11).k(68, 7, 6, 11).k(71, 9, 6, 11).p(66, 10, 'O')
g.r(74, 11, 75, 11, '^')
g.r(78, 10, 90, 11).h(82, 9, 79, 86).p(84, 6, 'O').p(88, 8, 'E')
L.append(g)

# ---------------- 12 · LAGUNA ----------------
g = G('Laguna', 96, 20)
g.r(1, 12, 94, 18)
g.p(2, 11, 'S').p(5, 11, 'I')
g.r(8, 12, 25, 15, '~').r(8, 16, 25, 16, 'x')
g.h(16, 11, 10, 23).p(19, 11, 'O')
g.p(26, 11, 'I').p(29, 11, 'D')
g.r(32, 12, 43, 17, '~')                                  # lago profondo senza spine
g.r(32, 14, 32, 17).r(33, 16, 33, 17)                     # gradini a sinistra
g.r(44, 12, 44, 15, '~').r(44, 16, 44, 17).r(45, 12, 45, 13, '~')   # gradini a destra
g.p(38, 16, 'O').h(38, 13, 34, 43)
g.p(48, 11, 'C').p(51, 11, 'I')
g.r(55, 6, 55, 9).r(55, 10, 58, 11, '~').r(56, 5, 58, 9, '~').r(59, 6, 59, 11)   # ascensore
g.p(57, 4, 'O')
g.r(60, 6, 71, 7).h(66, 5, 62, 70).p(68, 4, 'O')
g.r(72, 10, 73, 11).p(73, 10, 'B')                        # per risalire sulla piattaforma
g.r(76, 12, 89, 15, '~').r(76, 16, 89, 16, 'x').h(82, 11, 77, 88).p(85, 11, 'O')
g.p(92, 10, 'E')
L.append(g)

# ---------------- 13 · LABIRINTO (tutto collegato: si puo' sempre tornare indietro) ----------------
g = G('Labirinto', 40, 26)
g.r(1, 5, 35, 5).r(4, 10, 38, 10).r(1, 15, 35, 15).r(4, 20, 38, 20)
g.r(35, 8, 36, 9).r(37, 6, 38, 9)          # scala B -> A
g.r(3, 13, 4, 14).r(1, 11, 2, 14)          # scala C -> B
g.r(35, 18, 36, 19).r(37, 16, 38, 19)      # scala D -> C
g.r(3, 23, 4, 24).r(1, 21, 2, 24)          # scala E -> D
g.p(2, 4, 'S').p(10, 3, 'O').r(14, 4, 15, 4, '^').r(20, 3, 21, 4).p(25, 1, 'O').p(30, 4, 'L')
g.p(33, 9, 'C').h(20, 9, 8, 30).p(14, 7, 'O')
g.p(6, 14, 'C').r(16, 14, 18, 14, '^').p(17, 11, 'O').k(26, 12, 11, 14).p(31, 13, 'O')
g.r(20, 16, 24, 17).p(22, 18, 'O').r(12, 19, 13, 19, '^').h(8, 19, 5, 10)
g.p(7, 24, 'C').p(10, 22, 'O').r(15, 24, 17, 24, '^').p(37, 23, 'E')
L.append(g)

# ---------------- 14 · MONTAGNE RUSSE ----------------
g = G('Montagne russe', 120, 20)
g.r(1, 18, 118, 18)
g.p(2, 17, 'S').p(5, 16, 'O')
g.r(9, 16, 10, 17).r(11, 14, 12, 17).r(13, 12, 16, 17).r(17, 14, 18, 17).r(19, 16, 20, 17)
g.p(14, 9, 'O')
g.r(22, 17, 23, 17, '^').r(24, 17, 25, 17, '.').r(24, 18, 25, 18, 'B').r(26, 17, 27, 17, '^').p(24, 11, 'O')
g.p(30, 17, 'C')
g.r(33, 17, 49, 17, '^')
for x in (36, 41, 46): g.p(x, 17, 'B')
g.p(41, 10, 'O')
g.p(52, 17, 'L')
g.p(55, 18, 'B').r(57, 14, 66, 17).r(60, 13, 61, 13, '^').p(63, 11, 'O').h(64, 13, 62, 66).p(68, 18, 'B')
g.r(70, 17, 72, 17, '^').p(74, 17, 'C')
g.r(77, 1, 92, 9).r(77, 10, 92, 10, 'v')
g.k(80, 14, 12, 17).k(85, 16, 12, 17).k(90, 12, 12, 17).p(87, 14, 'O')
g.r(95, 16, 96, 17).r(97, 14, 98, 17).r(99, 12, 100, 17)
g.p(100, 11, 'B').r(103, 8, 118, 17).p(106, 6, 'O')
g.h(111, 7, 108, 114)
g.p(116, 6, 'E')
L.append(g)

# ---------------- 15 · GRAN FINALE ----------------
g = G('Gran finale', 132, 22)
g.r(1, 16, 130, 20)
g.p(2, 15, 'S').p(5, 14, 'O')
g.r(8, 16, 9, 16, 'B').r(11, 12, 15, 15).p(13, 9, 'O').p(17, 16, 'B')
g.r(19, 15, 21, 15, '^').h(25, 15, 23, 29)
g.r(32, 1, 41, 12).r(32, 13, 41, 13, 'v').p(36, 14, 'O')
g.p(43, 15, 'C').p(46, 15, 'I')
g.r(49, 16, 62, 19, '~').r(49, 20, 62, 20, 'x').h(55, 14, 50, 61).p(58, 15, 'O')
g.p(63, 15, 'I')
g.r(65, 8, 65, 13).r(65, 14, 69, 15, '~').r(66, 7, 68, 13, '~').r(69, 8, 69, 13)   # ascensore, aperto in basso
g.p(67, 6, 'O')
g.r(70, 8, 81, 9).p(72, 7, 'C').r(75, 1, 77, 5).p(76, 6, 'O').p(80, 7, 'D')
g.r(82, 1, 93, 6).r(82, 8, 93, 9)                         # galleria (solo pallina piccola)
g.p(79, 14, 'O')
g.r(85, 16, 92, 19, '~').r(92, 18, 92, 19).r(85, 18, 85, 19).p(88, 18, 'O')
g.p(96, 15, 'L')
g.r(99, 16, 100, 16, 'B').r(102, 15, 104, 15, '^').k(103, 11, 7, 13).r(105, 16, 106, 16, 'B')
g.r(108, 12, 111, 15).p(110, 10, 'O').p(113, 16, 'B')
g.r(115, 15, 117, 15, '^').p(120, 15, 'C')
g.k(123, 13, 10, 15).k(126, 11, 10, 15)
g.p(129, 14, 'E')
L.append(g)

# ---------------- controlli e stampa ----------------
SOL = set('#B^v')
def check(g):
    rows = g.rows(); err = []
    W, H = g.W, g.H
    flat = ''.join(rows)
    if flat.count('S') != 1: err.append('S count %d' % flat.count('S'))
    if flat.count('E') != 1: err.append('E count %d' % flat.count('E'))
    for y, row in enumerate(rows):
        for x, c in enumerate(row):
            if c in 'OE':
                below = rows[y + 1][x] if y + 1 < H else '#'
                if below not in '.~': err.append('%s at %d,%d has %r below' % (c, x, y, below))
            if c == 'h':
                for d in (-1, 1):
                    a = x + d
                    while rows[y][a] not in '|' and rows[y][a] not in SOL: a += d
            if c == 'k':
                for d in (-1, 1):
                    a = y + d
                    while rows[a][x] not in ':' and rows[a][x] not in SOL: a += d
    for x in range(W):
        if rows[0][x] != '#' or rows[H - 1][x] != '#': err.append('border col %d' % x); break
    for y in range(H):
        if rows[y][0] != '#' or rows[y][W - 1] != '#': err.append('border row %d' % y); break
    return err

if __name__ == '__main__':
    out = []
    for i, g in enumerate(L):
        e = check(g)
        if '-p' in sys.argv or e:
            print('== %d %s %dx%d %s' % (i + 5, g.name, g.W, g.H, e))
            if '-p' in sys.argv:
                print('   ' + ''.join(str(x // 10 % 10) for x in range(g.W)))
                print('   ' + ''.join(str(x % 10) for x in range(g.W)))
                for y, r in enumerate(g.rows()): print('%2d %s' % (y, r))
        out.append({'name': g.name, 'es': g.es, 'map': g.rows()})
    print('ok', len(out), 'livelli')
    if '--scrivi' in sys.argv:
        p = Path(__file__).resolve().parent.parent / 'src' / 'g_rimbalzo.js'
        m = p.read_text(encoding='utf-8')
        js = ['const MAPS = [']
        for lv in out:
            js.append("  { name: '%s', es: %s, map: [" % (lv['name'].replace("'", "\\'"), lv['es']))
            js += ["    '%s'," % r for r in lv['map']]
            js.append('  ] },')
        js.append('];')
        a = m.index('const MAPS = ['); b = m.index('];\nfor (const m of MAPS)', a) + 2
        p.write_text(m[:a] + '\n'.join(js) + m[b:], encoding='utf-8')
        print('scritto', p)
