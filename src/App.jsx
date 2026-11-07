import {useEffect,useMemo,useState} from "react";
import {request,normalize} from "./api";
import ParkingMap from "./components/ParkingMap";
import ParkingChat from "./components/ParkingChat";
import MeterDetails from "./components/MeterDetails";
const initial={lat:32.7157,lng:-117.1611,name:"Downtown San Diego"};
export default function App(){
 const [center,setCenter]=useState(initial),[query,setQuery]=useState(""),[choices,setChoices]=useState([]);
 const [radius,setRadius]=useState(1000),[fee,setFee]=useState("all"),[arrival,setArrival]=useState(""),[duration,setDuration]=useState(120);
 const [data,setData]=useState(null),[chat,setChat]=useState(null),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[searchError,setSearchError]=useState(""),[searching,setSearching]=useState(false),[retry,setRetry]=useState(0);
 function move(c){setChat(null);setCenter(c)}
 useEffect(()=>{
  const controller=new AbortController();let alive=true;
  const timer=setTimeout(()=>controller.abort(),60000);
  setLoading(true);setError("");setData(null);setSelected(null);
  const params=new URLSearchParams({lat:center.lat,lon:center.lng,radius_m:radius,limit:50,duration_minutes:duration});
  if(arrival)params.set("arrival_time",arrival+"-08:00");
  request("/v1/spots?"+params,{signal:controller.signal}).then(d=>{if(alive)setData(d)}).catch(e=>{if(alive)setError(e.name==="AbortError"?"The parking service timed out. Please retry.":e.message)}).finally(()=>{clearTimeout(timer);if(alive)setLoading(false)});
  return()=>{alive=false;clearTimeout(timer);controller.abort()};
 },[center,radius,arrival,duration,retry]);
 const active=chat||data;
 const results=useMemo(()=>normalize(active||{}).filter(p=>fee==="all"||p.tags.fee===fee),[active,fee]);
 const mapCenter=chat?.query?{lat:chat.query.lat,lng:chat.query.lon,name:"Assistant search"}:center;
 async function search(e){e.preventDefault();setSearching(true);setSearchError("");setChoices([]);
 try{const r=await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=us&viewbox=-117.6,33.3,-116.8,32.5&bounded=1&q="+encodeURIComponent(query),{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const matches=await r.json();setChoices(matches);if(!matches.length)setSearchError("No San Diego locations found. Try a full address.")}
 catch{setSearchError("Address search unavailable. Click the map to choose a location.")}finally{setSearching(false)}}
 function locate(){if(!navigator.geolocation){setSearchError("Location is unavailable in this browser.");return}
 navigator.geolocation.getCurrentPosition(p=>{move({lat:p.coords.latitude,lng:p.coords.longitude,name:"Your location"});setSearchError("")},()=>setSearchError("Location unavailable. Search an address or click the map."),{timeout:15000})}
 return <div className="app"><header><a className="brand" href="/"><span className="logo">P</span>ParkingPilot <small>SD</small></a><span className="header-note">Less circling. More exploring.</span></header><main><aside>
 <div className="intro"><span className="eyebrow">SAN DIEGO STREET PARKING</span><h1>Good parking.<br/>Great day.</h1><p>Find nearby meters and plan your arrival.</p></div>
 <form onSubmit={search}><label htmlFor="destination">Where are you going?</label><div className="search"><input id="destination" value={query} onChange={e=>setQuery(e.target.value)} placeholder="San Diego address or landmark" required/><button disabled={searching}>{searching?"…":"Search"}</button></div></form>
 {choices.length>0&&<ul className="choices">{choices.map(c=><li key={c.place_id}><button onClick={()=>{move({lat:+c.lat,lng:+c.lon,name:c.display_name.split(",").slice(0,2).join(",")});setChoices([]);setQuery(c.display_name)}}>{c.display_name}</button></li>)}</ul>}
 <button className="locate" onClick={locate}>◎ Use my location</button><p className="notice" role="status">{searchError}</p>
 <section className="filters"><div className="filter-heading"><h2>Your preferences</h2><button className="text-button" onClick={()=>{setChat(null);setRadius(1000);setFee("all");setArrival("");setDuration(120)}}>Reset</button></div>
 <label htmlFor="radius">Distance <strong>{(radius/1609.344).toFixed(2)} miles</strong></label><input id="radius" type="range" min="50" max="2000" step="50" value={radius} onChange={e=>{setChat(null);setRadius(+e.target.value)}}/><div className="range-labels"><span>50 m</span><span>2 km / 1.24 mi</span></div>
 <label htmlFor="fee">Parking fee</label><select id="fee" value={fee} onChange={e=>setFee(e.target.value)}><option value="all">Any price / unknown</option><option value="no">Free / outside enforced hours</option><option value="yes">Paid parking</option></select>
 <label htmlFor="arrival" style={{marginTop:16}}>Arrival (San Diego PST, UTC−08:00)</label><input id="arrival" type="datetime-local" value={arrival} onChange={e=>{setChat(null);setArrival(e.target.value)}}/><small>Leave blank for now. Future dates use the displayed offset.</small>
 <label htmlFor="duration" style={{marginTop:16}}>Length of stay</label><select id="duration" value={duration} onChange={e=>{setChat(null);setDuration(+e.target.value)}}>{[30,60,90,120,180,240].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></section>
 <div className="results-heading"><h2>Nearby meters</h2><span>{results.length} spots</span></div><p className="area">Around {mapCenter.name} · up to 50 ranked results</p>
 <div aria-live="polite">{!chat&&loading&&<p className="notice">Finding nearby parking…</p>}{!chat&&error&&<p className="notice">{error} <button onClick={()=>setRetry(x=>x+1)}>Retry</button></p>}{(!loading||chat)&&!error&&!results.length&&<p className="empty">No matching meters. Increase distance or clear filters. Coverage is limited to San Diego street meters.</p>}</div>
 {results.map(p=><article key={p.id} className={selected===p.id?"card active":"card"}><button className="card-main" onClick={()=>setSelected(p.id)}><span className="parking-icon">P</span><span><b>{p.tags.name}</b><small>{p.status==="unmetered_now"?"Free / unenforced":p.rate_per_hour!=null?"$"+p.rate_per_hour.toFixed(2)+"/hr":"Rate unknown"} · {p.walk_minutes} min walk</small><small className={"band "+p.availability?.band}>{p.status==="unmetered_now"?"Outside enforcement hours":p.availability?.p_available!=null?Math.round(p.availability.p_available*100)+"% estimated available · "+p.availability.band:"Availability unknown"}</small>{p.limit_exceeded&&<small className="warning">Stay exceeds meter limit</small>}</span><strong>{p.miles.toFixed(2)}<small>mi away</small></strong></button>{selected===p.id&&<div className="details"><MeterDetails spot={p}/><a target="_blank" rel="noreferrer" href={"https://www.google.com/maps/dir/?api=1&destination="+p.lat+","+p.lng+"&travelmode=driving"}>Get directions ↗</a></div>}</article>)}
 <ParkingChat center={center} onResults={d=>{setChat(d);setSelected(null);setFee("all")}}/>
 <footer>Availability probabilities are historical estimates derived from City of San Diego payment transactions, not real-time parking sensors. Disabled placard holders and non-paying vehicles are not captured in payment feeds. Walking times are straight-line approximations. Check posted signs.{active?.data_as_of&&<p>Data as of {active.data_as_of}</p>}</footer>
 </aside><section className="map-panel" aria-label="Parking map"><ParkingMap center={mapCenter} radius={(chat?.query?.radius_m||radius)/1609.344} places={results} selected={selected} onSelect={setSelected} onCenter={move}/><div className="map-label"><i/> Exploring {mapCenter.name}</div><div className="map-tip">Click to search · Green: likely · Amber: possible · Red: unlikely · Blue: unenforced</div></section></main></div>
}
