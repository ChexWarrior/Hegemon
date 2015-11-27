function ranNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("DOMContentLoaded", function() {
    var voronoi = new Voronoi();
    var bbox = {
        xl: 0,
        xr: 800,
        yt: 0,
        yb: 800
    };
    var sites = [];

    for(var i = 0; i < 35; i += 1) {
        sites.push({
            x: ranNum(0, 700),
            y: ranNum(0, 700)
        });
    }

    var diagram = voronoi.compute(sites, bbox),
        snap = Snap("#map"),
        x = 0,
        cells = diagram.cells,
        currentCell = null,
        startX,
        startY,
        endX,
        endY,
        cellPath,
        pathStr = "",
        color = "gray";

    console.log(diagram);
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

        if(i % 2) {
            color = "gray";
        } else {
            color = "white";
        }

        cellPath = snap.path(pathStr);
        cellPath.attr({
            stroke: "black",
            fill: color
        });
    }
});