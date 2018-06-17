var Bot = function(pos, address) {
  this.position = pos;
  this.subscribers = [];
  this.address = address;
  this.sendMessage = function () {
    comSystem.sendMessage();
  }

  this.move = function(x, y) {
    this.position.move(x, y)
  }
}

Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;