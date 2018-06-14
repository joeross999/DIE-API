var Position =  require('./classes/Position');
var Bot = require('./classes/Bot.js');
var helpers = require('./helpers');
var main = {};
var bots = [];
var wirelessRange = 5;

main.init = function(){
  var points = generateRandomPoints(100, 100, 100);
  bots = points.map(function(pos) {
    return new Bot(pos);
  });
  return points
};

main.frame = function() {
  // Clear subscriber list
  for(var i = 0; i < bots.length; i++) {
    bots[i].subscribers = [];
    bots[i].position.move(1,1);
  }
  for (var i = 0; i < bots.length; i++) {
    for (var j = i + 1; j < bots.length; j++) {
      if(bots[i].position.distance(bots[j])) {
        bots[i].subscribers.push(bots[j]);
        bots[j].subscribers.push(bots[i]);
      }
    }
  }
  return bots;
}

function generateRandomPoints(numPoints, worldX, worldY) {
  let points = [];
  for(var i = 0; i < numPoints; i ++){
    var x = Math.floor(Math.random() * (worldX));
    var y = Math.floor(Math.random() * (worldY));
    newPoint = new Position(x, y);
    if(!points.containsEqual(newPoint)){
      points.push(newPoint);
    } else {
      i--;
    }
  }
  return points;
}


module.exports = main;