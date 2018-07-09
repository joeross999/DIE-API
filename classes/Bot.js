var Message = require('./Message.js');

var Bot = function(pos, address) {
  this.position = pos;
  this.subscribers = [];
  this.address = address;

  // Broadcasts single message to all bots in range
  this.broadcastMessage = function(message) {
    comSystem.broadcastMessage(message);
  }

  this.createMessage = function(message) {
    return new Message(this.address, message);
  }

  this.sendMessages = function(message) {
    this.broadcastMessage(this.createMessage(message));
  }

  this.receiveMessage = function (message) {
      console.log(message);
  }

  this.move = function(x, y) {
      this.position.move(x, y)
    }
  }

Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;