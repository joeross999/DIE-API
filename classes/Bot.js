var Bot = function(pos, address) {
  this.position = pos;
  this.subscribers = [];
  this.address = address;

  // Broadcasts single message to all bots in range
  this.broadcastMessage = function(message) {
    comSystem.broadcastMessage(this.address, message);
  }

  this.receiveMessage = function (message, sender) {

  }

  this.move = function(x, y) {
      this.position.move(x, y)
    }
  }

Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;