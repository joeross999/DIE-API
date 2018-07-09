var ComSystem = function(bots){
  this.nextMessageID = 0;
  this.map = {};
  this.setupMap = function(bots){
    for (var i = 0; i < bots.length; i++) {
      this.map[bots[i].address] = bots[i];
    }
  };
  this.sendMessage = function(sender, recipient, message) {
    // console.log(this.map)
    // console.log(recipient);
    // console.log(this.map[recipient]);

    this.map[recipient].receiveMessage(message, sender);
  };
  
  this.newMessageID = function(){
    var id = nextMessageID;
    nextMessageID++;
    return id;
  };
  this.setupMap(bots);
}
module.exports = ComSystem;