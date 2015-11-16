(function(window, document, exportName, undefined) {
    "use strict";
    // http://www.movable-type.co.uk/scripts/latlong.html - some functions on latlog and distance
    
    // Html elements of the page
    var mapCanvas = null;
    var idCanvas = null;
    var buttonsDiv = null;
    var buttonGoBack = null;
    var buttonMenu = null;
    var buttonHelp = null;
    var buttonVoice = null;
    var divGoBack = null;
    var divMenu = null;
    var divHelp = null;
    var divVoice = null;

    // characteristics of the viewport
    var viewportWidth = null;
    var viewportHeight = null;
    
    // characteristics of the map
    var minZoomLevel = 0;
    var maxZoomLevel = 5;
    var tilesNumCols = 1;
    var tilesNumRows = 1;
    
    // Current position
    var zoomLevel = minZoomLevel;
    var xTile = 0;
    var yTile = 0;
    var xPosIntoTile = 128;
    var yPosIntoTile = 128;
    
    // URLs for tiles
    //var tileMapBaseUrls = ["http://a.tile.openstreetmap.org/","http://b.tile.openstreetmap.org/","http://c.tile.openstreetmap.org/"];
    // var tileMapBaseUrls = ["http://www.develost.com/maps/osm4dys/"];
    
    var tileMapBaseUrls = ["http://osm-for-the-dyslexic.github.io/viewer/map/osm4dys_id/"];
    //var tileMapBaseUrls = ["http://a.tile.openstreetmap.org/"];
    //var tileIdBaseUrls = ["http://a.tile.openstreetmap.org/"];
    //var tileIdBaseUrls = ["http://www.develost.com/maps/osm4dys_id/"];
    var tileIdBaseUrls = ["http://osm-for-the-dyslexic.github.io/viewer/map/osm4dys_id/"];

    // TileCache
    var defaultImage = new Image();
    var tileCache = {};
    var tileCacheLength = 0;
    var tileCacheMaxLength = 150;
    
    /**
     * return a random element of a vector
     */
    function getRandomElement(aVector) {
        var max = aVector.length - 1;
        return aVector[Math.floor(Math.random() * (max - 0 + 1)) + 0];
    }
    
    /**
     * return either 1 (yes) or 0 (no)
     */
    function randomYesNo(){
        return Math.floor((Math.random() * 2) + 0);
    }
    
    function initializeMap(){
        // a 256x256 png r=173 g=222 b=255  #ADDEFF same as osm color for ocean
        defaultImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAMhSURBVHhe7dQxAcAwDMCwbPyplNKoZE9ZWHrMwM/5dgdIem+BIAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOArJkfkUEFibeMV7cAAAAASUVORK5CYII=";
    }

    /**
     * Cleanup tile cache using proximity as parameter
     */
    function cleanupTileCache(){
        var originalTileCacheLength = tileCacheLength;
        //console.log("before cleanup tilecache is "+ tileCacheLength + " of " + tileCacheMaxLength + "- actual grid is " + tilesNumCols + "x"+ tilesNumRows);
        var max = Math.pow(2,zoomLevel) - 1;
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
                    //if ((currentTileZ < zoomLevel -1)
                    //  ||(currentTileZ > zoomLevel +1)
                    if ((currentTileZ < zoomLevel)
                      ||(currentTileZ > zoomLevel)
                      ||(currentTileX < ((xTile%(max+1)+max+1)%(max+1)) -((tilesNumCols-1)/2) - 1)
                      ||(currentTileX > ((xTile%(max+1)+max+1)%(max+1)) +((tilesNumCols-1)/2) - 1)
                      ||(currentTileY < yTile -((tilesNumRows-1)/2) - 1)
                      ||(currentTileY > yTile +((tilesNumRows-1)/2) - 1)
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
        console.log("after cleanup tilecache went from " + originalTileCacheLength + " to "+ tileCacheLength + " - max is " + tileCacheMaxLength + " actual grid is " + tilesNumCols + "x"+ tilesNumRows);
    }
    
    /**
     * Load a tile asyncronously into the tile cache
     */
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
            //imgElement.onerror = function(){
            //    tileCache[""+mapType+"_"+tileName] = defaultImage;
            //    if (z === zoomLevel){
            //        redrawMapCanvas("onTile");
            //    }
            //    if (tileCacheLength > tileCacheMaxLength){
            //        cleanupTileCache();
            //    }
            //}
            
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
            
            // switch map type for url
            var baseUrls = null;
            if (mapType === "MAP"){
                baseUrls = tileMapBaseUrls;
            }else{
                // IDS
                baseUrls = tileIdBaseUrls;
            }
            // mandatory set it before src
            imgElement.setAttribute('crossOrigin','anonymous');
            imgElement.src = getRandomElement(baseUrls) + tileName + ".png" ;        
            //imgElement.crossOrigin = "Anonymous";
            return null;
        }
        return imgElement;
    }
    
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
    
    
    function pad (_pad, str, padLeft) {
        if (typeof str === 'undefined') return _pad;
        if (padLeft) {
            return (_pad + str).slice(-_pad.length);
        } else {
            return (str + _pad).substring(0, _pad.length);
       }
    }    
    
    
    /**
     * utility method to check if an element is visble or not
     */
    function isVisible(elem) {
        return (elem.style.visibility != "hidden");
    }
    
    /**
     * utility method to set visbility on an html element
     */
    function setVisible(elem,yesNo){
        if (yesNo){
            elem.style.visibility = "visible";
        }else{
            elem.style.visibility = "hidden";
        }
    }
    
    /**
     * utility method to switch visbility of an html element
     */
    function switchVisible(elem){
        setVisible(elem,!isVisible(elem));
    }
    
    
    function onIdentify(canvasPosX,canvasPosY){
        redrawMapCanvas("onIdentify");
        var idContext = idCanvas.getContext("2d");
        var idWidth = idCanvas.width;
        var idHeight = idCanvas.height;
        if ((canvasPosX < 3) || (canvasPosX > idWidth - 3)) {return;}
        if ((canvasPosY < 3) || (canvasPosY > idHeight - 3)) {return;}
        var message = "";
        try {
            var points = idContext.getImageData(canvasPosX-3, canvasPosY-3, 7, 7); 
            // find the starting point
            message += "points.data.length = " + points.data.length + "\n";
            // each point has 4 bytes RGBA (A unused for us)
            var k = 0;
            for (var i=0; i<7;i++){
                for (var j=0;j<7;j++){
                    // start index
                    k = (i*7+j)*4;
                    //message += pad("00000000",points.data[k].toString(2)) + " ";
                    //message += pad("00000000",points.data[k+1].toString(2)) + " ";
                    //message += pad("00000000",points.data[k+2].toString(2)) + " ";
                    //message += pad("00000000",points.data[k+3].toString(2)) + "\n";
                    var redChannel = pad("00000000",points.data[k].toString(2))
                    if (redChannel[0] === '1'){
                        message += "found in " + i + "," + j ;
                    }
                    //message += pad("00000000",points.data[k].toString(2)) + " ";
                    //message += pad("00000000",points.data[k+1].toString(2)) + " ";
                    //message += pad("00000000",points.data[k+2].toString(2)) + " ";
                    //message += pad("00000000",points.data[k+3].toString(2)) + " ";
                }
            }
            //for (var i=0; i<points.data.length; i++ ){
            //    if (i%4 === 0){message += "\n";}
            //    message += pad("00000000",points.data[0].toString(2)) + " ";
            //}
            // message += pad("00000000",points.data[0].toString(2)) + " ";
            // message += pad("00000000",points.data[1].toString(2)) + " ";
            // message += pad("00000000",points.data[2].toString(2)) + " ";
            // message += pad("00000000",points.data[3].toString(2)) + " ";
            // the starting point has to be into the first 8x8 ( 0->7 ) othewise not found - return
            var startX = 0; // TODO calculate 
            var startY = 0; // TODO calculate
            //for (var i=0; i<8; i++ ){
            //    for (var j=0; j<8; j++ ){
            //        message +=  ((startX+i)*15)+startY+j + " ";
            //    }
            //    message += "\n";
            //}
            //message += pad("00",points.data[(i*4)+0].toString(16));
            //message += pad("00",points.data[(i*4)+1].toString(16));
            //message += pad("00",points.data[(i*4)+2].toString(16));
            // i+3 id the alpha do not consider for now
        } catch(e) {
            message = "Exception";
        }
        printMessageOnMapCanvas(message);
    }
    
    function onButton(buttonId){
        switch(buttonId) {
            case "button-go-back":
                switchVisible(divGoBack);
                setVisible(divMenu,false);
                setVisible(divHelp,false);
                setVisible(divVoice,false);
            break;
            case "button-menu":
                setVisible(divGoBack,false);
                switchVisible(divMenu);
                setVisible(divHelp,false);
                setVisible(divVoice,false);
            break;
            case "button-help":
                setVisible(divGoBack,false);
                setVisible(divMenu,false);
                switchVisible(divHelp);
                setVisible(divVoice,false);
            break;
            case "button-voice":
                setVisible(divGoBack,false);
                setVisible(divMenu,false);
                setVisible(divHelp,false);
                switchVisible(divVoice);
            break;
            default:
                // should never happen - all invisible
                setVisible(divGoBack,false);
                setVisible(divMenu,false);
                setVisible(divHelp,false);
                setVisible(divVoice,false);
        }
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
    
    /**
     * Create Map canvas, Id canvas, buttons and other html elements
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
        
        divGoBack = document.createElement("div");
        divGoBack.id = "div-go-back";
        setVisible(divGoBack,false);
        
        divMenu = document.createElement("div");
        divMenu.id = "div-menu";
        setVisible(divMenu,false);

        divHelp = document.createElement("div");
        divHelp.id = "div-help";
        setVisible(divHelp,false);

        divVoice = document.createElement("div");
        divVoice.id = "div-voice";
        setVisible(divVoice,false);
        
        mainElement.appendChild(divGoBack);
        mainElement.appendChild(divMenu);
        mainElement.appendChild(divHelp);
        mainElement.appendChild(divVoice);

    }
    
    /**
     * Resize Map and id canvas to full screen
     */
    function arrangeGui(){
        var buttonsDimension = 100; // now dynamic
        viewportWidth = parseInt(""+viewport().width,10);
        viewportHeight = parseInt(""+viewport().height,10);
        
        // resize html and body
        document.documentElement.style.width = "" + viewportWidth + "px";
        document.documentElement.style.height = "" + viewportHeight + "px";
        document.body.style.width = "" + viewportWidth + "px";
        document.body.style.height = "" + viewportHeight + "px";
        
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
                //alert("default: "+ (gapsSpace - minGapSpace*5));
        }
        // Arrange information divs
        if (viewportWidth > viewportHeight){
            // div 1/2 of the screen (minus buttons)
            divGoBack.style.top = "" + 0 + "px";
            divGoBack.style.left = "" + viewportWidth/2 + "px";
            divGoBack.style.height = "" + (viewportHeight) + "px";
            divGoBack.style.width = "" + (viewportWidth - (viewportWidth/2) - buttonsDimension) + "px";

            divMenu.style.top = "" + 0 + "px";
            divMenu.style.left = "" + viewportWidth/2 + "px";
            divMenu.style.height = "" + (viewportHeight) + "px";
            divMenu.style.width = "" + (viewportWidth - (viewportWidth/2) - buttonsDimension) + "px";
            
            divHelp.style.top = "" + 0 + "px";
            divHelp.style.left = "" + viewportWidth/2 + "px";
            divHelp.style.height = "" + (viewportHeight) + "px";
            divHelp.style.width = "" + (viewportWidth - (viewportWidth/2) - buttonsDimension) + "px";

            divVoice.style.top = "" + 0 + "px";
            divVoice.style.left = "" + viewportWidth/2 + "px";
            divVoice.style.height = "" + (viewportHeight) + "px";
            divVoice.style.width = "" + (viewportWidth - (viewportWidth/2) - buttonsDimension) + "px";
            
        }else{
            // div full screen (minus buttons)
            divGoBack.style.top = "" + 0 + "px";
            divGoBack.style.left = "" + 0 + "px";
            divGoBack.style.height = "" + (viewportHeight - buttonsDimension) + "px";
            divGoBack.style.width = "" + (viewportWidth) + "px";
            
            divMenu.style.top = "" + 0 + "px";
            divMenu.style.left = "" + 0 + "px";
            divMenu.style.height = "" + (viewportHeight - buttonsDimension) + "px";
            divMenu.style.width = "" + (viewportWidth) + "px";

            divHelp.style.top = "" + 0 + "px";
            divHelp.style.left = "" + 0 + "px";
            divHelp.style.height = "" + (viewportHeight - buttonsDimension) + "px";
            divHelp.style.width = "" + (viewportWidth) + "px";

            divVoice.style.top = "" + 0 + "px";
            divVoice.style.left = "" + 0 + "px";
            divVoice.style.height = "" + (viewportHeight - buttonsDimension) + "px";
            divVoice.style.width = "" + (viewportWidth) + "px";
        }

        
        //printMessageOnMapCanvas("Function: "+"arrangeGui" + "\n" + Date());
        //printPositionMessage();
    }
    
    /**
     * Method to repaint map and Id canvas
     */
    function redrawMapCanvas(operation){
        // operation not used yet
        var mapContext = mapCanvas.getContext("2d");
        var idContext = idCanvas.getContext("2d");
        mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
        idContext.clearRect(0, 0, idCanvas.width, idCanvas.height);
        var currentPosXonCanvas = Math.floor(mapCanvas.width / 2) - xPosIntoTile - (256 *((tilesNumCols-1)/2));
        var currentPosYonCanvas = Math.floor(mapCanvas.height/ 2) - yPosIntoTile - (256 *((tilesNumRows-1)/2));
        var currentXtile = xTile - ((tilesNumCols-1)/2);  // is always an integer since tilesNumCols is odd
        var currentYtile = yTile - ((tilesNumRows-1)/2);  // is always an integer since tilesNumRows is odd
        var imageTile = null;
        for (var i = 0; i < tilesNumRows; i++){      // on X
            for (var j = 0; j < tilesNumCols; j++){  // on Y
                
                imageTile = getTileImage("MAP",zoomLevel,(currentXtile+j),(currentYtile+i));
                if (imageTile === null){
                    // render the replacement
                    //if ((i+j+currentXtile+currentYtile)%2===0){
                    //    mapContext.fillStyle = "#DDDDDD";
                    //}else{
                    //    mapContext.fillStyle = "#EEEEEE";
                    //}
                    // mapContext.fillRect(currentPosXonCanvas,currentPosYonCanvas,256,256);
                    //mapContext.font="15px Courier";
                    //mapContext.fillStyle = "#000000";
                    //mapContext.fillText("z: "+zoomLevel+" x: "+(currentXtile+j)+" y: "+(currentYtile+i),currentPosXonCanvas+10,currentPosYonCanvas+128);
                    mapContext.drawImage(defaultImage, currentPosXonCanvas, currentPosYonCanvas,256,256);
                }else{
                    // render the tile for Map Canvas
                    mapContext.drawImage(imageTile, currentPosXonCanvas, currentPosYonCanvas,256,256);
                }
                
                imageTile = getTileImage("IDS",zoomLevel,(currentXtile+j),(currentYtile+i));
                if (imageTile === null){
                    // white replacemente for idCanvas
                    idContext.fillStyle = "#000000";
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
    
    /**
     * Calculate rows and cols for the tile map using viewport as parameter
     */
    function configureTileMap(){
        // to be called always after arrangeGui()
        var nCols = Math.ceil(viewportWidth/256)+1;
        tilesNumCols = (nCols%2===0?nCols+1:nCols);
        var nRows = Math.ceil(viewportHeight/256)+1;
        tilesNumRows =(nRows%2===0?nRows+1:nRows);
        tileCacheMaxLength = Math.max((tilesNumCols+2)*(tilesNumRows+2)*2,50);
    }
    
    /**
     * Called at the beginning and after eache page resize (viewport resize)
     */
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
        context.font="10px Courier";
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
        initializeMap();
        onResize();
        window.addEventListener("resize", onResize);
        GestureManager(mapCanvas,onPan,onZoom,onIdentify,[buttonGoBack,buttonMenu,buttonHelp,buttonVoice],onButton);
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
