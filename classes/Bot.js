var Bot = function(pos, address) {
  this.position = pos;
  this.subscribers = [];
  this.address = address;

  // Sends Single message to single target
  this.sendMessage = function (target, message) {
    comSystem.sendMessage(this.address, target, message);
  }

  // Broadcasts single message to all bots in range
  this.broadcastMessage = function(message) {
    for (var i = 0; i < this.subscribers.length; i++) {
      this.sendMessage(this.subscribers[i], message);
    }
  }

  this.receiveMessage = function (message, sender) {
    if(sender === 0){
      // console.log("Sender: " + sender);
      // console.log("\tMessage: " + message);
    }
  }

  this.move = function(x, y) {
    this.position.move(x, y)
  }
}

Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;