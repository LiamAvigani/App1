export function parkingColor(spot){
 if(spot.status==="unmetered_now")return "free";
 const band=spot.availability?.band;
 return ["likely","possible","unlikely"].includes(band)&&Number.isFinite(spot.availability?.p_available)?band:"unknown";
}
