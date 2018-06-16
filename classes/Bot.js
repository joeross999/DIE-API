

var Bot = function(pos) {
  this.position = pos;
  this.subscribers = [];

  this.start = function () {

  }

  this.frame = function () {
    this.subscribers = [];

  }

}

module.exports = Bot;