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
    allPaths: [],
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
            pathStr = "";
  
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
            for(x = 0; x < currentCell.halfedges.length; x += 1) {
                startX = currentCell.halfedges[x].getStartpoint().x;
                startY = currentCell.halfedges[x].getStartpoint().y;
                endX = currentCell.halfedges[x].getEndpoint().x;
                endY = currentCell.halfedges[x].getEndpoint().y;

                pathStr += ((x === 0) ? "M" : "L") + startX + "," + startY 
                    + "L" + endX + "," + endY;
            }

            cellPath = this.paper.path(pathStr);
            cellPath.attr({
                stroke: "black",
                fill: "gray"
            });
            cellPath.hover(function() {
                this.attr({
                    fill: "green"
                });
            }, function() {
                this.attr({
                    fill: "gray"
                });
            });

            //add this path to collection
            this.allPaths.push(cellPath);
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