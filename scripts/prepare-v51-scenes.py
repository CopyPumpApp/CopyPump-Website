"""Build route-specific background compositions from approved existing artwork.
No new image model, network calls, text, fake data, or upscaling. Originals stay intact.
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageDraw
import json, hashlib, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/media/v51'; OUT.mkdir(parents=True,exist_ok=True)
source=ROOT/'public/backgrounds/copypump-global-market-background.png'
master=Image.open(source).convert('RGB')
master=ImageEnhance.Contrast(master).enhance(1.045)
master=ImageEnhance.Color(master).enhance(1.035)
W,H=master.size
records=[]

def glow(image, center, color, strength=.16, radius=.38):
    # A pre-rendered light field. No browser blur/paint loop.
    field=Image.new('RGBA',(W,H),(0,0,0,0)); pix=field.load()
    cx,cy=center
    for y in range(H):
        for x in range(W):
            d=((x/W-cx)**2+((y/H-cy)*.8)**2)/(radius*radius)
            a=int(255*strength*math.exp(-d*3.5))
            if a:pix[x,y]=(*color,a)
    return Image.alpha_composite(image,field)

for theme in ['home','product','radar','progress','community','security','contact']:
    canvas=master.copy().convert('RGBA')
    if theme!='home':
        wash=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(wash)
        for x in range(W):
            a=int(145*max(0,(x/W-.42)/.58))
            dr.line((x,0,x,H),fill=(3,8,18,a))
        canvas=Image.alpha_composite(canvas,wash)
        color={'product':(37,155,218),'radar':(17,194,226),'progress':(87,108,231),'community':(63,197,178),'security':(78,113,228),'contact':(187,151,98)}[theme]
        canvas=glow(canvas,(.8,.49),color,.2)
    motif={'product':'qualify','radar':'detect','security':'constrain'}.get(theme)
    if motif:
        art_source=ROOT/f'public/media/v48/{motif}-800.webp'
        obj=Image.open(art_source).convert('RGBA'); obj.thumbnail((600,640),Image.Resampling.LANCZOS)
        obj.putalpha(obj.getchannel('A').point(lambda a:int(a*.46)))
        canvas.alpha_composite(obj,(int(W*.65),int(H*.18)))
    if theme in ['progress','community','contact']:
        lines=Image.new('RGBA',(W,H));d=ImageDraw.Draw(lines)
        if theme=='progress':
            # Architectural ascending light planes; no progress percentages/checkmarks.
            for i in range(5):
                x=1000+i*113;y=680-i*57
                d.polygon([(x,y),(x+85,y-36),(x+85,y-50),(x,y-14)],fill=(108,180,244,37+i*8))
                d.line([(x,y-14),(x+85,y-50)],fill=(168,215,255,105),width=2)
        elif theme=='community':
            pts=[(1130,260),(1330,370),(1110,570),(1470,610),(1500,240)]
            for a,b in [(0,1),(1,2),(1,3),(1,4),(0,2),(3,4)]:
                d.line([pts[a],pts[b]],fill=(131,224,216,67),width=2)
            for x,y in pts:
                d.ellipse((x-12,y-12,x+12,y+12),outline=(174,240,223,100),width=2)
                d.ellipse((x-3,y-3,x+3,y+3),fill=(195,250,234,170))
        else:
            for r,a in [(110,100),(155,65),(205,32)]:
                d.arc((1330-r,450-r,1330+r,450+r),-70,225,fill=(220,210,179,a),width=2)
            d.line((1010,510,1470,330),fill=(192,206,224,55),width=2)
        canvas=Image.alpha_composite(canvas,lines)
    filename=f'scene-{theme}.webp';dest=OUT/filename
    canvas.convert('RGB').save(dest,'WEBP',quality=93,method=6)
    records.append({'theme':theme,'file':filename,'width':W,'height':H,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'motif':motif})
(OUT/'manifest.json').write_text(json.dumps({'source':str(source.relative_to(ROOT/'public')),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'method':'Native-resolution compositions of the approved room and original canonical cutouts, plus decorative geometry. No generated claims, charts or text. Baked light only.','scenes':records},indent=2)+'\n')
print(json.dumps(records,indent=2))
