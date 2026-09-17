export const SCENE_THEMES = ['home','product','radar','progress','community','security','contact'] as const
export type SceneTheme = typeof SCENE_THEMES[number]
export function themeForPath(path:string):SceneTheme {
  const raw=path.replace(/^\/ru(?=\/|$)/,'').replace(/\/$/,'')||'/'
  if(raw.includes('#community'))return 'community'
  if(raw.startsWith('/radar'))return 'radar'
  if(raw.startsWith('/project'))return 'product'
  if(raw.startsWith('/progress'))return 'progress'
  if(raw.startsWith('/contact'))return 'contact'
  if(['/security','/privacy','/terms'].includes(raw))return 'security'
  return 'home'
}
export const sceneSource=(theme:SceneTheme)=>`/media/v51/scene-${theme}.webp`
export function previewScene(path:string|null) {
  window.dispatchEvent(new CustomEvent('copypump:scene-preview',{detail:path}))
}
