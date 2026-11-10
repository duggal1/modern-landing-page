import type {FactSheet,SceneScript} from '@repo/schema';
export function createSceneScript(facts:FactSheet):SceneScript{
 const sorted=[...facts.modules].sort((a,b)=>b.centrality-a.centrality||a.id.localeCompare(b.id)).slice(0,12);
 const ids=new Set(sorted.map(m=>m.id));
 const edges=facts.edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
 const nodes=sorted.map(m=>({id:m.id,label:m.files[0]?.split('/').pop()||m.id,role:m.files[0]?.includes('app/')?'entry':'module',purpose:'Source file: '+(m.files[0]||'unknown')}));
 const scenes=nodes.map((node,i)=>{const linked=edges.filter(e=>e.from===node.id||e.to===node.id);const narration='This source file is '+node.label+'. It has '+linked.length+' verified local import connections in the inspected source sample.';return {id:'scene-'+i,level:'overview',durationMs:Math.max(2500,narration.split(/\s+/).length*400),estimated:true,narration,focus:{modules:[node.id],edges:linked.map(e=>e.id)},camera:{moduleIds:[node.id]},captions:[{text:narration,startMs:0,endMs:Math.max(2500,narration.split(/\s+/).length*400)}]};});
 const total=scenes.reduce((sum,s)=>sum+s.durationMs,0);
 return {meta:{repo:facts.repo.owner+'/'+facts.repo.name,sha:facts.repo.sha,title:facts.repo.name,totalDurationMs:total},diagram:{nodes,edges},levels:[{id:'overview',scenes}],summary:'Inspected '+facts.modules.length+' source files. Found '+facts.edges.length+' locally resolved import relationships and '+facts.dependencies.length+' external dependencies. This is a partial static source inspection, not a verified runtime execution trace.'};
}
