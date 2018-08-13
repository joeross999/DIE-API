// var ComSystem = require('./ComSystem.js');

var Message = function(sender, text, type, userID) {
  this.type = type
  this.originalSender = sender;
  this.text = text;
  this.id = global[userID].comSystem.newMessageID();
}

module.exports = Message;