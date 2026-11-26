# Generează variante mai mici (800 și 1400 px pe latura lungă) pentru fiecare imagine din public/images,
# ca broșurile să încarce doar cât le trebuie. Rulează: python3 scripts-variante.py
import glob, os, re
from PIL import Image
for f in glob.glob('public/images/*/*.webp'):
    if re.search(r'-(800|1400)\.webp$', f): continue
    im = Image.open(f)
    for w in (800, 1400):
        out = f[:-5] + f'-{w}.webp'
        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f): continue
        if max(im.size) <= w: im.save(out, quality=78, method=6); continue
        r = w / max(im.size)
        im.resize((round(im.size[0] * r), round(im.size[1] * r)), Image.LANCZOS).save(out, quality=78, method=6)
