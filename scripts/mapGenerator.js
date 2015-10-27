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
    createShape(
        globals.boardWidth / 2, 
        globals.boardHeight / 2, 
        30, 
        15, 
        200
    );
});

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = angleInDegrees * Math.PI / 180.0,
    x = centerX + radius * Math.cos(angleInRadians),
    y = centerY + radius * Math.sin(angleInRadians);
    
    return x + " " + y;
}

//TODO: Need a way to gradually increase and decreaes heights between points
//We need a way to retain randomness while not allow a huge jump in distance between two
//consectutive points, there should still be a chance of a jump however
function graduateLength(min, max, prevLength) {

} 

function createShape(centerXPos, centerYPos, numSides, minDistance, maxDistance) {
    var pathArray = [],
        pathString = "",
        angleIncrement = 360 / numSides,
        angle = 0,
        randomLength = 0,
        currMax = maxDistance,
        currMin = minDistance,
        index;
    //console.log("x: " + centerXPos + " y:" + centerYPos);
    for(index = 0; index < numSides; index += 1) {
        randomLength = generateRandomNumber(minDistance, maxDistance);      
        pathArray[index] = polarToCartesian(centerXPos, centerYPos, randomLength, angle) + ",";
        randomLength = generateRandomNumber(currMin, currMax);
        console.log("Length: " + randomLength);
        // console.log("Current Min: " + currMin + " Current Max: " + currMax + " Length: " + randomLength);
        angle += angleIncrement;
    }
    // console.log("pathArray: " + pathArray);
    pathString = "M" + pathArray[0];
    for(index = 1; index < pathArray.length; index += 1) {
        pathString += pathArray[index].toString();
    }
    pathString = pathString.substr(0, pathString.lastIndexOf(",")) + "Z";
    // console.log("pathString: " + pathString);
    var shape = globals.boardElement.path(pathString);
        shape.attr({
        fill: "gray",
        stroke: "black"
    });
}
