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
