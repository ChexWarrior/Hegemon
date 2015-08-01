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

// function createShape(numSides, area) {
//     var angle = 0;
//     var x = 0;
//     var y = 0;
//     var points = [];
//     var radius = 250; //Math.sqrt((2 * area) / (numSides * Math.sin((2 * Math.PI) / numSides)));
//     console.log("radius: " + radius);
//     var centerXPos = globals.boardWidth / 2;
//     var centerYPos = globals.boardHeight / 2;
//     var polygonStr = "";//centerXPos + ", " + centerYPos;
//     //from center point, go a distance R and generate points at 2pi/n angle increments
//     for(var index = 1; index <= numSides; index += 1) {
//         console.log("Iteration: " + index);
//         angle = (2 * Math.PI) / numSides * index;
//         console.log("Angle: " + angle);
//         x = Math.cos(angle) * radius;
//         console.log("X: " + x);
//         y = Math.sin(angle) * radius;
//         console.log("Y: " + y);
//          // x += 100;
//          // y += 100;
//         points.push(new Point(x, y));
//     }

//     for(index = 0; index < points.length; index += 1) {
//         polygonStr += points[index].x + ", " + points[index].y + ", "; 
//     }
//     polygonStr = polygonStr.substr(0, polygonStr.lastIndexOf(",")).trim();

//     console.log(polygonStr);
//     globals.boardElement.polygon(polygonStr);
// }