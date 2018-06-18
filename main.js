var Position = require('./classes/Position');
var Bot = require('./classes/Bot.js');
var ComSystem = require('./classes/ComSystem.js');
var helpers = require('./helpers');
var main = {};
var bots = [];
var wirelessRange = 5;
var world = {
  x: 100,
  y: 100
};
var numberOfBots = 100;

main.init = function () {
  bots = [];
  var points = generatePoints(numberOfBots, world.x, world.y);
  // TODO generate random addresses

  for (var i = 0; i < numberOfBots; i++) {
    bots.push(new Bot(points[i], i));
  }

  // Initialize Communication System
  global.comSystem = new ComSystem(bots);
  
  setBotColor();
  
  return bots
};

main.frame = function () {
  setSubscriberList();
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
    bots[i].sendMessage();
    if(bots[i].subscribers.length === 0) {
      bots[i].move(1,1);
    } else if(bots[i].subscribers.length < 2) {
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
    switch (bots[i].subscribers.length) {
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

function setSubscriberList() {
  for (var i = 0; i < bots.length; i++) {
    bots[i].subscribers = [];
  }
  for (var i = 0; i < bots.length; i++) {
    for (var j = i + 1; j < bots.length; j++) {
      if (bots[i].position.distance(bots[j].position) <= wirelessRange) {
        bots[i].subscribers.push(bots[j].address);
        bots[j].subscribers.push(bots[i].address);
      }
    }
  }
}

module.exports = main;