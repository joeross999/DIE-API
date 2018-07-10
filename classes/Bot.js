var Message = require('./Message.js');

var Bot = function(pos, address) {
  this.position = pos;
  this.subscribers = [];
  this.address = address;
  this.receivedMessages = []
  this.neighbors = [];

  // Broadcasts single message to all bots in range
  this.broadcastMessage = async function(message) {
    comSystem.broadcastMessage(this.address, message);
  }

  this.createMessage = function(message) {
    return new Message(this.address, message);
  }

  this.sendMessages = function(message) {
    this.neighbors = [];
    this.receivedMessages = [];
    this.broadcastMessage(this.createMessage(message));
  }
  this.receiveMessage = function (message) {
    if (this.address == 1) {console.log("message")}
    if(!this.receivedMessages.includes(message.id)){
      if (this.address == 1) {console.log("new message: " + message.id)};
      if (this.address == 1) {console.log(this.receivedMessages)};
      this.receivedMessages.push(message.id);
      if (this.address == 1) {console.log(this.receivedMessages)};
      this.neighbors.push(message.text);
      this.broadcastMessage(message);
    }
    if (this.address == 1) {console.log("neighbors: " + this.neighbors.length)}
    if (this.address == 1) {console.log(this.neighbors)}
  }

  this.move = function(x, y) {
      this.position.move(x, y)
    }
  }

Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;