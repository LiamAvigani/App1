const entries=[
 ["likely","Likely","60%+ estimated"],
 ["possible","Possible","30–59% estimated"],
 ["unlikely","Unlikely","Under 30% estimated"],
 ["free","Reported off-hours","Vacancy unknown"],
 ["unknown","Unknown","No availability data"],
 ["destination","Destination","Your movable search pin"]
];
export default function MapLegend(){
 return <section className="map-legend legend-horizontal" aria-label="Parking color guide">
 <div className="legend-heading"><strong>Parking colors</strong><span>Same colors on cards and map · estimates, not guaranteed spaces</span></div>
 <ul className="legend-row">{entries.map(([key,title,description])=><li key={key}><span className={"legend-swatch "+key} aria-hidden="true"/><span><strong>{title}</strong><small>{description}</small></span></li>)}</ul>
 </section>
}
