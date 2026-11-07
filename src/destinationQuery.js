export function destinationQuery(text){
 const input=text.trim().replace(/[.!?]+$/,"");
 // Extract the place independently of arrival wording: "UCSD today this afternoon".
 const withoutTime=input.split(/\s+(?:today|tomorrow|tonight|this\s+(?:morning|afternoon|evening)|next\s+(?:week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|within|for\s+\d|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i)[0].trim();
 const explicit=withoutTime.match(/\b(?:near|around|going to|go to|heading to|headed to|take me to|pin (?:at|on)|destination (?:is|to)|parking at|park at)\s+(.+)/i);
 let place=explicit?.[1];
 if(!place)place=withoutTime.replace(/^(?:(?:please\s+)?(?:i\s+)?(?:want|wanna|need)\s+(?:to\s+)?(?:go|head|drive)(?:\s+to)?|(?:please\s+)?(?:navigate|directions)\s+to)\s+/i,"");
 if(place===withoutTime&&!explicit&&/\b(parking|garage|garages|meters?|free|paid|within|today|tomorrow|hours?|minutes?|show|only|closer|cheaper|here|there|location|pin|price|available|availability|why|how|what)\b/i.test(place))return null;
 if(!place||place.split(/\s+/).length>16)return null;
 place=place.split(/\s+and\s+(?:find|show|look)\b/i)[0].trim();
 if(/^(?:me|here|there|my location|the pin|this location|that location)$/i.test(place))return null;
 return place.replace(/\s+on\s+(?=.+(?:avenue|ave|street|st|road|rd|blvd|boulevard)\b)/i,", ")||null;
}
export function isLocalFollowup(text){
 return /\b(near me|nearby|here|there|my location|this location|that location|current pin|dropped pin|closer|cheaper|only|within|any price|all streets)\b/i.test(text)&&!destinationQuery(text);
}
export function resolvedDestination(target,query,current,keepCurrent=false){
 if(target)return target;
 if(!keepCurrent&&Number.isFinite(query?.lat)&&Number.isFinite(query?.lon)){
  const changed=query.lat!==current.lat||query.lon!==current.lng;
  return {lat:query.lat,lng:query.lon,name:changed?"Requested destination":current.name};
 }
 return current;
}
