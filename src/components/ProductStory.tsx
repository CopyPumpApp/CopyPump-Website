import { useI18n } from '../i18n'

export function ProductStory(){
  const { locale } = useI18n()
  const ru = locale === 'ru'
  const flow = ru ? [
    ['01','Наблюдение','CopyPump отслеживает выбранные публичные кошельки и превращает их активность в кандидаты, а не в автоматические сделки.'],
    ['02','Отбор','Сигнал проверяется по свежести, ликвидности и другим критериям качества до того, как в расчёт попадёт капитал.'],
    ['03','Ограничение','Лимит сделки, проскальзывание, экспозиция и полномочия пользователя образуют жёсткий контур риска.'],
    ['04','Исполнение + сверка','Только разрешённое действие может перейти к исполнению. После него ожидаемое состояние сверяется с фактическим.'],
  ] : [
    ['01','Observe','CopyPump watches selected public wallets and turns activity into candidates — not automatic trades.'],
    ['02','Qualify','A signal is checked for freshness, liquidity and other quality criteria before capital is considered.'],
    ['03','Constrain','Trade size, slippage, exposure and user authority form a hard risk envelope around automation.'],
    ['04','Execute + reconcile','Only an allowed action can proceed. Afterwards, expected state is reconciled against what actually happened.'],
  ]
  const controls = ru ? [
    ['Капитал','Задайте максимальный объём, который может использовать одно действие.'],
    ['Риск','Ограничьте проскальзывание, размер позиции и другие условия исполнения.'],
    ['Полномочия','Разрешения должны быть ограниченными и отзывными — подключение кошелька не равно полному доступу.'],
    ['Аварийная остановка','Остановите автоматизацию независимо от остальных проверок.'],
  ] : [
    ['Capital','Set the maximum amount a single action may use.'],
    ['Risk','Bound slippage, position exposure and other execution conditions.'],
    ['Authority','Permissions are intended to be bounded and revocable — connecting a wallet is not unlimited access.'],
    ['Emergency stop','Stop automation independently of the other checks.'],
  ]
  const failures = ru ? [
    ['Сигнал устарел','Действие блокируется до использования капитала.'],
    ['Превышен лимит','Кандидат не получает разрешение на исполнение.'],
    ['Полномочия отозваны','Автоматизация должна остановиться, а не искать обходной путь.'],
    ['Результат не подтверждён','Состояние остаётся несверенным; система не должна показывать ложный успех.'],
  ] : [
    ['Signal is stale','The action is blocked before capital is used.'],
    ['Limit is exceeded','The candidate does not receive permission to execute.'],
    ['Authority is revoked','Automation should stop rather than search for a workaround.'],
    ['Outcome is not confirmed','State remains unreconciled; the system should not report a false success.'],
  ]
  return <section id="product-story" className="product-story section-shell" aria-labelledby="product-story-title">
    <div className="story-heading" data-reveal="0" data-reveal-kind="title"><span className="eyebrow">{ru?'КАК УСТРОЕН COPYPUMP':'HOW COPYPUMP WORKS'}</span><h2 id="product-story-title">{ru?'Не копировать вслепую.':'Don’t copy blindly.'}<br/><em>{ru?'Автоматизировать с границами.':'Automate inside boundaries.'}</em></h2><p>{ru?'CopyPump создаётся как некастодиальный слой автоматизации для Solana: система помогает следовать за выбранными smart-money кошельками, но каждое действие должно пройти правила пользователя до исполнения.':'CopyPump is being built as a non-custodial automation layer for Solana: it helps follow selected smart-money wallets, while every candidate action must pass the user’s rules before execution.'}</p></div>
    <div className="story-flow" aria-label={ru?'Путь решения':'Decision path'}>{flow.map(([n,title,text],i)=><article key={n} data-reveal={String(i*45)}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    <div className="story-split">
      <div data-reveal="80"><span className="eyebrow">{ru?'ЧТО КОНТРОЛИРУЕТ ПОЛЬЗОВАТЕЛЬ':'WHAT YOU CONTROL'}</span><div className="story-list">{controls.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div></div>
      <div data-reveal="130"><span className="eyebrow">{ru?'ЕСЛИ ЧТО-ТО НЕ ПРОХОДИТ ПРОВЕРКУ':'WHEN SOMETHING FAILS A CHECK'}</span><div className="story-list story-list--failure">{failures.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div></div>
    </div>
    <p className="story-note" data-reveal="160">{ru?'Текущий публичный интерфейс показывает модель принятия решения. Это не обещание доходности и не подтверждение готовности Mainnet.':'The current public interface demonstrates the decision model. It is not a profitability claim or proof of Mainnet readiness.'}</p>
  </section>
}
