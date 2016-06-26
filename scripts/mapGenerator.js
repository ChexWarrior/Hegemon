'use strict';

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
            x: chance.integer({min: 0, max: 800}),
            y: chance.integer({min: 0, max: 800})
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


function combineTerritory(territories, comboTerritory, adjTerritory, canvas) {
    var adjTerritoryPathSegments = Raphael.parsePathString(adjTerritory.pathStr),
        comboTerritoryPathSegments = Raphael.parsePathString(comboTerritory.pathStr),
        currentTerritory,
        newTerritoryPathSegmentsFromAdj = [],
        newTerritoryPathSegmentsFromCombo = [],
        newTerritoryPathSegments = [],
        newTerritoryPathStr = '',
        newTerritory = {},
        outerIndex,
        innerIndex,
        index,
        adjIndex,
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
        sharedPoints = [],
        adjPathStartPoint,
        adjPathEndPoint,
        comboPathStartPoint,
        comboPathEndPoint,
        lastPointIsShared,
        nextPointIsShared,
        currentPoint;

    comboTerritory.path.attr({
        fill: 'pink'
    });

    adjTerritory.path.attr({
        fill: 'green'
    });

    console.log('Combo Territory', comboTerritory);
    console.log('Adjacent Territory', adjTerritory);

    for (outerIndex = 0; outerIndex < adjTerritoryPathSegments.length; outerIndex += 1) {
        outerX = adjTerritoryPathSegments[outerIndex][1];
        outerY = adjTerritoryPathSegments[outerIndex][2];
        //console.log('Outer Point: ' + outerX + ',' + outerY)
        for (innerIndex = 0; innerIndex < comboTerritoryPathSegments.length; innerIndex += 1) {
            innerX = comboTerritoryPathSegments[innerIndex][1];
            innerY = comboTerritoryPathSegments[innerIndex][2];

            //console.log('Inner Point: ' + innerX + ',' + innerY)
            //if a shared point
            if (innerX === outerX && innerY === outerY) {
                //console.log('Found shared point!');
                sharedPoints.push({
                    x: innerX,
                    y: innerY,
                    //index of this point within inner path segments
                    innerIndex: innerIndex,
                    //index of this point within outer path segments
                    outerIndex: outerIndex                
                });
            }
        }
    }

    //find starting and ending shared points relative to base path
    for (index = 0; index < adjTerritoryPathSegments.length; index += 1) {
        lastIndex = (index > 0) ? index - 1 : adjTerritoryPathSegments.length - 1;
        nextIndex = (index < adjTerritoryPathSegments.length - 1) ? index + 1 : 0;

        currentX = adjTerritoryPathSegments[index][1];
        currentY = adjTerritoryPathSegments[index][2];

        nextX = adjTerritoryPathSegments[nextIndex][1];
        nextY = adjTerritoryPathSegments[nextIndex][2];

        lastX = adjTerritoryPathSegments[lastIndex][1];
        lastY = adjTerritoryPathSegments[lastIndex][2];

        if (currentPoint = isSharedPoint(currentX, currentY, sharedPoints)) {
            lastPointIsShared = isSharedPoint(lastX, lastY, sharedPoints);
            nextPointIsShared = isSharedPoint(nextX, nextY, sharedPoints);

            if (!lastPointIsShared && nextPointIsShared) {
                adjPathStartPoint = currentPoint;

            } else if (lastPointIsShared && !nextPointIsShared) {
                adjPathEndPoint = currentPoint;
            }
        }
    }

    //find starting and ending shared points relative to combo path
    for (index = 0; index < comboTerritoryPathSegments.length; index += 1) {
        lastIndex = (index > 0) ? index - 1 : comboTerritoryPathSegments.length - 1;
        nextIndex = (index < comboTerritoryPathSegments.length - 1) ? index + 1 : 0;

        currentX = comboTerritoryPathSegments[index][1];
        currentY = comboTerritoryPathSegments[index][2];

        nextX = comboTerritoryPathSegments[nextIndex][1];
        nextY = comboTerritoryPathSegments[nextIndex][2];

        lastX = comboTerritoryPathSegments[lastIndex][1];
        lastY = comboTerritoryPathSegments[lastIndex][2];

        if (currentPoint = isSharedPoint(currentX, currentY, sharedPoints)) {
            lastPointIsShared = isSharedPoint(lastX, lastY, sharedPoints);
            nextPointIsShared = isSharedPoint(nextX, nextY, sharedPoints);

            if (!lastPointIsShared && nextPointIsShared) {
                comboPathStartPoint = currentPoint;

            } else if (lastPointIsShared && !nextPointIsShared) {
                comboPathEndPoint = currentPoint;
            }
        }
    }

    //add end point as first part of new path string
    newTerritoryPathSegmentsFromAdj.push([
        'M',
         adjTerritoryPathSegments[adjPathEndPoint.outerIndex][1],
         adjTerritoryPathSegments[adjPathEndPoint.outerIndex][2]
    ]);

    //beginning with end point, add all non shared paths to new path
    nextIndex = (adjPathEndPoint.outerIndex < adjTerritoryPathSegments.length - 1) 
                ? adjPathEndPoint.outerIndex + 1 : 0;
    nextX = adjTerritoryPathSegments[nextIndex][1];
    nextY = adjTerritoryPathSegments[nextIndex][2];

    while (!isSharedPoint(nextX, nextY, sharedPoints)) {
            newTerritoryPathSegmentsFromAdj.push([
                'L',
                adjTerritoryPathSegments[nextIndex][1],
                adjTerritoryPathSegments[nextIndex][2]
            ]);
        nextIndex = (nextIndex < adjTerritoryPathSegments.length - 1) 
                    ? nextIndex + 1 : 0;
        nextX = adjTerritoryPathSegments[nextIndex][1];
        nextY = adjTerritoryPathSegments[nextIndex][2];
    }

    //add start point of of base 
    newTerritoryPathSegmentsFromAdj.push([
        'L',
         adjTerritoryPathSegments[adjPathStartPoint.outerIndex][1],
         adjTerritoryPathSegments[adjPathStartPoint.outerIndex][2]
    ]);

    //add all non shared points from combo path
    nextIndex = (comboPathEndPoint.innerIndex < comboTerritoryPathSegments.length - 1) 
                ? comboPathEndPoint.innerIndex + 1 : 0;
    nextX = comboTerritoryPathSegments[nextIndex][1];
    nextY = comboTerritoryPathSegments[nextIndex][2];
    while (!isSharedPoint(nextX, nextY, sharedPoints)) {
        newTerritoryPathSegmentsFromCombo.push([
            'L',
            comboTerritoryPathSegments[nextIndex][1],
            comboTerritoryPathSegments[nextIndex][2]
        ]);

        nextIndex = (nextIndex < comboTerritoryPathSegments.length - 1) 
                    ? nextIndex + 1 : 0;
        nextX = comboTerritoryPathSegments[nextIndex][1];
        nextY = comboTerritoryPathSegments[nextIndex][2];
    }

    newTerritoryPathSegments = 
        newTerritoryPathSegmentsFromAdj.concat(newTerritoryPathSegmentsFromCombo);

    for(index = 0; index < newTerritoryPathSegments.length; index += 1) {
        newTerritoryPathStr += newTerritoryPathSegments[index][0] 
                        + newTerritoryPathSegments[index][1] 
                        + ',' 
                        + newTerritoryPathSegments[index][2];
    }

    // console.log('Base Territory Path Str', adjTerritory.pathStr);
    // console.log('Combo Territory Path Str', comboTerritory.pathStr);
    // console.log('New Path Str', newTerritoryPathStr);

    newTerritory.path = canvas.path(newTerritoryPathStr).attr({
        fill: 'blue',
        'fill-opacity': 0.5
    });

    //create new entry for this territory
    //give new territory the voronoi id of combo
    newTerritory.voronoiId = comboTerritory.voronoiId;
    //add adj territories of both old territories
    newTerritory.adjTerritories = 
        _.uniq(comboTerritory.adjTerritories.concat(adjTerritory.adjTerritories));
    newTerritory.pathStr = newTerritoryPathStr;
    newTerritory.center = getCenter(newTerritory);
    //TODO: Don't get center of territories till after combining smaller ones
    //remove adj territory from territories obj
    //ensure territories that were adj to adjTerritory are changed to new territory
    for(index = 0; index < adjTerritory.adjTerritories.length; index += 1) {
        currentTerritory = territories[adjTerritory.adjTerritories[index]];
        adjIndex =_.indexOf(currentTerritory.adjTerritories, adjTerritory.voronoiId);
        currentTerritory.adjTerritories[adjIndex] = newTerritory.voronoiId;
        currentTerritory.adjTerritories = _.uniq(currentTerritory.adjTerritories);
    }

    //remove adj territory from new territory
    adjIndex = _.indexOf(newTerritory.adjTerritories, adjTerritory.voronoiId);
    newTerritory.adjTerritories.splice(adjIndex, 1);

    territories[adjTerritory.voronoiId] = undefined;
    //replace combo territory
    territories[comboTerritory.voronoiId] = newTerritory;

    console.log('New Territory: ', newTerritory);
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
    comboTerritory,
    adjTerritory,
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

for (index = 0; index < territoryIdsToCombine.length; index += 1) {
    //ensure this territory wasn't removed during combo before...
    if(territories[territoryIdsToCombine[index]]) {
        //get territory to combine
        comboTerritory = territories[territoryIdsToCombine[index]];
        //pull random adj territory to combine prev territory with
        adjTerritory = territories[
            comboTerritory.adjTerritories[chance.integer({ 
                min: 0, 
                max: comboTerritory.adjTerritories.length - 1
            })]
        ];
        combineTerritory(territories, comboTerritory, adjTerritory, canvas);
    }
}
