var Position = require('./classes/Position');
var Bot = require('./classes/Bot.js');
var ComSystem = require('./classes/ComSystem.js');
var helpers = require('./helpers');
var main = {};
var bots = [];
var wirelessRange = 3;
var world = {
  x: 10,
  y: 10
};
var numberOfBots = 5;

main.init = function () {
  bots = [];
  var points = generatePoints(numberOfBots, world.x, world.y);
  // TODO generate random addresses

  for (var i = 0; i < numberOfBots; i++) {
    bots.push(new Bot(points[i], i));
  }

  // Initialize Communication System
  global.comSystem = new ComSystem(bots, wirelessRange);
  // global.comSystem.setupMap(bots);

  setBotColor();
  
  return bots
};

main.frame = function () {
  comSystem.setSubscriberList();
  sendMessages();
  setTimeout(function(){}, 1000)
  setBotColor();
  moveBots();

  return bots;
}


main.test = function () {
  var points = generatePoints(numberOfBots, world.x, world.y);

  for (var i = 0; i < numberOfBots; i++) {
    bots.push(new Bot(points[i], i));
  }

  setSubscriberList();
  return bots;
}

function moveBots() {
  for (var i = 0; i < bots.length; i++) {
    if(bots[i].neighbors.length === 0) {
      bots[i].move(1,1);
    } else if(bots[i].neighbors.length < 2) {
      bots[i].move(0, -1);
    } else {
      bots[i].move(5,0)
    }
  }
}

function generatePoints(numBots, worldX, worldY) {
  let points = [];
  for (var i = 0; i < numBots; i++) {
    var x = Math.floor(Math.random() * (worldX));
    var y = Math.floor(Math.random() * (worldY));
    newPoint = new Position(x, y);
    if (!points.containsEqual(newPoint)) {
      points.push(newPoint);
    } else {
      i--;
    }
  }
  return points;
}

function setBotColor() {
  for (var i = 0; i < bots.length; i++) {
    switch (bots[i].neighbors.length) {
      case 0:
        bots[i].color = "black";
        break;
      case 1:
        bots[i].color = "red";
        break;
      case 2:
        bots[i].color = "orange";
        break;
      case 3:
        bots[i].color = "yellow";
        break;
      case 4:
        bots[i].color = "green";
        break;
      case 5:
        bots[i].color = "blue";
        break;
      default:
        bots[i].color = "purple";
    }
  }
}

function sendMessages() {
  for (var i = 0; i < bots.length; i++) {
    bots[i].sendMessages(bots[i].position);
  }
}

module.exports = main;