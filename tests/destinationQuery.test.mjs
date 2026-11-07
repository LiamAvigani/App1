import test from "node:test";
import assert from "node:assert/strict";
import {destinationQuery} from "../src/destinationQuery.js";
test("extracts a named destination independently of previous pin",()=>{
 assert.equal(destinationQuery("Garages near Petco Park tomorrow at 7pm for 2 hours"),"Petco Park");
 assert.equal(destinationQuery("I wanna go to Target"),"Target");
 assert.equal(destinationQuery("Target"),"Target");
 assert.equal(destinationQuery("parking near Target on Balboa Avenue"),"Target, Balboa Avenue");
});
test("preserves current pin for local follow-ups",()=>{
 assert.equal(destinationQuery("free parking near me"),null);
 assert.equal(destinationQuery("within 2 miles"),null);
 assert.equal(destinationQuery("garages only"),null);
});
import {resolvedDestination,isLocalFollowup} from "../src/destinationQuery.js";
test("UCSD with natural arrival wording resolves campus name",()=>{
 assert.equal(destinationQuery("ucsd today this afternoon"),"ucsd");
 assert.equal(destinationQuery("UCSD tomorrow at 3pm"),"UCSD");
 assert.equal(destinationQuery("I want to go UCSD today"),"UCSD");
});
test("backend resolved destination replaces stale dropped pin",()=>{
 const previous={lat:32.7157,lng:-117.1611,name:"Dropped pin"};
 const campus={lat:32.8792438,lon:-117.2311247};
 assert.equal(resolvedDestination(null,campus,previous).lat,campus.lat);
 assert.equal(resolvedDestination(null,campus,previous).lng,campus.lon);
 assert.equal(resolvedDestination(null,campus,previous,true),previous);
 assert.equal(isLocalFollowup("parking near me"),true);
 assert.equal(isLocalFollowup("ucsd today this afternoon"),false);
});
