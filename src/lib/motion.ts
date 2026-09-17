let pending=0
function afterNavigation(id?:string){
  if(pending)cancelAnimationFrame(pending)
  pending=requestAnimationFrame(()=>{pending=requestAnimationFrame(()=>{
    pending=0
    const target=document.getElementById(id||'main-content')
    if(id)target?.scrollIntoView({block:'start',behavior:document.documentElement.dataset.motion==='on'?'smooth':'auto'})
    else window.scrollTo({top:0,left:0,behavior:'auto'})
    if(!id)target?.focus({preventScroll:true})
  })})
}
export function smoothScrollToId(id:string,_offset=92){afterNavigation(id)}
export function navigateLocal(path:string){
  const url=new URL(path,window.location.origin)
  if(url.origin!==window.location.origin)return
  const locale=document.documentElement.lang==='ru'?'ru':'en'
  const raw=url.pathname.replace(/^\/ru(?=\/|$)/,'')||'/'
  const local=locale==='ru'?(raw==='/'?'/ru':`/ru${raw}`):raw
  const destination=`${local}${url.search}${url.hash}`
  if(`${location.pathname}${location.search}${location.hash}`!==destination){
    history.pushState({},'',destination)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  afterNavigation(url.hash?decodeURIComponent(url.hash.slice(1)):undefined)
}
