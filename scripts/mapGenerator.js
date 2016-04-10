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

                pathStr += ((x === 0) ? "M" : "L") + startX + "," + startY 
                    + "L" + endX + "," + endY;
            }

            cellPath = this.paper.path(pathStr);
            cellPath.attr({
                stroke: "#000000",
                fill: onEdge ? "#2F4FED" : "#6B4B2A"
            });
            // cellPath.hover(function() {
            //     this.attr({
            //         stroke: "#000000",
            //         fill: onEdge ? "#2F4FED" : "#6B4B2A"
            //     });
            // }, function() {
            //     this.attr({
            //         stroke: "#000000",
            //         fill: onEdge ? "#2F4FED" : "#6B4B2A"
            //     });
            // });

            //add a new territory to collection
            this.territories.push({
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