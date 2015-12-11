(function(window, document, exportName, undefined) {
    "use strict";
    
    /*********************************************************************************************
     * Private variables
     *********************************************************************************************/
    var mapCanvas = null;
    var historyDiv = null;
    var onZoomFunction = null;
    var onIdentifyFunction = null;
    var onPanFunction = null;
    var onButton = null;
    var onPressHistoryEntryFunction = null;
    var deltaX = 0;
    var deltaY = 0;
    var zoomCounter = 0;
    var zoomEnabled = true;
    var zoomEnabledTimer;

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function enableZoom(){
        zoomEnabled = true;
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onPan(ev){
        var currDeltaX = ev.deltaX - deltaX;
        var currDeltaY = ev.deltaY - deltaY;
        deltaX = ev.deltaX;
        deltaY = ev.deltaY;
        if ((Math.abs(currDeltaX) > 50) ||(Math.abs(currDeltaY) > 50 )){
            // hack: when starting a new pan it goes to the previos location without it
            currDeltaX = 0;
            currDeltaY = 0;
        }
        onPanFunction(currDeltaX,currDeltaY);
        //console.log(ev.type + " X: " + currDeltaX + " Y: " + currDeltaY );
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onPress(ev){
        onIdentifyFunction(ev.pointers[0].clientX,ev.pointers[0].clientY);
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function zoomOut(){
        zoomCounter -= 1;
        if (10 < Math.abs(zoomCounter)){
            zoomCounter = 0;
            if (zoomEnabled) {
                zoomEnabled = false;
                onZoomFunction(1);
                zoomEnabledTimer = setTimeout(enableZoom, 1000);
            }
        }
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function zoomIn(){
        zoomCounter += 1;
        if (10 < Math.abs(zoomCounter)){
            zoomCounter = 0;
            if (zoomEnabled) {
                zoomEnabled = false;
                onZoomFunction(-1);
                zoomEnabledTimer = setTimeout(enableZoom, 1000);
            }
        }
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function mouseWheelHandler(e) {
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        if (delta < 0) {
            onZoomFunction(-1);
        }else{
            onZoomFunction(1);
        }
        return false;
    }
    
    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onPressButton(ev){
        onButton(ev.target.id);
    }

    /*********************************************************************************************
     *
     *********************************************************************************************/
    function onPressHistory(ev){
        console.log("onPressHistory");
        try{
            console.log("onPressHistory - try");
            var classNames = "" + ev.target.className;
            var strPos = classNames.indexOf("pos");
            if (strPos > -1){
                console.log("onPressHistory - strpos > 1");
                var position = parseInt(""+classNames.substring(strPos+3),10);
                console.log("onPressHistory - position is " + position);
                onPressHistoryEntryFunction(position);
                
            }
        } catch(e){
            console.log("onPressHistory - catch " + e.message);
        }
    }
    
    /*********************************************************************************************
     * GestureManager (initializer)
     * @param _mapCanvas canvas of the map
     *********************************************************************************************/
    function GestureManager(_mapCanvas,_historyDiv,_onPan,_onZoom,_onIdentify,_buttons,_onButton,_onPressHistoryEntry) {
        mapCanvas = _mapCanvas;
        historyDiv = _historyDiv;
        onPanFunction = _onPan;
        onZoomFunction = _onZoom;
        onIdentifyFunction = _onIdentify;
        onButton = _onButton;
        onPressHistoryEntryFunction = _onPressHistoryEntry;
        
        var mc = new Hammer.Manager(mapCanvas,{
            transform_always_block: true,
            transform_min_scale: 1,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0        
        });
        mc.add(new Hammer.Pan({ threshold: 10, pointers: 0 }));
        mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith(mc.get('pan'));
        mc.add(new Hammer.Press({ threshold: 10 })).recognizeWith(mc.get('pan'));
        mc.on("panleft panright panup pandown", onPan);
        mc.on("pinchin", zoomIn);
        mc.on("pinchout", zoomOut);
        mc.on("press", onPress);
        
        if (mapCanvas.addEventListener) {
            // IE9, Chrome, Safari, Opera
            mapCanvas.addEventListener("mousewheel", mouseWheelHandler, false);
            // Firefox
            mapCanvas.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
        } else {
            // IE 6/7/8
            mapCanvas.attachEvent("onmousewheel", mouseWheelHandler);
        }
        
        var mcHistory = new Hammer.Manager(historyDiv,{
            transform_always_block: true,
            transform_min_scale: 1,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0        
        });
        mcHistory.add(new Hammer.Press({ threshold: 10 }));
        mcHistory.on("press", onPressHistory);        
        
        for (var i = 0; i<_buttons.length ; i++){
            var mcButtons = new Hammer.Manager(_buttons[i],{
                transform_always_block: true,
                transform_min_scale: 1,
                drag_block_horizontal: true,
                drag_block_vertical: true,
                drag_min_distance: 0        
            //mcButtons.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));        
            });
            mcButtons.add(new Hammer.Press({ threshold: 10 }));
            mcButtons.on("press", onPressButton);
        }
        
        return;
    }
    
    // export
    if (typeof define == "function" && define.amd) {
        define(function() {
            return GestureManager;
        });
    } else if (typeof module != "undefined" && module.exports) {
        module.exports = GestureManager;
    } else {
        window[exportName] = GestureManager;
    }    
})(window, document, "GestureManager");