// Canvas
let playField = $("#playField");
let ctx = playField[0].getContext("2d"); // Get canvas context
let w = playField.attr("width");
let h = playField.attr("height");

// Layout Containers
let setupContainer = $("#setup");
let worldContainer = $("#simulation .inner-content");

// Customization inputs
var numberOfBotsSelector = $("#bot-selector");
var numberOfBotsOutput = $("#number-of-bots");
var worldSizeXSelector = $("#world-size-x");
var worldSizeYSelector = $("#world-size-y");
var speedSelector = $("#speed");
let reset;
let pause = false;
let running = false;
let overlayVisable = true;

// Object containing information about world
let world = {}
let defaultWorld = {
  squareSize: 5,
  lineWidth: 1,
  color: "lightgrey",
  worldBounds: {
    x: 100,
    y: 100
  },
  wirelessRange: 5,
  numberOfBots: 100,
  speed: 1000,
};
world = JSON.parse(JSON.stringify(defaultWorld));
// Initialize Simulation
function initSim() {
  running = true;
  $.post({
    url: "http://localhost:3000/init",
    data: world,
    success: function (res) {
      initCanvas();
      drawMap(res.bots, world);
      refresh();
    },
    dataType: "json"
  });
}

// Refresh Simulation (Every Time Step)
function refresh() {
  reset = setTimeout(function () {
    $.ajax({
      url: "http://localhost:3000/refresh",
      dataType: "json",
      success: function (res) {
        drawMap(res, world);
        if (running) refresh();
      }
    });
  }, world.speed);
}

function init() {
  resetSettings();
}

// Draw the grid
function gridLines(world) {
  let inc = world.squareSize + world.lineWidth;
  for (let x = 0, n = 0; n < world.worldBounds.x; x += inc, n++) { // Draw vertical lines.
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0, n = 0; n < world.worldBounds.y; y += inc, n++) { // Draw horizontal lines.
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.strokeStyle = world.color;
  ctx.lineWidth = world.lineWidth;
}

// Get the position to render square based on square size and position
function getTopLeft(world, pos) {
  return {
    x: (world.squareSize + world.lineWidth) * pos.x,
    y: (world.squareSize + world.lineWidth) * pos.y
  }
}

// Draw the bots
function drawMap(data, world) {
  ctx.beginPath();
  gridLines(world);
  ctx.clearRect(0, 0, w + 0.5, h + 0.5);
  for (var i = 0; i < data.length; i++) {
    let tl = getTopLeft(world, data[i].pos);
    ctx.fillStyle = data[i].color;
    ctx.fillRect(tl.x, tl.y, world.squareSize, world.squareSize);
  }
  ctx.stroke();
}

// Initializes the canvas
function initCanvas() {
  ctx.translate(-0.5, -0.5); // Moves coordinates to center of pixel for high precision and crisp lines
  playField.attr("width", ((world.squareSize + world.lineWidth) * world.worldBounds.x));
  playField.attr("height", ((world.squareSize + world.lineWidth) * world.worldBounds.y));
  w = playField.attr("width");
  h = playField.attr("height");
}

// Toggles the overlay by sliding it up and down
// TODO 
// bug if window size changes when overlay is hidden.
function toggleOverlay() {
  let topValue = overlayVisable ? "-100%" : "0px";
  overlayVisable = !overlayVisable;
  setupContainer.animate({
    top: topValue
  }, 500)
}

// Sopts the simulation and fades out the grid
function stopSimulation() {
  running = false;
  worldContainer.animate({
    opacity: "0"
  }, 300, function () {
    clearTimeout(reset);
    pause = true;
  });
}

// Clears and then fades in grid
// Starts the simulation
function startSimulation() {
  drawMap({}, world);
  toggleOverlay();
  worldContainer.animate({
    opacity: "1"
  }, 750, function () {
    initSim();
  });
}

function initWorldSettings() {
  world.worldBounds.x = worldSizeXSelector.val();
  world.worldBounds.y = worldSizeYSelector.val();
  world.numberOfBots = numberOfBotsSelector.val();
  world.speed = speedSelector.val();
}

function resetSettings() {
  world = JSON.parse(JSON.stringify(defaultWorld));
  initInputs();
}

// Sets up inputs
function initInputs() {
  numberOfBotsSelector.val(world.numberOfBots);
  numberOfBotsOutput.html(world.numberOfBots);
  speedSelector.val(world.speed);
  worldSizeXSelector.val(world.worldBounds.x);
  worldSizeYSelector.val(world.worldBounds.y);
}

function setResetButtonText() {
  console.log("setResetButtonText")
  console.log(running);
  if (running) {
    console.log($("#reset-button"));
    $("#reset-button").text("Stop Simulation");
  } else {
    $("#reset-button").text("Reset Simulation");
  }
}

// Slider listener
numberOfBotsSelector.get(0).oninput = function () {
  numberOfBotsOutput.html(this.value);
};
// Button Listeners
$("#reset-button").on("click", function () {
  if (running) {
    running = false;
    pause = true;
    clearTimeout(reset);
    setResetButtonText()
  } else {
    initSim();
    setResetButtonText()
  }
});

$(".go-button").on("click", function () {
  running = true;
  initWorldSettings();
  startSimulation();
  setResetButtonText()
});

$(".change-settings").on("click", function () {
  toggleOverlay();
  stopSimulation();
});

$("#reset-settings").on("click", function () {
  resetSettings();
});


init();