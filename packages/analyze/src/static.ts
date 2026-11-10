import {stableId,resolveLocalImport} from './index';
export type AnalyzedFile={path:string;language:string;imports:string[];exports:string[];symbols:string[]};
const language=(path:string)=>/\.tsx?$/.test(path)?'TypeScript':/\.jsx?$/.test(path)?'JavaScript':path.endsWith('.py')?'Python':'Go';
export function inspectSource(path:string,content:string):AnalyzedFile{
 const imports:string[]=[];const exports:string[]=[];const symbols:string[]=[];
 // Conservative extraction: syntax matches are not claimed as fully resolved AST facts.
 if(/\.[jt]sx?$/.test(path)){
 for(const match of content.matchAll(/(?:import\s+(?:[\s\S]*?\s+from\s+)?|require\s*\(\s*)['"]([^'"]+)['"]/g))imports.push(match[1]);
 for(const match of content.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|type|interface)\s+(\w+)/g))exports.push(match[1]);
 for(const match of content.matchAll(/(?:function|class)\s+(\w+)\s*[({]/g))symbols.push(match[1]);
 }else if(path.endsWith('.py')){
 for(const match of content.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm))imports.push(match[1]||match[2]);
 for(const match of content.matchAll(/^\s*(?:def|class)\s+(\w+)/gm))symbols.push(match[1]);
 }else if(path.endsWith('.go')){
 for(const match of content.matchAll(/^\s*import\s+"([^"]+)"/gm))imports.push(match[1]);
 for(const match of content.matchAll(/^func\s+(?:\([^)]*\)\s*)?(\w+)/gm))symbols.push(match[1]);
 }
 return {path,language:language(path),imports:[...new Set(imports)],exports:[...new Set(exports)],symbols:[...new Set(symbols)]};
}
export function graphFromFiles(files:AnalyzedFile[]){
 const paths=new Set(files.map(f=>f.path));const modules=files.map(f=>({id:stableId(f.path),files:[f.path],size:1,centrality:0}));
 const edges:{id:string;from:string;to:string;kind:'import';confidence:'resolved'}[]=[];const external=new Set<string>();
 for(const f of files)for(const spec of f.imports){const target=resolveLocalImport(f.path,spec,paths);if(target){const from=stableId(f.path),to=stableId(target);edges.push({id:stableId(from,to,'import'),from,to,kind:'import',confidence:'resolved'});}else if(!spec.startsWith('.'))external.add(spec);}
 const degrees=new Map<string,number>();for(const e of edges){degrees.set(e.from,(degrees.get(e.from)||0)+1);degrees.set(e.to,(degrees.get(e.to)||0)+1);}
 for(const m of modules)m.centrality=degrees.get(m.id)||0;
 return {modules,edges,dependencies:[...external].sort()};
}
