import {NextResponse} from 'next/server';
import {githubIngest} from '../../../../../packages/analyze/src/github';
import {inspectSource,graphFromFiles} from '../../../../../packages/analyze/src/static';
export const runtime='nodejs';export const maxDuration=60;
export async function POST(request:Request){
 try{
 const {url}=await request.json();if(typeof url!=='string')throw Error('Missing repository URL');
 const repo=await githubIngest(url,process.env.GITHUB_TOKEN);
 // Bounded preview only; never misrepresent it as a full repository analysis.
 const sample=repo.files.slice(0,60);
 const inspected=await Promise.all(sample.map(async file=>{
 try{const response=await fetch('https://raw.githubusercontent.com/'+repo.owner+'/'+repo.repo+'/'+repo.sha+'/'+file.path,{signal:AbortSignal.timeout(8000)});if(!response.ok)return null;return inspectSource(file.path,await response.text());}catch{return null;}
 }));
 const files=inspected.filter((x):x is NonNullable<typeof x>=>x!==null);const graph=graphFromFiles(files);
 return NextResponse.json({repo:{owner:repo.owner,name:repo.repo,sha:repo.sha},total:repo.total,accepted:repo.files.length,analyzed:files.length,partial:repo.files.length>files.length,skipped:repo.skipped,files,graph});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Analysis failed'},{status:400});}
}
