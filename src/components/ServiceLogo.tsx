/** Local vector marks. Provenance and trademark notes: docs/SERVICE_MARKS_V44.md. */
export type ServiceName = 'phantom' | 'x' | 'discord' | 'github' | 'solana'
export function ServiceLogo({ name, size = 24 }: { name: ServiceName; size?: number }) {
  return <img className={`service-logo service-logo--${name}`} src={`/service-logos/${name}.svg`} width={size} height={size} alt="" aria-hidden="true" draggable={false}/>
}
