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
    createShape(250, 250, 35, 100, 300);
});

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = angleInDegrees * Math.PI / 180.0,
      x = centerX + radius * Math.cos(angleInRadians),
      y = centerY + radius * Math.sin(angleInRadians);
  //console.log("X: " + x + " Y: " + y);
  return x + ", " + y;
}

//TODO: Need to tweak length so that it gradually increases or decreases...
// When determining length take previous length and determine it's distance to each min
// and max limits. If closer to minimum chance of being closer to min should increase and
// vice versa for the maximum...
function determineLengthFactor(min, max, prevLength) {
  var minDistance = prevLength - min,
      maxDistance = Math.abs(prevLength - max),
      halfDistance = (max - min) / 2;
      if(minDistance > maxDistance) {
        return [min, prevLength];
      } else if(maxDistance > minDistance) {
        return [prevLength, max];
      } else {
        return [min, max];
      }
} 

function createShape(bCircleCenterX, bCircleCenterY, numSides, minDistance, maxDistance) {
  var polygon = "",
      angleIncrement = 360 / numSides,
      angle = 0,
      length = 0,
      prevLength = 0,
      currMax = maxDistance,
      currMin = minDistance,
      distance = [],
      index;
  //console.log("Angle Increment: " + angleIncrement);
  for(index = 0; index < numSides; index += 1) {
    if(prevLength) {
      distance = determineLengthFactor(minDistance, maxDistance, prevLength);
      currMin = distance[0];
      currMax = distance[1];
    } 
    length = generateRandomNumber(currMin, currMax);
    prevLength = length;
    //console.log("Length: " + length + " Angle: " + angle);
    console.log("Current Min: " + currMin + " Current Max: " + currMax + " Length: " + length);
    polygon += polarToCartesian(bCircleCenterX, bCircleCenterY, length, angle) + ",";
    angle += angleIncrement;
    //angle += generateRandomNumber(angle, angle + angleIncrement);
  }
  //console.log("Polygon: " + polygon);
  var shape = globals.boardElement.polygon(polygon.substr(0, polygon.lastIndexOf(",")));
  shape.attr({
    fill: "gray",
    stroke: "black"
  });
}