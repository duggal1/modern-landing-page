import {NextResponse} from 'next/server';
import {FactSheetSchema,SceneScriptSchema} from '../../../../../packages/schema/src/index';
import {createSceneScript} from '../../../../../packages/render/src/story';
import {verifyReferences} from '../../../../../packages/ai/src/verification';
export async function POST(req:Request){try{const facts=FactSheetSchema.parse(await req.json());const script=SceneScriptSchema.parse(createSceneScript(facts));const errors=verifyReferences(facts,script);if(errors.length)throw Error(errors.join('; '));return NextResponse.json(script);}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid facts'},{status:400})}}
