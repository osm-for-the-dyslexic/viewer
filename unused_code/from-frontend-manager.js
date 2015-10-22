    /*
    // utility methods currently unused
    
    function deltaLonLat4aTile(zoom,y,x){
        var pos1 = num2deg(x, y, zoom);
        var pos2 = num2deg(x+1, y+1, zoom);
        var deltaLat = pos2.lat - pos1.lat;
        var deltaLon = pos2.lon - pos1.lon;
        return {dLat:deltaLat,dLon:deltaLon};
    }
    
    function deg2num (_latDeg, _lonDeg, _zoom){
        // From http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        // and http://stackoverflow.com/questions/135909/what-is-the-method-for-converting-radians-to-degrees
        // Lat = Y Lon = X
        var latRad = _latDeg * (Math.PI / 180.0);
        var n = Math.pow(2,_zoom);
        var xtile = Math.floor((_lonDeg + 180.0)/360.0*n);
        var ytile = Math.floor((1.0 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2.0 * n);
        return {z:_zoom,y:ytile,x:xtile};
        
    }

    function deg2pixel(_latDeg, _lonDeg, _zoom){
        // From https://help.openstreetmap.org/questions/747/given-a-latlon-how-do-i-find-the-precise-position-on-the-tile
        // The fractional part indicates the position within the tile. As a tile is 256 pixel wide, 
        // multiplying the fractional part with 256 will give you the pixel position from the top left.
        // Lat = Y Lon = X
        var latRad = _latDeg * (Math.PI / 180.0);
        var n = Math.pow(2,_zoom);
        var deltaX = Math.round((((_lonDeg + 180.0)/360.0*n)%1)*255);
        var deltaY = Math.round((((1.0 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2.0 * n)%1)*255);
        return {dy:deltaY,dx:deltaX};
    }
    
    function num2deg(xtile, ytile, zoom){
        // From http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        // and http://stackoverflow.com/questions/135909/what-is-the-method-for-converting-radians-to-degrees
        // Lat = Y Lon = X
        var n = Math.pow(2,zoom);
        var lonDeg = xtile / n * 360.0 - 180.0;
        // Math.sinh(x)  <==> (exp(x) - exp(-x))/2.
        var latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ytile / n)));
        var latDeg = latRad * (180.0 / Math.PI);
        return {lat:latDeg, lon:lonDeg};
    }
    */
    
    /*
    function printPositionMessage(){
        var tileId = deg2num(latDeg, lonDeg, zoomLevel);
        var deltaLonLatTile = deltaLonLat4aTile(tileId.z,tileId.y,tileId.x);
        var positionIntoTile = deg2pixel(latDeg, lonDeg, zoomLevel);
        var message = "";
        message += "---------------------------" + "\n";
        message += "zoomLevel       : " + zoomLevel + "\n";
        message += "latDeg          : " + latDeg + "\n";
        message += "lonDeg          : " + lonDeg + "\n";
        message += "---------------------------" + "\n";
        message += "central tile ID : " + tileId.z + "/" + tileId.y + "/" + tileId.x + "\n";
        message += "dLonForTile     : " + deltaLonLatTile.dLon + "\n";
        message += "dLatForTile     : " + deltaLonLatTile.dLat + "\n";
        message += "YposIntoTile    : " + positionIntoTile.dy + "\n";
        message += "XposIntoTile    : " + positionIntoTile.dx + "\n";
        message += "viewportWidth   : " + viewportWidth + "\n";
        message += "viewportHeight  : " + viewportHeight + "\n";
        message += "---------------------------" + "\n";
        //message += Date();
        //printMessageOnMapCanvas("Function: "+"onZoom(" + deltaZ +")\n" + Date());    
        printMessageOnMapCanvas(message);
    }
    */    