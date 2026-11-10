import type {FactSheet,SceneScript} from '@repo/schema';
export function verifyReferences(facts:FactSheet,script:SceneScript){
 const modules=new Set(facts.modules.map(m=>m.id));const edges=new Map(facts.edges.map(e=>[e.id,e]));const errors:string[]=[];
 for(const node of script.diagram.nodes)if(!modules.has(node.id))errors.push('Unknown node '+node.id);
 for(const edge of script.diagram.edges){const real=edges.get(edge.id);if(!real||real.from!==edge.from||real.to!==edge.to||real.kind!==edge.kind)errors.push('Unsupported edge '+edge.id);}
 for(const level of script.levels)for(const scene of level.scenes){for(const id of [...scene.focus.modules,...scene.camera.moduleIds])if(!modules.has(id))errors.push('Unsupported module focus '+id);for(const id of scene.focus.edges)if(!edges.has(id))errors.push('Unsupported edge focus '+id);}
 return errors;
}
