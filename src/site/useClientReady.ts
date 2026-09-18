import {useEffect,useState} from 'react'

/** Published HTML is readable immediately. Imperative controls require hydration. */
export function useClientReady(){
  const [ready,setReady]=useState(false)
  useEffect(()=>setReady(true),[])
  return ready
}
