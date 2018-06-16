Array.prototype.containsEqual = function(other){
  // Only works if every element of array and other array have equals functions that return true if the object is equal the one passed.
  if(this.length < 1){return false;};
  for(var i = 0; i < this.length; i++) {
    if(this[i].equals(other)){return true};
  }
  return false;
}

console.log("Helpers.js Loaded...");