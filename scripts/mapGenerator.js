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
        20, 
        50, 
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
    //maybe we need to determine what TOO much of a difference is between min and max
    //min 100 to max 500 100 to 200 is a big distane try 1/5?
    //don't allow a single change over the break point at a time?
    if(prevLength > 0) {
        var breakPoint = (max - min) / 10;
        if(generateRandomNumber(1,100) > 50) {
            return generateRandomNumber(breakPoint, max);
        } else {
            return generateRandomNumber(min, breakPoint);
        }
    } else {
        return generateRandomNumber(min, max);
    }
} 

function createShape(centerXPos, centerYPos, numSides, minDistance, maxDistance) {
    var pathArray = [],
        pathString = "",
        angleIncrement = 360 / numSides,
        angleChangeMax = angleIncrement + 15,
        changeToIncrease,
        angle = 0,
        randomLength = 0,
        lastAngle,
        stopAngleChange = true,
        currMax = maxDistance,
        currMin = minDistance,
        index;
    //console.log("x: " + centerXPos + " y:" + centerYPos);
    for(index = 0; index < numSides; index += 1) {
        //randomLength = graduateLength(currMin, currMax, randomLength);
        randomLength = generateRandomNumber(currMin, currMax);
        pathArray[index] = polarToCartesian(centerXPos, centerYPos, randomLength, angle) + ",";
        console.log("Length: " + randomLength);
        // console.log("Current Min: " + currMin + " Current Max: " + currMax + " Length: " + randomLength);
        //angle += angleIncrement;
        chanceToIncrease = generateRandomNumber(1,100);
        lastAngle = angle;
        angle += generateRandomNumber(angleIncrement, angleChangeMax);

        if(angle > 360) {
            angle = 360;
            break;
        }

        console.log("Angle: " + angle);
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
