var ComSystem = function(bots){
  this.map = {}
  this.setupMap = function(bots){
    for (var i = 0; i < bots.length; i++) {
      addition = {};
      addition[bots[i].address] = bot[i];
    }
  }
  this.sendMessage = function(sender, recipient ) {
    
  }
}
module.exports = ComSystem;