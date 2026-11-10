import {NextResponse} from 'next/server';
import {FactSheetSchema,SceneScriptSchema} from '../../../../../packages/schema/src/index';
import {createSceneScript} from '../../../../../packages/render/src/story';
export async function POST(req:Request){try{const facts=FactSheetSchema.parse(await req.json());const script=createSceneScript(facts);return NextResponse.json(SceneScriptSchema.parse(script));}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid facts'},{status:400})}}
