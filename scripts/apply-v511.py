"""One-time, preview-only integration on the accepted v51 baseline. No network calls."""
import json,subprocess
from pathlib import Path
BASE='13203ab5ed4eb02b5008a28df783bc1b1a22340e'
paths=['src/premium/content.ts','src/premium/Site.tsx','src/premium/premium.css','src/i18n/en.json','src/i18n/ru.json','public/release-marker.txt']
# Prevent the stale local patch pack from reverting accepted v51 fixes.
for name in paths:
    expected=subprocess.check_output(['git','show',f'{BASE}:{name}'])
    assert Path(name).read_bytes()==expected, f'Unexpected base for {name}'

def update(name,pairs):
    file=Path(name);text=file.read_text()
    for before,after in pairs:
        assert text.count(before)==1, f'{name}: expected unique target {before[:80]!r}, got {text.count(before)}'
        text=text.replace(before,after,1)
    file.write_text(text)

update('src/premium/content.ts',[
('A new way to follow conviction, not every trade. CopyPump is building autonomous trading around the wallets you choose and the boundaries you set.','CopyPump discovers successful wallets automatically. You set the strategy and limits—the system works within them.'),
('Следуйте за осмысленными решениями, а не за каждой сделкой. Мы создаём автономную торговлю вокруг выбранных вами кошельков и заданных вами границ.','CopyPump сам обнаруживает успешные кошельки. Вы задаёте стратегию и лимиты — система работает в этих рамках.'),
('Watch conviction take shape.','Find successful wallets.'),
('Замечать осмысленные действия.','Находить успешные кошельки.'),
('Bring selected public wallets into one focused watchlist. Their activity creates candidates to examine—not instructions to copy blindly.','CopyPump analyses public trading history and selects wallets automatically. Their activity creates candidates for checks against your rules. You do not choose whom to copy manually.'),
('Соберите выбранные публичные кошельки в один список наблюдения. Их активность становится поводом для проверки, а не приказом слепо повторить сделку.','CopyPump анализирует публичную историю торговли и сам отбирает кошельки. Их активность проходит проверку по вашим правилам. Вручную выбирать, кого копировать, не нужно.'),
("key:'SELECTED WALLET ACTIVITY'","key:'AUTOMATIC WALLET DISCOVERY'"),
("['Watchlist','Selected by you']","['Wallet discovery','Selected by the system']"),
("key:'АКТИВНОСТЬ ВЫБРАННЫХ КОШЕЛЬКОВ'","key:'АВТОМАТИЧЕСКИЙ ПОИСК КОШЕЛЬКОВ'"),
("['Список наблюдения','Выбираете вы']","['Поиск кошельков','Отбирает система']"),
])

update('src/premium/Site.tsx',[
("import {usePageEntrance} from './usePageEntrance'","import {usePageEntrance} from './usePageEntrance'\nimport {useArtworkSwipe} from './useArtworkSwipe'"),
("export function PremiumHeader({simple=false}:{simple?:boolean})", "export function PremiumHeader({simple=false,hideChannels=false}:{simple?:boolean;hideChannels?:boolean})"),
('<div className="mobile-nav__external"><External href={CHANNELS.github}>GitHub</External><External href={CHANNELS.discord}>Discord</External><External href={CHANNELS.x}>X</External></div>', '{!hideChannels&&<div className="mobile-nav__external"><External href={CHANNELS.github}>GitHub</External><External href={CHANNELS.discord}>Discord</External><External href={CHANNELS.x}>X</External></div>}'),
('  usePageEntrance(routeKey,outlet)\n', "  usePageEntrance(routeKey,outlet)\n  const contactRoute=routeKey.endsWith(':/contact')\n"),
('<div className="site-frame"><PremiumHeader/><div ref={outlet} className="page-outlet">{children}</div><PremiumFooter/></div>', '<div className="site-frame"><PremiumHeader hideChannels={contactRoute}/><div ref={outlet} className="page-outlet">{children}</div><PremiumFooter hideChannels={contactRoute}/></div>'),
('export function PremiumFooter(){', 'export function PremiumFooter({hideChannels=false}:{hideChannels?:boolean}){'),
('<nav aria-label="CopyPump"><External href={CHANNELS.x}>X <Arrow diagonal/></External><External href={CHANNELS.discord}>Discord <Arrow diagonal/></External><External href={CHANNELS.github}>GitHub <Arrow diagonal/></External><External href={CHANNELS.email}>Email <Arrow diagonal/></External></nav>', '{!hideChannels&&<nav aria-label="CopyPump"><External href={CHANNELS.x}>X <Arrow diagonal/></External><External href={CHANNELS.discord}>Discord <Arrow diagonal/></External><External href={CHANNELS.github}>GitHub <Arrow diagonal/></External><External href={CHANNELS.email}>Email <Arrow diagonal/></External></nav>}'),
('data-release="51.0-motion"', 'data-release="51.1-polish"'),
('  const chapter=c.chapters[active],allowed=limit>=.5', '''  const pending=useRef(requested);pending.current=requested
  const stepChapter=(direction:1|-1)=>{
    const next=Math.max(0,Math.min(ART.objects.length-1,pending.current+direction))
    if(next===pending.current)return
    pending.current=next;void selectChapter(next)
  }
  const swipe=useArtworkSwipe(stepChapter)
  const chapter=c.chapters[active],allowed=limit>=.5'''),
('      <div className="experience-art" data-reveal="depth"><div className="art-orbit" aria-hidden="true"/><ChapterArtwork name={ART.objects[active]} running={m.running&&inView}/></div>', '''      <div className="experience-art" data-reveal="depth" {...swipe} role="group" aria-label={locale==='ru'?'Переключение сцен продукта':'Product scene controls'} aria-describedby="artwork-swipe-hint" tabIndex={0} onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();stepChapter(event.key==='ArrowRight'?1:-1)}}}>
        <div className="art-orbit" aria-hidden="true"/><ChapterArtwork name={ART.objects[active]} running={m.running&&inView}/>
        <div className="artwork-step-controls"><button type="button" className="artwork-previous" disabled={requested===0} aria-label={locale==='ru'?'Предыдущий объект':'Previous object'} onClick={()=>stepChapter(-1)}>‹</button><span id="artwork-swipe-hint">{locale==='ru'?'Листайте объекты свайпом':'Swipe to explore'}</span><button type="button" className="artwork-next" disabled={requested===ART.objects.length-1} aria-label={locale==='ru'?'Следующий объект':'Next object'} onClick={()=>stepChapter(1)}>›</button></div>
      </div>'''),
])
# Remove the obsolete repeated plain-text contact list at its source. Keep security advice.
for locale,heading in [('en','Official channels'),('ru','Официальные каналы')]:
    file=Path(f'src/i18n/{locale}.json');data=json.loads(file.read_text());sections=data['legal']['contact']['sections']
    assert sum(x['heading']==heading for x in sections)==1
    data['legal']['contact']['sections']=[x for x in sections if x['heading']!=heading]
    file.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
update('src/premium/premium.css',[
('.section-space{padding-block:110px}', '.section-space{padding-block:80px}'),
('.section-space{padding-block:68px}', '.section-space{padding-block:40px}'),
('.community{padding-top:90px;padding-bottom:112px}', '.community{padding-top:70px;padding-bottom:80px}'),
('.community{padding-top:55px;padding-bottom:65px}', '.community{padding-top:40px;padding-bottom:40px}'),
('grid-template-columns:.9fr 1.1fr;min-height:660px;', 'grid-template-columns:.9fr 1.1fr;min-height:580px;'),
])
file=Path('src/premium/premium.css')
file.write_text(file.read_text()+'''
/* v51.1: bounded gesture surface. Native vertical scroll and pinch zoom stay available. */
.experience-art{touch-action:pan-y pinch-zoom;user-select:none;-webkit-user-select:none;cursor:grab;padding-bottom:48px}
.experience-art[data-dragging=true]{cursor:grabbing}
.experience-art img{-webkit-user-drag:none;user-select:none}
.artwork-step-controls{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:min(100%,320px);display:flex;align-items:center;justify-content:space-between;gap:12px}
.artwork-step-controls button{width:44px;height:44px;flex:none;padding:0;font-size:27px;color:var(--mint);background:transparent;border:0;box-shadow:none}
.artwork-step-controls button:disabled{opacity:.25}
.artwork-step-controls span{font-size:11px;color:var(--quiet);white-space:nowrap}
@media(max-width:760px){.experience-art{height:340px;min-height:340px;padding-bottom:44px}.experience-story{padding-top:18px}}
''')
Path('public/release-marker.txt').write_text('CopyPump v51.1 / automatic discovery, unique contacts, artwork swipe, compact spacing\n')
assert 'usePageEntrance(routeKey,outlet)' in Path('src/premium/Site.tsx').read_text()
assert 'key={asset}' in Path('src/premium/ChapterArtwork.tsx').read_text()
print('v51.1 integrated on the accepted v51 baseline; original artwork and motion runtimes preserved.')
