'use strict';

/**
 * Checklist
 * =========
 * Refactoring in progress, draw shapes next...
 *
 *
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
        territories = {
            length: 0
        },
        startPointX,
        startPointY,
        endPointX,
        endPointY,
        cellPathStr,
        cellPath,
        cell,
        cellIndex,
        edgeIndex,
        cellEdges;

    for (cellIndex = 0; cellIndex < numCells; cellIndex += 1) {
        sites.push({
            x: ranNum(0, 800),
            y: ranNum(0, 800)
        });
    }

    voronoi = new Voronoi().compute(sites, bbox);
    console.log('Computed Voronoi: ', voronoi);
    cells = voronoi.cells;

    for (cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
        cell = cells[cellIndex];
        cellPath = '';
        for (edgeIndex = 0; edgeIndex < cell.halfedges.length; edgeIndex += 1) {
            startPointX = cell.halfedges[edgeIndex].getStartpoint().edgeIndex;
            startPointY = cell.halfedges[edgeIndex].getStartpoint().y;
            endPointX = cell.halfedges[edgeIndex].getEndpoint().edgeIndex;
            endPointY = cell.halfedges[edgeIndex].getEndpoint().y;
            //build path string
            cellPathStr += (edgeIndex === 0 ? "M" : "L") + startPointX + "," + startPointY + "L" + endPointX + "," + endPointY;
        }

        territories[cell.site.voronoiId] = {
            voronoiId: cell.site.voronoiId,
            edges: cell.halfedges,
            path: cellPath
        };
    }

    return territories;
}

//TODO: Refactor
function getAdjacentTerritories(territories, territory) {
    var edges = territory.edges,
        edgeLSite,
        edgeRSite,
        edgeIndex,
        adjIds = [];

    for (edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        adjPathObj = {};
        //voronoi cell to left of current edge
        edgeLSite = edges[edgeIndex].edge.lSite;
        //voronoi cell to right of current edge
        edgeRSite = edges[edgeIndex].edge.rSite;

        //check each side of edge and store the id of cell that isn't the parent
        //of this edge
        if (edgeLSite && edgeLSite.voronoiId !== territory.voronoiId) {
            adjIds.push(edgeLSite.voronoiId);
        } else if (edgeRSite && edgeRSite.voronoiId !== territory.voronoiId) {
            adjIds.push(edgeRSite.voronoiId);
        }
    }

    return adjIds;
}

//TODO: Refactor
function getCenter(territory) {
    //Find approx center
    //http://stackoverflow.com/questions/1691928/put-label-in-the-center-of-an-svg-path
    var pathLength = territory.path.getTotalLength(),
        step = pathLength / 100,
        point,
        xAvg = 0,
        yAvg = 0;

    for (var dist = 0; dist < pathLength; dist += step) {
        point = territory.path.getPointAtLength(dist);
        xAvg += point.x;
        yAvg += point.y;
    }

    return [
        xAvg / 100,
        yAvg / 100
    ];
}

//TODO: Refactor
function getAreaOfTerritory(territory) {
    // Area of Polygon: www.mathopenref.com/coordpolygonarea2.html
    var area = 0,
        xyNext,
        xy,
        edges = territory.cell.halfedges;

    for (var i = 0; i < edges.length; i += 1) {
        xy = edges[i].getStartpoint();
        xyNext = (edges[i + 1]) ? edges[i + 1].getStartpoint() : edges[0].getStartpoint();

        area += xy.x * xyNext.y - xy.y * xyNext.x
    }

    return Math.abs(area / 2);
}

//TODO: Refactor
function combineTerritories(territory) {
    //grab first adj territory
    var adjTerritorySegements = Raphael.parsePathString(territory.adjTerritories[0].pathStr),
        adjLineStart = territory.adjTerritories[0].adjSide[0],
        adjLineEnd = territory.adjTerritories[0].adjSide[1],
        //split path into segements
        pathSegements = Raphael.parsePathString(territory.pathStr),
        currentX,
        currentY,
        spliceIndex,
        combinedPath = 'M ';

    for (var x = 0; x < adjTerritorySegements.length; x += 1) {
        currentX = adjTerritorySegements[x][1];
        1
        currentY = adjTerritorySegements[x][2];

        //if we've arrived at the shared line segement of the two paths...
        if (currentX == adjLineStart.x && currentY == adjLineStart.y) {
            spliceIndex = x;
            break;
        }
    }

    var deleteIndex = [];
    //remove the shared line from the smaller territorys path
    for (var z = 0; z < pathSegements.length; z += 1) {
        currentX = pathSegements[z][1];
        currentY = pathSegements[z][2];

        //if we've arrived at the shared line segement of the two paths...
        if (currentX == adjLineStart.x && currentY == adjLineStart.y) {

            deleteIndex.push(z);
        } else if (currentX == adjLineEnd.x && currentY == adjLineEnd.y) {
            deleteIndex.push(z);
        }
    }

    pathSegements.splice(deleteIndex[0], 1);
    pathSegements.splice(deleteIndex[1], 1);

    adjTerritorySegements.splice.apply(adjTerritorySegements, [spliceIndex, 0].concat(pathSegements));

    console.log('Combined Path: ');
    console.log(adjTerritorySegements);

    for (var y = 0; y < adjTerritorySegements.length; y += 1) {
        combinedPath += adjTerritorySegements[y][1] + ' ' + adjTerritorySegements[y][2] + 'L';
    }

    combinedPath = combinedPath.substr(0, combinedPath.lastIndexOf('L'));

    console.log(combinedPath);

    canvas.path(combinedPath).attr({
        stroke: 'blue'
    });
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
    numCells = 42,
    territoryIndex,
    territory,
    MIN_AREA = 4000;

var territories = initialize(bbox, canvas, numCells);

for (territoryIndex = 0; territoryIndex < territories.length; territoryIndex += 1) {
    territory = territories[territoryIndex];

    territory.adjTerritories = getAdjacentTerritories(territories, territory);
}
