import {createContext,useCallback,useContext,useEffect,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from 'react'
import {parseIndex,validId,type ObservationSummary,type RadarIndex,type Observation} from './schema'
const KEY='copypump.radar.v1'
type LocalState={saved:string[]; read:Record<string,number>}
const empty=():LocalState=>({saved:[],read:{}})
export function parseLocal(raw:string|null):LocalState{
  if(!raw)return empty()
  const value=JSON.parse(raw)
  if(!value||!Array.isArray(value.saved)||!value.read||typeof value.read!=='object')throw new Error('Invalid saved state')
  const read:Record<string,number>={}
  for(const [id,version] of Object.entries(value.read).slice(-500))if(validId(id)&&Number.isInteger(version)&&Number(version)>0)read[id]=Number(version)
  return {saved:[...new Set<string>(value.saved.filter(validId))].slice(-500),read}
}
export const hasUpdate=(item:ObservationSummary,read:Record<string,number>)=>!!read[item.id]&&item.version>read[item.id]
const Context=createContext<{
  ready:boolean; initialObservation?:Observation; index:RadarIndex|null; loading:boolean; error:boolean; local:LocalState; persistent:boolean;
  reload:()=>void; toggleSave:(id:string)=>void; markRead:(id:string,version:number)=>void
}>({ready:false,index:null,loading:true,error:false,local:empty(),persistent:true,reload:()=>{},toggleSave:()=>{},markRead:()=>{}})
export const useRadar=()=>useContext(Context)
export function RadarProvider({children,initialIndex,initialObservation}:{children:ReactNode;initialIndex?:RadarIndex;initialObservation?:Observation}){
  const [index,setIndex]=useState<RadarIndex|null>(initialIndex||null),[loading,setLoading]=useState(!initialIndex),[error,setError]=useState(false)
  const [local,setLocal]=useState<LocalState>(empty),[persistent,setPersistent]=useState(true),[ready,setReady]=useState(false)
  const current=useRef(local),abort=useRef<AbortController|null>(null)
  // SSR controls stay disabled until handlers are attached and browser preferences
  // have been restored. A visible server-rendered Save must not lose its first click.
  useLayoutEffect(()=>{try{const next=parseLocal(localStorage.getItem(KEY));current.current=next;setLocal(next)}catch{setPersistent(false)}finally{setReady(true)}},[])
  const reload=useCallback(()=>{
    abort.current?.abort();const controller=new AbortController();abort.current=controller
    setLoading(true)
    const timeout=window.setTimeout(()=>controller.abort(),10000)
    fetch('/radar/index.json',{signal:controller.signal,cache:'no-cache'}).then(async r=>{
      if(!r.ok)throw new Error('Index unavailable');const data=parseIndex(await r.json());
      if(abort.current===controller){setIndex(data);setError(false)}
    }).catch(()=>{if(abort.current===controller)setError(true)}).finally(()=>{clearTimeout(timeout);if(abort.current===controller)setLoading(false)})
  },[])
  useEffect(()=>{reload();return()=>{abort.current?.abort();abort.current=null}},[reload])
  const change=useCallback((fn:(s:LocalState)=>LocalState)=>{
    const next=fn(current.current);current.current=next;setLocal(next)
    try{localStorage.setItem(KEY,JSON.stringify(next));setPersistent(true)}catch{setPersistent(false)}
  },[])
  useEffect(()=>{
    const sync=(e:StorageEvent)=>{if(e.key!==KEY&&e.key!==null)return;try{const next=parseLocal(e.key===null?null:e.newValue);current.current=next;setLocal(next);setPersistent(true)}catch{setPersistent(false)}}
    addEventListener('storage',sync);return()=>removeEventListener('storage',sync)
  },[])
  const toggleSave=useCallback((id:string)=>{if(!validId(id))return;change(s=>({...s,saved:s.saved.includes(id)?s.saved.filter(x=>x!==id):[...s.saved,id].slice(-500)}))},[change])
  const markRead=useCallback((id:string,version:number)=>{if(!validId(id)||!Number.isInteger(version)||version<=0||current.current.read[id]>=version)return;change(s=>({...s,read:{...s.read,[id]:version}}))},[change])
  const value=useMemo(()=>({ready,initialObservation,index,loading,error,local,persistent,reload,toggleSave,markRead}),[ready,initialObservation,index,loading,error,local,persistent,reload,toggleSave,markRead])
  return <Context.Provider value={value}>{children}</Context.Provider>
}
