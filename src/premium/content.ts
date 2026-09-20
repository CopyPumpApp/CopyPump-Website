import { PROJECT_STATUS_UPDATE } from '../content/project-status.generated'

/** Each subject has one editorial home. Do not duplicate long explanations across routes. */
export const STATUS = {
  sourceDate: PROJECT_STATUS_UPDATE.sourceDate,
  source: 'https://github.com/CopyPumpApp/CopyPump/blob/main/docs/PROJECT_STATUS.md',
  stage: 'Technical alpha',
  network: 'Solana Devnet',
  mainnet: 'locked',
} as const
export const CHANNELS = {
  x: 'https://x.com/CopyPumpAI',
  discord: 'https://discord.gg/WS95eXrGB',
  github: 'https://github.com/CopyPumpApp/CopyPump',
  email: 'mailto:copypumphq@gmail.com',
} as const
export const ART = {
  background: '/media/v48/earth-trading-1600.webp',
  backgroundSmall: '/media/v48/earth-trading-900.webp',
  objects: ['detect', 'qualify', 'constrain', 'execute-prove'],
} as const

const en = {
  nav: {product:'Product', progress:'Progress', community:'Community', home:'Home', security:'Security', contact:'Contact', menu:'Open navigation', close:'Close navigation', label:'Navigation', explore:'Explore CopyPump', resources:'Stay connected', motion:'Motion', pause:'Pause ambient motion', play:'Enable ambient motion', reduced:'Reduced motion is enabled by your device', skip:'Skip to content'},
  hero: {eyebrow:'AUTOMATION, WITH INTENT · SOLANA', line1:'Smart money.', line2:'Your rules.', intro:'CopyPump discovers successful wallets automatically. You set the strategy and limits—the system works within them.', primary:'Explore the experience', secondary:'Where we are today', label:'TECHNICAL ALPHA', stamp:'Designed for your control.', bottom:'Non-custodial by design. Built to act within limits.', imageLabel:'THE COPYPUMP VISION', hint:'Discover what sits between a signal and a trade'},
  experience: {eyebrow:'THE PRODUCT EXPERIENCE', title:'A signal is not a trade.', accent:'Your rules come first.', intro:'Explore the four parts of the intended workflow. This is an interactive product illustration, not a live trading terminal.', artLabel:'CANONICAL WORKFLOW OBJECT', example:'ILLUSTRATIVE DATA · NO TRANSACTION', detail:'Explore the control model', chapters:[
    {name:'Discover', title:'Find successful wallets.', copy:'CopyPump analyses public trading history and selects wallets automatically. Their activity creates candidates for checks against your rules. You do not choose whom to copy manually.', key:'AUTOMATIC WALLET DISCOVERY', rows:[['Wallet discovery','Selected by the system'],['Activity','New candidate'],['Action','Awaiting qualification']]},
    {name:'Qualify', title:'Less noise. More context.', copy:'Consider freshness, liquidity and signal quality before a candidate reaches your capital. A wallet move alone is not enough.', key:'SIGNAL QUALITY', rows:[['Freshness','Within the policy'],['Liquidity','Review required'],['Next step','Risk assessment']]},
    {name:'Constrain', title:'A boundary, not a suggestion.', copy:'An agent can propose an action. Your capital limit can reject it. Try changing the limit in this simplified example.', key:'POLICY CHECK · INTERACTIVE', rows:[['Candidate size','0.50 SOL'],['Authority','Bounded'],['Execution','Not connected']]},
    {name:'Verify', title:'Know what actually happened.', copy:'The target is a reviewable record from decision to confirmed outcome. A submitted transaction is not automatically a successful trade.', key:'EXECUTION RECORD', rows:[['Decision','Recorded'],['Transaction','Confirmation required'],['Final state','Reconciliation required']]},
  ], limit:'Your capital limit', allowed:'Within this limit', blocked:'Blocked by your limit', allowedNote:'This single check passes. Every other required check must also pass before an action can proceed.', blockedNote:'The candidate exceeds your limit. This example does not send transactions.', test:'0.50 SOL candidate', policyLink:'Read all execution conditions'},
  status: {eyebrow:'BUILDING WITH EVIDENCE', title:'A bigger ambition.', accent:'Verifiable steps.', intro:'The product is in technical alpha. The current focus is a complete, reviewable execution lifecycle on Solana Devnet.', label:'PROJECT SNAPSHOT', now:'Verification in progress', network:'Testing ground', mainnet:'Mainnet access', locked:'Intentionally locked', source:'Source updated', link:'Open the progress report', note:'Public launch follows verified readiness—not a countdown.'},
  cta: {eyebrow:'BUILD WITH COPYPUMP', title:'Be part of what comes next.', copy:PROJECT_STATUS_UPDATE.communityEn, community:'Join the conversation', builder:'Contribute to the project', partners:'Partnerships & enquiries'},
  product: {eyebrow:'PRODUCT / CONTROL MODEL', title:'Autonomy needs', accent:'clear boundaries.', intro:'The parameters behind the experience. These describe the intended architecture; verification status is tracked separately in Progress.', tabs:['Execution policy','Wallet & authority','Questions'], policyTitle:'Define the conditions before the action.', policyIntro:'These checks answer different questions. Passing one never bypasses the others.', controls:[
    {name:'Capital', detail:'Set the maximum capital an individual action may use. An otherwise valid candidate is rejected when it exceeds this allocation.', tag:'SIZE OF AN ACTION'},
    {name:'Slippage & liquidity', detail:'Bound acceptable execution conditions. A signal does not justify accepting an unrestricted price change or insufficient liquidity.', tag:'QUALITY OF EXECUTION'},
    {name:'Exposure', detail:'Constrain the position and portfolio exposure the strategy is allowed to create. Trade size alone does not describe total risk.', tag:'TOTAL COMMITMENT'},
    {name:'Emergency stop', detail:'Stop automation independently of the other checks. Recovery must respect the current user policy rather than resume by assumption.', tag:'OPERATIONAL CONTROL'},
  ], authorityTitle:'A connection is not unlimited permission.', authorityIntro:'CopyPump is designed to keep custody with the user. Automation relies on bounded authority, not ownership of a wallet.', authority:[
    {title:'You keep the keys',copy:'The intended model uses user-controlled wallet signing. A seed phrase or private key should never be provided to CopyPump.'},
    {title:'Permissions have a scope',copy:'Delegated or session authority is intended to be limited by explicit policy and revocable by the user. An agent does not get a free pass around these conditions.'},
    {title:'Uncertainty is not success',copy:'When confirmation or reconciliation is incomplete, the system should expose the unresolved state. It should not invent a completed outcome.'},
  ], faqTitle:'The practical questions.', faq:[
    {q:'Can I use this website to trade?',a:'No. This website explains the project and includes a local policy illustration. It does not connect a wallet, place orders or accept deposits.'},
    {q:'Where can I check launch readiness?',a:'Progress is the single source on this site for current verification gates and the next public milestones. There is no promised launch date.'},
    {q:'Is the complete source code public?',a:'The public GitHub contains curated documentation. Selected source and tests are published only after security, privacy and licensing review; the full engineering repository remains private.'},
    {q:'Does following smart money guarantee returns?',a:'No. Wallet history, signals and automation do not guarantee future results. Trading can lose capital, even when policy checks function as designed.'},
  ], evidence:'Read the evidence & current status'},
  progress: {eyebrow:'PROGRESS / PUBLIC RECORD', title:'Evidence before', accent:'access.', intro:'A clear separation between what is available, what is being verified, and what is not open yet.', date:'Public source updated', summaryTitle:'Technical alpha.', summaryCopy:'CopyPump is validating its trading lifecycle on Solana Devnet. The public website is available; public Mainnet trading is not.', currentLabel:'CURRENT ENGINEERING TARGET', currentTitle:PROJECT_STATUS_UPDATE.progressTitleEn, currentCopy:PROJECT_STATUS_UPDATE.progressCopyEn, gates:[
    {name:'Public product surface',state:'Available',tone:'good',copy:'Product overview, custody model, contribution policies and official channels.'},
    {name:'Devnet lifecycle',state:'In verification',tone:'active',copy:'End-to-end execution evidence remains the principal proof target.'},
    {name:'Failure paths & recovery',state:'Hardening',tone:'active',copy:'Revoked permissions, repeated requests, emergency stops and unresolved outcomes.'},
    {name:'Mainnet trading',state:'Locked',tone:'locked',copy:'No public access until the required verification gates have been met.'},
  ], noteTitle:'Latest engineering note', note:PROJECT_STATUS_UPDATE.noteEn, roadmapLabel:'WHAT COMES NEXT', roadmapTitle:'Milestones, not promises.', roadmap:PROJECT_STATUS_UPDATE.roadmapEn.map(([,title,copy])=>({title,copy})), source:'Read the source record', update:'This page is a dated public snapshot, not a live system-health feed.'},
  footer: {line:'Autonomous execution. Deliberate control.', privacy:'Privacy', terms:'Terms', security:'Security', contact:'Contact', disclaimer:'Technical alpha. No public Mainnet trading. No guaranteed returns.'},
}
const ru = {
  nav:{product:'Продукт',progress:'Прогресс',community:'Сообщество',home:'Главная',security:'Безопасность',contact:'Контакты',menu:'Открыть меню',close:'Закрыть меню',label:'Навигация',explore:'Откройте CopyPump',resources:'На связи',motion:'Анимации',pause:'Остановить фоновые анимации',play:'Включить фоновые анимации',reduced:'Устройство использует режим уменьшения движения',skip:'К содержимому'},
  hero:{eyebrow:'АВТОМАТИЗАЦИЯ СО СМЫСЛОМ · SOLANA',line1:'Умные деньги.',line2:'Ваши правила.',intro:'CopyPump сам обнаруживает успешные кошельки. Вы задаёте стратегию и лимиты — система работает в этих рамках.',primary:'Посмотреть, как это работает',secondary:'На каком мы этапе',label:'ТЕХНИЧЕСКАЯ АЛЬФА',stamp:'Контроль остаётся у вас.',bottom:'Без передачи средств платформе. С исполнением в рамках лимитов.',imageLabel:'ВИДЕНИЕ COPYPUMP',hint:'Что стоит между сигналом и сделкой'},
  experience:{eyebrow:'ЗНАКОМСТВО С ПРОДУКТОМ',title:'Сигнал — ещё не сделка.',accent:'Сначала ваши правила.',intro:'Четыре части задуманного процесса. Это интерактивная иллюстрация продукта, а не работающий торговый терминал.',artLabel:'ОБЪЕКТ ПРОЦЕССА',example:'УСЛОВНЫЕ ДАННЫЕ · БЕЗ ТРАНЗАКЦИЙ',detail:'Подробнее о модели контроля',chapters:[
    {name:'Сигналы',title:'Находить успешные кошельки.',copy:'CopyPump анализирует публичную историю торговли и сам отбирает кошельки. Их активность проходит проверку по вашим правилам. Вручную выбирать, кого копировать, не нужно.',key:'АВТОМАТИЧЕСКИЙ ПОИСК КОШЕЛЬКОВ',rows:[['Поиск кошельков','Отбирает система'],['Активность','Новый кандидат'],['Действие','Ожидает проверки']]},
    {name:'Отбор',title:'Меньше шума. Больше контекста.',copy:'Свежесть, ликвидность и качество сигнала проверяются до обращения к капиталу. Одного движения кошелька недостаточно.',key:'КАЧЕСТВО СИГНАЛА',rows:[['Свежесть','В рамках правил'],['Ликвидность','Требует проверки'],['Следующий шаг','Оценка риска']]},
    {name:'Лимиты',title:'Лимит — не рекомендация.',copy:'Агент может предложить действие. Ваш лимит капитала может его запретить. Измените лимит в этом упрощённом примере.',key:'ПРОВЕРКА ПРАВИЛ · ИНТЕРАКТИВ',rows:[['Размер кандидата','0.50 SOL'],['Полномочия','Ограничены'],['Исполнение','Не подключено']]},
    {name:'Сверка',title:'Знать, что произошло на самом деле.',copy:'Цель — проверяемая запись от решения до подтверждённого результата. Отправленная транзакция ещё не означает успешную сделку.',key:'ЗАПИСЬ ИСПОЛНЕНИЯ',rows:[['Решение','Зафиксировано'],['Транзакция','Нужно подтверждение'],['Итоговое состояние','Нужна сверка']]},
  ],limit:'Ваш лимит капитала',allowed:'В пределах лимита',blocked:'Заблокировано лимитом',allowedNote:'Эта проверка пройдена. Перед действием должны пройти и все остальные обязательные проверки.',blockedNote:'Кандидат превышает ваш лимит. Этот пример не отправляет транзакции.',test:'Кандидат на 0.50 SOL',policyLink:'Все условия исполнения'},
  status:{eyebrow:'РАЗВИТИЕ С ПОДТВЕРЖДЕНИЯМИ',title:'Большая цель.',accent:'Проверяемые шаги.',intro:'Продукт находится в технической альфе. Сейчас фокус — полный, проверяемый цикл исполнения в Solana Devnet.',label:'СОСТОЯНИЕ ПРОЕКТА',now:'Проверка продолжается',network:'Среда проверки',mainnet:'Доступ в Mainnet',locked:'Намеренно закрыт',source:'Источник обновлён',link:'Открыть отчёт о прогрессе',note:'Публичный запуск следует за подтверждённой готовностью, а не за таймером.'},
  cta:{eyebrow:'СОЗДАЁМ COPYPUMP',title:'Участвуйте в следующем этапе.',copy:PROJECT_STATUS_UPDATE.communityRu,community:'Присоединиться к обсуждению',builder:'Помочь в разработке',partners:'Партнёрство и вопросы'},
  product:{eyebrow:'ПРОДУКТ / МОДЕЛЬ КОНТРОЛЯ',title:'Автономности нужны',accent:'чёткие границы.',intro:'Параметры, которые стоят за продуктом. Здесь описана задуманная архитектура; состояние её проверки отдельно отражено в «Прогрессе».',tabs:['Правила исполнения','Кошелёк и доступ','Вопросы'],policyTitle:'Сначала условия. Затем действие.',policyIntro:'Каждая проверка отвечает за своё. Прохождение одной не отменяет остальные.',controls:[
    {name:'Капитал',detail:'Максимум средств для отдельного действия. Даже качественный кандидат отклоняется, если выходит за выделенный объём.',tag:'ОБЪЁМ ДЕЙСТВИЯ'},
    {name:'Проскальзывание и ликвидность',detail:'Допустимые условия исполнения. Наличие сигнала не оправдывает неограниченное изменение цены или недостаточную ликвидность.',tag:'КАЧЕСТВО ИСПОЛНЕНИЯ'},
    {name:'Экспозиция',detail:'Ограничения позиции и общей нагрузки на портфель. Размер отдельной сделки не описывает весь риск стратегии.',tag:'ОБЩАЯ НАГРУЗКА'},
    {name:'Экстренная остановка',detail:'Остановка автоматизации независимо от остальных проверок. Восстановление должно учитывать действующие правила пользователя, а не возобновлять работу по предположению.',tag:'УПРАВЛЕНИЕ РАБОТОЙ'},
  ],authorityTitle:'Подключение — не безграничное разрешение.',authorityIntro:'CopyPump проектируется без передачи контроля над средствами платформе. Автоматизация опирается на ограниченные полномочия, а не на владение кошельком.',authority:[
    {title:'Ключи остаются у вас',copy:'Модель предполагает подпись под контролем пользователя. Передавать CopyPump seed-фразу или приватный ключ не нужно.'},
    {title:'У разрешений есть границы',copy:'Делегированные или сессионные полномочия должны ограничиваться явными правилами и отзываться пользователем. Агент не получает права обходить эти условия.'},
    {title:'Неопределённость — не успех',copy:'Неполное подтверждение или сверка должны оставаться видимым незавершённым состоянием. Система не должна выдавать их за готовый результат.'},
  ],faqTitle:'Практические вопросы.',faq:[
    {q:'На этом сайте можно торговать?',a:'Нет. Сайт знакомит с проектом и показывает локальный пример проверки лимита. Он не подключает кошелёк, не размещает ордера и не принимает депозиты.'},
    {q:'Где посмотреть готовность к запуску?',a:'В «Прогрессе» собраны действующие этапы проверки и следующие публичные цели. Обещанной даты запуска нет.'},
    {q:'Весь исходный код открыт?',a:'Публичный GitHub содержит отобранную документацию. Код и тесты публикуются после проверки безопасности, приватности и лицензирования. Полный инженерный репозиторий остаётся закрытым.'},
    {q:'Следование за smart money гарантирует доход?',a:'Нет. История кошельков, сигналы и автоматизация не гарантируют будущий результат. В торговле можно потерять капитал даже при корректной работе проверок.'},
  ],evidence:'Подтверждения и текущий статус'},
  progress:{eyebrow:'ПРОГРЕСС / ПУБЛИЧНЫЙ ОТЧЁТ',title:'Сначала доказательства.',accent:'Потом доступ.',intro:'Разделяем то, что уже доступно, то, что проходит проверку, и то, что пока закрыто.',date:'Публичный источник обновлён',summaryTitle:'Техническая альфа.',summaryCopy:'CopyPump проверяет торговый цикл в Solana Devnet. Публичный сайт доступен; публичная торговля в Mainnet не запущена.',currentLabel:'ТЕКУЩАЯ ИНЖЕНЕРНАЯ ЦЕЛЬ',currentTitle:'Подтвердить полный цикл.',currentCopy:'Покупка → позиция → частичная продажа → полная продажа. Проверить подтверждение транзакций, сверить итоговое состояние и учесть комиссии и PnL. Работающий интерфейс ещё не доказывает прохождение этого цикла.',gates:[
    {name:'Публичная часть проекта',state:'Доступна',tone:'good',copy:'Описание продукта, модель хранения средств, правила участия и официальные каналы.'},
    {name:'Цикл в Devnet',state:'Проверяется',tone:'active',copy:'Подтверждения сквозного исполнения остаются главной целью проверки.'},
    {name:'Сбои и восстановление',state:'Дорабатывается',tone:'active',copy:'Отозванные разрешения, повторные запросы, экстренная остановка и неподтверждённые результаты.'},
    {name:'Торговля в Mainnet',state:'Закрыта',tone:'locked',copy:'Публичного доступа нет до прохождения обязательных проверок.'},
  ],noteTitle:'Последнее инженерное примечание',note:PROJECT_STATUS_UPDATE.noteRu,roadmapLabel:'ЧТО ДАЛЬШЕ',roadmapTitle:'Цели вместо обещаний.',roadmap:PROJECT_STATUS_UPDATE.roadmapRu.map(([,title,copy])=>({title,copy})),source:'Открыть исходный отчёт',update:'Это датированный публичный срез, а не мониторинг системы в реальном времени.'},
  footer:{line:'Автономное исполнение. Осознанный контроль.',privacy:'Приватность',terms:'Условия',security:'Безопасность',contact:'Контакты',disclaimer:'Техническая альфа. Публичной торговли в Mainnet нет. Доходность не гарантируется.'},
}
export const premiumCopy = { en, ru }
