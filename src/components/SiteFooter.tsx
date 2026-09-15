import { navigateLocal } from '../lib/motion'
import { useI18n } from '../i18n'

export function SiteFooter() {
  const { dict, pathFor } = useI18n()
  const links = [
    [dict.footer.privacy, '/privacy'], [dict.footer.terms, '/terms'], [dict.footer.security, '/security'], [dict.footer.contact, '/contact'],
  ] as const
  return <footer className="site-footer"><div className="section-shell site-footer__inner"><div><strong>© 2026 CopyPump</strong><span>{dict.studio.community.footer}</span></div><nav aria-label={dict.footer.navLabel}>{links.map(([label,path]) => <a key={path} href={pathFor(path)} onClick={(event) => { event.preventDefault(); navigateLocal(path) }}>{label}</a>)}<a href="https://discord.gg/DNBQtqw6R" target="_blank" rel="noreferrer" aria-label={dict.footer.discordAria}>{dict.footer.discord}</a></nav></div></footer>
}
