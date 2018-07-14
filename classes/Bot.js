var Message = require('./Message.js');

var Bot = function(pos, address) {
  this.position = pos;
  this.address = address;
  this.receivedMessages = []
  this.neighbors = [];

  // Broadcasts single message to all bots in range
  this.broadcastMessage = async function(message) {
    this.receivedMessages.push(message.id);
    comSystem.broadcastMessage(this.address, message);
  }

  this.createMessage = function(message) {
    return new Message(this.address, message);
  }

  this.step = function() {
    this.neighbors = [];
    this.receivedMessages = [];
  }

  this.sendMessages = function(message) {
    this.broadcastMessage(this.createMessage(message));
  }
  this.receiveMessage = function (message) {
    if(!this.receivedMessages.includes(message.id)){
      this.neighbors.push(message.text);
      this.broadcastMessage(message);
    }
  }

  this.move = function(x, y) {
      this.position.move(x, y)
    }
  }

Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;