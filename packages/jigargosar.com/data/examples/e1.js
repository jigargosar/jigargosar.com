var absoluteValue = function(num){
  return Math.abs(num);
}
// And please don't break my unit tests.
assert.equals(absoluteValue(-4), 4);
assert.equals(absoluteValue(16), 16);
