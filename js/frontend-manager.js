(function(window, document, exportName, undefined) {
    "use strict";
    
    var mapCanvas = null;
    var idCanvas = null;
    var buttonsDiv = null;
    var buttonGoBack = null;
    var buttonMenu = null;
    var buttonHelp = null;
    var buttonVoice = null;
    var viewportWidth = null;
    var viewportHeight = null;
    var minZoomLevel = 0;
    var maxZoomLevel = 19;
    var zoomLevel = minZoomLevel;
    var xTile = 0;
    var yTile = 0;
    var xPosIntoTile = 128;
    var yPosIntoTile = 128;
    var tileMapBaseUrls = ["http://a.tile.openstreetmap.org/","http://b.tile.openstreetmap.org/","http://c.tile.openstreetmap.org/"];
    var tileIdBaseUrl = "";

    
    var tilesNumCols = 0;
    var tilesNumRows = 0;
    
    //var renderTimeout = null;
    
    function getRandomElement(aVector) {
        var max = aVector.length - 1;
        return aVector[Math.floor(Math.random() * (max - 0 + 1)) + 0];
    }
    
    function randomYesNo(){
        return Math.floor((Math.random() * 2) + 0);
    }
    
    function cleanupTileCache(){
        console.log("before cleanup tilecache is "+ tileCacheLength + " long");
        var currentTileZ = 0;
        var currentTileX = 0;
        var currentTileY = 0;
        var tmpName, tmpSplit;
        for (var name in tileCache) {
            if (tileCache.hasOwnProperty(name)) {
                if (tileCache[name] !== null){
                    tmpName = name.substring(4); // MAP_ or IDS_ removed
                    tmpSplit = tmpName.split("/",3);
                    currentTileZ = parseInt(tmpSplit[0]);
                    currentTileX = parseInt(tmpSplit[1]);
                    currentTileY = parseInt(tmpSplit[2]);
                    if ((currentTileZ < zoomLevel -1)
                      ||(currentTileZ > zoomLevel +1)
                      ||(currentTileX < xTile -((tilesNumCols-1)/2))
                      ||(currentTileX > xTile +((tilesNumCols-1)/2))
                      ||(currentTileY < yTile -((tilesNumRows-1)/2))
                      ||(currentTileY > yTile +((tilesNumRows-1)/2))
                      ){
                        try {
                            delete tileCache[name];
                            tileCacheLength --;
                            //console.log ("removed " + name + " with delete");
                        } catch(e) { 
                            tileCache[name] = undefined; 
                            tileCacheLength --;
                            //console.log ("removed " + name + " with setting undefined");
                        }
                    }
                }
            } 
        }
        console.log("after cleanup tilecache is "+ tileCacheLength + " long");
    }
    
    // ------------------------------------------------------------------------
    // tile cache
    // ------------------------------------------------------------------------
    var tileCache = {};
    var tileCacheLength = 0;
    var tileCacheMaxLength = 150;
    function getTileImage(mapType,z,x,y){
        // check if tile id is valid
        // X goes from 0 to 2^zoom − 1 
        // Y goes from 0 to 2^zoom − 1
        var max = Math.pow(2,z) - 1;
        x = ((x%(max+1)+max+1)%(max+1));
        //if (x < 0) {return null;}
        //if (x > max) {return null;}
        
        if (y < 0) {return null;}
        if (y > max) {return null;}
        var tileName = "" + z + "/" + x + "/" + y;
        //console.log("x:" + x);
        //console.log("tileCacheLength: " + tileCacheLength);
        // to clean an image just set the object to null
        var imgElement = tileCache[""+mapType+"_"+tileName];
        if (typeof imgElement === "undefined") {
            tileCache[""+mapType+"_"+tileName] = null;
            tileCacheLength ++;
            imgElement = new Image();
            imgElement.onload = function(){
                tileCache[""+mapType+"_"+tileName] = this;
                if (z === zoomLevel){
                    redrawMapCanvas("onTile");
                }
                if (tileCacheLength > tileCacheMaxLength){
                    cleanupTileCache();
                }
                //clearTimeout(renderTimeout);
                //renderTimeout = setTimeout(redrawMapCanvas,300); // 300ms
            }
            // todo switch map type for url
            imgElement.src = getRandomElement(tileMapBaseUrls) + tileName + ".png" ;        
            return null;
        }
        return imgElement;
    }
    
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
    
    function onPan(deltaX,deltaY){
        xPosIntoTile -= deltaX;
        yPosIntoTile -= deltaY;
        var maxTile = Math.pow(2,zoomLevel) - 1;
        if (xPosIntoTile < 0){
            xPosIntoTile = 255 + xPosIntoTile; // since it is negative
            xTile -= 1;
            //if (xTile < 0) {xTile = 0;xPosIntoTile=0;}
        }
        if (yPosIntoTile < 0){
            yPosIntoTile = 255 + yPosIntoTile; // since it is negative
            yTile -= 1;
            if (yTile < 0) {yTile = 0;yPosIntoTile=0;}
            
        }
        if (xPosIntoTile > 255){
            xPosIntoTile = xPosIntoTile - 255;
            xTile += 1;
            //if (xTile > maxTile) {xTile = maxTile;xPosIntoTile=255;}
        }
        if (yPosIntoTile > 255){
            yPosIntoTile = yPosIntoTile - 255;
            yTile += 1;
            if (yTile > maxTile) {yTile = maxTile;yPosIntoTile=255;}
        }
        redrawMapCanvas("onPan");
    }
    
    function onZoom(deltaZ){
        var targetZoomLevel = zoomLevel + deltaZ;
        if ((targetZoomLevel < minZoomLevel ) || (targetZoomLevel>maxZoomLevel)){
            // do nothing
            return;
        }
        var operation = "";
        if (deltaZ > 0){
            operation = "zoomIn";
            zoomLevel += 1;
            if (xPosIntoTile<128){
                xTile = 2*xTile;
                xPosIntoTile = 2*xPosIntoTile;
            }else{
                xTile = 2*xTile+1;
                xPosIntoTile = 2*(xPosIntoTile-128);
            }
            if (yPosIntoTile<128){
                yTile = 2*yTile;
                yPosIntoTile = 2*yPosIntoTile;
            }else{
                yTile = 2*yTile+1;
                yPosIntoTile = 2*(yPosIntoTile-128);
            }
        }else{
            operation = "zoomOut";
            zoomLevel -= 1;
            if (xTile%2===0){
                xTile = xTile / 2;
                xPosIntoTile = Math.round(xPosIntoTile / 2);
            }else{
                xTile = Math.floor(xTile / 2);
                xPosIntoTile = 128 + Math.round(xPosIntoTile / 2);
            }
            if (yTile%2===0){
                yTile = yTile / 2;
                yPosIntoTile = Math.round(yPosIntoTile / 2);
            }else{
                yTile = Math.floor(yTile / 2);
                yPosIntoTile = 128 + Math.round(yPosIntoTile / 2);
            }
        }
        redrawMapCanvas(operation);
    }
    
    function onIdentify(canvasPosX,canvasPosY){
        redrawMapCanvas("onIdentify");
        printMessageOnMapCanvas("Function: "+"onIdentify(" + canvasPosX + "," + canvasPosY + ")\n" + Date());
    }
    
    function onButton(buttonId){
        redrawMapCanvas("onButton");
        printMessageOnMapCanvas("Function onButton(" + buttonId + ")\n" + Date());
    }
    
    /**
     * viewport height and width
     * support method
     */
    function viewport() {
        var e = window, a = 'inner';
        if (!('innerWidth' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
    }
    
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
    
    
    /**
     * Create Map canvas and Id canvas
     */
    function createChilds(mainElementId){
        var mainElement = document.getElementById(mainElementId);
        mapCanvas = document.createElement("canvas");
        mapCanvas.id = "map-canvas";
        idCanvas = document.createElement("canvas");
        idCanvas.id = "id-canvas";
        buttonsDiv = document.createElement("div");
        buttonsDiv.id = "buttons-div";
        
        buttonGoBack = document.createElement("div");
        buttonGoBack.id = "button-go-back";

        buttonMenu = document.createElement("div");
        buttonMenu.id = "button-menu";

        buttonHelp = document.createElement("div");
        buttonHelp.id = "button-help";

        buttonVoice = document.createElement("div");
        buttonVoice.id = "button-voice";
        
        buttonsDiv.appendChild(buttonGoBack);
        buttonsDiv.appendChild(buttonMenu);
        buttonsDiv.appendChild(buttonHelp);
        buttonsDiv.appendChild(buttonVoice);
        mainElement.appendChild(buttonsDiv);
        
        mainElement.appendChild(idCanvas);
        mainElement.appendChild(mapCanvas);
    }
    
    /**
     * Resize Map and id canvas to full screen
     */
    function arrangeGui(){
        var buttonsDimension = 100; // now dynamic
        viewportWidth = parseInt(""+viewport().width,10);
        viewportHeight = parseInt(""+viewport().height,10);
        
        var mapWidth = viewportWidth;
        var mapHeight = viewportHeight;
        var buttonWidth = viewportWidth;
        var buttonHeight = viewportHeight;
        var buttonTop = 0;
        var buttonLeft = 0;
        var availableSpace = 0;
        var gapsSpace = 0;
        var minGapSpace = 0;
        
        if (viewportWidth > viewportHeight){
            buttonsDimension = Math.floor(viewportHeight/4.0);
            if ( buttonsDimension > 100 ) {buttonsDimension = 100;}
            // buttons on right
            mapWidth -= buttonsDimension;
            buttonWidth = buttonsDimension;
            buttonLeft = mapWidth;
            availableSpace = viewportHeight;
            
        } else {
            buttonsDimension = Math.floor(viewportWidth/4.0);
            if ( buttonsDimension > 100 ) {buttonsDimension = 100;}
            // buttons on bottom
            mapHeight -= buttonsDimension;
            buttonHeight = buttonsDimension;
            buttonTop = mapHeight;
            availableSpace = viewportWidth;
        }
        
        mapCanvas.style.width = "" + mapWidth + "px";
        mapCanvas.style.height = "" + mapHeight + "px";
        var context = mapCanvas.getContext("2d");
        context.canvas.width  = "" + mapWidth + "";
        context.canvas.height = "" + mapHeight + "";
        idCanvas.style.width = "" + mapWidth + "px";
        idCanvas.style.height = "" + mapHeight + "px";
        var context2 = idCanvas.getContext("2d");
        context2.canvas.width  = "" + mapWidth + "";
        context2.canvas.height = "" + mapHeight + "";
        redrawMapCanvas("arrangeGui");
        buttonsDiv.style.height = "" + buttonHeight + "px";
        buttonsDiv.style.width = "" + buttonWidth + "px";
        buttonsDiv.style.top = "" + buttonTop + "px";
        buttonsDiv.style.left = "" + buttonLeft + "px";
        
        buttonGoBack.style.height = "" + (buttonsDimension) + "px";
        buttonGoBack.style.width = "" + (buttonsDimension) + "px";
        buttonMenu.style.height = "" + (buttonsDimension) + "px";
        buttonMenu.style.width = "" + (buttonsDimension) + "px";
        buttonHelp.style.height = "" + (buttonsDimension) + "px";
        buttonHelp.style.width = "" + (buttonsDimension) + "px";
        buttonVoice.style.height = "" + (buttonsDimension) + "px";
        buttonVoice.style.width = "" + (buttonsDimension) + "px";
        
        gapsSpace = availableSpace - (4 * buttonsDimension);
        minGapSpace = Math.floor(gapsSpace/5.0);
        
        //alert ("gapsSpace:" + gapsSpace + ", minGapSpace:" + minGapSpace*5);
        
        switch(gapsSpace - minGapSpace*5) {
            case 0:
                // ----------------------------
                // all gaps same dimension
                // ----------------------------
                // minGapSpace
                // button 1
                // minGapSpace
                // button 2
                // minGapSpace
                // button 3
                // minGapSpace
                // button 4
                // minGapSpace
                //alert("0");
                if (viewportWidth > viewportHeight){
                    // buttons on right
                    buttonGoBack.style.top = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonGoBack.style.left = "" + (0) + "px";
                    buttonMenu.style.top = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonMenu.style.left = "" + (0) + "px";
                    buttonHelp.style.top = "" + (minGapSpace*3+buttonsDimension*2) + "px";
                    buttonHelp.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonMenu.style.top = "" + (0) + "px";
                    buttonMenu.style.left = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonHelp.style.top = "" + (0) + "px";
                    buttonHelp.style.left = "" + (minGapSpace*3+buttonsDimension*2) + "px";
                    buttonVoice.style.top = "" + (0) + "px";
                    buttonVoice.style.left = "" + (minGapSpace*4+buttonsDimension*3) + "px";
                }                
            break;
            case 1:
                // ----------------------------
                // all gaps same dimension
                // ----------------------------
                // minGapSpace
                // button 1
                // minGapSpace
                // button 2
                // minGapSpace + 1
                // button 3
                // minGapSpace
                // button 4
                // minGapSpace
                //alert("1");
                if (viewportWidth > viewportHeight){
                    // buttons on right
                    buttonGoBack.style.top = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonGoBack.style.left = "" + (0) + "px";
                    buttonMenu.style.top = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonMenu.style.left = "" + (0) + "px";
                    buttonHelp.style.top = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonHelp.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (1+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonMenu.style.top = "" + (0) + "px";
                    buttonMenu.style.left = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonHelp.style.top = "" + (0) + "px";
                    buttonHelp.style.left = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonVoice.style.top = "" + (0) + "px";
                    buttonVoice.style.left = "" + (1+minGapSpace*4+buttonsDimension*3) + "px";
                }                
            break;
            case 2:
                // ----------------------------
                // first and last gap + 1
                // ----------------------------
                // minGapSpace + 1
                // button 1
                // minGapSpace
                // button 2
                // minGapSpace
                // button 3
                // minGapSpace
                // button 4
                // minGapSpace + 1
                //alert("2");
                if (viewportWidth > viewportHeight){
                    // buttons on right
                    buttonGoBack.style.top = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonGoBack.style.left = "" + (0) + "px";
                    buttonMenu.style.top = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonMenu.style.left = "" + (0) + "px";
                    buttonHelp.style.top = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonHelp.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (1+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonMenu.style.top = "" + (0) + "px";
                    buttonMenu.style.left = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonHelp.style.top = "" + (0) + "px";
                    buttonHelp.style.left = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonVoice.style.top = "" + (0) + "px";
                    buttonVoice.style.left = "" + (1+minGapSpace*4+buttonsDimension*3) + "px";
                }                
            break;
            case 3:
                // ----------------------------
                // first last and central gap + 1
                // ----------------------------
                // minGapSpace + 1
                // button 1
                // minGapSpace
                // button 2
                // minGapSpace + 1
                // button 3
                // minGapSpace
                // button 4
                // minGapSpace + 1
                //alert("3");
                if (viewportWidth > viewportHeight){
                    // buttons on right
                    buttonGoBack.style.top = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonGoBack.style.left = "" + (0) + "px";
                    buttonMenu.style.top = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonMenu.style.left = "" + (0) + "px";
                    buttonHelp.style.top = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonHelp.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (2+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonMenu.style.top = "" + (0) + "px";
                    buttonMenu.style.left = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonHelp.style.top = "" + (0) + "px";
                    buttonHelp.style.left = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonVoice.style.top = "" + (0) + "px";
                    buttonVoice.style.left = "" + (2+minGapSpace*4+buttonsDimension*3) + "px";
                }                
            break;
            case 4:
                // ----------------------------
                // first, second forth fifth gap +1
                // ----------------------------
                // minGapSpace + 1
                // button 1
                // minGapSpace + 1
                // button 2
                // minGapSpace
                // button 3
                // minGapSpace + 1
                // button 4
                // minGapSpace + 1
                //alert("4");
                if (viewportWidth > viewportHeight){
                    // buttons on right
                    buttonGoBack.style.top = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonGoBack.style.left = "" + (0) + "px";
                    buttonMenu.style.top = "" + (2+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonMenu.style.left = "" + (0) + "px";
                    buttonHelp.style.top = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonHelp.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (3+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonMenu.style.top = "" + (0) + "px";
                    buttonMenu.style.left = "" + (2+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonHelp.style.top = "" + (0) + "px";
                    buttonHelp.style.left = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonVoice.style.top = "" + (0) + "px";
                    buttonVoice.style.left = "" + (3+minGapSpace*4+buttonsDimension*3) + "px";
                }                
            break;
            default:
                // should never happen, all gaps same dimension
                alert("default: "+ (gapsSpace - minGapSpace*5));
        }        
        //printMessageOnMapCanvas("Function: "+"arrangeGui" + "\n" + Date());
        //printPositionMessage();
    }
    
    /**
     * Support method to completly erase the map canvas
     */
    function redrawMapCanvas(operation){
        // operation not used yed
        var mapContext = mapCanvas.getContext("2d");
        var idContext = idCanvas.getContext("2d");
        mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        idContext.clearRect(0, 0, idCanvas.width, idCanvas.height);
        var currentPosXonCanvas = Math.floor(mapCanvas.width / 2) - xPosIntoTile - (256 *((tilesNumCols-1)/2));
        var currentPosYonCanvas = Math.floor(mapCanvas.height/ 2) - yPosIntoTile - (256 *((tilesNumRows-1)/2));
        var currentXtile = xTile - ((tilesNumCols-1)/2);  // is always an integer since tilesNumCols is odd
        var currentYtile = yTile - ((tilesNumRows-1)/2);  // is always an integer since tilesNumRows is odd
        var imageTile = null;
        //var tileName = null;
        for (var i = 0; i < tilesNumRows; i++){      // on X
            for (var j = 0; j < tilesNumCols; j++){  // on Y
                
                imageTile = getTileImage("MAP",zoomLevel,(currentXtile+j),(currentYtile+i));
                if (imageTile === null){
                    // render the replacement
                    //if ((i+j+currentXtile+currentYtile)%2===0){
                        mapContext.fillStyle = "#DDDDDD";
                    //}else{
                    //    mapContext.fillStyle = "#EEEEEE";
                    //}
                    
                    mapContext.fillRect(currentPosXonCanvas,currentPosYonCanvas,256,256);
                    //mapContext.font="15px Courier";
                    //mapContext.fillStyle = "#000000";
                    //mapContext.fillText("z: "+zoomLevel+" x: "+(currentXtile+j)+" y: "+(currentYtile+i),currentPosXonCanvas+10,currentPosYonCanvas+128);
                }else{
                    // render the tile for Map Canvas
                    mapContext.drawImage(imageTile, currentPosXonCanvas, currentPosYonCanvas,256,256);
                }
                
                imageTile = getTileImage("IDS",zoomLevel,(currentXtile+j),(currentYtile+i));
                if (imageTile === null){
                    // white replacemente for idCanvas
                    idContext.fillStyle = "#DDDDDD";
                    idContext.fillRect(currentPosXonCanvas,currentPosYonCanvas,256,256);
                }else{
                    // render the tile for idCanvas
                    idContext.drawImage(imageTile, currentPosXonCanvas, currentPosYonCanvas,256,256);
                }
                
                currentPosXonCanvas += 256; 
            }
            currentPosXonCanvas = Math.floor(mapCanvas.width / 2) - xPosIntoTile - (256 *((tilesNumCols-1)/2));
            currentPosYonCanvas += 256;
        }
    }
    
    function configureTileMap(){
        // to be called always after arrangeGui()
        var nCols = Math.ceil(viewportWidth/256)+1;
        tilesNumCols = (nCols%2===0?nCols+1:nCols);
        var nRows = Math.ceil(viewportHeight/256)+1;
        tilesNumRows =(nRows%2===0?nRows+1:nRows);
        
        console.log("now tilMap is C:" +  tilesNumCols + "x R:" + tilesNumRows);
    }
    
    
    function onResize(){
        arrangeGui();
        configureTileMap();
        redrawMapCanvas("onResize");
    }
    
    /**
     * Support method to write a (debug) message on map canvas
     */
    function printMessageOnMapCanvas(message){
        var lines = message.split("\n");
        var context=mapCanvas.getContext("2d");
        context.font="15px Courier";
        context.fillStyle = "#000000";
        for (var i = 0; i < lines.length; i++) {
            context.fillText(lines[i],10,50+i*25);
        } 
    }    
    
    /**
     * Main method of the module FrontendManager
     */
    function FrontendManager(mainElementId) {
        createChilds(mainElementId);
        onResize();
        window.addEventListener("resize", onResize);
        GestureManager(mapCanvas,onPan,onZoom,onIdentify,[buttonGoBack,buttonMenu,buttonHelp,buttonVoice],onButton);
        //MapManager(mapCanvas)
        return;
    }
    
    // export
    if (typeof define == "function" && define.amd) {
        define(function() {
            return FrontendManager;
        });
    } else if (typeof module != "undefined" && module.exports) {
        module.exports = FrontendManager;
    } else {
        window[exportName] = FrontendManager;
    }    
})(window, document, "FrontendManager");    
