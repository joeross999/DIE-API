var ComSystem = function(bots, wirelessRange){
  this.wirelessRange = wirelessRange
  this.bots = bots;
  this.nextMessageID = 0;
  this.map = {};
  this.setupMap = function(bots){
    for (var i = 0; i < bots.length; i++) {
      this.map[bots[i].address] = {
        'bot': bots[i],
        'subscribers': []
      }
    }
  };
  this.sendMessage = function(sender, recipient, message) {
    this.map[recipient].bot.receiveMessage(message, sender);
  };

  this.setSubscriberList = function() {
    for (var i = 0; i < this.bots.length; i++) {
      this.map[this.bots[i].address].subscribers = [];
      for (var j = i + 1; j < this.bots.length; j++) {
        if (this.bots[i].position.distance(this.bots[j].position) <= this.wirelessRange) {
          this.map[this.bots[i].address].subscribers.push(this.bots[j].address);
          this.map[this.bots[j].address].subscribers.push(this.bots[i].address);
        }
      }
    }
  }

  this.broadcastMessage = function(sender, message) {
    for (var i = 0; i < this.map[sender].subscribers.length; i++) {
      this.sendMessage(sender, this.map[sender].subscribers[i], message);
    }
  }

  this.newMessageID = function(){
    var id = nextMessageID;
    nextMessageID++;
    return id;
  };
  this.setupMap(bots);
}
module.exports = ComSystem;