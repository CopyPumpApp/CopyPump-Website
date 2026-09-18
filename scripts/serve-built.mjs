/** Local static preview with the same HTML routing/headers as the shipped assets. */
import http from 'node:http'
import {readFileSync,existsSync,statSync} from 'node:fs'
import {resolve,extname} from 'node:path'
const args=process.argv.slice(2),value=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback
const port=Number(value('--port',process.env.PORT||4173)),host=value('--host','127.0.0.1'),root=resolve('dist')
const manifest=JSON.parse(readFileSync(root+'/publication-manifest.json','utf8'))
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.woff2':'font/woff2','.webmanifest':'application/manifest+json'}
http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  const url=new URL(req.url,'http://localhost');let path=decodeURIComponent(url.pathname)
  if(path.endsWith('/')&&path!=='/'){res.writeHead(308,{Location:path.slice(0,-1)+url.search});res.end();return}
  let file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))throw new Error('Invalid path')
  if(!existsSync(file)||!statSync(file).isFile())file+='.html'
  let status=200
  if(!existsSync(file)||!statSync(file).isFile()){file=root+(path.startsWith('/ru/radar/')?'/ru/radar/404.html':path.startsWith('/radar/')?'/radar/404.html':path.startsWith('/ru/')?'/ru/404.html':'/404.html');status=404}
  const headers={...manifest.headers,'Content-Type':mime[extname(file)]||'application/octet-stream'}
  if(path.startsWith('/assets/'))headers['Cache-Control']='public, max-age=31536000, immutable'
  if(status===404||path.startsWith('/radar/evidence/'))headers['X-Robots-Tag']='noindex'
  res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:readFileSync(file))
 }catch{res.writeHead(400);res.end('Bad request')}
}).listen(port,host,()=>console.log(`Built site at http://${host}:${port}`))
