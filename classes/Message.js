// var ComSystem = require('./ComSystem.js');

var Message = function(sender, text) {
  this.originalSender = sender;
  this.text = text;
  this.id = comSystem.newMessageID();
}

module.exports = Message;