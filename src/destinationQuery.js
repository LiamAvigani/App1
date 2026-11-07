export function destinationQuery(text){
 const input=text.trim().replace(/[.!?]+$/,"");
 const explicit=input.match(/\b(?:near|around|going to|go to|heading to|headed to|take me to|pin (?:at|on)|destination (?:is|to)|parking at)\s+(.+)/i);
 let place=explicit?.[1];
 if(!place&&/^(?:i want to go to|i wanna go to|i want parking at)\s+/i.test(input))place=input.replace(/^(?:i want to go to|i wanna go to|i want parking at)\s+/i,"");
 if(!place&&!/\b(parking|garage|garages|meters?|free|paid|within|today|tomorrow|hours?|minutes?|show|only|closer|cheaper|here|there|location|pin|price|available|availability|why|how|what)\b/i.test(input)&&input.split(/\s+/).length<=10)place=input;
 if(!place)return null;
 place=place.split(/\s+(?:today|tomorrow|tonight|within|for\s+\d|at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)|and\s+(?:find|show|look))\b/i)[0].trim();
 if(/^(?:me|here|there|my location|the pin|this location|that location)$/i.test(place))return null;
 return place.replace(/\s+on\s+(?=.+(?:avenue|ave|street|st|road|rd|blvd|boulevard)\b)/i,", ")||null;
}
