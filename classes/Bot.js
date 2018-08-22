var Message = require('./Message.js');
var Position = require('./Position.js');
var PathFinding = require('pathfinding');

var Bot = function (pos, address, pattern, userID) {
  this.userID = userID;
  this.position = pos;
  this.address = address;
  this.receivedMessages = []
  this.neighbors = [];
  this.origin = pos;
  this.lastTurnNeigborsLength = -1;
  this.moveCounter = 0;
  this.target = null;
  this.pattern = pattern;
  this.pattern.init();
  this.path = [];
  this.hasReachedTarget = false;
  this.hasRoamed = false;
  this.numComplete = 0;

  // Broadcasts single message to all bots in range
  this.broadcastMessage = async function (message) {
    this.receivedMessages.push(message.id);
    global[userID].comSystem.broadcastMessage(this.address, message);
  }

  this.createMessage = function (message, type) {
    return new Message(this.address, message, type, this.userID);
  }

  this.sendMessages = function (text) {
    this.broadcastMessage(this.createMessage(text, "position"));
  }

  this.receiveMessage = function (message) {
    if (!this.receivedMessages.includes(message.id)) {
      if (message.type === "position") {
        this.neighbors.push(message.text);
      }
      if (message.type === "targetReached") {
        this.acceptReachTarget(message.text);
      }
      if (message.type === "roamDirection") {
        if(!this.hasRoamed) this.roam(message.text);
      }
      this.broadcastMessage(message);
    }
  }

  this.postCommunication = function () {
    if (this.neighbors.length != this.lastTurnNeigborsLength) {
      let cluster = this.neighbors.slice();
      cluster.push(this.position);
      this.origin = this.calcOrigin(cluster);
      this.moveCounter = 0;
      this.hasReachedTarget = false;
      this.numComplete = 0;
      this.skipTargetCheck = true;
    }
    this.mapPattern();
  }

  this.cleanup = function () {
    this.lastTurnNeigborsLength = this.neighbors.length;
    this.neighbors = [];
    this.receivedMessages = [];
    this.hasRoamed = false;
  }

  // Moves Bot in specified direction
  // Move is prevented if target position is occupied
  // Returns true if move is executed, false otherwise
  this.move = function (x, y) {
    let target = new Position(this.position.x, this.position.y);
    target.move(x, y);
    if (!global[userID].comSystem.spaceOccupied(target)) {
      this.position.move(x, y);
      return true;
    }
    return false;
  }

  this.getDir = function () {
    return dir = (Math.ceil(2*Math.sqrt(Math.floor(this.moveCounter/Math.floor(Math.sqrt(this.neighbors.length + 1)))+1)) - 2) % 4;
  }

  this.roam = function (dir) {
    this.hasRoamed = true;
    switch (dir) {
      case 0:
        this.position.move(1, 0);
        this.origin.move(1, 0);
        break;
      case 1:
        this.position.move(0, -1);
        this.origin.move(0, -1);
        break;
      case 2:
        this.position.move(-1, 0);
        this.origin.move(-1, 0);
        break;
      case 3:
        this.position.move(0, 1);
        this.origin.move(0, 1);
        break;
    }
    this.moveCounter++;
  }

  this.moveToNext = function () {
    this.target = this.chooseTarget();
    if (this.position.equals(this.target)) {
      this.reachTarget();
    } else if (this.path.length > 0) {
      let next = this.path.shift();

      if (!this.moveTowards(next)) {
        this.createPath();
        if(this.path.length != 0) {
          this.moveToNext();
        }
      }
    }
  }

  this.assemblePattern = function () {
    if(((this.numComplete == (this.neighbors.length + 1)) || this.neighbors.size+1 < Math.ceil(this.pattern.size/4)) && !this.hasRoamed) {
      let dir = this.getDir();
      this.roam(dir);
      this.broadcastMessage(this.createMessage(dir, "roamDirection"));
    } else {
      if (!this.hasReachedTarget && this.path.length === 0) {
        this.createPath();
      }
      if (!this.hasReachedTarget) {
        this.moveToNext();
      }
    }
  }
  
  this.targetCheck = function () {
    if (!this.skipTargetCheck && this.position.equals(this.target)) {
      this.reachTarget();
    }
  }

  this.createPath = function () {
    this.path = [];
    this.target = this.chooseTarget();
    let path = this.findPath();
    for (i = 1; i < path.length; i++) {
      this.path.push(new Position(path[i][0], path[i][1]));
    }
  }

  this.findPath = function () {
    // Uses pathfinding library to find new path to target
    let grid = new PathFinding.Grid(global[userID].world.worldBounds.x, global[userID].world.worldBounds.y);
    var finder = new PathFinding.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: false
    });
    for (let i = 0; i < this.neighbors.length; i++) {
      let v = this.neighbors[i];
      grid.setWalkableAt(v.x, v.y, false);
    }
    let me = this.position;
    return finder.findPath(me.x, me.y, this.target.x, this.target.y, grid);
  }

  this.mapPattern = function () {
    for (let i = 0; i < pattern.size; i++) {
      elem = pattern.map[i];
      elem.isOccupied = false;
      elem.location = new Position(elem.virtualLocation.x, elem.virtualLocation.y);
      elem.location.move(pattern.virtualOrigin.xDistance(this.origin), pattern.virtualOrigin.yDistance(this.origin));
    }
  }

  this.chooseTarget = function () {
    // Choose target from open options
    let targetDistance = 0;
    let minimunNumberOfTargets = 5;
    let eligibleTargets = []
    while (eligibleTargets.length <= minimunNumberOfTargets && targetDistance < Math.ceil(this.pattern.width / 2)) {
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
      if (elem.isTarget && !elem.isOccupied) {
        let priorityScore = this.determinePriority(elem.location.distance(this.position), elem.priority);
        if (priorityScore > nearestTarget.priorityScore) {
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

  // TODO Functional but needs to be reworked
  this.determinePriority = function (distance, priority) {
    return (1 / (distance + 1)) + 25 / priority;
  }

  this.reachTarget = function () {
    // Send message to other bots to inform them that a target has been filled
    this.hasReachedTarget = true;
    this.broadcastMessage(this.createMessage(this.position, "targetReached"));
    this.numComplete++;
  }

  this.acceptReachTarget = function (target) {
    // Check if filled target was yours, if so replace your target.
    for (let i = 0; i < this.pattern.map.length; i++) {
      if (this.pattern.map[i].location.equals(target)) {
        this.pattern.map[i].isOccupied = true;
      }
    }
    if (this.target != null && target.equals(this.target)) {
      this.createPath();
    }
    this.numComplete++;
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

  this.moveTowards = function (target) {
    if (this.position.equals(target)) {
      return new Position(0, 0);
    }
    let angleIncrement = Math.PI / 4;
    let targetAngle = Math.round(Math.atan2(this.position.xDistance(target), this.position.yDistance(target)) / angleIncrement) * angleIncrement;
    this.move(Math.round(Math.sin(targetAngle)), Math.round(Math.cos(targetAngle)));
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

}

module.exports = Bot;