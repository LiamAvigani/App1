import {useState} from "react";
import {request} from "../api";
export default function ParkingChat({center,onResults}){
 const [messages,setMessages]=useState([]),[text,setText]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function send(e){e.preventDefault();if(!text.trim()||busy)return;
 const next=[...messages,{role:"user",text:text.trim()}];setMessages(next);setText("");setBusy(true);setError("");
 try{const data=await request("/v1/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next,user_location:{lat:center.lat,lon:center.lng}})});
 setMessages([...next,{role:"assistant",text:data.reply}]);if(Array.isArray(data.results))onResults(data);
 }catch(err){setError(err.message)}finally{setBusy(false)}
 }
 return <section className="chat"><h2>Ask ParkingPilot</h2><p>Try “Near Petco Park tomorrow at 7pm for 2 hours.”</p><div aria-live="polite">{messages.map((m,i)=><p key={i} className={"bubble "+m.role}><b>{m.role==="user"?"You":"Pilot"}</b> {m.text}</p>)}</div><form onSubmit={send}><label htmlFor="chat">Ask about parking</label><div className="search"><input id="chat" value={text} onChange={e=>setText(e.target.value)} required placeholder="Find a spot…" maxLength={2000}/><button disabled={busy}>{busy?"…":"Send"}</button></div></form>{error&&<p role="alert">{error} Send your question again to retry.</p>}</section>
}
