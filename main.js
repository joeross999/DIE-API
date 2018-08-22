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
let db = {};

main.init = function (data, res, userID) {
  global[userID].world = data;
  global[userID].world.patternType = "checkerboardSquare"
  let pattern = new Maps[global[userID].world.patternType](global[userID].world.numberOfBots);
  let bots = [];
  setupWorld(global[userID].world);
  var points = generatePoints(global[userID].world.numberOfBots, global[userID].world.spawnRange);
  // TODO generate random addresses
  for (var i = 0; i < global[userID].world.numberOfBots; i++) {
    newPattern = Object.assign({}, pattern);
    newPattern.init = pattern.init;
    bots.push(new Bot(points[i], i, newPattern, userID));
  }

  // Initialize Communication System
  global[userID].comSystem = new ComSystem(bots, global[userID].world.wirelessRange);

  setBotColor(userID);
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
    "world": global[userID].world,
    "bots": global[userID].comSystem.bots.map(bot => {
      return {
        'pos': bot.position,
        'address': bot.address,
        'origin': bot.origin,
        'lastTurnNeigborsLength': bot.lastTurnNeigborsLength,
        "target": bot.target
      }
    })
  }, dbURL, finishInit, res, userID);
}

function finishInit(res, userID) {
  let tempWorld = global[userID].world;
  let tempComsystem = global[userID].comSystem;
  cleanupServer(userID);
  res.json({
    "bots": tempComsystem.bots.map(bot => {
      return {
        'pos': bot.position,
        'color': bot.color
      }
    }),
    "world": tempWorld
  });
}

function continueFrame(doc, res, userID) {
  global[userID].world = doc.world;
  let pattern = new Maps[global[userID].world.patternType](global[userID].world.numberOfBots);
  let bots = [];
  for (let i = 0; i < doc.bots.length; i++) {
    elem = doc.bots[i];
    newPattern = Object.assign({}, pattern);
    newPattern.init = pattern.init;
    newBot = new Bot(new Position(elem.pos.x, elem.pos.y), elem.address, newPattern, userID);
    newBot.origin = new Position(elem.origin.x, elem.origin.y);
    if (elem.target) newBot.target = new Position(elem.target.x, elem.target.y);
    newBot.lastTurnNeigborsLength = elem.lastTurnNeigborsLength;
    bots.push(newBot);
  };
  global[userID].comSystem = new ComSystem(bots, global[userID].world.wirelessRange);
  global[userID].comSystem.setSubscriberList();
  sendMessages(userID);
  postCommunication(userID);
  moveBots(userID);
  cleanupBots(userID);
  setBotColor(userID);
  db.update({
    "userID": userID
  }, {
    $set: {
      "bots": global[userID].comSystem.bots.map(bot => {
        return {
          'pos': bot.position,
          'address': bot.address,
          'origin': bot.origin,
          'lastTurnNeigborsLength': bot.lastTurnNeigborsLength,
          "target": bot.target
        }
      })
    }
  }, dbURL, finishFrame, res, userID);
}

function finishFrame(res, userID) {
  let tempComsystem = global[userID].comSystem;
  cleanupServer(userID);
  res.json(tempComsystem.bots.map(bot => {
    return {
      'pos': bot.position,
      'color': bot.color
    }
  }));
}

function moveBots(userID) {
  for (var i = 0; i < global[userID].comSystem.bots.length; i++) {
    global[userID].comSystem.bots[i].targetCheck();
  }
  for (var i = 0; i < global[userID].comSystem.bots.length; i++) {
    global[userID].comSystem.bots[i].assemblePattern();
  }
}

function postCommunication(userID) {
  for (var i = 0; i < global[userID].comSystem.bots.length; i++) {
    global[userID].comSystem.bots[i].postCommunication();
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

function setBotColor(userID) {
  let bots = global[userID].comSystem.bots;
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

function sendMessages(userID) {
  for (var i = 0; i < global[userID].comSystem.bots.length; i++) {
    global[userID].comSystem.bots[i].sendMessages(global[userID].comSystem.bots[i].position);
  }
}

function cleanupBots(userID) {
  for (var i = 0; i < global[userID].comSystem.bots.length; i++) {
    global[userID].comSystem.bots[i].cleanup();
  }
}

function cleanupServer(userID) {
  delete global[userID];
}


db.insert = function (obj, url, callback, browserResult, userID) {
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("distributed-intelligence-experiment");
    dbo.collection("worlds").insertOne(obj, function (err, res) {
      if (err) throw err;
      db.close();
      callback(browserResult, userID);
    });
  });
}

db.update = function (query, newValues, url, callback, browserResult, userID) {
  MongoClient.connect(url, {
    useNewUrlParser: true
  }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("distributed-intelligence-experiment");
    dbo.collection("worlds").updateOne(query, newValues, function (err, res) {
      if (err) throw err;
      db.close();
      callback(browserResult, userID);
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