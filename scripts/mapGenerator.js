var globals = null;

document.addEventListener("DOMContentLoaded", function () {
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
    createShape(250, 250, 8, 50, 300);
});

function Point(x, y) {
    this.x = x;
    this.y = y;

    return this;
}

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = angleInDegrees * Math.PI / 180.0;
  var x = centerX + radius * Math.cos(angleInRadians);
  var y = centerY + radius * Math.sin(angleInRadians);
  console.log("X: " + x + " Y: " + y);
  return x + ", " + y;
}

function createShape(bCircleCenterX, bCircleCenterY, numSides, minDistance, maxDistance) {
  var polygon = "",
    angleIncrement = parseInt(360 / numSides),
    angle = 0,
    length = 0,
    index;
  for(index = 0; index < numSides; index += 1) {
    length = generateRandomNumber(minDistance, maxDistance);
    polygon += polarToCartesian(bCircleCenterX, bCircleCenterY, length, angle) + ",";
    angle += angleIncrement;
    //angle += generateRandomNumber(angle, angle + angleIncrement);
  }
  console.log("Polygon: " + polygon);
  var shape = globals.boardElement.polygon(polygon.substr(0, polygon.lastIndexOf(",")));
  shape.attr({
    fill: "red",
    stroke: "black"
  });
}