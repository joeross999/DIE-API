// var ComSystem = require('./ComSystem.js');

var Message = function(sender, text, type) {
  this.type = type
  this.originalSender = sender;
  this.text = text;
  this.id = comSystem.newMessageID();
}

module.exports = Message;