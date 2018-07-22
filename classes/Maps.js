let Position = require('./Position');

let solidSquare = function(bots){
  this.width = Math.round(Math.sqrt(bots));
  this.height = Math.round(Math.sqrt(bots));
  this.map = [];
  this.init = function() {
    this.virtualOrigin = new Position (Math.round(this.width/2), Math.round(this.height/2))
    this.map = new Array(this.width);
    for(let i = 0; i < this.width; i++) {
      this.map[i] = new Array(this.height);
      for(let j = 0; j < this.height; j++) {
        this.map[i][j] = {
          target: true,
          occupied: false,
          virtualLocation: new Position(i, j)
        }
      }
    }
  }
};

module.exports = {"solidSquare": solidSquare};

