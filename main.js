var Position = require('./classes/Position');
var Bot = require('./classes/Bot.js');
var ComSystem = require('./classes/ComSystem.js');
var helpers = require('./helpers');
var main = {};
var bots = [];
var world = {};

main.init = function (data) {
  world = data;
  bots = [];
  setupWorld(world);
  var points = generatePoints(world.numberOfBots, world.spawnRange);
  // TODO generate random addresses

  for (var i = 0; i < world.numberOfBots; i++) {
    bots.push(new Bot(points[i], i));
  }

  // Initialize Communication System
  global.comSystem = new ComSystem(bots, world.wirelessRange);


  setBotColor();

  return {
    "bots": bots,
    "world": world.worldBounds
  };
};

main.frame = function () {
  comSystem.setSubscriberList();
  sendMessages();
  moveBots();
  cleanupBots();
  setBotColor();
  return bots;
}

function moveBots() {
  for (var i = 0; i < bots.length; i++) {
    if (bots[i].neighbors.length === 0) {
      bots[i].move(1, 1);
    } else if (bots[i].neighbors.length < 2) {
      bots[i].move(0, -1);
    } else {
      bots[i].move(5, 0)
    }
  }
}

function generatePoints(numBots, spawnRange) {
  let points = [];
  for (var i = 0; i < numBots; i++) {
    var x = Math.floor(Math.random() * (spawnRange.x.max - spawnRange.x.min)) + spawnRange.x.min;
    var y = Math.floor(Math.random() * (spawnRange.y.max - spawnRange.y.min)) + spawnRange.y.min;
    newPoint = new Position(x, y);
    if (!points.containsEqual(newPoint)) {
      points.push(newPoint);
    } else {
      i--;
    }
  }
  return points;
}

function setupWorld(world) {
  world.spawnRange = {
    x: {},
    y: {}
  }
  world.spawnRange.x.min = world.worldBounds.x / 4;
  world.spawnRange.x.max = world.worldBounds.x / 4 * 3;
  world.spawnRange.y.min = world.worldBounds.y / 4;
  world.spawnRange.y.max = world.worldBounds.y / 4 * 3;
}

function setBotColor() {
  for (var i = 0; i < bots.length; i++) {
    switch (bots[i].moveCounter) {
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

function cleanupBots() {
  for (var i = 0; i < bots.length; i++) {
    bots[i].cleanup();
  }
}

module.exports = main;