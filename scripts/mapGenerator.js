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
        for (var i = 0; i < numCells; i += 1) {
            this.sites.push({
                x: this.ranNum(0, 800),
                y: this.ranNum(0, 800)
            });
        }

        diagram = voronoi.compute(this.sites, this.bbox);
        console.log(diagram);
        cells = diagram.cells;

        for (i = 0; i < cells.length; i += 1) {
            currentCell = cells[i];
            pathStr = '';
            onEdge = false;
            for (x = 0; x < currentCell.halfedges.length; x += 1) {
                startX = currentCell.halfedges[x].getStartpoint().x;
                startY = currentCell.halfedges[x].getStartpoint().y;
                endX = currentCell.halfedges[x].getEndpoint().x;
                endY = currentCell.halfedges[x].getEndpoint().y;

                pathStr += ((x === 0) ? "M" : "L") + startX + "," + startY + "L" + endX + "," + endY;
            }

            cellPath = this.paper.path(pathStr);

            cellPath.attr({
                stroke: "#000000",
                fill: onEdge ? "#2F4FED" : "#6B4B2A"
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

            //add a new territory to collection
            this.territories[cells[i].site.voronoiId.toString()] = {
                startPoint: [startX, startY],
                endPoint: [endX, endY],
                site: cells[i].site,
                halfedges: cells[i].halfedges,
                path: cellPath
            };
        }

        var adjPaths;

        for (index = 0; index < this.territories.length; index += 1) {
            adjPaths = [];
            for (x = 0; x < this.territories[index].halfedges.length; x += 1) {
                if (this.territories[index].halfedges[x].edge.lSite) {
                    adjPaths.push(this.territories[index].halfedges[x].edge.lSite.voronoiId);
                }
                
                if (this.territories[index].halfedges[x].edge.rSite) {
                    adjPaths.push(this.territories[index].halfedges[x].edge.rSite.voronoiId);
                }
            }
        }

        console.log(this.territories);
    },
    ranNum: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

document.addEventListener("DOMContentLoaded", function() {
    mapGenerator.init();
});
