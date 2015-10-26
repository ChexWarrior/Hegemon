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
        maxAmtPoints: 10,
        marks: []
    };
    createShape(250, 250, 10, 100, 250);
});

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = angleInDegrees * Math.PI / 180.0,
    x = centerX + radius * Math.cos(angleInRadians),
    y = centerY + radius * Math.sin(angleInRadians);
    //console.log("X: " + x + " Y: " + y);
    // globals.marks.push({
    //   x: x,
    //   y: y
    // });
    return x + ", " + y;
}

//TODO: Need a way to gradually increase and decreaes heights between points
function graduateLength(min, max, prevLength) {

} 

function createShape(centerXPos, centerYPos, numSides, minDistance, maxDistance) {
var polygon = "",
    angleIncrement = 360 / numSides,
    angle = 0,
    randomLength = 0,
    prevLength = 0,
    currMax = maxDistance,
    currMin = minDistance,
    distance = [],
    index;
    console.log("x: " + centerXPos + " y:" + centerYPos);
    for(index = 0; index < numSides; index += 1) {
        randomLength = generateRandomNumber(minDistance, maxDistance);      
        polygon += polarToCartesian(centerXPos, centerYPos, randomLength, angle) + ",";
        randomLength = generateRandomNumber(currMin, currMax);
        prevLength = randomLength;
        console.log("Current Min: " + currMin + " Current Max: " + currMax + " Length: " + randomLength);
        polygon += polarToCartesian(centerXPos, centerYPos, randomLength, angle) + ",";
        angle += angleIncrement;
    }
    console.log("Polygon: " + polygon);
    var shape = globals.boardElement.polygon(polygon.substr(0, polygon.lastIndexOf(",")));
        shape.attr({
        fill: "gray",
        stroke: "black"
    });
    // for(index = 0; index < globals.marks.length; index += 1) {
    //   var mark = globals.boardElement.text(globals.marks[index].x, globals.marks[index].y, index);
    //   mark.attr({
    //     fill: "red",
    //     stroke: "black"
    //   });
    // }
}
