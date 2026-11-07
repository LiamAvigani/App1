import {useEffect,useRef,useState} from "react";
import {request} from "../api";
import {chatPreferences,requestedArrival,requestedRadius} from "../chatPreferences";
import {destinationQuery,isLocalFollowup,resolvedDestination} from "../destinationQuery";
export default function ParkingChat({center,onResults,onDestination,streets=[],onLocate}){
 const [messages,setMessages]=useState([]),[text,setText]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[pending,setPending]=useState(null);
 const log=useRef(null),controller=useRef(null),generation=useRef(0);
 useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight},[messages,busy,pending]);
 useEffect(()=>()=>{generation.current++;controller.current?.abort()},[]);
 async function run(question,chosen=null,skipLookup=false){
  if(busy)return;
  const id=++generation.current;
  const next=[...messages,{role:"user",text:question}];
  setBusy(true);setError("");setPending(null);
  const abort=new AbortController();controller.current=abort;
  const timer=setTimeout(()=>abort.abort(),60000);
  try{
   let target=chosen;
   const named=destinationQuery(question);
   if(named&&!skipLookup){
    const response=await fetch("/discovery/places?q="+encodeURIComponent(named),{signal:abort.signal});
    if(!response.ok)throw Error("I couldn't look up that destination. Please try a full address.");
    const matches=(await response.json()).filter(p=>Number.isFinite(+p.lat)&&Number.isFinite(+p.lon));
    if(!matches.length)throw Error('No San Diego match for "'+named+'". Try the store name plus its street or full address.');
    if(matches.length>1){if(id===generation.current)setPending({question,matches});return}
    target={lat:+matches[0].lat,lng:+matches[0].lon,name:matches[0].display_name};
   }
   if(id!==generation.current)return;
   let destination=target||center;
   const prefs=chatPreferences(question,streets);
   if(target){delete prefs.street;onDestination(target)}
   let data=await request("/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},signal:abort.signal,body:JSON.stringify({messages:next,user_location:{lat:destination.lat,lon:destination.lng}})});
   if(id!==generation.current)return;
   destination=resolvedDestination(target,data.query,center,isLocalFollowup(question));
   const moved=!!target||destination.lat!==center.lat||destination.lng!==center.lng;
   if(!target&&moved){delete prefs.street;onDestination(destination)}
   if(target||data.query){
    const arrival=requestedArrival(question)||data.query?.arrival_time||new Date().toISOString();
    const radius=requestedRadius(question)||data.query?.radius_m||1000;
    const durationMatch=question.match(/\bfor\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i);
    const duration=durationMatch?Math.round(+durationMatch[1]*(/^h/i.test(durationMatch[2])?60:1)):data.query?.duration_minutes;
    const params=new URLSearchParams({lat:destination.lat,lon:destination.lng,arrival_time:arrival,radius_m:radius,limit:50});
    if(duration)params.set("duration_minutes",duration);
    const corrected=await request("/v1/spots?"+params,{signal:abort.signal});
    if(id!==generation.current)return;
    data={...data,...corrected,destination_name:destination.name};
    onResults(data,prefs);
    const label=prefs.kind==="garage"?"garages":prefs.kind==="lot"?"parking lots":"parking options";
    data.reply=(moved?"I moved your destination pin to "+destination.name+". ":"I'm using your current destination pin. ")+"The map and "+label+" below use that same location. Check the arrival time shown below; availability is not guaranteed.";
   }
   setMessages([...next,{role:"assistant",text:data.reply||"Please tell me your destination."}]);setText("");
  }catch(err){if(id===generation.current){setText(question);setError(err.name==="AbortError"?"That took too long. Please try again.":err.message)}}
  finally{clearTimeout(timer);if(id===generation.current)setBusy(false)}
 }
 function send(e){e.preventDefault();if(text.trim())run(text.trim())}
 return <section className="chat primary-chat">
 <div className="chat-heading"><span className="pilot-avatar">P</span><div><h2>Your parking copilot</h2><small>Name a place to move your destination pin.</small></div></div>
 <div className="conversation" ref={log} role="log" aria-live="polite" aria-label="Parking conversation">
 {!messages.length&&<p className="bubble assistant">Where are you going? Name a store, venue, or address and I’ll move your pin there. Clicking the map sets a new destination, too.</p>}
 {messages.map((m,i)=><p key={i} className={"bubble "+m.role}><b>{m.role==="user"?"You":"Pilot"}</b><span>{m.text}</span></p>)}
 {busy&&<p className="thinking" role="status">Finding your destination and parking…</p>}
 </div>
 {pending&&<div className="destination-choices"><p>Which location did you mean?</p>{pending.matches.map(p=><button key={p.place_id} disabled={busy} onClick={()=>run(pending.question,{lat:+p.lat,lng:+p.lon,name:p.display_name},true)}><b>{p.name||p.display_name.split(",")[0]}</b><span>{p.display_name}</span></button>)}</div>}
 {!messages.length&&!pending&&<div className="suggestions">{["Garages near Petco Park for 2 hours","Parking near Target on Balboa Avenue","Free parking near Balboa Park"].map(q=><button key={q} onClick={()=>setText(q)}>{q}</button>)}</div>}
 <form onSubmit={send}><label htmlFor="chat" className="sr-only">Tell ParkingPilot what you need</label><div className="composer"><textarea id="chat" rows={3} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form.requestSubmit()}}} required placeholder="Try: take me to Target on Balboa Avenue" maxLength={2000}/><div className="composer-actions"><button type="button" className="text-button" onClick={onLocate} disabled={busy}>◎ Use my location</button><button type="submit" disabled={busy||!text.trim()}>{busy?"Searching…":"Find parking →"}</button></div></div></form>
 {error&&<p role="alert" className="notice">{error}</p>}
 <p className="chat-note">Suggestions, not reservations. Live space availability isn’t verified.</p>
 </section>
}
