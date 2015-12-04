var utils = (function () {
	//var my = {},
	//	privateVariable = 1;
	//function privateMethod() {
	//	// ...
	//}
    
    /*********************************************************************************************
     * Initialization and version
     *********************************************************************************************/
    var _utils = {};
	_utils.version = "0.1";
    
    /*********************************************************************************************
     * Method to check if an element is visble or not
     * @param elem html element
     *********************************************************************************************/
	_utils.isVisible = function (elem) {
		return (elem.style.visibility != "hidden");
	};
    
    /*********************************************************************************************
     * Method to set visbility on an html element
     * @param elem html element
     * @param yesNo boolean
     *********************************************************************************************/
    _utils.setVisible = function (elem,yesNo){
        if (yesNo){
            elem.style.visibility = "visible";
        }else{
            elem.style.visibility = "hidden";
        }
    }
    
    /*********************************************************************************************
     * Method to switch visbility of an html element
     * @param elem html element
     *********************************************************************************************/
    _utils.switchVisible = function (elem){
        _utils.setVisible(elem,!_utils.isVisible(elem));
    }

    /*********************************************************************************************
     * Method to set top, leftheight and width of an element
     * if T,L,H,W argument null keeps original value
     * @param elem html element
     * @param theTop integer top in pixel
     * @param theLeft integer left in pixel
     * @param theHeight integer height in pixel
     * @param theWidth integer width in pixel
     *********************************************************************************************/
    _utils.setTLHWpx = function(elem,theTop,theLeft,theHeight,theWidth){
        if(theTop !== null){
            elem.style.top = "" + theTop + "px";
        }
        if(theLeft !== null){
            elem.style.left = "" + theLeft + "px";
        }
        if(theHeight !== null){
            elem.style.height = "" + theHeight + "px";
        }
        if(theWidth !== null){
            elem.style.width = "" + theWidth + "px";
        }
    }
    
    /*********************************************************************************************
     * Method to get information about the viewport height and width
     *********************************************************************************************/
    _utils.viewport = function() {
        var e = window, a = 'inner';
        if (!('innerWidth' in window )) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
    }
    
    /*********************************************************************************************
     * Return a random element of a vector
     * @param aVector a vector of items
     *********************************************************************************************/
    _utils.getRandomElement = function(aVector) {
        var max = aVector.length - 1;
        return aVector[Math.floor(Math.random() * (max - 0 + 1)) + 0];
    }
    
    /*********************************************************************************************
     * Return either 1 (yes) or 0 (no)
     *********************************************************************************************/
    _utils.randomYesNo = function (){
        return Math.floor((Math.random() * 2) + 0);
    }
    
    /*********************************************************************************************
     * Convert a binary string to a hex string
     * @param str a string composed of 0 and 1 (multiple of 4)
     *********************************************************************************************/
    _utils.bin2hex = function(str){
        var retval = "";
        var temp4bits = "";
        for (var i=0;i<str.length;i+=4){
            temp4bits = str.substring(i,i+4);
            switch(temp4bits) {
                case '0000': retval+= '0'; break;
                case '0001': retval+= '1'; break;
                case '0010': retval+= '2'; break;
                case '0011': retval+= '3'; break;
                case '0100': retval+= '4'; break;
                case '0101': retval+= '5'; break;
                case '0110': retval+= '6'; break;
                case '0111': retval+= '7'; break;
                case '1000': retval+= '8'; break;
                case '1001': retval+= '9'; break;
                case '1010': retval+= 'a'; break;
                case '1011': retval+= 'b'; break;
                case '1100': retval+= 'c'; break;
                case '1101': retval+= 'd'; break;
                case '1110': retval+= 'e'; break;
                case '1111': retval+= 'f'; break;
                default: break;
            } 
        }
        return retval;
    }
    
    /*********************************************************************************************
     * Convert a binary string to a hex string
     * @param _pad string origional string
     * @param str string the string used to pad
     * @param padLeft boolean pad to left or to right
     *********************************************************************************************/
    _utils.pad = function (_pad, str, padLeft) {
        if (typeof str === 'undefined') return _pad;
        if (padLeft) {
            return (_pad + str).slice(-_pad.length);
        } else {
            return (str + _pad).substring(0, _pad.length);
       }
    }
    
    /*********************************************************************************************
     * Squared spiral identification
     * @param originalCanvasPosX
     * @param originalCanvasPosY
     * @param idCanvas
     * @param precision put 0 to identify only one time
     *********************************************************************************************/
    _utils.identifyLocation = function(originalCanvasPosX,originalCanvasPosY,idCanvas,precision){
        var idContext = idCanvas.getContext("2d");
        var idWidth = idCanvas.width;
        var idHeight = idCanvas.height;

        var x = 0;
        var y = 0;
        var dx = 0;
        var dy = -1;
        var temp = 0;
        var canvasPosX = null;
        var canvasPosY = null;
        var points = null;
        var uuids = null;
        var sparseFactor = 3;
        
        // squared spiral identification
        try {
            for(var i =0;i<(Math.pow(precision,2));i++){
                if( ((-precision/2)<x) && (x<=(precision/2)) && ((-precision/2)<y) && (y<=(precision/2)) ){
                    canvasPosX = originalCanvasPosX + ((x*4)*sparseFactor);
                    canvasPosY = originalCanvasPosY + ((y*4)*sparseFactor);
                    if ((canvasPosX < 3) || (canvasPosX > idWidth - 3) || (canvasPosY < 3) || (canvasPosY > idHeight - 3)) {
                        // out of canvas, do nothing
                    }else{
                        // identify
                        points = idContext.getImageData(canvasPosX-3, canvasPosY-3, 7, 7);
                        uuids = _utils.fromPoints2uuids(points);
                        if ((uuids !== null) && (uuids.length > 0)){
                            // return identified uuids
                            return uuids;
                        }
                    }
                }
                if ( (x===y) || ((x<0) && (x=== -y)) || ((x>0) && (x === 1-y)) ){
                    temp = dx;
                    dx = -dy;
                    dy = temp;
                }
                x += dx;
                y += dy;
            }
        } catch(e){
            // todo log an excepion
            return null;
        }
        return null;
    }    
    
    /*********************************************************************************************
     * From points to 3 uuids
     * @param points 7x7 point extracted from an idcanvas
     *********************************************************************************************/
    _utils.fromPoints2uuids = function(points){
        var uuids = null;
        try{
            var k = 0;
            var found = false;
            var foundI = 0;
            var foundJ = 0;
            for (var i=0; i<7&&!found;i++){
                for (var j=0;j<7&&!found;j++){
                    // start index
                    k = (i*7+j)*4;
                    var redChannel = _utils.pad("00000000",points.data[k].toString(2),true)
                    if (redChannel[0] === '1'){
                        foundI = i;
                        foundJ = j;
                        found = true;
                    }
                }
            }
            if (found){
                var bitstring = ""
                for (var i = foundI; i<foundI+4;i++){
                    for (var j = foundJ; j<foundJ+4;j++){
                        k = (i*7+j)*4;
                        //var r = utils.pad("000",points.data[k].toString(10),true)
                        //var g = utils.pad("000",points.data[k+1].toString(10),true)
                        //var b = utils.pad("000",points.data[k+2].toString(10),true)
                        //message += "" +r + "-" + g + "-" + b +"\n";
                        bitstring += _utils.pad("00000000",points.data[k].toString(2),true)
                        bitstring += _utils.pad("00000000",points.data[k+1].toString(2),true)
                        bitstring += _utils.pad("00000000",points.data[k+2].toString(2),true)
                    }
                }
                // from bitstring to interesting bits
                var counterBin = bitstring.substring(1,3);
                var counter = parseInt(counterBin,2);
                
                var i = 3;
                var j = 8;
                var k = 0;
                var interestingBits = bitstring.substring(i,j);
                for (var k=1; k<48;k++){
                    i=j;
                    j+=8;
                    if (k%3 === 0){
                        interestingBits += bitstring.substring(i+1,j);
                    }else{
                        interestingBits += bitstring.substring(i,j);
                    }
                }
                //message += "Found " + counter + " features, len:" + interestingBits.length; ;
                if (counter > 0){
                    //message += "IDENTIFIED " + counter + " FEATURE" + (counter===1 ? '':'S') + "\n";
                    // from interesting bits to binRepresentation
                    var binRepresentation = "";
                    binRepresentation += interestingBits.substring(0,48);
                    binRepresentation += "0100";
                    binRepresentation += interestingBits.substring(48,60);
                    binRepresentation += "10";  // this is constant part
                    binRepresentation += interestingBits.substring(60,122);

                    binRepresentation += interestingBits.substring(122+0,122+48);
                    binRepresentation += "0100";
                    binRepresentation += interestingBits.substring(122+48,122+60);
                    binRepresentation += "10";
                    binRepresentation += interestingBits.substring(122+60,122+122);

                    binRepresentation += interestingBits.substring(122+122+0,122+122+48);
                    binRepresentation += "0100";
                    binRepresentation += interestingBits.substring(122+122+48,122+122+60);
                    binRepresentation += "10";
                    binRepresentation += interestingBits.substring(122+122+60,122+122+122);
                    
                    // from binRepresentation to 3 UUID version 4
                    var uuid1bin = binRepresentation.substring(0,128);
                    var uuid2bin = binRepresentation.substring(128,256);
                    var uuid3bin = binRepresentation.substring(256,384);
                    
                    var uuid1 = _utils.bin2hex(uuid1bin);
                    var uuid2 = _utils.bin2hex(uuid2bin);
                    var uuid3 = _utils.bin2hex(uuid3bin);
                    
                    uuid1 = uuid1.substring(0,8) + "-" + uuid1.substring(8,12) + "-" + uuid1.substring(12,16) + "-" + uuid1.substring(16,20) + "-" + uuid1.substring(20,32);
                    uuid2 = uuid2.substring(0,8) + "-" + uuid2.substring(8,12) + "-" + uuid2.substring(12,16) + "-" + uuid2.substring(16,20) + "-" + uuid2.substring(20,32);
                    uuid3 = uuid3.substring(0,8) + "-" + uuid3.substring(8,12) + "-" + uuid3.substring(12,16) + "-" + uuid3.substring(16,20) + "-" + uuid3.substring(20,32);
                    
                    if (counter === 1){
                        uuids = [uuid1];
                    }else if (counter === 2){
                        uuids = [uuid1,uuid2];
                    }else if (counter === 3){
                        uuids = [uuid1,uuid2,uuid3];
                    }
                }else{
                    // counter = 0, simpley return uuids which is null
                }
            } else {
                // if not found, simply return uuids, which is null
            }
        } catch(e) {
                // to nothing, simply return uuids, which is null
        }
        return uuids;
     }
    
    /*********************************************************************************************
     * Return utils
     *********************************************************************************************/
	return _utils;
}());
