'use strict';

function ranNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initialize(bbox, canvas, numCells) {
    var voronoi = null,
        cells = [],
        sites = [],
        territories = {},
        startX,
        startY,
        endX,
        endY,
        pathStr,
        cellPath,
        currentCell;

    for (var i = 0; i < numCells; i += 1) {
        sites.push({
            x: ranNum(0, 800),
            y: ranNum(0, 800)
        });
    }

    voronoi = new Voronoi().compute(sites, bbox);
    console.log(voronoi);
    cells = voronoi.cells;

    for (var i = 0; i < cells.length; i += 1) {
        currentCell = cells[i];
        pathStr = '';
        for (var x = 0; x < currentCell.halfedges.length; x += 1) {
            startX = currentCell.halfedges[x].getStartpoint().x;
            startY = currentCell.halfedges[x].getStartpoint().y;
            endX = currentCell.halfedges[x].getEndpoint().x;
            endY = currentCell.halfedges[x].getEndpoint().y;

            pathStr += ((x === 0) ? "M" : "L") + startX + "," + startY + "L" + endX + "," + endY;
        }

        cellPath = canvas.path(pathStr);

        cellPath.attr({
            stroke: "#000000",
            fill: "#6B4B2A"
        });

        cellPath.hover(function() {
            this.attr({
                stroke: "#D61515",
                'stroke-width': 2
            });

            this.toFront();

        }, function() {
            this.attr({
                stroke: "#000000",
                'stroke-width': 1
            });
        });

        //add territories to map by voronoi ID
        territories[currentCell.site.voronoiId] = {
            id: currentCell.site.voronoiId,
            path: cellPath,
            cell: currentCell
        };
    }

    return territories;
}

function getAdjacentTerritories(territories) {

}

var territories = {},
    bbox = {
        xl: 0,
        xr: 800,
        yt: 0,
        yb: 800
    },
    canvas = Raphael(document.getElementById("map"), 800, 800),
    numCells = 55;

//run app
var territories = initialize(bbox, canvas, numCells);

for(var territory in territories) {
    if(territories.hasOwnProperty(territory)) {
        territories[territory].adjTerritories = getAdjacentTerritories(territories[territory]);
    }
}