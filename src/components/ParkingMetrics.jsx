export default function ParkingMetrics({spot}){
 const p=spot;
 const offHours=p.status==="unmetered_now";
 const price=offHours?"Reported free":p.tags.fee==="no"?"Free":Number.isFinite(p.rate_per_hour)?"$"+p.rate_per_hour.toFixed(2):p.tags.fee==="yes"?"Paid":"Unknown";
 const priceNote=offHours?"Check posted payment rules":Number.isFinite(p.rate_per_hour)&&p.rate_per_hour>0?"per hour":p.tags.fee==="no"?"Mapped fee · check signs":"Hourly rate not provided";
 const probability=!offHours&&Number.isFinite(p.availability?.p_available)?Math.round(p.availability.p_available*100):null;
 return <span className="parking-metrics">
 <span className="parking-metric price-metric"><span className="metric-label">Parking price</span><strong className={"metric-value"+(price.length>10?" metric-text":"")}>{price}</strong><span className="metric-caption">{priceNote}</span></span>
 <span className={"parking-metric availability-metric "+(probability===null?"unknown":p.availability?.band||"unknown")}><span className="metric-label">Availability</span><strong className={"metric-value"+(probability===null?" metric-text":"")}>{probability===null?"Unknown":probability+"%"}</strong><span className="metric-caption">{probability===null?"No live vacancy data":"Historical estimate · "+(p.availability?.band||"unverified")}</span></span>
 </span>
}
