var Position = require('../classes/Position');


describe("Position", function() {
  var a;

  it("create", function() {
    a = new Position(1,2);
    expect(a.x).toBe(1);
    expect(a.y).toBe(2);
  });
  
  it("move", function() {
    a = new Position(1,2);
    a.move(1,0)
    expect(a.x).toBe(2);
    expect(a.y).toBe(2);
    a.move(0,3)
    expect(a.x).toBe(2);
    expect(a.y).toBe(5);
    a.move(1,-5)
    expect(a.x).toBe(3);
    expect(a.y).toBe(0);
  });

  it("moveTo", function() {
    a = new Position(1,2);
    a.moveTo(5,3)
    expect(a.x).toBe(5);
    expect(a.y).toBe(3);
  });

  it("equals", function() {
    a = new Position(1,2);
    b = new Position(1,2);
    c = new Position(2,2);
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("equals", function() {
    a = new Position(1,2);
    b = new Position(1,3);
    c = new Position(4,2);
    d = new Position(4,6);
    expect(a.distance(b)).toBe(1);
    expect(a.distance(c)).toBe(3);
    expect(a.distance(d)).toBe(5);
  });

  it("objectType", function() {
    a = new Position(1,2);
    expect(a.objectType).toBe("position");
  });
});

var ComSystem = require('../classes/ComSystem');
var Message = require('../classes/Message');

init = function (botRange = 1) {
  bots = [];

  for (var i = 0; i < 20; i++) {
    bots.push(new Bot(new Position(i, 0), i));
  }

  global.comSystem = new ComSystem(bots, botRange);

  return bots
};

describe("Message", function() {
  it("create", function() {
    init();
    let message = new Message("Test Sender", "Test Text");
    expect(message.originalSender).toBe("Test Sender");
    expect(message.text).toBe("Test Text");
    expect(message.id).toBe(0);
  });
})

var Bot = require('../classes/Bot');

describe("Bot", function() {

  it("create", function() {
    var pos = new Position(11, 34);
    var bot = new Bot(pos, 0);
    expect(bot.position).toBe(pos);
    expect(bot.address).toBe(0);
  });

  it("move", function() {
    let bot = new Bot(new Position(11, 34), 0);
    bot.move(5, -3);
    expect(bot.position.x).toBe(16);
    expect(bot.position.y).toBe(31);
  });

  it("neighbors", function() {
    let bots = init(2);
    comSystem.setSubscriberList();
    for(i = 0; i < bots.length; i+= 2) {
      bots[i].sendMessages(bots[i].position); // Send messages from every other bot
    }
    for(i = 2; i < bots.length; i+= 2) {
      expect(bots[0].neighbors[i/2-1].x).toBe(i); // Test for existience of all detected bots
    }
  });

  it("messaging", function() {
    let bots = init(2);
    let m1 = "Test Message One";
    let m2 = "Test Message Two";

    bots[0].recNum = 0; //Number of recieved messages

    // Inject code into the function to allow debugging
    bots[0].receiveMessage = function (message) {
      if(!this.receivedMessages.includes(message.id)){
        this.neighbors.push(message.text);
        this.broadcastMessage(message);
        this.lastMessage = message;
        this.recNum++;
      }
    }

    comSystem.setSubscriberList();

    bots[1].sendMessages(m1); // Send first test message
    expect(bots[0].lastMessage.text).toBe(m1); // Ensure bot 0 recieved correct message
    expect(bots[0].recNum).toBe(1); // Check for extra messages

    
    bots[8].sendMessages(m2); // Send second test message
    expect(bots[0].lastMessage.text).toBe(m2); // Ensure bot 0 recieved correct message
    expect(bots[0].recNum).toBe(2); // Check for extra messages
  });
});

describe("Comm System", function() {
  it("subscriber list", function() {
    let range = 5
    let bots = init(range);
    comSystem.setSubscriberList();

    for (i = 0; i < bots.length; i++) {
      let curr = bots[i];
      for(j = 0; j < bots.length; j++) {
        if(j === i) continue;
        let other = bots[j];
        if(comSystem.map[curr.address].subscribers.includes(other.address)) {
          expect(curr.position.distance(other.position)).toBeLessThanOrEqual(range);
        } else {
          expect(curr.position.distance(other.position)).toBeGreaterThan(range);
        }
      }
    }
  });
});
