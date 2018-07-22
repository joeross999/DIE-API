var Position = function(x,y) {
  this.x = x;
  this.y = y;
  this.objectType = "position";
  
  this.moveTo = function(x, y) {
    this.x = x;
    this.y = y;
  }
  this.move = function (x, y) {
    this.x += x;
    this.y += y;
  }
}

Position.prototype.equals = function(other) {
  if(this.objectType === other.objectType && this.x === other.x && this.y === other.y) {
    return true;
  }
  return false;
}

Position.prototype.distance = function(other) {
  const dx = this.x - other.x;
  const dy = this.y - other.y;
  return Math.hypot(dx, dy);
}

Position.prototype.xDistance = function(other) {
   return other.x - this.x;
}

Position.prototype.yDistance = function(other) {
   return other.y - this.y;
}

module.exports = Position;