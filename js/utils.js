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
     *********************************************************************************************/
	_utils.isVisible = function (elem) {
		return (elem.style.visibility != "hidden");
	};
    
    /*********************************************************************************************
     * Method to set visbility on an html element
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
     *********************************************************************************************/
    _utils.switchVisible = function (elem){
        _utils.setVisible(elem,!_utils.isVisible(elem));
    }

    /*********************************************************************************************
     * Method to set top, leftheight and width of an element
     * if T,L,H,W argument null keeps original value
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
     * Return utils
     *********************************************************************************************/
	return _utils;
}());
