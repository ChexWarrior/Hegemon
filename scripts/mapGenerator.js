document.addEventListener("DOMContentLoaded", function() {
    var globals = {
        boardElement: Snap("#map"),
        boardWidth: 500,
        boardHeight: 500,
        shapeMinWidth: 100,
        shapeMinHeight: 100
    };
    //createShape();
    // var polygon = globals.boardElement.polygon(10, 100, 20, 200, 40, 300, 50, 250);
    // polygon.attr({
    //     stroke: "black",
    //     fill: "#bada55"
    // }); 
});

function Polygon(points, svgElement) {
    this.points = points;
    this.svgElement = svgElement;
    return this;
}

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createShape() {
    var numberOfPoints = generatePoints();
    //create new polygons...
}

function generatePoints() {
    //return array of points
}