var globals = null;

document.addEventListener("DOMContentLoaded", function() {
    globals = {
        boardElement: Snap("#map"),
        boardWidth: 500,
        boardHeight: 500,
        shapeMinWidth: 100,
        shapeMinHeight: 100,
        boardPadding: 10,
        minAmtPoints: 4,
        maxAmtPoints: 10
    };
    createShape();
   // polarToCartesian(250, 250, 50, 15);
});

function Point(x, y) {
    this.x = x;
    this.y = y;

    return this;
}

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createShape() {
    var circle = globals.boardElement.circle(250, 250, 50);
    circle.attr({
        fill: "white",
        stroke: "black"
    });
    var poly = polarToCartesian(250, 250, 50, 0) + 
        ", " + polarToCartesian(250, 250, 50, 65);
    var line = globals.boardElement.polyline(poly);
    line.attr({
        stroke: "red"
    });
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = angleInDegrees * Math.PI / 180.0;
  var x = centerX + radius * Math.cos(angleInRadians);
  var y = centerY + radius * Math.sin(angleInRadians);
  console.log("X: " + x + " Y: " + y);
  //return [x,y];
  return x + ", " + y;
}