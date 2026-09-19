import type { ReactNode } from 'react'
import { useI18n } from '../i18n'
import { KineticHeading } from './KineticHeading'
import { navigateLocal } from '../lib/motion'
import './HomePublicationContent.css'

function LocalLink({to,children,className=''}:{to:string;children:ReactNode;className?:string}){
  const {pathFor}=useI18n()
  return <a href={pathFor(to)} className={className} onClick={event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigateLocal(to)}}>{children}</a>
}

const copy = {
  en: {
    valueEyebrow:'WHY COPYPUMP',
    valueTitle:'Automation that searches.',
    valueAccent:'Rules that stay yours.',
    valueIntro:'CopyPump is designed to separate discovery from execution. The system can find activity worth examining; your policy still decides what is allowed.',
    values:[
      ['Automatic discovery','The system analyses public trading history and surfaces wallets and activity as candidates for further checks.'],
      ['Qualification before capital','Freshness, liquidity and execution conditions are considered before a candidate can reach the capital layer.'],
      ['User-defined boundaries','Capital, exposure, authority and emergency controls define the envelope automation is allowed to operate inside.'],
    ],
    controlEyebrow:'YOUR CONTROL',
    controlTitle:'Autonomy has a boundary.',
    controlAccent:'You define it.',
    controlIntro:'A useful agent should be able to say “no”. CopyPump is built around independent checks that can stop a candidate before execution.',
    controls:[
      ['Capital','How much a single action is allowed to use.'],
      ['Execution risk','Price impact, liquidity and other conditions can stop an action.'],
      ['Exposure','Automation stays inside the position and portfolio boundaries you define.'],
      ['Emergency stop','A separate stop control can halt automation without waiting for other checks.'],
    ],
    differenceEyebrow:'WHY THE PIPELINE MATTERS',
    differenceTitle:'A wallet move is',
    differenceAccent:'not enough context.',
    differenceIntro:'CopyPump is not designed as “wallet moved → repeat immediately”. The intended path adds qualification, policy and reconciliation between an observation and a result.',
    flow:['Discover','Qualify','Constrain','Execute','Reconcile'],
    flowNote:'Every stage can stop the path. A successful submission is still not treated as a confirmed outcome until state is reconciled.',
    mapEyebrow:'THE PRODUCT MAP',
    mapTitle:'What exists publicly.',
    mapAccent:'What is still being proven.',
    mapIntro:'The public surface separates product architecture from verification status so that ambition is not confused with readiness.',
    map:[
      ['Product experience','Available','Public explanation of automatic discovery, qualification, limits and reconciliation.'],
      ['Non-custodial model','Documented','User-controlled signing and bounded authority are the intended custody and automation model.'],
      ['Risk & policy model','Documented','Capital, slippage/liquidity, exposure and emergency-stop controls are described publicly.'],
      ['Radar','Available','A source-backed editorial surface for examining public Solana activity without turning it into a trading signal.'],
      ['Devnet lifecycle','In verification','The current proof target is a complete reviewed execution lifecycle on Solana Devnet.'],
      ['Mainnet trading','Locked','Public Mainnet access remains intentionally blocked until the required verification gates pass.'],
    ],
    productLink:'Explore the control model',
    progressLink:'See the evidence & progress',
  },
  ru: {
    valueEyebrow:'ЗАЧЕМ COPYPUMP',
    valueTitle:'Автоматизация ищет.',
    valueAccent:'Правила остаются вашими.',
    valueIntro:'CopyPump разделяет обнаружение возможностей и исполнение. Система может находить активность, достойную проверки, но именно ваши правила определяют, что допустимо.',
    values:[
      ['Автоматическое обнаружение','Система анализирует публичную торговую историю и выделяет кошельки и активность как кандидатов для дальнейшей проверки.'],
      ['Проверка до капитала','Свежесть, ликвидность и условия исполнения оцениваются до того, как кандидат сможет дойти до использования капитала.'],
      ['Границы задаёт пользователь','Капитал, экспозиция, полномочия и экстренная остановка формируют рамки, внутри которых может работать автоматизация.'],
    ],
    controlEyebrow:'ВАШ КОНТРОЛЬ',
    controlTitle:'У автономности есть границы.',
    controlAccent:'Их задаёте вы.',
    controlIntro:'Полезный агент должен уметь сказать «нет». CopyPump строится вокруг независимых проверок, каждая из которых может остановить кандидата до исполнения.',
    controls:[
      ['Капитал','Сколько средств разрешено использовать одному действию.'],
      ['Риск исполнения','Цена, ликвидность и другие условия могут остановить действие.'],
      ['Экспозиция','Автоматизация остаётся внутри заданных вами границ позиции и портфеля.'],
      ['Экстренная остановка','Отдельный stop-контроль может остановить автоматизацию независимо от остальных проверок.'],
    ],
    differenceEyebrow:'ЗАЧЕМ НУЖЕН PIPELINE',
    differenceTitle:'Движения кошелька',
    differenceAccent:'недостаточно.',
    differenceIntro:'CopyPump не строится по принципу «кошелёк сделал действие → сразу повторить». Между наблюдением и результатом находятся отбор, правила риска, исполнение и сверка.',
    flow:['Обнаружение','Отбор','Ограничения','Исполнение','Сверка'],
    flowNote:'Каждый этап может остановить путь. Даже отправленная транзакция не считается подтверждённым результатом, пока состояние не сверено.',
    mapEyebrow:'КАРТА ПРОДУКТА',
    mapTitle:'Что уже доступно публично.',
    mapAccent:'Что ещё доказывается.',
    mapIntro:'Публичная часть проекта отделяет архитектуру продукта от статуса проверки, чтобы амбиции не выглядели как заявление о готовности.',
    map:[
      ['Продуктовый сценарий','Доступен','Публичное объяснение автоматического обнаружения, отбора, лимитов и сверки результата.'],
      ['Non-custodial модель','Описана','Подпись под контролем пользователя и ограниченные полномочия — основа задуманной модели хранения и автоматизации.'],
      ['Риск и правила','Описаны','Публично раскрыты капитал, проскальзывание/ликвидность, экспозиция и экстренная остановка.'],
      ['Radar','Доступен','Разбор публичной активности Solana с источниками — без превращения наблюдений в торговые сигналы.'],
      ['Devnet lifecycle','Проверяется','Текущая цель — полный проверенный цикл исполнения на Solana Devnet.'],
      ['Mainnet торговля','Закрыта','Публичный Mainnet намеренно заблокирован до прохождения необходимых проверок.'],
    ],
    productLink:'Открыть модель контроля',
    progressLink:'Посмотреть подтверждения и прогресс',
  },
} as const

export function HomeValueStrip(){
  const {locale}=useI18n(),c=copy[locale]
  return <section className="home-value wrap section-space" data-scene="experience" aria-labelledby="home-value-title">
    <div className="home-value-heading">
      <p className="eyebrow" data-reveal="label">{c.valueEyebrow}</p>
      <KineticHeading id="home-value-title" lines={[{text:c.valueTitle},{text:c.valueAccent,accent:true}]}/>
      <p data-reveal>{c.valueIntro}</p>
    </div>
    <div className="home-value-grid">
      {c.values.map((item,i)=><article key={item[0]} data-reveal="record" data-delay={i*70}>
        <span>0{i+1}</span><h3>{item[0]}</h3><p>{item[1]}</p>
      </article>)}
    </div>
  </section>
}

export function HomeControlStory(){
  const {locale}=useI18n(),c=copy[locale]
  return <section className="home-control wrap section-space" data-scene="experience" aria-labelledby="home-control-title">
    <div className="home-control-heading">
      <p className="eyebrow" data-reveal="label">{c.controlEyebrow}</p>
      <KineticHeading id="home-control-title" lines={[{text:c.controlTitle},{text:c.controlAccent,accent:true}]}/>
      <p data-reveal>{c.controlIntro}</p>
      <LocalLink to="/project" className="text-link">{c.productLink} →</LocalLink>
    </div>
    <div className="home-control-list">
      {c.controls.map((item,i)=><article key={item[0]} data-reveal="record" data-delay={i*60}>
        <span>0{i+1}</span><div><h3>{item[0]}</h3><p>{item[1]}</p></div>
      </article>)}
    </div>
  </section>
}

export function HomePipelineStory(){
  const {locale}=useI18n(),c=copy[locale]
  return <section className="home-pipeline wrap section-space" data-scene="experience" aria-labelledby="home-pipeline-title">
    <div>
      <p className="eyebrow" data-reveal="label">{c.differenceEyebrow}</p>
      <KineticHeading id="home-pipeline-title" lines={[{text:c.differenceTitle},{text:c.differenceAccent,accent:true}]}/>
      <p className="home-pipeline-intro" data-reveal>{c.differenceIntro}</p>
    </div>
    <ol className="home-pipeline-flow" aria-label={c.differenceEyebrow}>
      {c.flow.map((item,i)=><li key={item} data-reveal="record" data-delay={i*55}><span>0{i+1}</span><strong>{item}</strong>{i<c.flow.length-1&&<i aria-hidden="true">→</i>}</li>)}
    </ol>
    <p className="home-pipeline-note" data-reveal>{c.flowNote}</p>
  </section>
}

export function HomeProductMap(){
  const {locale}=useI18n(),c=copy[locale]
  return <section className="home-map wrap section-space" data-scene="status" aria-labelledby="home-map-title">
    <div className="home-map-heading">
      <p className="eyebrow" data-reveal="label">{c.mapEyebrow}</p>
      <KineticHeading id="home-map-title" lines={[{text:c.mapTitle},{text:c.mapAccent,accent:true}]}/>
      <p data-reveal>{c.mapIntro}</p>
    </div>
    <div className="home-map-list">
      {c.map.map((item,i)=><article key={item[0]} data-reveal="record" data-delay={(i%3)*55}>
        <span className="home-map-index">0{i+1}</span>
        <div><h3>{item[0]}</h3><p>{item[2]}</p></div>
        <strong className={item[1].toLowerCase().includes('lock')||item[1].toLowerCase().includes('закры')?'locked':item[1].toLowerCase().includes('verif')||item[1].toLowerCase().includes('провер')?'active':'good'}>{item[1]}</strong>
      </article>)}
    </div>
    <LocalLink to="/progress" className="text-link">{c.progressLink} →</LocalLink>
  </section>
}
