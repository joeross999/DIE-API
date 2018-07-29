var Message = require('./Message.js');
var Position = require('./Position.js');
var PathFinding = require('pathfinding');

var Bot = function (pos, address, pattern) {
  this.position = pos;
  this.address = address;
  this.receivedMessages = []
  this.neighbors = [];
  this.origin = pos;
  this.lastTurnNeigborsLength = 0;
  this.moveCounter = 0;
  this.pattern = pattern;
  this.pattern.init();

  // Broadcasts single message to all bots in range
  this.broadcastMessage = async function (message) {
    this.receivedMessages.push(message.id);
    comSystem.broadcastMessage(this.address, message);
  }

  this.createMessage = function (message) {
    return new Message(this.address, message);
  }

  this.sendMessages = function (message) {
    this.broadcastMessage(this.createMessage(message));
  }

  this.receiveMessage = function (message) {
    if (!this.receivedMessages.includes(message.id)) {
      this.neighbors.push(message.text);
      this.broadcastMessage(message);
    }
  }

  this.postCommunication = function() {
    this.moveCounter++;
    if (this.neighbors.length != this.lastTurnNeigborsLength) {
      this.moveCounter = 0;
      let cluster = this.neighbors.slice();
      cluster.push(this.position);
      this.origin = this.calcOrigin(cluster);
    }
    this.mapPattern();
  }

  this.cleanup = function () {
    this.lastTurnNeigborsLength = this.neighbors.length;
    this.neighbors = [];
    this.receivedMessages = [];
  }

  // Moves Bot in specified direction
  // Move is prevented if target position is occupied
  // Returns true if move is executed, false otherwise
  this.move = function (x, y) {
    let target = new Position(this.position.x, this.position.y);
    target.move(x, y);
    if (!comSystem.spaceOccupied(target)) {
      this.position.move(x, y);
      return true;
    }
    return false;
  }

  this.roam = function () {
    // TODO Move in roaming pattern
  }

  this.getVirtualLocation = function (position) {
    let node = this.pattern.map[0]
    let offset = {
      x: node.location.xDistance(node.virtualLocation),
      y: node.location.yDistance(node.virtualLocation)
    };
    let virtualLocation = new Position(position.x, position.y);
    virtualLocation.move(offset.x, offset.y);
    return virtualLocation;
  }

  this.assemblePattern = function () {
    let path = this.findPath(this.chooseTarget());
  }

  this.findPath = function(target) {
    let grid = new PathFinding.Grid(world.worldBounds.x, world.worldBounds.y);
    var finder = new PathFinding.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true
    });
    for(let i = 0; i < this.neighbors.length; i++) {
      let v = this.neighbors[i];
        grid.setWalkableAt(v.x, v.y, !comSystem.spaceOccupied(v));
    }

    let me = this.position;

    return finder.findPath(me.x, me.y, target.x, target.y, grid);
  }

  this.mapPattern = function () {
    for (let i = 0; i < pattern.size; i++) {
      elem = pattern.map[i];
      elem.location = new Position(elem.virtualLocation.x, elem.virtualLocation.y)
      elem.location.move(pattern.virtualOrigin.xDistance(this.origin), pattern.virtualOrigin.yDistance(this.origin));
    }
  }

  this.chooseTarget = function () {
    // Choose target from open options
    let targetDistance = 0;
    let minimunNumberOfTargets = 5;
    let eligibleTargets = []
    while (eligibleTargets.length <= minimunNumberOfTargets) {
      eligibleTargets = this.chooseEligibleTargets(targetDistance);
      targetDistance++;
    }
    // Choose target from open options
    let nearestTarget = {
      "target": eligibleTargets[0].location,
      "priorityScore": this.determinePriority(eligibleTargets[0].location.distance(this.position), eligibleTargets[0].priority)
    };
    for (let i = 0; i < eligibleTargets.length; i++) {
      elem = eligibleTargets[i];
      if(elem.isTarget && !elem.isOccupied) {
        let priorityScore = this.determinePriority(elem.location.distance(this.position), elem.priority);
        if(priorityScore > nearestTarget.priorityScore) {
          nearestTarget.target = elem.location;
          nearestTarget.priorityScore = priorityScore;
        }
      }
    }
    return nearestTarget.target;
  }

  this.chooseEligibleTargets = function (eligibleDistance) {
    let eligibleTargets = [];
    for (let i = 0; i < this.pattern.map.length; i++) {
      let elem = this.pattern.map[i];
      if (elem.virtualLocation.xDistance(this.pattern.virtualOrigin) <= eligibleDistance &&
        elem.virtualLocation.yDistance(this.pattern.virtualOrigin) <= eligibleDistance &&
        elem.isTarget == true && elem.isOccupied == false) {
        eligibleTargets.push(elem);
      }
    }
    return eligibleTargets;
  }

  this.determinePriority = function(distance, priority) {
    return (1/(distance + 1)) + 2/priority;
  }

  this.reachTarget = function () {
    // Send message to other bots to inform them that a target has been filled
  }

  this.acceptReachTarget = function (target) {
    // Check if filled target was yours, if so replace your target.

  }

  this.calcOrigin = function (cluster) {
    totalX = 0;
    totalY = 0;
    for (let i = 0; i < cluster.length; i++) {
      totalX += cluster[i].x;
      totalY += cluster[i].y;
    }
    return new Position(Math.floor(totalX / cluster.length), Math.floor(totalY / cluster.length));
  }

}


Bot.prototype.comSystem = global.comSystem;

module.exports = Bot;