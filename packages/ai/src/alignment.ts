export type CharacterAlignment={characters:string[];character_start_times_seconds:number[];character_end_times_seconds:number[]};
export type WordTiming={text:string;startMs:number;endMs:number};
export function wordsFromAlignment(input:CharacterAlignment):WordTiming[]{
 const {characters,character_start_times_seconds:starts,character_end_times_seconds:ends}=input;
 if(characters.length!==starts.length||starts.length!==ends.length)throw Error('Alignment arrays have different lengths');
 const words:WordTiming[]=[];let text='';let start=0;let end=0;
 const flush=()=>{if(text.trim())words.push({text:text.trim(),startMs:Math.round(start*1000),endMs:Math.round(end*1000)});text=''};
 for(let i=0;i<characters.length;i++){const char=characters[i];if(/\s/.test(char)){flush();continue;}if(!text)start=starts[i];text+=char;end=ends[i];}
 flush();return words;
}
export function captionLines(words:WordTiming[],limit=42){const lines:{text:string;startMs:number;endMs:number}[]=[];let line:WordTiming[]=[];let count=0;for(const word of words){if(line.length&&count+word.text.length+1>limit){lines.push({text:line.map(w=>w.text).join(' '),startMs:line[0].startMs,endMs:line[line.length-1].endMs});line=[];count=0;}line.push(word);count+=word.text.length+1;}if(line.length)lines.push({text:line.map(w=>w.text).join(' '),startMs:line[0].startMs,endMs:line[line.length-1].endMs});return lines;}
