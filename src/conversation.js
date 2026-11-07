import {chatPreferences,requestedArrival,requestedRadius} from './chatPreferences.js';

export function parkingAnswer(text){
 if(/^(hi|hello|hey|thanks|thank you)[!. ]*$/i.test(text.trim()))return "Hi! Tell me where you're going and when. You can follow up with 'only garages', 'within half a mile', or 'same place tomorrow afternoon'.";
 if(/\b(how|why|what|are|is|can|do)\b/i.test(text)&&/\b(availability|empty|open spots?|guarantee|reserve|reservation|unenforced|colors?|colours?|estimat|meters? actually)/i.test(text))return "Meter availability is an estimate from historical payment patterns, not a live check of an empty space. 'Unenforced' refers to payment hours, not vacancy; check posted signs. Lots and garages currently have mapped locations, but no verified live space counts. Green means an estimate of at least 60%, amber 30–59%, red below 30%, blue reported off-hours, and gray unknown. I can't reserve or guarantee a space.";
 if(/^(help|what can you do)[?!. ]*$/i.test(text.trim()))return "I can find a destination, narrow parking to garages, lots or meters, and change distance, arrival time and stay length. Try 'UCSD tomorrow afternoon for 2 hours', then 'only garages within half a mile'. I'll keep the other preferences. If a place has multiple matches, I'll ask which one.";
 return null;
}
export function followupOnly(text){
 return /^(?:same place|same destination|there|here|only |just |make it |closer|cheaper|within |for |today|tomorrow|this afternoon|this evening|tonight|at \d|any price|all streets|all parking|any parking|paid is fine)/i.test(text.trim());
}
export function conversationPlan(text,current={},streets=[],now=new Date()){
 const normalized=text.replace(/half (?:a |an )?mile/gi,'0.5 miles').replace(/a quarter (?:of a )?mile/gi,'0.25 miles');
 let timeText=normalized,assumption='';
 const part=normalized.match(/\b(morning|afternoon|evening|tonight)\b/i);
 if(part&&!/\d\s*(am|pm)\b/i.test(normalized)){
  const hour={morning:'9am',afternoon:'2pm',evening:'6pm',tonight:'7pm'}[part[1].toLowerCase()];
  timeText=(/tomorrow/i.test(normalized)?'tomorrow':'today')+' at '+hour;
  assumption='I interpreted '+part[1].toLowerCase()+' as '+hour+' Pacific. Tell me a different time if needed.';
 }
 if(/^\s*at \d/i.test(timeText))timeText='today '+timeText;
 const duration=normalized.match(/\b(?:for|stay(?:ing)?(?: for)?|make it)\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/i);
 const prefs={kind:current.kind||'all',fee:current.fee||'all',street:current.street||'all',...chatPreferences(normalized,streets)};
 const radius=requestedRadius(normalized)||(/\bcloser\b/i.test(normalized)?Math.max(161,Math.round((current.radius_m||1000)/2)):current.radius_m||1000);
 return {prefs,assumption,radius_m:Math.min(3219,Math.max(161,radius)),arrival_time:requestedArrival(timeText,now)||current.arrival_time||now.toISOString(),duration_minutes:duration?Math.min(1440,Math.max(1,Math.round(+duration[1]*(/^h/i.test(duration[2])?60:1)))):current.duration_minutes||120};
}
export function searchSummary(destination,plan){
 const type={all:'parking options',garage:'garages',lot:'parking lots',meter:'street meters'}[plan.prefs.kind];
 const time=new Date(plan.arrival_time).toLocaleString('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 return `Searching ${type} near ${destination.name}, within ${(plan.radius_m/1609.344).toFixed(2)} miles, arriving ${time} Pacific for ${plan.duration_minutes} minutes.${plan.prefs.fee==='no'?' Free filter is on; check posted payment rules.':''} ${plan.assumption} Live vacancy isn't verified.`;
}
