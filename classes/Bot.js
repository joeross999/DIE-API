var Message = require('./Message.js');
var Position = require('./Position.js');

var Bot = function (pos, address) {
  this.position = pos;
  this.address = address;
  this.receivedMessages = []
  this.neighbors = [];
  this.origin = pos;
  this.lastTurnNeigborsLength = 0;
  this.moveCounter = 0;
  
  // Broadcasts single message to all bots in range
  this.broadcastMessage = async function (message) {
    this.receivedMessages.push(message.id);
    comSystem.broadcastMessage(this.address, message);
  }
  
  this.createMessage = function (message) {
    return new Message(this.address, message);
  }
  
  this.sendMessages = function (message) {
    this.broadcastMessage(this.createMessage(message));
  }
  
  this.receiveMessage = function (message) {
    if (!this.receivedMessages.includes(message.id)) {
      this.neighbors.push(message.text);
      this.broadcastMessage(message);
    }
  }
  
  this.cleanup = function() {
    this.moveCounter++;
    if(this.neighbors.length > this.lastTurnNeigborsLength) {
      this.moveCounter = 0;
      let cluster = this.neighbors.slice();
      cluster.push(this.position);
      this.origin = this.calcOrigin(cluster);
    }
    this.lastTurnNeigborsLength = this.neighbors.length;
    this.neighbors = [];
    this.receivedMessages = [];
  }

  this.move = function (x, y) {
    this.position.move(x, y)
  }
  this.randomMove = function () {
    // TODO Move the origin and bot in a random direction.
  }
  
  this.spiralMove = function () {
    // TODO Move the bot in the spiral pattern
  }
  
  this.roam = function () {
    // TODO Move in roaming pattern
  }
  
  this.assemblePattern = function() {
    // TODO Move in direction to form pattern
  }

  this.calcOrigin = function(cluster) {
    totalX = 0;
    totalY = 0;
    for (let i = 0; i < cluster.length; i++){
      totalX += cluster[i].x;
      totalY += cluster[i].y;
    }
    return new Position(Math.floor(totalX/cluster.length), Math.floor(totalY/cluster.length));
  }

  this.moveTowards = function(target){    
    if(this.position.equals(target)) {
      return new Position(0,0);
    }
    let angleIncrement = Math.PI/4;
    let targetAngle = Math.round(Math.atan2(this.position.xDistance(target), this.position.yDistance(target)) / angleIncrement) * angleIncrement;
    this.move(Math.round(Math.sin(targetAngle)), Math.round(Math.cos(targetAngle)));
  }
}


Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;