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
    console.log(voronoi);
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
            cellPathStr += (edgeIndex === 0 ? "M" : "L") 
                            + startPointX + "," + startPointY + "L" + endPointX + "," + endPointY;
        }

        cellPath = canvas.path(cellPathStr);

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
            cellPathStr: cellPathStr,
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
            adjPathObj.pathStr = territories[edges[i].edge.lSite.voronoiId].pathStr;
            adjPathObj.adjSide = [
                edges[i].edge.va,
                edges[i].edge.vb
            ];
        } else if (edges[i].edge.rSite && edges[i].edge.rSite.voronoiId !== territory.id) {
            adjPathObj.path = territories[edges[i].edge.rSite.voronoiId].path;
            adjPathObj.pathStr = territories[edges[i].edge.rSite.voronoiId].pathStr;
            adjPathObj.adjSide = [
                edges[i].edge.va,
                edges[i].edge.vb
            ];
        }

        if (Object.keys(adjPathObj).length > 0) {
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


    console.log('Adj Territory Segement: ');
    console.log(adjTerritorySegements);

    console.log('Target Territory Segement: ');
    console.log(pathSegements);

    console.log('Adj Line Start: ');
    console.log(adjLineStart);

    console.log('Adj Line End: ');
    console.log(adjLineEnd);

    // canvas.path('M' + adjLineStart.x + ' ' + adjLineStart.y 
    //     + 'L' + adjLineEnd.x + ' ' + adjLineEnd.y).attr({
    //         stroke: 'red'
    //     });

    for(var x = 0; x < adjTerritorySegements.length; x += 1) {
        currentX = adjTerritorySegements[x][1];1
        currentY = adjTerritorySegements[x][2];

        //if we've arrived at the shared line segement of the two paths...
        if(currentX == adjLineStart.x && currentY == adjLineStart.y) {
            spliceIndex = x;
            break;
        } 
    }
    var deleteIndex = [];
    //remove the shared line from the smaller territorys path
    for(var z = 0; z < pathSegements.length; z += 1) {
        currentX = pathSegements[z][1];
        currentY = pathSegements[z][2];

        //if we've arrived at the shared line segement of the two paths...
        if(currentX == adjLineStart.x && currentY == adjLineStart.y) {

            deleteIndex.push(z);
        } else if(currentX == adjLineEnd.x && currentY == adjLineEnd.y) {
            deleteIndex.push(z);
        }
    }

    pathSegements.splice(deleteIndex[0], 1);
    pathSegements.splice(deleteIndex[1], 1);


    adjTerritorySegements.splice.apply(adjTerritorySegements, [spliceIndex, 0].concat(pathSegements));

    console.log('Combined Path: ');
    console.log(adjTerritorySegements);

    for(var y = 0; y < adjTerritorySegements.length; y += 1) {
        combinedPath += adjTerritorySegements[y][1] 
                     + ' ' + adjTerritorySegements[y][2] 
                     + 'L';
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
    MIN_AREA = 4000;

var territories = initialize(bbox, canvas, numCells);

for (var territory in territories) {
    if (territories.hasOwnProperty(territory)) {
        territories[territory].adjTerritories = getAdjacentTerritories(territories, territories[territory]);
    }
}

for (var territory in territories) {
    if (territories.hasOwnProperty(territory)) {
        if (territories[territory].area < MIN_AREA) {
            combineTerritories(territories[territory]);
        }
    }
}

console.log(territories);
