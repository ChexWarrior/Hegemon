function ranNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("DOMContentLoaded", function() {
    var voronoi = new Voronoi(),
        bbox = {
            xl: 0,
            xr: 800,
            yt: 0,
            yb: 800
        },
        sites = [],
        diagram = null,
        paper = Raphael(document.getElementById("map"), 800, 800),
        x = 0,
        cells = null,
        currentCell = null,
        startX,
        startY,
        endX,
        endY,
        cellPath,
        cellColor,
        numCells = 55,
        pathStr = "";

    for(var i = 0; i < numCells; i += 1) {
        sites.push({
            x: ranNum(0, 700),
            y: ranNum(0, 700)
        });
    }

    diagram = voronoi.compute(sites, bbox);
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

        cellPath = paper.path(pathStr);
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
    }
});