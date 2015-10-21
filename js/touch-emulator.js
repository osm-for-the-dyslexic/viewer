// from https://github.com/goodpatch/touchemulator not from main repo

(function(window, document, exportName, undefined) {
    "use strict";

    var isMultiTouch = false;
    var multiTouchStartPos;
    var eventTarget;
    var onMouseEnable = true;
    var touchElements = {};

    // polyfills
    if(!document.createTouch) {
        document.createTouch = function(view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY) {
            // auto set
            if(clientX == undefined || clientY == undefined) {
                clientX = pageX - window.pageXOffset;
                clientY = pageY - window.pageYOffset;
            }

            return new Touch(target, identifier, {
                pageX: pageX,
                pageY: pageY,
                screenX: screenX,
                screenY: screenY,
                clientX: clientX,
                clientY: clientY
            });
        };
    }

    if(!document.createTouchList) {
        document.createTouchList = function() {
            var touchList = new TouchList();
            for (var i = 0; i < arguments.length; i++) {
                touchList[i] = arguments[i];
            }
            touchList.length = arguments.length;
            return touchList;
        };
    }

    /**
     * create an touch point
     * @constructor
     * @param target
     * @param identifier
     * @param pos
     * @param deltaX
     * @param deltaY
     * @returns {Object} touchPoint
     */
    function Touch(target, identifier, pos, deltaX, deltaY) {
        deltaX = deltaX || 0;
        deltaY = deltaY || 0;

        this.identifier = identifier;
        this.target = target;
        this.clientX = pos.clientX + deltaX;
        this.clientY = pos.clientY + deltaY;
        this.screenX = pos.screenX + deltaX;
        this.screenY = pos.screenY + deltaY;
        this.pageX = pos.pageX + deltaX;
        this.pageY = pos.pageY + deltaY;
    }

    /**
     * create empty touchlist with the methods
     * @constructor
     * @returns touchList
     */
    function TouchList() {
        var touchList = [];

        touchList.item = function(index) {
            return this[index] || null;
        };

        // specified by Mozilla
        touchList.identifiedTouch = function(id) {
            return this[id + 1] || null;
        };

        return touchList;
    }


    /**
     * Simple trick to fake touch event support
     * this is enough for most libraries like Modernizr and Hammer
     */
    function fakeTouchSupport() {
        var objs = [window, document.documentElement];
        var props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];

        for(var o=0; o<objs.length; o++) {
            for(var p=0; p<props.length; p++) {
                if(objs[o] && objs[o][props[p]] == undefined) {
                    objs[o][props[p]] = null;
                }
            }
        }
    }

    /**
     * we don't have to emulate on a touch device
     * @returns {boolean}
     */
    function hasTouchSupport() {
        // return ("ontouchstart" in window) || // touch events
        //        (window.Modernizr && window.Modernizr.touch) || // modernizr
        //        (navigator.msMaxTouchPoints || navigator.maxTouchPoints) > 2; // pointer events
        try {
            document.createEvent("TouchEvent");
            //Windows ＋ Chorme TouchEvent
            return !/Windows.*Chrome/.test(navigator.userAgent);
        } catch (e) {
            return false;
        }
    }

    /**
     * do NO rendering when:
     * 1) if the gesture is not pinch in or pinch out
     * 2) if the prototype is not displayed
     * 2) if the target do not contain a "transition" class
     * @param ev
     * @returns {boolean}
     */
    function canRendering(ev) {
        if(ev.touches.length == 1){
            return false;
        }
        if(document.getElementsByClassName("preview").length < 1){
            return false;
        }
        if((ev.target.className.indexOf("transition") < 0)&&(ev.target.tagName != "IMG")){
            return false;
        }
        return true;
    }

    /**
     * disable mouseevents on the page
     * @param ev
     */
    function preventMouseEvents(ev) {
        // ev.preventDefault();
        // ev.stopPropagation();
    }

    /**
     * only trigger touches when the left mousebutton has been pressed
     * @param touchType
     * @returns {Function}
     */
    function onMouse(touchType) {
        return function(ev) {
            if (onMouseEnable === false) {
                return;
            }

            // prevent mouse events
            preventMouseEvents(ev);

            // firefox which 1 buttons
            if((typeof ev.buttons === "undefined" && ev.which === 1) || (ev.type === "mouseup" || ev.buttons === 1)) {
              // The EventTarget on which the touch point started when it was first placed on the surface,
              // even if the touch point has since moved outside the interactive area of that element.
              // also, when the target doesnt exist anymore, we update it
              if (ev.type == 'mousedown' || !eventTarget || (eventTarget && !eventTarget.dispatchEvent)) {
                  eventTarget = ev.target;
              }

              // shiftKey has been lost, so trigger a touchend
              if (isMultiTouch && !ev.shiftKey) {
                  triggerTouch('touchend', ev);
                  isMultiTouch = false;
              }

              triggerTouch(touchType, ev);

              // we're entering the multi-touch mode!
              // 
              if (!isMultiTouch && ev.shiftKey && document.getElementsByClassName("pc-screen").length === 0) {
                  isMultiTouch = true;
                  multiTouchStartPos = {
                      pageX: ev.pageX,
                      pageY: ev.pageY,
                      clientX: ev.clientX,
                      clientY: ev.clientY,
                      screenX: ev.screenX,
                      screenY: ev.screenY
                  };
                  triggerTouch('touchstart', ev);
              }

              // reset
              if (ev.type == 'mouseup') {
                  multiTouchStartPos = null;
                  isMultiTouch = false;
                  eventTarget = null;
                  if (Object.keys(touchElements).length > 0) {
                      for(var k in touchElements) {
                        document.body.removeChild(touchElements[k])
                      }
                      touchElements = {}
                  }
                  document.body.classList.remove("no-cursor");
                  document.body.classList.remove("two-point-cursor");
              }
            }

        }
    }

    /**
     * trigger a touch event
     * @param eventName
     * @param mouseEv
     */
    function triggerTouch(eventName, mouseEv) {
        if (eventName === "touchend" && eventTarget.className.split(" ").indexOf("transition") < 0) {
            return
        }
        var touchEvent = document.createEvent('Event');
        touchEvent.initEvent(eventName, true, true);

        touchEvent.altKey = mouseEv.altKey;
        touchEvent.ctrlKey = mouseEv.ctrlKey;
        touchEvent.metaKey = mouseEv.metaKey;
        touchEvent.shiftKey = mouseEv.shiftKey;

        touchEvent.touches = getActiveTouches(mouseEv, eventName);
        touchEvent.targetTouches = getActiveTouches(mouseEv, eventName);
        touchEvent.changedTouches = getChangedTouches(mouseEv, eventName);

        eventTarget.dispatchEvent(touchEvent);
        
        // for debug
        // console.log(touchEvent, "touchEvent");
        // console.log(eventTarget, "eventTarget");
    }

    /**
     * create a touchList based on the mouse event
     * @param mouseEv
     * @returns {TouchList}
     */
    function createTouchList(mouseEv) {
        var touchList = new TouchList();

        if (isMultiTouch) {
            var f = TouchEmulator.multiTouchOffset;
            var deltaX = multiTouchStartPos.pageX - mouseEv.pageX;
            var deltaY = multiTouchStartPos.pageY - mouseEv.pageY;

            touchList.push(new Touch(eventTarget, 1, multiTouchStartPos, (deltaX*-1) - f, (deltaY*-1) + f));
            touchList.push(new Touch(eventTarget, 2, multiTouchStartPos, deltaX+f, deltaY-f));
        } else {
            touchList.push(new Touch(eventTarget, 1, mouseEv, 0, 0));
        }

        return touchList;
    }

    /**
     * receive all active touches
     * @param mouseEv
     * @returns {TouchList}
     */
    function getActiveTouches(mouseEv, eventName) {
        // empty list
        if (mouseEv.type == 'mouseup') {
            return new TouchList();
        }

        var touchList = createTouchList(mouseEv);
        if(isMultiTouch && mouseEv.type != 'mouseup' && eventName == 'touchend') {
            touchList.splice(1, 1);
        }
        return touchList;
    }

    /**
     * receive a filtered set of touches with only the changed pointers
     * @param mouseEv
     * @param eventName
     * @returns {TouchList}
     */
    function getChangedTouches(mouseEv, eventName) {
        var touchList = createTouchList(mouseEv);

        // we only want to return the added/removed item on multitouch
        // which is the second pointer, so remove the first pointer from the touchList
        //
        // but when the mouseEv.type is mouseup, we want to send all touches because then
        // no new input will be possible
        if(isMultiTouch && mouseEv.type != 'mouseup' &&
            (eventName == 'touchstart' || eventName == 'touchend')) {
            touchList.splice(0, 1);
        }

        return touchList;
    }

    /**
     * show the touchpoints on the screen
     */
    function showTouches(ev) {
        var touch, i, el, styles;

        if(canRendering(ev)){
            for(i = 0; i < ev.touches.length; i++) {
                touch = ev.touches[i];
                el = touchElements[touch.identifier];
                if(!el) {
                    el = touchElements[touch.identifier] = document.createElement("div");
                    el.className = "touch-pointer" // Shift
                    document.body.appendChild(el);
                    // hide real cursor when pinch in or pinch out
                    document.body.classList.add("no-cursor");
                    document.body.classList.remove("two-point-cursor");
                }

                styles = TouchEmulator.template(touch);
                for(var prop in styles) {
                    el.style[prop] = styles[prop];
                }
            }
        }

        // remove all ended touches
        if(ev.type == 'touchend' || ev.type == 'touchcancel') {
            for(i = 0; i < ev.changedTouches.length; i++) {
                touch = ev.changedTouches[i];
                el = touchElements[touch.identifier];
                if(el) {
                    el.parentNode.removeChild(el);
                    delete touchElements[touch.identifier];
                    // show real cursor
                    document.body.classList.remove("no-cursor");
                    if(shiftPressing){
                        document.body.classList.add("two-point-cursor");
                    }
                }
            }
        }
    }

    /**
     * TouchEmulator initializer
     */
    function TouchEmulator() {
        if (hasTouchSupport()) {
            return;
        }

        onMouseEnable = true;

        fakeTouchSupport();

        window.addEventListener("mousedown", onMouse('touchstart'), true);
        window.addEventListener("mousemove", onMouse('touchmove'), true);
        window.addEventListener("mouseup", onMouse('touchend'), true);

        window.addEventListener("mouseenter", preventMouseEvents, true);
        window.addEventListener("mouseleave", preventMouseEvents, true);
        window.addEventListener("mouseout", preventMouseEvents, true);
        window.addEventListener("mouseover", preventMouseEvents, true);

        window.addEventListener("touchstart", showTouches, false);
        window.addEventListener("touchmove", showTouches, false);
        window.addEventListener("touchend", showTouches, false);
        window.addEventListener("touchcancel", showTouches, false);
    }

    /**
     * destroy TouchEmulator
     */
    TouchEmulator.destroy = function() {
        if (hasTouchSupport()) {
            return;
        }

        onMouseEnable = false;

        window.removeEventListener("mousedown", onMouse('touchstart'), true);
        window.removeEventListener("mousemove", onMouse('touchmove'), true);
        window.removeEventListener("mouseup", onMouse('touchend'), true);

        window.removeEventListener("mouseenter", preventMouseEvents, true);
        window.removeEventListener("mouseleave", preventMouseEvents, true);
        window.removeEventListener("mouseout", preventMouseEvents, true);
        window.removeEventListener("mouseover", preventMouseEvents, true);

        window.removeEventListener("touchstart", showTouches, false);
        window.removeEventListener("touchmove", showTouches, false);
        window.removeEventListener("touchend", showTouches, false);
        window.removeEventListener("touchcancel", showTouches, false);
    };

    // start distance when entering the multitouch mode
    TouchEmulator.multiTouchOffset = 30;

    /**
     * css template for the touch rendering
     * @param touch
     * @returns object
     */
    TouchEmulator.template = function(touch) {
        var size = 36;
        var transform = 'translate('+ (touch.clientX-(size/2)) +'px, '+ (touch.clientY-(size/2)) +'px)';
        return {
            position: 'absolute',
            left: 0,
            top: 0,
            background: '#f00',
            //background: 'url("./images/touch@2x.png") center center no-repeat',
            backgroundSize: '36px 36px',
            height: size + 'px',
            width: size + 'px',
            padding: 0,
            margin: 0,
            display: 'block',
            overflow: 'hidden',
            pointerEvents: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            userSelect: 'none',
            webkitTransform: transform,
            mozTransform: transform,
            transform: transform,
            zIndex: 999999
        }
    };

    var shiftPressing = false;

    // show fake pinch cursor when shift key is pressed
    document.body.onkeydown = function(event){
        event = event || window.event;
        var keycode = event.charCode || event.keyCode;
        if(keycode === 16){
            shiftPressing = true;
            document.body.classList.add("two-point-cursor");
        }
    };

    document.body.onkeyup = function(event){
        event = event || window.event;
        var keycode = event.charCode || event.keyCode;
        if(keycode === 16){
            shiftPressing = false;
            document.body.classList.remove("two-point-cursor");
            document.body.classList.remove("no-cursor");
        }
    };

    // export
    if (typeof define == "function" && define.amd) {
        define(function() {
            return TouchEmulator;
        });
    } else if (typeof module != "undefined" && module.exports) {
        module.exports = TouchEmulator;
    } else {
        window[exportName] = TouchEmulator;
    }
})(window, document, "TouchEmulator");
