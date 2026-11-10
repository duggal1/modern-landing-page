import {NextResponse} from 'next/server';
import {z} from 'zod';
export const runtime='nodejs';export const maxDuration=60;
const Request=z.object({text:z.string().min(1).max(3500)});
export async function POST(req:Request){
 try{
  if(!process.env.ELEVENLABS_API_KEY||!process.env.ELEVENLABS_VOICE_ID)return NextResponse.json({error:'Voice provider is not configured'},{status:503});
  const {text}=Request.parse(await req.json());
  const voice=encodeURIComponent(process.env.ELEVENLABS_VOICE_ID);
  const response=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'/with-timestamps',{method:'POST',headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({text,model_id:process.env.ELEVENLABS_MODEL_ID||'eleven_flash_v2_5'}),signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error('Voice provider returned '+response.status);
  const data=await response.json();
  const audio=data.audio_base64;const alignment=data.alignment;
  if(typeof audio!=='string'||!alignment)throw Error('Voice provider returned incomplete alignment');
  return NextResponse.json({audio,alignment},{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Voice generation failed'},{status:400})}
}
