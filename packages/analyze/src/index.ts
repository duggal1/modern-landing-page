import type {FactSheet} from '@repo/schema';
export type SourceFile={path:string;content:string};
export interface LanguagePlugin{extensions:string[];parse(file:SourceFile):Promise<{imports:string[];exports:string[];symbols:string[]}>}
export interface RepositorySource{fetch(owner:string,repo:string,sha:string):AsyncIterable<SourceFile>}
export function stableId(...parts:string[]){return parts.map(x=>encodeURIComponent(x)).join(':')}
export function resolveLocalImport(source:string,specifier:string,paths:Set<string>){if(!specifier.startsWith('.'))return null;const base=source.split('/').slice(0,-1);for(const segment of specifier.split('/')){if(segment==='..')base.pop();else if(segment!=='.')base.push(segment)}const stem=base.join('/');return [stem,stem+'.ts',stem+'.tsx',stem+'.js',stem+'.jsx',stem+'/index.ts',stem+'/index.js'].find(p=>paths.has(p))??null}
export function assertGraph(sheet:FactSheet){const ids=new Set(sheet.modules.map(m=>m.id));for(const edge of sheet.edges)if(!ids.has(edge.from)||!ids.has(edge.to))throw Error('Dangling edge: '+edge.id)}
