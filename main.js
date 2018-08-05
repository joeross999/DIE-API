var Position = require('./classes/Position');
var Bot = require('./classes/Bot.js');
var ComSystem = require('./classes/ComSystem.js');
var Maps = require('./classes/Maps.js');
var helpers = require('./helpers');
const f = require('util').format;
var MongoClient = require('mongodb').MongoClient;

// Database setup
const user = encodeURIComponent('tester1');
const password = encodeURIComponent('tester1');
const authMechanism = 'DEFAULT';
const dbURL = f('mongodb://%s:%s@ds111082.mlab.com:11082/distributed-intelligence-experiment?authMechanism=%s',
  user, password, authMechanism);

var main = {};
var bots = [];
let db = {};


main.init = function (data, res, userID) {
  global.world = data;
  global.world.patternType = "checkerboardSquare"
  let pattern = new Maps[world.patternType](world.numberOfBots);
  bots = [];
  setupWorld(world);
  var points = generatePoints(world.numberOfBots, world.spawnRange);
  // TODO generate random addresses
  for (var i = 0; i < world.numberOfBots; i++) {
    newPattern = Object.assign({}, pattern);
    newPattern.init = pattern.init;
    bots.push(new Bot(points[i], i, newPattern));
  }

  // Initialize Communication System
  global.comSystem = new ComSystem(bots, world.wirelessRange);

  setBotColor();
  db.remove({
    "userID": userID
  }, dbURL, continueInit, res, userID)
};

main.frame = function (res, userID) {
  db.find({
    "userID": userID
  }, dbURL, continueFrame, res, userID);
}

function continueInit(res, userID) {
  db.insert({
    "userID": userID,
    "world": global.world,
    // "bots": bots,
    "bots": bots.map(bot => {
      return {
        'pos': bot.position,
        'address': bot.address,
        'origin': bot.origin,
        'lastTurnNeigborsLength': bot.lastTurnNeigborsLength
      }
    })
  }, dbURL, finishInit, res);
}

function finishInit(res) {
  res.json({
    "bots": bots.map(bot => {
      return {
        'pos': bot.position,
        'color': bot.color
      }
    }),
    "world": global.world
  });
}

function continueFrame(doc, res, userID) {
  global.world = doc.world;
  let pattern = new Maps[world.patternType](world.numberOfBots);
  bots = [];
  for(let i = 0; i < doc.bots.length; i++){
    elem = doc.bots[i];
    newPattern = Object.assign({}, pattern);
    newPattern.init = pattern.init;
    newBot = new Bot(new Position(elem.pos.x, elem.pos.y), elem.address, newPattern);
    newBot.origin = new Position(elem.origin.x, elem.origin.y);
    newBot.lastTurnNeigborsLength = elem.lastTurnNeigborsLength;
    bots.push(newBot);
  };
  global.comSystem = new ComSystem(bots, world.wirelessRange);
  comSystem.setSubscriberList();
  sendMessages();
  postCommunication();
  moveBots();
  cleanupBots();
  setBotColor();
  db.update({
    "userID": userID
  }, {
    $set: {
      "bots": bots.map(bot => {
        return {
          'pos': bot.position,
          'address': bot.address,
          'origin': bot.origin,
          'lastTurnNeigborsLength': bot.lastTurnNeigborsLength
        }
      })
    }
  }, dbURL, finishFrame, res);
}

function finishFrame(res) {
  res.json(bots.map(bot => {
    return {
      'pos': bot.position,
      'color': bot.color
    }
  }));
}

function moveBots() {
  for (var i = 0; i < bots.length; i++) {
    bots[i].targetCheck();
  }
  for (var i = 0; i < bots.length; i++) {
    bots[i].assemblePattern();
  }
}

function postCommunication() {
  for (var i = 0; i < bots.length; i++) {
    bots[i].postCommunication();
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
    switch (bots[i].lastTurnNeigborsLength) {
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


db.insert = function (obj, url, callback, browserResult) {
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("distributed-intelligence-experiment");
    dbo.collection("worlds").insertOne(obj, function (err, res) {
      if (err) throw err;
      db.close();
      callback(browserResult);
    });
  });
}

db.update = function (query, newValues, url, callback, browserResult) {
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("distributed-intelligence-experiment");
    dbo.collection("worlds").updateOne(query, newValues, function (err, res) {
      if (err) throw err;
      db.close();
      callback(browserResult);
    });
  });
}

db.find = function (query, url, callback, browserResult, userID) {
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("distributed-intelligence-experiment");
    dbo.collection("worlds").findOne(query, function (err, res) {
      if (err) throw err;
      db.close();
      callback(res, browserResult, userID);
    });
  });
}

db.remove = function (query, url, callback, browserResult, userID) {
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("distributed-intelligence-experiment");
    dbo.collection("worlds").deleteMany(query, function (err, res) {
      if (err) throw err;
      db.close();
      callback(browserResult, userID);
    });
  });
}


module.exports = main;