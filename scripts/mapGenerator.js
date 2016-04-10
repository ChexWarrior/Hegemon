var mapGenerator = {
    //properties
    bbox: {
        xl: 0,
        xr: 800,
        yt: 0,
        yb: 800
    },
    sites: [],
    paper: Raphael(document.getElementById("map"), 800, 800),
    territories: [],
    //methods
    init: function() {
        var x = 0,
            voronoi = new Voronoi(),
            cells = null,
            currentCell = null,
            diagram = null,
            startX,
            startY,
            endX,
            endY,
            cellPath,
            cellColor,
            numCells = 55,
            pathStr = "",
            sitePoint,
            onEdge;
  
        // create random points
        for(var i = 0; i < numCells; i += 1) {
            this.sites.push({
                x: this.ranNum(0, 800),
                y: this.ranNum(0, 800)
            });
        }

        diagram = voronoi.compute(this.sites, this.bbox);
        console.log(diagram);
        cells = diagram.cells;

        for(i = 0; i < cells.length; i += 1) {
            currentCell = cells[i];
            pathStr = "";
            onEdge = false;
            for(x = 0; x < currentCell.halfedges.length; x += 1) {
                startX = currentCell.halfedges[x].getStartpoint().x;
                startY = currentCell.halfedges[x].getStartpoint().y;
                endX = currentCell.halfedges[x].getEndpoint().x;
                endY = currentCell.halfedges[x].getEndpoint().y;

                //TODO: Force all cells to move edges closer to center by one, this
                //will ensure that each cells border can be shown w/o overlap. Use
                //each side positions relative to site point to determine calculations...
                //Subtract the center coordinates from each edges point
                // A negative y indicates it is above the current point
                // A positive y indicates it is below the current point
                // A negative x indicates it is to the left of the current point
                // A positive x indicates it is to the right of the current point

                //to the right
                if(startX - currentCell.site.x > 0) {
                    startX -= 1;
                //to the left
                } else if (startX - currentCell.site.x < 0) {
                    startX += 1;
                }

                //to the right
                if(endX - currentCell.site.x > 0) {
                    endX -= 1;
                //to the left
                } else if (endX - currentCell.site.x < 0) {
                    endX += 1;
                }

                //below
                if(startY - currentCell.site.y > 0) {
                    startY -= 1;
                //above
                } else if (startY - currentCell.site.y < 0) {
                    startY += 1;
                }

                //below
                if(endY - currentCell.site.y > 0) {
                    endY -= 1;
                //above
                } else if (endY - currentCell.site.y < 0) {
                    endY += 1;
                }

                pathStr += ((x === 0) ? "M" : "L") + startX + "," + startY 
                    + "L" + endX + "," + endY;
            }

            cellPath = this.paper.path(pathStr);

            //draw site point
            sitePoint = this.paper.circle(currentCell.site.x, currentCell.site.y, 2);
            sitePoint.attr({
                fill: '#D61515'
            });

            cellPath.attr({
                stroke: "#000000",
                //'stroke-width': 2,
                fill: onEdge ? "#2F4FED" : "#6B4B2A"
            });

            cellPath.hover(function() {
                this.attr({
                    stroke: "#D61515"
                });
            }, function() {
                this.attr({
                    stroke: "#000000"
                });
            });

            //add a new territory to collection
            this.territories.push({
                startPoint: [startX, startY],
                endPoint: [endX, endY], 
                path: cellPath
            });
        }
    },
    determineTerrainType: function() {
        var numPaths = this.territories.length,
            randIndex = this.ranNum(0, numPaths - 1),
            chosenPath = numPaths[randIndex],
            adjPaths = [];
        adjPaths = this.getAdjPaths(chosenPath);
    },
    getAdjPaths: function(chosenPath) {
        var adjPaths = [];
        //randomly choose paths and make all adjacent paths "land"
        //how to tell if two polygons are adjacent:
        //  1) they share a side
        
        return adjPaths;
    },
    ranNum: function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

document.addEventListener("DOMContentLoaded", function() {
    mapGenerator.init();
});