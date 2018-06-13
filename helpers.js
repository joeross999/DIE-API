
Array.prototype.containsEquals = function(other){
  // Only works if every element of array and other array have equals functions that return true if the object is equal the one passed.
  for(var i = 0; i < this.length; i++) {
    if(!this[i].equals(this[i], other)){return false};
    return true;
  }
}

console.log("Helpers.js Loaded...");