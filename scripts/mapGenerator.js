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
        cellPathStr = '';
        for (edgeIndex = 0; edgeIndex < cell.halfedges.length; edgeIndex += 1) {
            startPointX = cell.halfedges[edgeIndex].getStartpoint().x;
            startPointY = cell.halfedges[edgeIndex].getStartpoint().y;
            endPointX = cell.halfedges[edgeIndex].getEndpoint().x;
            endPointY = cell.halfedges[edgeIndex].getEndpoint().y;
            //build path string
            cellPathStr += (edgeIndex === 0 ? "M" : "L") + startPointX + "," + startPointY + "L" + endPointX + "," + endPointY;
        }

        territories[cell.site.voronoiId] = {
            voronoiId: cell.site.voronoiId,
            edges: cell.halfedges,
            pathStr: cellPathStr
        };

        territories.length += 1;
    }

    return territories;
}

function drawTerritory(territory, canvas) {
    var pathObj = territory.path = canvas.path(territory.pathStr);
    pathObj.attr({
        fill: '#AF623B',
        stroke: '#000'
    });

    return pathObj;
}

function drawTerritoryCenter(territory, canvas) {
    canvas.circle(territory.centerPoint.x, territory.centerPoint.y, 3).attr({
        fill: '#2862C1',
        stroke: '#000'
    });
}

function getAdjacentTerritories(territories, territory) {
    var edges = territory.edges,
        edgeLSite,
        edgeRSite,
        edgeIndex,
        adjIds = [];

    for (edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
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

function getCenter(territory) {
    //Find approx center
    //http://stackoverflow.com/questions/1691928/put-label-in-the-center-of-an-svg-path
    var pathLength = Raphael.getTotalLength(territory.pathStr),
        step = pathLength / 100,
        point,
        xAvg = 0,
        yAvg = 0;

    for (var dist = 0; dist < pathLength; dist += step) {
        point = Raphael.getPointAtLength(territory.pathStr, dist);
        xAvg += point.x;
        yAvg += point.y;
    }

    return {
        x: xAvg / 100,
        y: yAvg / 100
    };
}

function getAreaOfTerritory(territory) {
    // Area of Polygon: www.mathopenref.com/coordpolygonarea2.html
    var area = 0,
        nextPoint,
        point,
        edges = territory.edges,
        edgeIndex;

    for (edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
        point = edges[edgeIndex].getStartpoint();
        nextPoint = (edges[edgeIndex + 1]) ? edges[edgeIndex + 1].getStartpoint() : edges[0].getStartpoint();

        area += point.x * nextPoint.y - point.y * nextPoint.x
    }

    return Math.abs(area / 2);
}

//TODO: Refactor
function combineTerritories(territory) {
    // Refactor:
    // 1) Find all territories eligble for combination
    // 2) Find out if any of these territories are adjacent
    // 3) Choose adj territory to combine small ones into
    // 4) Adj small territories should not pick the same territory (or each other)
    // 5) Add paths, remove shared side

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
    prop,
    territoryIdsToCombine = [],
    MIN_AREA = 4000;

var territories = initialize(bbox, canvas, numCells);

for (prop in territories) {
    if (territories.hasOwnProperty(prop) && prop !== 'length') {
        territory = territories[prop];
        console.log('Territory ' + territory.voronoiId);
        territory.adjTerritories = getAdjacentTerritories(territories, territory);
        console.log('Adj Territories: ', territory.adjTerritories);
        territory.area = getAreaOfTerritory(territory);
        console.log('Area: ', territory.area);
        
        if(territory.area <= MIN_AREA) {
            territoryIdsToCombine.push(territory.voronoiId);
        }

        territory.centerPoint = getCenter(territory);
        console.log('Center Point: ', territory.centerPoint);
        territory.path = drawTerritory(territory, canvas);
        console.log('Path: ', territory.path);
        drawTerritoryCenter(territory, canvas);
    }
}

console.log('Territory Ids to Combine: ', territoryIdsToCombine);