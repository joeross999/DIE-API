let Position = require('./Position');

let solidSquare = function (bots) {
  this.size = bots;
  this.width = Math.sqrt(size);
  this.map;

  this.init = function () {
    this.virtualOrigin = new Position(Math.round(this.width / 2), Math.round(this.width / 2))
    let counter = 0;
    this.map = [];
    for (let i = 0; i < this.size; i++) {
      let virtualLocation = new Position(i % this.width, Math.floor(i / this.width));
      this.map[counter] = {
        isTarget: true,
        isOccupied: false,
        priority: virtualLocation.distance(this.virtualOrigin) + 1,
        virtualLocation: virtualLocation
      };
      counter++;
    };
  }
};

let checkerboardSquare = function (bots) {
  this.size = bots * 2;
  this.width = Math.sqrt(this.size);
  this.map;

  this.init = function () {
    this.virtualOrigin = new Position(Math.round(this.width / 2), Math.round(this.width / 2))
    let counter = 0;
    this.map = [];
    for (let i = 0; i < this.size; i++) {
      let x = i % this.width
      let y = Math.floor(i / this.width)
      let virtualLocation = new Position(x, y);
      this.map[counter] = {
        isTarget: (x % 2 == 1 && y % 2 == 1) || (x % 2 == 0 && y % 2 == 0),
        isOccupied: false,
        priority: virtualLocation.distance(this.virtualOrigin) + 1,
        virtualLocation: virtualLocation
      };
      counter++;
    };
  }
};

module.exports = {
  "solidSquare": solidSquare,
  "checkerboardSquare": checkerboardSquare
};