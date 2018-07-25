let Position = require('./Position');

let solidSquare = function (bots) {
  this.width = Math.round(Math.sqrt(bots));
  this.height = Math.round(Math.sqrt(bots));
  this.size = bots;
  this.map;

  this.init = function () {
    this.virtualOrigin = new Position(Math.round(this.width / 2), Math.round(this.height / 2))
    let counter = 0;
    this.map = [];
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.map[counter] = {
          isTarget: true,
          isOccupied: false,
          virtualLocation: new Position(i, j)
        };
        counter++;
      };
    };
  }
};

let checkerboardSquare = function (bots) {
  this.width = Math.round(Math.sqrt(bots)) * 2;
  this.height = Math.round(Math.sqrt(bots)) * 2;
  this.size = bots * 2;
  this.map;

  this.init = function () {
    this.virtualOrigin = new Position(Math.round(this.width / 2), Math.round(this.height / 2))
    let counter = 0;
    this.map = [];
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.map[counter] = {
          isTarget: (i%2 == 1 && j%2 == 1) || (i%2 == 0 && j%2 == 0),
          isOccupied: false,
          virtualLocation: new Position(i, j)
        };
        counter++;
      };
    };
  }
};

module.exports = {
  "solidSquare": solidSquare,
  "checkerboardSquare": checkerboardSquare
};