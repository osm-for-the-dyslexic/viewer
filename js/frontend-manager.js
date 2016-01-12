(function(window, document, exportName, undefined) {
    "use strict";
    // http://www.movable-type.co.uk/scripts/latlong.html - some functions on latlog and distance
    // http://www.voicerss.org/api/
    
    /*********************************************************************************************
     * Private variables
     *********************************************************************************************/
    // Html elements of the page
    var mapCanvas = null;
    var idCanvas = null;
    var buttonsDiv = null;
    var buttonGoBack = null;
    var buttonWhereAmI = null;
    var buttonData = null;
    var buttonVoice = null;
    var divGoBack = null;
    var divGoBackChild = null;
    var divData = null;
    var divDataChild = null;
    var divVoice = null;
    
    var audioPlayer = null;
    var voiceLanguage = "";
    var voiceLanguageSelect = null;
    var voiceSpeedSelect = null;
    var voiceSpeed = "0";
    

    // characteristics of the viewport
    var viewportWidth = null;
    var viewportHeight = null;
    
    // characteristics of the map
    var minZoomLevel = 0;
    var maxZoomLevel = 6;
    var tilesNumCols = 1;
    var tilesNumRows = 1;
    
    // Current position
    var zoomLevel = minZoomLevel;
    var xTile = 0;
    var yTile = 0;
    var xPosIntoTile = 128;
    var yPosIntoTile = 128;
    
    // URLs for tiles
    var tileMapBaseUrls = ["http://osm-for-the-dyslexic.github.io/basemap/osm4dys/"];
    var tileIdBaseUrls = ["http://osm-for-the-dyslexic.github.io/idmap/osm4dys/"];
    var dataBaseUrls = ["http://osm-for-the-dyslexic.github.io/data/"];

    // TileCache
    var defaultImage = new Image();
    var tileCache = {};
    var tileCacheLength = 0;
    var tileCacheMaxLength = 150;
    
    // utility variables
    var canvasMessage = "";
    var intoWhereAmI = false;
    //var onRedraw = false;
    //var onIdentifyG = false;
    
    // Location history
    var locationHistoryData = [];
    var locationHistoryMaxLength = 10;
    var locationHistoryTimer; 

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function initializeMap(){
        // a 256x256 png r=173 g=222 b=255  #ADDEFF same as osm color for ocean
        defaultImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMhSURBVHhe7dQxAcAwDMCwbPyplNKoZE9ZWHrMwM/5dgdIem+BIAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOAMAOArJkfkUEFibeMV7cAAAAASUVORK5CYII=";
        for(var i=0; i<locationHistoryMaxLength;i++){
            locationHistoryData[i] = null;
        }
        locationHistoryTimer = window.setInterval(updateLoctionHistory, 5000); // fire every 5 sec
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function text2speech(text){
        if (voiceLanguage !== ""){
            text = text.replace(/\n/g," . . . ");
            var url = "https://api.voicerss.org/?key=968701308bba4ce19a33b14001491005&src=" + text + "&hl=" + voiceLanguage + "&r=" + voiceSpeed; // + "&rnd=" + Math.random();
            audioPlayer.src = url;
        }
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function extractTextFromDiv(element){
        var outText = "";
        if (element.childNodes.length > 0) {
            for (var i = 0; i < element.childNodes.length; i++) {
                outText += extractTextFromDiv(element.childNodes[i]);
            }
        }

        if (element.nodeType == Node.TEXT_NODE && /\S/.test(element.nodeValue)) {
            outText += element.nodeValue + " ";
        }
        return outText;
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function updateLoctionHistory(){
        console.log("updateLoctionHistory");
        //return;
        if (intoWhereAmI) {return;}
        var currentZ = zoomLevel;
        var currentX = xTile;
        var currentY = yTile;
        var currentXpos = xPosIntoTile;
        var currentYpos = yPosIntoTile;
        var max = Math.pow(2,currentZ) - 1;
        currentX = ((currentX%(max+1)+max+1)%(max+1));
        if ((!(currentY < 0))&&(!(currentY > max))){
            if (
                (locationHistoryData[0] === null) ||
                (locationHistoryData[0]['z'] !== currentZ) || 
                (locationHistoryData[0]['x'] !== currentX) || 
                (locationHistoryData[0]['y'] !== currentY)
            ) {
                for (var i=locationHistoryMaxLength-1; i>0; i--){
                    locationHistoryData[i] = locationHistoryData[i-1];
                }
                locationHistoryData[0] = {};
                locationHistoryData[0]['z'] = currentZ;
                locationHistoryData[0]['x'] = currentX;
                locationHistoryData[0]['y'] = currentY;
                locationHistoryData[0]['xpos'] = currentXpos;
                locationHistoryData[0]['ypos'] = currentYpos;
                // async call to identify, first uuid
                var context = mapCanvas.getContext("2d");
                var halfWidth = parseInt(""+mapCanvas.width/2,10);
                var halfHeight = parseInt(""+mapCanvas.height/2,10);
                onIdentifyInternal(halfWidth,halfHeight,false);
            }
        }
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
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

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function renderTileReplacement(mapType,z,x,y,mapContext,currentPosXonCanvas,currentPosYonCanvas){
        var max = Math.pow(2,z) - 1;
        x = ((x%(max+1)+max+1)%(max+1));
        if (y < 0) {
            mapContext.drawImage(defaultImage, currentPosXonCanvas, currentPosYonCanvas,256,256);
            return;
        }
        if (y > max) {
            mapContext.drawImage(defaultImage, currentPosXonCanvas, currentPosYonCanvas,256,256);
            return;
        }
        var upperX = parseInt(""+x/2,10);
        var upperY = parseInt(""+y/2,10);
        var tileName = "" + (z-1) + "/" + upperX + "/" + upperY;
        //console.log("x:" + x);
        //console.log("tileCacheLength: " + tileCacheLength);
        var imgElement = tileCache[""+mapType+"_"+tileName];
        if (typeof imgElement === "undefined") {
            var lowerX = 2*x;
            var lowerY = 2*y;
            for (var i=0;i<2;i++){
                for (var j=0;j<2;j++){
                    tileName = "" + (z+2) + "/" + lowerX + "/" + lowerY;
                    var imgElement = tileCache[""+mapType+"_"+tileName];
                    if (typeof imgElement === "undefined") {
                        // current tile as composition of defaultImage
                        mapContext.drawImage(defaultImage, 0, 0, 256, 256, currentPosXonCanvas+(i*128), currentPosYonCanvas+(j*128), 128, 128);
                    }else{
                        // current tile as composition of lower tiles
                        mapContext.drawImage(imgElement, 0, 0, 256, 256, currentPosXonCanvas+(i*128), currentPosYonCanvas+(j*128), 128, 128);
                    }
                }
            }
        }else{
            // current tile as strecth of upper tile
            var startingPosX = 0;
            var startingPosY = 0;
            if (x%2 === 1){
                var startingPosX = 128;
            }
            if (y%2 === 1){
                var startingPosY = 128;
            }
            try {
                mapContext.drawImage(imgElement, startingPosX, startingPosY, 128, 128, currentPosXonCanvas, currentPosYonCanvas, 256, 256);
            } catch (e) {
                // happens when the tile is not present, do nothing
            }
        }
    }
    
    
    /*********************************************************************************************
     * Load a tile asyncronously into the tile cache
     *********************************************************************************************/
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
            imgElement.onerror = function(){
                tileCache[""+mapType+"_"+tileName] = defaultImage;
                if (z === zoomLevel){
                    redrawMapCanvas("onTile");
                }
                if (tileCacheLength > tileCacheMaxLength){
                    cleanupTileCache();
                }
            }
            
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
            imgElement.src = utils.getRandomElement(baseUrls) + tileName + ".png" ;
            //imgElement.crossOrigin = "Anonymous";
            return null;
        }
        return imgElement;
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function panToZXY(z,x,y,posx,posy){
        zoomLevel = z;
        xTile = x;
        yTile = y;
        xPosIntoTile = posx;
        yPosIntoTile = posy;
        redrawMapCanvas("panToZXY");
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onPan(deltaX,deltaY){
        //if (intoWhereAmI) {return;}
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

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onZoom(deltaZ){
        var targetZoomLevel = zoomLevel + deltaZ;
        if ((targetZoomLevel < minZoomLevel ) || (targetZoomLevel>maxZoomLevel)){
            // do nothing
            return;
        }
        if ((intoWhereAmI) && (targetZoomLevel+3 > maxZoomLevel) && (deltaZ > 0)){
            return;
        }
        var operation = "";
        if (deltaZ > 0){
            operation = "zoomIn";
            for(var i=0;i<deltaZ;i++){
                zoomLevel += 1;
                //zoomLevel = targetZoomLevel;
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
            }
        }else{
            operation = "zoomOut";
            for(var i=0;i<(-deltaZ);i++){
                zoomLevel -= 1;
                //zoomLevel = targetZoomLevel;
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
        }
        redrawMapCanvas(operation);
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onIdentify(canvasPosX,canvasPosY){
        onIdentifyInternal(canvasPosX,canvasPosY,true)    
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function getInfoForHistory(uuids){
        // only info for first uuid
        var requestUrl = utils.getRandomElement(dataBaseUrls);
        requestUrl += (""+uuids[0]).substring(0,3) + "/";
        requestUrl += uuids[0] + ".json";
        /* -- removed library http
        var request = new Http.Get(requestUrl, true);  // true = async
        request.start().then(function(response) {
            var newTitle = "";
            try{
                newTitle += (""+response["Name"]).toUpperCase();
            }catch(err){
                newTitle += "(NO NAME) FOR" + (""+response["table_name"]).toUpperCase();
                //newTitle += (": "+response["table_name"]).toUpperCase();
            }
            //newTitle += (": "+response["table_name"]).toUpperCase();
            locationHistoryData[0]['title'] = newTitle;
            printMessageOnMapCanvas("YOU ARE LOOKING AT " + newTitle + "\n" );
            if (utils.isVisible(divGoBack)){
                populateHistoryDiv();
            }
        });
        */
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.overrideMimeType("application/json");
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                var newTitle = "";
                try{
                    newTitle += (""+response["Name"]).toUpperCase();
                }catch(err){
                    newTitle += "(NO NAME) FOR" + (""+response["table_name"]).toUpperCase();
                }
                locationHistoryData[0]['title'] = newTitle;
                printMessageOnMapCanvas("YOU ARE LOOKING AT " + newTitle + "\n" );
                if (utils.isVisible(divGoBack)){
                    populateHistoryDiv();
                }                
            }
        };
        xmlhttp.open("GET", requestUrl, true);
        xmlhttp.send();
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onPressHistoryEntry(position){
        if ((position >= 0) && (position < locationHistoryMaxLength)){
            var historyData = locationHistoryData[position];
            if (historyData !== null){
                var message = "WENT TO " + historyData['title'] + "\nAT ZOOM LEVEL " + historyData['z'] + "\n";
                panToZXY(historyData['z'],historyData['x'],historyData['y'],historyData['xpos'],historyData['ypos']);
                audioPlayer.src = "";
                utils.setVisible(divGoBack,false);
                utils.setVisible(divData,false);
                utils.setVisible(divVoice,false);
                printMessageOnMapCanvas(message);
                text2speech(message);
            }
        }
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onIdentifyInternal(canvasPosX,canvasPosY,isUserIdentify){
        //if (onRedraw) {return;}
        //onIdentifyG = true;
        redrawMapCanvas("onIdentify");
        var precision = 1;
        if (!isUserIdentify){
            precision = 10;
        }
        var message = "";
        var uuids = utils.identifyLocation(canvasPosX,canvasPosY,idCanvas,precision);
        if ((uuids !== null) && (uuids.length > 0)){
            if(isUserIdentify){
                message += "IDENTIFIED " + uuids.length + " FEATURE" + (uuids.length===1 ? '':'S') + "\n";
                printMessageOnMapCanvas(message);
                populateDataDiv(uuids,0);
            }else{
                locationHistoryData[0]['title'] = "(GETTING THE NAME)";
                if (utils.isVisible(divGoBack)){
                    populateHistoryDiv();
                }
                getInfoForHistory(uuids);
            }
        }else{
            if(isUserIdentify){
                message += "NOTHING HERE\n";
                printMessageOnMapCanvas(message);
                text2speech(message);
            }else{
                locationHistoryData[0]['title'] = "(NOTHING)";
                if (utils.isVisible(divGoBack)){
                    populateHistoryDiv();
                }
            }
        }
        //onIdentifyG = false;
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function populateHistoryDiv(){
        divGoBackChild.innerHTML = "";
        while (divGoBackChild.hasChildNodes()) {
            divGoBackChild.removeChild(divGoBackChild.lastChild);
        }
        var tempDiv = document.createElement("div");
        var newHtml = "";

        newHtml += "<table>";
        newHtml += "<thead><tr><th colspan=\"2\">HISTORY</th></tr></thead><tbody>";
        
        for(var i=0; i<locationHistoryMaxLength;i++){
            if (locationHistoryData[i] !== null){
                var historyData = locationHistoryData[i];
                var z = historyData['z'];
                var x = historyData['x'];
                var y = historyData['y'];
                var tileName = "" + z + "/" + x + "/" + y;
                var imgElementSrc = utils.getRandomElement(tileMapBaseUrls) + tileName + ".png" ;
                newHtml += "<tr class=\"pos"+i+"\"><td class=\"image pos"+ i +"\"><img class=\"pos"+ i +"\" src=\"" + imgElementSrc + "\"></td><td class=\"pos"+i+"\">GO TO " + historyData['title'] + "\nAT ZOOM LEVEL " + z + "</td></tr>";
            }
        }
        newHtml += "</tbody></table>";        
        tempDiv.innerHTML = newHtml;
        divGoBackChild.appendChild(tempDiv);
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function populateDataDiv(uuids,index){
        //	console.log("request start");
        var requestUrl = utils.getRandomElement(dataBaseUrls);
        requestUrl += (""+uuids[index]).substring(0,3) + "/";
        requestUrl += uuids[index] + ".json";
        var tempDiv = document.createElement("div");
        /*
        var request = new Http.Get(requestUrl, true);  // true = async
        request.start().then(function(response) {
            var newHtml = "";
            var content = "";
            newHtml += "<table>";
            newHtml += "<thead><tr><th colspan=\"2\">" + (""+response["table_name"]).toUpperCase() + "</th></tr></thead><tbody>";
            var newMessage = (""+response["table_name"]).toUpperCase();
            try{
                content = ""+response["Name"];
                if ( (content !== null) && (content !== 'null') && (content !== "" )){
                    newMessage += ": " + content.toUpperCase();   
                }else{
                    newMessage += " (NO NAME PROVIDED)";
                }
            }catch(err){
                newMessage += " (NO NAME PROVIDED)";
            }
            for (var key in response) {
                if (response.hasOwnProperty(key)) {
                    if ((key !== 'table_name') && (key !== 'id')){
                        content = ""+response[key];
                        if ( (content !== null) && (content !== 'null') && (content !== "" )){
                            newHtml += "<tr><td class=\"key\">" + (""+key).toUpperCase() + "</td><td>" + content.toUpperCase() + "</td></tr>";
                        }
                    }
                }
            }
            newHtml += "</tbody></table>";
            tempDiv.innerHTML = newHtml;
            if (index===0){
                // this is a new request, clear old data
                divDataChild.innerHTML = "";
                while (divDataChild.hasChildNodes()) {
                    divDataChild.removeChild(divDataChild.lastChild);
                }
                canvasMessage = "";
            }
            
            divDataChild.appendChild(tempDiv);
            //console.log("request arrived");
            canvasMessage += newMessage + "\n";
            if (uuids.length > index + 1){
                // recursive
                populateDataDiv(uuids,index+1)
            }else{
                // print final message on canvas
                printMessageOnMapCanvas(canvasMessage);
                if (!utils.isVisible(divData)) {
                    text2speech(canvasMessage);
                }
            }
        });
        */
        
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.overrideMimeType("application/json");
        xmlhttp.onreadystatechange = function() {
            //alert("state: " + xmlhttp.readyState + " status: " + xmlhttp.status + " requestUrl: " + requestUrl);
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                var newHtml = "";
                var content = "";
                newHtml += "<table>";
                newHtml += "<thead><tr><th colspan=\"2\">" + (""+response["table_name"]).toUpperCase() + "</th></tr></thead><tbody>";
                var newMessage = (""+response["table_name"]).toUpperCase();
                try{
                    content = ""+response["Name"];
                    if ( (content !== null) && (content !== 'null') && (content !== "" )){
                        newMessage += ": " + content.toUpperCase();   
                    }else{
                        newMessage += " (NO NAME PROVIDED)";
                    }
                }catch(err){
                    newMessage += " (NO NAME PROVIDED)";
                }
                for (var key in response) {
                    if (response.hasOwnProperty(key)) {
                        if ((key !== 'table_name') && (key !== 'id')){
                            content = ""+response[key];
                            if ( (content !== null) && (content !== 'null') && (content !== "" )){
                                newHtml += "<tr><td class=\"key\">" + (""+key).toUpperCase() + "</td><td>" + content.toUpperCase() + "</td></tr>";
                            }
                        }
                    }
                }
                newHtml += "</tbody></table>";
                tempDiv.innerHTML = newHtml;
                if (index===0){
                    // this is a new request, clear old data
                    divDataChild.innerHTML = "";
                    while (divDataChild.hasChildNodes()) {
                        divDataChild.removeChild(divDataChild.lastChild);
                    }
                    canvasMessage = "";
                }
                divDataChild.appendChild(tempDiv);
                //console.log("request arrived");
                canvasMessage += newMessage + "\n";
                if (uuids.length > index + 1){
                    // recursive
                    populateDataDiv(uuids,index+1)
                }else{
                    // print final message on canvas
                    printMessageOnMapCanvas(canvasMessage);
                    if (!utils.isVisible(divData)) {
                        text2speech(canvasMessage);
                    }
                }
            }
        };
        xmlhttp.open("GET", requestUrl, true);
        xmlhttp.send();        
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onButtonWhereAmI(){
        if (intoWhereAmI){
            intoWhereAmI = false;
            onZoom(3);
        }else{
            var targetZoomLevel = zoomLevel - 3;
            if (targetZoomLevel < minZoomLevel ){
                var times = minZoomLevel - targetZoomLevel;
                var message = "NOT POSSIBLE AT THIS ZOOM LEVEL\nTRY TO ZOOMIN " + times + " TIME" + (times===1 ? ' MORE':'S') + "\n";
                printMessageOnMapCanvas(message);
            }else{     
                intoWhereAmI = true;
                onZoom(-3);
            }
        }
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function printWhereAmIRectangleOnMapCanvas(){
        var context = mapCanvas.getContext("2d");
        var halfWidth = parseInt(""+mapCanvas.width/2,10);
        var halfHeight = parseInt(""+mapCanvas.height/2,10);
        var partWidth = parseInt(""+mapCanvas.width/16,10);
        var partHeight = parseInt(""+mapCanvas.height/16,10);
        context.fillStyle = "rgba(255, 0, 0, 0.8)";
        context.fillRect(halfWidth-partWidth,halfHeight-partHeight,partWidth*2,partHeight*2);
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onButton(buttonId){
        switch(buttonId) {
            case "button-go-back":
                if (!utils.isVisible(divGoBack)){
                    populateHistoryDiv();
                    text2speech(extractTextFromDiv(divGoBack));
                }else{
                    audioPlayer.src = "";
                }
                utils.switchVisible(divGoBack);
                //utils.setVisible(divWhereAmI,false);
                utils.setVisible(divData,false);
                utils.setVisible(divVoice,false);
            break;
            case "button-whereami":
                utils.setVisible(divGoBack,false);
                //utils.switchVisible(divWhereAmI);
                utils.setVisible(divData,false);
                utils.setVisible(divVoice,false);
                onButtonWhereAmI();
            break;
            case "button-data":
                utils.setVisible(divGoBack,false);
                if (!utils.isVisible(divData)){
                    text2speech(extractTextFromDiv(divData));
                }else{
                    audioPlayer.src = "";                    
                }                
                //utils.setVisible(divWhereAmI,false);
                utils.switchVisible(divData);
                utils.setVisible(divVoice,false);
            break;
            case "button-voice":
                if (voiceLanguage === ""){
                    utils.setVisible(divGoBack,false);
                    utils.setVisible(divData,false);
                    audioPlayer.src = "";
                    utils.switchVisible(divVoice);
                } else {
                    if (utils.isVisible(divGoBack)){
                        text2speech(extractTextFromDiv(divGoBack)); 
                    } else if (utils.isVisible(divData)){
                        text2speech(extractTextFromDiv(divData)); 
                    } else { 
                        utils.setVisible(divGoBack,false);
                        utils.setVisible(divData,false);
                        audioPlayer.src = "";
                        utils.switchVisible(divVoice);
                    }
                }
            break;
            default:
                // should never happen - all invisible
                utils.setVisible(divGoBack,false);
                //utils.setVisible(divWhereAmI,false);
                utils.setVisible(divData,false);
                utils.setVisible(divVoice,false);
        }
    }
    
    /*********************************************************************************************
     * Create Map canvas, Id canvas, buttons and other html elements
     *********************************************************************************************/
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
        buttonWhereAmI = document.createElement("div");
        buttonWhereAmI.id = "button-whereami";
        buttonData = document.createElement("div");
        buttonData.id = "button-data";
        buttonVoice = document.createElement("div");
        buttonVoice.id = "button-voice";
        buttonsDiv.appendChild(buttonGoBack);
        buttonsDiv.appendChild(buttonWhereAmI);
        buttonsDiv.appendChild(buttonData);
        buttonsDiv.appendChild(buttonVoice);
        mainElement.appendChild(buttonsDiv);
        mainElement.appendChild(idCanvas);
        mainElement.appendChild(mapCanvas);
        divGoBack = document.createElement("div");
        divGoBack.id = "div-go-back";
        divGoBackChild = document.createElement("div");
        divGoBackChild.innerHTML = "EMPTY HISTORY";
        divGoBack.appendChild(divGoBackChild);
        utils.setVisible(divGoBack,false);
        divData = document.createElement("div");
        divData.id = "div-data";
        divDataChild = document.createElement("div");
        //divDataChild.innerHTML = "YOU HAVEN'T IDENTIFIED ANYTHING YET"; // hack to precharge font
        divDataChild.innerHTML = "<div><table><thead><tr><th colspan=\"2\">IDENTIFICATION</th></tr></thead><tbody><tr><td colspan=\"2\">YOU HAVEN'T IDENTIFIED</td></tr><tr><td colspan=\"2\">ANYTHING YET</td></tr></tbody></table></div>";
        divData.appendChild(divDataChild);
        utils.setVisible(divData,false);
        divVoice = document.createElement("div");
        divVoice.id = "div-voice";
        utils.setVisible(divVoice,false);
        mainElement.appendChild(divGoBack);
        //mainElement.appendChild(divWhereAmI);
        mainElement.appendChild(divData);
        
        audioPlayer = document.createElement("audio");
        audioPlayer.autoplay = true;
        
        var languages = [
            "ca-es","zh-cn","zh-hk","zh-tw","da-dk","nl-nl","en-au","en-ca","en-gb","en-in","en-us",
            "fi-fi","fr-ca","fr-fr","de-de","it-it","ja-jp","ko-kr","nb-no","pl-pl","pt-br","pt-pt",
            "ru-ru","es-mx","es-es","sv-se"
        ];
        
        var languagesDescription = ["Catalan","Chinese (China)","Chinese (HongKong)",
            "Chinese (Taiwan)","Danish","Dutch","English (Australia)","English (Canada)",
            "English (GreatBritain)","English (India)","English (UnitedStates)","Finnish",
            "French (Canada)","French (France)","German","Italian","Japanese","Korean","Norwegian",
            "Polish","Portuguese (Brazil)","Portuguese (Portugal)","Russian","Spanish (Mexico)",
            "Spanish (Spain)","Swedish (Sweden)"
        ];
        
        var speed = ["-10","-5","0","5","10"];
        var speedDescription = ["SLOWEST","SLOW","NORMAL","FAST","FASTEST"];
        
        var tempDiv = document.createElement("div");
        var newHtml = "<table>";
        newHtml += "<thead><tr><th colspan=\"2\">TEXT TO SPEECH</th></tr></thead><tbody><tr>";
        newHtml += "<td class=\"key\">LANGUAGE</td>";
        newHtml += "<td class=\"value\">";
        newHtml += "<select id=\"languageselected\">";
        newHtml += "<option value=\"\" selected>DISABLED</option>";
        for (var i = 0; i<languages.length;i++){
            newHtml += "<option value=\""+ languages[i] +"\">"+ languagesDescription[i].toUpperCase() +"</option>";
        }
        newHtml += "</select>";
        newHtml += "</td>";
        newHtml += "</tr><tr>";
        newHtml += "<td class=\"key\">SPEED</td>";
        newHtml += "<td class=\"value\">";
        newHtml += "<select id=\"speedselected\">";
        for (var i = 0; i<speed.length;i++){
            newHtml += "<option value=\""+ speed[i] +"\"";
            if (speed[i] === "0"){
                newHtml += " selected";
            }
            newHtml +=">"+ speedDescription[i].toUpperCase() +"</option>";
        }
        newHtml += "</select>";
        newHtml += "</td>";
        newHtml += "</tr></tbody></table>";
        tempDiv.innerHTML = newHtml;
        divVoice.appendChild(tempDiv);
        mainElement.appendChild(divVoice);
        mainElement.appendChild(audioPlayer);
        
        voiceLanguageSelect = document.getElementById("languageselected");
        voiceLanguageSelect.addEventListener('change',function(){voiceLanguage = voiceLanguageSelect.value;},false);
        voiceSpeedSelect = document.getElementById("speedselected");
        voiceSpeedSelect.addEventListener('change',function(){voiceSpeed = voiceSpeedSelect.value;},false);
        
    }
    
    
    /*********************************************************************************************
     * Resize Map and id canvas to full screen
     *********************************************************************************************/
    function arrangeGui(){
        var buttonsDimension = 100; // now dynamic
        viewportWidth = parseInt(""+utils.viewport().width,10);
        viewportHeight = parseInt(""+utils.viewport().height,10);
        // resize html and body
        utils.setTLHWpx(document.documentElement,null,null,viewportHeight,viewportWidth);
        utils.setTLHWpx(document.body,null,null,viewportHeight,viewportWidth);
        
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
        utils.setTLHWpx(mapCanvas,null,null,mapHeight,mapWidth);
        var context = mapCanvas.getContext("2d");
        context.canvas.width  = "" + mapWidth + "";
        context.canvas.height = "" + mapHeight + "";
        utils.setTLHWpx(idCanvas,null,null,mapHeight,mapWidth);
        var context2 = idCanvas.getContext("2d");
        context2.canvas.width  = "" + mapWidth + "";
        context2.canvas.height = "" + mapHeight + "";
        redrawMapCanvas("arrangeGui");
        utils.setTLHWpx(buttonsDiv,buttonTop,buttonLeft,buttonHeight,buttonWidth);
        utils.setTLHWpx(buttonGoBack,null,null,buttonsDimension,buttonsDimension);
        utils.setTLHWpx(buttonWhereAmI,null,null,buttonsDimension,buttonsDimension);
        utils.setTLHWpx(buttonData,null,null,buttonsDimension,buttonsDimension);
        utils.setTLHWpx(buttonVoice,null,null,buttonsDimension,buttonsDimension);
        
        gapsSpace = availableSpace - (4 * buttonsDimension);
        minGapSpace = Math.floor(gapsSpace/5.0);
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
                    buttonWhereAmI.style.top = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonWhereAmI.style.left = "" + (0) + "px";
                    buttonData.style.top = "" + (minGapSpace*3+buttonsDimension*2) + "px";
                    buttonData.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonWhereAmI.style.top = "" + (0) + "px";
                    buttonWhereAmI.style.left = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonData.style.top = "" + (0) + "px";
                    buttonData.style.left = "" + (minGapSpace*3+buttonsDimension*2) + "px";
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
                    buttonWhereAmI.style.top = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonWhereAmI.style.left = "" + (0) + "px";
                    buttonData.style.top = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonData.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (1+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonWhereAmI.style.top = "" + (0) + "px";
                    buttonWhereAmI.style.left = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonData.style.top = "" + (0) + "px";
                    buttonData.style.left = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
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
                    buttonWhereAmI.style.top = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonWhereAmI.style.left = "" + (0) + "px";
                    buttonData.style.top = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonData.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (1+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonWhereAmI.style.top = "" + (0) + "px";
                    buttonWhereAmI.style.left = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonData.style.top = "" + (0) + "px";
                    buttonData.style.left = "" + (1+minGapSpace*3+buttonsDimension*2) + "px";
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
                    buttonWhereAmI.style.top = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonWhereAmI.style.left = "" + (0) + "px";
                    buttonData.style.top = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonData.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (2+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonWhereAmI.style.top = "" + (0) + "px";
                    buttonWhereAmI.style.left = "" + (1+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonData.style.top = "" + (0) + "px";
                    buttonData.style.left = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
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
                    buttonWhereAmI.style.top = "" + (2+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonWhereAmI.style.left = "" + (0) + "px";
                    buttonData.style.top = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
                    buttonData.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (3+minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (1+minGapSpace*1+buttonsDimension*0) + "px";
                    buttonWhereAmI.style.top = "" + (0) + "px";
                    buttonWhereAmI.style.left = "" + (2+minGapSpace*2+buttonsDimension*1) + "px";
                    buttonData.style.top = "" + (0) + "px";
                    buttonData.style.left = "" + (2+minGapSpace*3+buttonsDimension*2) + "px";
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
                    buttonWhereAmI.style.top = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonWhereAmI.style.left = "" + (0) + "px";
                    buttonData.style.top = "" + (minGapSpace*3+buttonsDimension*2) + "px";
                    buttonData.style.left = "" + (0) + "px";
                    buttonVoice.style.top = "" + (minGapSpace*4+buttonsDimension*3) + "px";
                    buttonVoice.style.left = "" + (0) + "px";
                } else {
                    // buttons on bottom
                    buttonGoBack.style.top = "" + (0) + "px";
                    buttonGoBack.style.left = "" + (minGapSpace*1+buttonsDimension*0) + "px";
                    buttonWhereAmI.style.top = "" + (0) + "px";
                    buttonWhereAmI.style.left = "" + (minGapSpace*2+buttonsDimension*1) + "px";
                    buttonData.style.top = "" + (0) + "px";
                    buttonData.style.left = "" + (minGapSpace*3+buttonsDimension*2) + "px";
                    buttonVoice.style.top = "" + (0) + "px";
                    buttonVoice.style.left = "" + (minGapSpace*4+buttonsDimension*3) + "px";
                }                  
                //alert("default: "+ (gapsSpace - minGapSpace*5));
        }
        // Arrange information divs
        if (viewportWidth > viewportHeight){
            // div 1/2 of the screen (minus buttons)
            var divTop = 0;
            var divLeft = viewportWidth/2;
            var divHeight = viewportHeight;
            var divWidth = viewportWidth - (viewportWidth/2) - buttonsDimension;
            utils.setTLHWpx(divGoBack,divTop,divLeft,divHeight,divWidth);
            //utils.setTLHWpx(divWhereAmI,divTop,divLeft,divHeight,divWidth);
            utils.setTLHWpx(divData,divTop,divLeft,divHeight,divWidth);
            utils.setTLHWpx(divVoice,divTop,divLeft,divHeight,divWidth);
        }else{
            // div full screen (minus buttons)
            var divTop = 0;
            var divLeft = 0;
            var divHeight = viewportHeight - buttonsDimension;
            var divWidth = viewportWidth;
            utils.setTLHWpx(divGoBack,divTop,divLeft,divHeight,divWidth);
            //utils.setTLHWpx(divWhereAmI,divTop,divLeft,divHeight,divWidth);
            utils.setTLHWpx(divData,divTop,divLeft,divHeight,divWidth);
            utils.setTLHWpx(divVoice,divTop,divLeft,divHeight,divWidth);            
        }
    }
    
    /*********************************************************************************************
     * Method to repaint map and Id canvas
     *********************************************************************************************/
    function redrawMapCanvas(operation){
        //if (onIdentifyG) {return;}
        //onRedraw = true;
        //alert("redrawMapCanvas");
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
                    // TODO test if can derivate the image from upper image or lower images
                    renderTileReplacement("MAP",zoomLevel,(currentXtile+j),(currentYtile+i),mapContext,currentPosXonCanvas,currentPosYonCanvas);
                }else{
                    // render the tile for Map Canvas
                    mapContext.drawImage(imageTile, currentPosXonCanvas, currentPosYonCanvas,256,256);
                }
                
                imageTile = getTileImage("IDS",zoomLevel,(currentXtile+j),(currentYtile+i));
                if (imageTile === null){
                    // white replacemente for idCanvas, mandatory black
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
        if (intoWhereAmI){
            printWhereAmIRectangleOnMapCanvas();
        }
        //onRedraw = false;
    }
    
    /*********************************************************************************************
     * Calculate rows and cols for the tile map using viewport as parameter
     *********************************************************************************************/
    function configureTileMap(){
        // to be called always after arrangeGui()
        var nCols = Math.ceil(viewportWidth/256)+1;
        tilesNumCols = (nCols%2===0?nCols+1:nCols);
        var nRows = Math.ceil(viewportHeight/256)+1;
        tilesNumRows =(nRows%2===0?nRows+1:nRows);
        tileCacheMaxLength = Math.max((tilesNumCols+4)*(tilesNumRows+4)*3,50);
    }
    
    /*********************************************************************************************
     * Called at the beginning and after eache page resize (viewport resize)
     *********************************************************************************************/
    function onResize(){
        arrangeGui();
        configureTileMap();
        redrawMapCanvas("onResize");
    }
    
    /*********************************************************************************************
     * Support method to write a message on map canvas
     *********************************************************************************************/
    function printMessageOnMapCanvas(message){
        var lines = message.split("\n");
        var context = mapCanvas.getContext("2d");
        var width = mapCanvas.width;
        context.fillStyle = "#333333";
        context.fillRect(0,0,width,lines.length*15);        
        context.font="12px OpenDyslexic";
        context.fillStyle = "#FF0000";
        for (var i = 0; i < lines.length; i++) {
            context.fillText(lines[i],10,20+i*15);
        }
    }
    
    /*********************************************************************************************
     * Main method of the module FrontendManager
     *********************************************************************************************/
    function FrontendManager(mainElementId) {
        createChilds(mainElementId);
        initializeMap();
        onResize();
        window.addEventListener("resize", onResize);
        GestureManager(mapCanvas,divGoBack,onPan,onZoom,onIdentify,[buttonGoBack,buttonWhereAmI,buttonData,buttonVoice],onButton,onPressHistoryEntry);
        return;
    }
    
    /*********************************************************************************************
     * Export
     *********************************************************************************************/
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
