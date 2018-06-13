var Position =  require('./classes/Position');
var main = {};

main.init = function(){
  var points = generateRandomPoints(100, 100, 100);
  return points
};


function generateRandomPoints(numPoints, worldX, worldY) {
  let points = [];
  for(var i = 0; i < numPoints; i ++){
    var x = Math.floor(Math.random() * (worldX - 1));
    var y = Math.floor(Math.random() * (worldY - 1));
    newPoint = new Position(x, y);
    points.push(newPoint);
  }
  return points;
}




module.exports = main;