'use strict';

/**
 * Checklist
 * =========
 * 1) Generate territories (done)
 * 2) Distinguish territories (done)
 * 3) Get territories adjacent to another territory (done)
 * 4) Ensure territories are of proper size
 *      a) What is "too small"? Use area of polyon...
 *      b) How to fix? Merge into adj territory?
 * 5) Draw units on territories
 * 6) Find center of territories (done, approx)
 */

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

        territories[currentCell.site.voronoiId].area = getAreaOfTerritory(
            territories[currentCell.site.voronoiId]);

        territories[currentCell.site.voronoiId].center = getCenter(
            territories[currentCell.site.voronoiId]);

        canvas.circle(territories[currentCell.site.voronoiId].center[0],
            territories[currentCell.site.voronoiId].center[1], 2).attr({
                fill: '#274BBE'
            });
    }

    return territories;
}

function getAdjacentTerritories(territories, territory) {
    var edges = territory.cell.halfedges,
        path,
        adjPathObj,
        adjPaths = [],
        adjIds = [];
    //get the ids
    for (var i = 0; i < edges.length; i += 1) {
        adjPathObj = {};
        if (edges[i].edge.lSite && edges[i].edge.lSite.voronoiId !== territory.id) {
            adjPathObj.path = territories[edges[i].edge.lSite.voronoiId].path;
            adjPathObj.adjSide = [
                territories[edges[i].edge.lSite.voronoiId].va,
                territories[edges[i].edge.lSite.voronoiId].vb
            ];
        } else if (edges[i].edge.rSite && edges[i].edge.rSite.voronoiId !== territory.id) {
            adjPathObj.path = territories[edges[i].edge.rSite.voronoiId].path;
            adjPathObj.adjSide = [
                territories[edges[i].edge.rSite.voronoiId].va,
                territories[edges[i].edge.rSite.voronoiId].vb
            ];
        }

        if(adjPathObj) {
            adjPaths.push(adjPathObj);
        }
    }
 
   territory.path.click(function() {
        for (i = 0; i < adjPaths.length; i += 1) {
            adjPaths[i].path.attr({
                fill: '#257D32'
            });
        }
    });

    return adjPaths;
}

function getCenter(territory) {
    // Find approx center
    //http://stackoverflow.com/questions/1691928/put-label-in-the-center-of-an-svg-path
    var pathLength = territory.path.getTotalLength(),
        step = pathLength / 100,
        point,
        xAvg = 0,
        yAvg = 0;

    for(var dist = 0; dist < pathLength; dist += step) {
        point = territory.path.getPointAtLength(dist);
        xAvg += point.x;
        yAvg += point.y;
    }

    return [
        xAvg / 100,
        yAvg / 100
    ];
}

function getAreaOfTerritory(territory) {
    // Area of Polygon: www.mathopenref.com/coordpolygonarea2.html
    var area = 0,
        xyNext,
        xy,
        edges = territory.cell.halfedges;

    for(var i = 0; i < edges.length; i += 1) {
        xy = edges[i].getStartpoint();
        xyNext = (edges[i + 1]) 
            ? edges[i + 1].getStartpoint()
            : edges[0].getStartpoint();

        area += xy.x * xyNext.y - xy.y * xyNext.x
    }

    return Math.abs(area / 2);
}

//start app
var territories = {},
    bbox = {
        xl: 0,
        xr: 800,
        yt: 0,
        yb: 800
    },
    canvas = Raphael(document.getElementById('map'), 800, 800),
    numCells = 42;

var territories = initialize(bbox, canvas, numCells);

for (var territory in territories) {
    if (territories.hasOwnProperty(territory)) {
        territories[territory].adjTerritories = getAdjacentTerritories(territories, territories[territory]);
    }
}

console.log(territories);
