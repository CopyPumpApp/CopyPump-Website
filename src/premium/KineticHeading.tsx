import type {CSSProperties} from 'react'

/** Accessible wording once; word-sized visual masks avoid a huge moving text surface. */
export function KineticHeading({as:Tag='h2',lines,id,className=''}:{as?:'h1'|'h2'|'h3';lines:Array<{text:string;accent?:boolean}>;id?:string;className?:string}) {
  return <Tag id={id} className={`kinetic-heading ${className}`}>
    <span className="sr-only">{lines.map(l=>l.text).join(' ')}</span>
    {lines.map((line,i)=><span className={`heading-line ${line.accent?'heading-line--accent':''}`} aria-hidden="true" data-gradient={line.accent?'':undefined} key={i}>
      {line.text.split(/\s+/).map((word,w)=><span className="heading-word-mask" key={w}>
        <span className="heading-motion" data-reveal="heading" data-delay={Math.min(360,i*140+w*65)}>
          <span className={line.accent?'heading-ink gradient-ink':'heading-ink'} style={{'--ink-delay':`${w*.42}s`,'--ink-position':`${w*21}%`} as CSSProperties}>
            <span className="gradient-base">{word}</span>{line.accent&&<span className="gradient-shift">{word}</span>}
          </span>
        </span>
      </span>)}
    </span>)}
  </Tag>
}
