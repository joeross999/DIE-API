var ComSystem = require('./classes/ComSystem.js');

var Message = function(sender, message) {
  this.sender = sender;
  this.message = message;
  this.id = ComSystem.newMessageID();
}