var Position = require("../classes/Position");

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
