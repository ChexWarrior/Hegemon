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
    //console.log('Computed Voronoi: ', voronoi);
    cells = voronoi.cells;

    for (cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
        cell = cells[cellIndex];
        cellPathStr = '';
        for (edgeIndex = 0; edgeIndex < cell.halfedges.length - 1; edgeIndex += 1) {
            startPointX = cell.halfedges[edgeIndex].getStartpoint().x;
            startPointY = cell.halfedges[edgeIndex].getStartpoint().y;
            endPointX = cell.halfedges[edgeIndex].getEndpoint().x;
            endPointY = cell.halfedges[edgeIndex].getEndpoint().y;
            //build path string
            if (edgeIndex === 0) {
                cellPathStr += 'M' + startPointX + ' ' + startPointY + 'L' + endPointX + ' ' + endPointY;
            } else {
                cellPathStr += 'L' + endPointX + ' ' + endPointY;
            }
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

function isSharedPoint(x, y, sharedPoints) {
    for (var index = 0; index < sharedPoints.length; index += 1) {
        if (x === sharedPoints[index].x && y === sharedPoints[index].y) {
            return sharedPoints[index];
        }
    }

    return false;
}

//TODO: Refactor
function combineTerritory(territories, territoryIdToCombine, canvas) {
    // Refactor
    // 1) Choose adj territory
    // 2) Merge two paths
    // 3) Add two former territories adj paths to new ones, removing the two former territories.
    // 4) Add attr to former territory to ensure any requests are rerouted to new one
    // 5) Check if new territory is large enough, if not add to combo ids

    //the combo territory is the territory that will be put into another
    var comboTerritory = territories[territoryIdToCombine],
        //the adj territory is the territory that the combo territory is being combined into
        baseTerritory = territories[comboTerritory.adjTerritories[0]],
        baseTerritoryPathSegments = Raphael.parsePathString(baseTerritory.pathStr),
        comboTerritoryPathSegments = Raphael.parsePathString(comboTerritory.pathStr),
        newPathSegmentsFromBase = [],
        newPathSegmentsFromCombo = [],
        newPathStr = '',
        outerIndex,
        innerIndex,
        index,
        nextIndex,
        lastIndex,
        outerX,
        outerY,
        innerX,
        innerY,
        currentX,
        currentY,
        lastX,
        lastY,
        nextX,
        nextY,
        sharedPoint = {},
        sharedPoints = [],
        found = 0,
        currentPoint,
        firstPointFound = false,
        secondPointFound = false;


    comboTerritory.path.attr({
        fill: 'pink'
    });

    baseTerritory.path.attr({
        fill: 'green'
    });

    for (outerIndex = 0; outerIndex < baseTerritoryPathSegments.length; outerIndex += 1) {
        outerX = baseTerritoryPathSegments[outerIndex][1];
        outerY = baseTerritoryPathSegments[outerIndex][2];
        //console.log('Outer Point: ' + outerX + ',' + outerY)
        for (innerIndex = 0; innerIndex < comboTerritoryPathSegments.length; innerIndex += 1) {
            innerX = comboTerritoryPathSegments[innerIndex][1];
            innerY = comboTerritoryPathSegments[innerIndex][2];

            //TODO: Redo this algorithm, add paths along shared line and simply remove
            // the shared line!
            // Find shared points, find lines between points and replace
            // Find shared points not between other shared points (end point)
            // 

            //console.log('Inner Point: ' + innerX + ',' + innerY)
            //if a shared point
            if (innerX === outerX && innerY === outerY) {
                console.log('Found shared point!');
                sharedPoints.push({
                    x: innerX,
                    y: innerY,
                    //index of this point within inner path segments
                    innerIndex: innerIndex,
                    //index of this point within outer path segments
                    outerIndex: outerIndex,
                    isEndPoint: false,
                    isStartPoint: false
                });
            }
        }
    }

    //store where end points are in sharedPoints array
    var startPoint, endPoint;

    //find starting and ending shared points relative to base path
    for (index = 0; index < baseTerritoryPathSegments.length; index += 1) {
        lastIndex = (index > 0) ? index - 1 : baseTerritoryPathSegments.length - 1;
        nextIndex = (index < baseTerritoryPathSegments.length - 1) ? index + 1 : 0;

        currentX = baseTerritoryPathSegments[index][1];
        currentY = baseTerritoryPathSegments[index][2];

        nextX = baseTerritoryPathSegments[nextIndex][1];
        nextY = baseTerritoryPathSegments[nextIndex][2];

        lastX = baseTerritoryPathSegments[lastIndex][1];
        lastY = baseTerritoryPathSegments[lastIndex][2];

        if (currentPoint = isSharedPoint(currentX, currentY, sharedPoints)) {
            var lastPointIsShared = isSharedPoint(lastX, lastY, sharedPoints);
            var nextPointIsShared = isSharedPoint(nextX, nextY, sharedPoints);

            if (!lastPointIsShared && nextPointIsShared) {
                currentPoint.isStartPoint = true;
                startPoint = currentPoint;

            } else if (lastPointIsShared && !nextPointIsShared) {
                currentPoint.isEndPoint = true;
                endPoint = currentPoint;
            }
        }
    }

    //loop through base path add all points to new path that are:
    //Not shared or,
    //are shared but is the start or end point

    //beginning with end point, add all non shared paths to new path
    nextIndex = (endPoint.outerIndex < baseTerritoryPathSegments.length - 1) 
                ? endPoint.outerIndex + 1 : 0;
    nextX = baseTerritoryPathSegments[nextIndex][1];
    nextY = baseTerritoryPathSegments[nextIndex][2];
    var firstLoop = true;
    while (!isSharedPoint(nextX, nextY, sharedPoints)) {
        if(firstLoop) {
            newPathSegmentsFromBase.push([
                'M',
                baseTerritoryPathSegments[nextIndex][1],
                baseTerritoryPathSegments[nextIndex][2]
            ]);
        } else {
            newPathSegmentsFromBase.push([
                'L',
                baseTerritoryPathSegments[nextIndex][1],
                baseTerritoryPathSegments[nextIndex][2]
            ]);
        }

        firstLoop = false;

        nextIndex = (nextIndex < baseTerritoryPathSegments.length - 1) 
                    ? nextIndex + 1 : 0;
        nextX = baseTerritoryPathSegments[nextIndex][1];
        nextY = baseTerritoryPathSegments[nextIndex][2];
    }

    nextIndex = (startPoint.innerIndex < comboTerritoryPathSegments.length - 1) 
                ? startPoint.innerIndex + 1 : 0;
    nextX = comboTerritoryPathSegments[nextIndex][1];
    nextY = comboTerritoryPathSegments[nextIndex][2];
    while (!isSharedPoint(nextX, nextY, sharedPoints)) {
        newPathSegmentsFromCombo.push([
            'L',
            comboTerritoryPathSegments[nextIndex][1],
            comboTerritoryPathSegments[nextIndex][2]
        ]);

        nextIndex = (nextIndex.innerIndex < comboTerritoryPathSegments.length - 1) 
                    ? nextIndex + 1 : 0;
        nextX = comboTerritoryPathSegments[nextIndex][1];
        nextY = comboTerritoryPathSegments[nextIndex][2];
    }

    var newPathSegments = newPathSegmentsFromBase.concat(newPathSegmentsFromCombo);

    for(index = 0; index < newPathSegments.length; index += 1) {
        newPathStr += newPathSegments[index][0] 
                        + newPathSegments[index][1] 
                        + ',' 
                        + newPathSegments[index][2];
    }

    console.log('Base Territory Path Str', baseTerritory.pathStr);
    console.log('Combo Territory Path Str', comboTerritory.pathStr);
    console.log('New Path Str', newPathStr);

    canvas.path(newPathStr).attr({
        fill: 'blue'
    });


    //start on base path:
    // if not shared add to new path
    // if shared but not end point continue
    // if shared end point then 
    // based on combo path innerIndex of that point, add point and iterate through combo path:
    //if next point is shared, go backwards
    //add to new path until we get to other end point, add it and switch to base
    //path based on outerIndex of shared point, if next point on base is shared go 
    // other direction and add points until we hit other end point


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
    index,
    prop,
    territoryIdsToCombine = [],
    MIN_AREA = 4000;

var territories = initialize(bbox, canvas, numCells);

for (prop in territories) {
    if (territories.hasOwnProperty(prop) && prop !== 'length') {
        territory = territories[prop];
        //console.log('Territory ' + territory.voronoiId);
        territory.adjTerritories = getAdjacentTerritories(territories, territory);
        //console.log('Adj Territories: ', territory.adjTerritories);
        territory.area = getAreaOfTerritory(territory);
        //console.log('Area: ', territory.area);

        if (territory.area <= MIN_AREA) {
            territoryIdsToCombine.push(territory.voronoiId);
        }

        territory.centerPoint = getCenter(territory);
        //console.log('Center Point: ', territory.centerPoint);
        territory.path = drawTerritory(territory, canvas);
        //console.log('Path: ', territory.path);
        drawTerritoryCenter(territory, canvas);
    }
}

console.log('Territory Ids to Combine: ', territoryIdsToCombine);

//for (index = 0; index < territoryIdsToCombine.length; index += 1) {
    if(territoryIdsToCombine.length > 0) {
        combineTerritory(territories, territoryIdsToCombine[0], canvas);
    }
//}
