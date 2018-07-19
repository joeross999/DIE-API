var Message = require('./Message.js');

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
      this.calcOrigin(cluster);
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
    // Move in roaming pattern
  }
  
  this.assemblePattern = function() {
    // Move in direction to form pattern
  }

  this.calcOrigin = function(cluster) {
    // Calculate origin of cluster
  }
}


Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;