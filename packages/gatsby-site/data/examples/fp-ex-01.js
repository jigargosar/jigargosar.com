const assert = require("assertion");

var absoluteValue = function(num) {
  return Math.abs(num);
}
// And please don't break my unit tests.
assert.equal(absoluteValue(-4), 4);
assert.equal(absoluteValue(16), 16);
