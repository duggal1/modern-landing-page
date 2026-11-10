export type RepoFile={path:string;sha:string;size:number;type:string};
export type IngestResult={owner:string;repo:string;sha:string;files:RepoFile[];skipped:Record<string,number>;total:number};
const ignored=/(^|\/)(node_modules|vendor|dist|build|\.git|\.next|coverage)(\/|$)|\.(min\.js|map|lock|png|jpe?g|svg|woff2?|ttf|otf)$/i;
const supported=/\.(tsx?|jsx?|py|go)$/i;
export function parseGithubUrl(input:string){const url=new URL(input);const parts=url.pathname.split('/').filter(Boolean);if(url.protocol!=='https:'||url.hostname!=='github.com'||url.search||url.hash||url.port||parts.length!==2||!parts.every(x=>/^[\w.-]+$/.test(x)))throw Error('Enter https://github.com/owner/repo');return {owner:parts[0],repo:parts[1]};}
export async function githubIngest(input:string,token?:string):Promise<IngestResult>{
 const {owner,repo}=parseGithubUrl(input);const base=`https://api.github.com/repos/${owner}/${repo}`;
 const headers={Accept:'application/vnd.github+json',...(token?{Authorization:'Bearer '+token}:{})};
 async function json(url:string){const r=await fetch(url,{headers,signal:AbortSignal.timeout(15000),cache:'no-store'});if(!r.ok)throw Error('GitHub request failed: '+r.status);return r.json();}
 const info=await json(base);if(info.private)throw Error('Only public repositories are supported');
 if(info.size>200000)throw Error('Repository exceeds 200 MB limit');
 const commit=await json(base+'/commits/'+encodeURIComponent(info.default_branch));const sha=commit.sha as string;
 const tree=await json(base+'/git/trees/'+sha+'?recursive=1');if(tree.truncated)throw Error('Repository tree truncated. Dedicated worker required.');
 const all=(tree.tree as RepoFile[]).filter(f=>f.type==='blob');
 if(all.length>50000)throw Error('Repository exceeds 50,000-file limit');
 const skipped={unsupported:0,ignored:0,oversized:0};const files:RepoFile[]=[];
 for(const file of all){if(ignored.test(file.path)){skipped.ignored++;continue;}if(!supported.test(file.path)){skipped.unsupported++;continue;}if(file.size>1000000){skipped.oversized++;continue;}files.push(file);}
 return {owner,repo,sha,files,skipped,total:all.length};
}
