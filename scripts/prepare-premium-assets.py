"""Derive responsive v48 assets from the owner's existing artwork; never substitute art."""
from pathlib import Path
from PIL import Image
import hashlib, json

root = Path(__file__).resolve().parents[1]
out = root / 'public/media/v48'
out.mkdir(parents=True, exist_ok=True)
records = []

def export(source, name, widths):
    path = root / 'public' / source
    with Image.open(path) as original:
        original.load()
        for width in widths:
            image = original.copy()
            height = round(image.height * min(width, image.width) / image.width)
            image = image.resize((min(width, image.width), height), Image.Resampling.LANCZOS)
            dest = out / f'{name}-{width}.webp'
            image.save(dest, 'WEBP', quality=88, method=6, exact=True)
            records.append({'source': source, 'sourceSha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'output': str(dest.relative_to(root / 'public')), 'width': image.width, 'height': image.height, 'bytes': dest.stat().st_size})

export('backgrounds/copypump-global-market-background.png', 'earth-trading', [900, 1600])
for name in ['detect', 'qualify', 'constrain', 'execute-prove']:
    export(f'workflow-objects/{name}-cutout-final-v47.webp', name, [480, 800])
(out / 'manifest.json').write_text(json.dumps({'artwork': 'Existing owner-uploaded Earth / trading-room artwork and canonical V47 cutouts. Same sources; responsive resampling only.', 'files': records}, indent=2) + '\n')
print(json.dumps(records, indent=2))
