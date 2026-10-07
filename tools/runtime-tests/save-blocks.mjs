export function block(text, pattern, offset=0) {
  const match=pattern.exec(text.slice(offset));
  if(!match) throw Error(`Missing save block ${pattern}`);
  const start=offset+match.index;let depth=0,began=false;
  const tokens=/"(?:\\.|[^"\\])*"|#[^\r\n]*|[{}]/g;tokens.lastIndex=start;
  for(let m;(m=tokens.exec(text));) {
    if(m[0]==='{') {depth++;began=true;} else if(m[0]==='}') depth--;
    if(began && depth===0) return text.slice(start,tokens.lastIndex);
  }
  throw Error('Unclosed native save');
}
