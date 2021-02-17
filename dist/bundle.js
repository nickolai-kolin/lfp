/*!
 * @fileOverview TouchSwipe - jQuery Plugin
 * @version 1.6.18
 *
 * @author Matt Bryson http://www.github.com/mattbryson
 * @see https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 * @see http://labs.rampinteractive.co.uk/touchSwipe/
 * @see http://plugins.jquery.com/project/touchSwipe
 * @license
 * Copyright (c) 2010-2015 Matt Bryson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */
!function(factory){"function"==typeof define&&define.amd&&define.amd.jQuery?define(["jquery"],factory):factory("undefined"!=typeof module&&module.exports?require("jquery"):jQuery)}(function($){"use strict";function init(options){return!options||void 0!==options.allowPageScroll||void 0===options.swipe&&void 0===options.swipeStatus||(options.allowPageScroll=NONE),void 0!==options.click&&void 0===options.tap&&(options.tap=options.click),options||(options={}),options=$.extend({},$.fn.swipe.defaults,options),this.each(function(){var $this=$(this),plugin=$this.data(PLUGIN_NS);plugin||(plugin=new TouchSwipe(this,options),$this.data(PLUGIN_NS,plugin))})}function TouchSwipe(element,options){function touchStart(jqEvent){if(!(getTouchInProgress()||$(jqEvent.target).closest(options.excludedElements,$element).length>0)){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(!event.pointerType||"mouse"!=event.pointerType||0!=options.fallbackToMouseEvents){var ret,touches=event.touches,evt=touches?touches[0]:event;return phase=PHASE_START,touches?fingerCount=touches.length:options.preventDefaultEvents!==!1&&jqEvent.preventDefault(),distance=0,direction=null,currentDirection=null,pinchDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,maximumsMap=createMaximumsData(),cancelMultiFingerRelease(),createFingerData(0,evt),!touches||fingerCount===options.fingers||options.fingers===ALL_FINGERS||hasPinches()?(startTime=getTimeStamp(),2==fingerCount&&(createFingerData(1,touches[1]),startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start)),(options.swipeStatus||options.pinchStatus)&&(ret=triggerHandler(event,phase))):ret=!1,ret===!1?(phase=PHASE_CANCEL,triggerHandler(event,phase),ret):(options.hold&&(holdTimeout=setTimeout($.proxy(function(){$element.trigger("hold",[event.target]),options.hold&&(ret=options.hold.call($element,event,event.target))},this),options.longTapThreshold)),setTouchInProgress(!0),null)}}}function touchMove(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;if(phase!==PHASE_END&&phase!==PHASE_CANCEL&&!inMultiFingerRelease()){var ret,touches=event.touches,evt=touches?touches[0]:event,currentFinger=updateFingerData(evt);if(endTime=getTimeStamp(),touches&&(fingerCount=touches.length),options.hold&&clearTimeout(holdTimeout),phase=PHASE_MOVE,2==fingerCount&&(0==startTouchesDistance?(createFingerData(1,touches[1]),startTouchesDistance=endTouchesDistance=calculateTouchesDistance(fingerData[0].start,fingerData[1].start)):(updateFingerData(touches[1]),endTouchesDistance=calculateTouchesDistance(fingerData[0].end,fingerData[1].end),pinchDirection=calculatePinchDirection(fingerData[0].end,fingerData[1].end)),pinchZoom=calculatePinchZoom(startTouchesDistance,endTouchesDistance),pinchDistance=Math.abs(startTouchesDistance-endTouchesDistance)),fingerCount===options.fingers||options.fingers===ALL_FINGERS||!touches||hasPinches()){if(direction=calculateDirection(currentFinger.start,currentFinger.end),currentDirection=calculateDirection(currentFinger.last,currentFinger.end),validateDefaultEvent(jqEvent,currentDirection),distance=calculateDistance(currentFinger.start,currentFinger.end),duration=calculateDuration(),setMaxDistance(direction,distance),ret=triggerHandler(event,phase),!options.triggerOnTouchEnd||options.triggerOnTouchLeave){var inBounds=!0;if(options.triggerOnTouchLeave){var bounds=getbounds(this);inBounds=isInBounds(currentFinger.end,bounds)}!options.triggerOnTouchEnd&&inBounds?phase=getNextPhase(PHASE_MOVE):options.triggerOnTouchLeave&&!inBounds&&(phase=getNextPhase(PHASE_END)),phase!=PHASE_CANCEL&&phase!=PHASE_END||triggerHandler(event,phase)}}else phase=PHASE_CANCEL,triggerHandler(event,phase);ret===!1&&(phase=PHASE_CANCEL,triggerHandler(event,phase))}}function touchEnd(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent,touches=event.touches;if(touches){if(touches.length&&!inMultiFingerRelease())return startMultiFingerRelease(event),!0;if(touches.length&&inMultiFingerRelease())return!0}return inMultiFingerRelease()&&(fingerCount=fingerCountAtRelease),endTime=getTimeStamp(),duration=calculateDuration(),didSwipeBackToCancel()||!validateSwipeDistance()?(phase=PHASE_CANCEL,triggerHandler(event,phase)):options.triggerOnTouchEnd||options.triggerOnTouchEnd===!1&&phase===PHASE_MOVE?(options.preventDefaultEvents!==!1&&jqEvent.cancelable!==!1&&jqEvent.preventDefault(),phase=PHASE_END,triggerHandler(event,phase)):!options.triggerOnTouchEnd&&hasTap()?(phase=PHASE_END,triggerHandlerForGesture(event,phase,TAP)):phase===PHASE_MOVE&&(phase=PHASE_CANCEL,triggerHandler(event,phase)),setTouchInProgress(!1),null}function touchCancel(){fingerCount=0,endTime=0,startTime=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,cancelMultiFingerRelease(),setTouchInProgress(!1)}function touchLeave(jqEvent){var event=jqEvent.originalEvent?jqEvent.originalEvent:jqEvent;options.triggerOnTouchLeave&&(phase=getNextPhase(PHASE_END),triggerHandler(event,phase))}function removeListeners(){$element.off(START_EV,touchStart),$element.off(CANCEL_EV,touchCancel),$element.off(MOVE_EV,touchMove),$element.off(END_EV,touchEnd),LEAVE_EV&&$element.off(LEAVE_EV,touchLeave),setTouchInProgress(!1)}function getNextPhase(currentPhase){var nextPhase=currentPhase,validTime=validateSwipeTime(),validDistance=validateSwipeDistance(),didCancel=didSwipeBackToCancel();return!validTime||didCancel?nextPhase=PHASE_CANCEL:!validDistance||currentPhase!=PHASE_MOVE||options.triggerOnTouchEnd&&!options.triggerOnTouchLeave?!validDistance&&currentPhase==PHASE_END&&options.triggerOnTouchLeave&&(nextPhase=PHASE_CANCEL):nextPhase=PHASE_END,nextPhase}function triggerHandler(event,phase){var ret,touches=event.touches;return(didSwipe()||hasSwipes())&&(ret=triggerHandlerForGesture(event,phase,SWIPE)),(didPinch()||hasPinches())&&ret!==!1&&(ret=triggerHandlerForGesture(event,phase,PINCH)),didDoubleTap()&&ret!==!1?ret=triggerHandlerForGesture(event,phase,DOUBLE_TAP):didLongTap()&&ret!==!1?ret=triggerHandlerForGesture(event,phase,LONG_TAP):didTap()&&ret!==!1&&(ret=triggerHandlerForGesture(event,phase,TAP)),phase===PHASE_CANCEL&&touchCancel(event),phase===PHASE_END&&(touches?touches.length||touchCancel(event):touchCancel(event)),ret}function triggerHandlerForGesture(event,phase,gesture){var ret;if(gesture==SWIPE){if($element.trigger("swipeStatus",[phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection]),options.swipeStatus&&(ret=options.swipeStatus.call($element,event,phase,direction||null,distance||0,duration||0,fingerCount,fingerData,currentDirection),ret===!1))return!1;if(phase==PHASE_END&&validateSwipe()){if(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),$element.trigger("swipe",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipe&&(ret=options.swipe.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection),ret===!1))return!1;switch(direction){case LEFT:$element.trigger("swipeLeft",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeLeft&&(ret=options.swipeLeft.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case RIGHT:$element.trigger("swipeRight",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeRight&&(ret=options.swipeRight.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case UP:$element.trigger("swipeUp",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeUp&&(ret=options.swipeUp.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection));break;case DOWN:$element.trigger("swipeDown",[direction,distance,duration,fingerCount,fingerData,currentDirection]),options.swipeDown&&(ret=options.swipeDown.call($element,event,direction,distance,duration,fingerCount,fingerData,currentDirection))}}}if(gesture==PINCH){if($element.trigger("pinchStatus",[phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchStatus&&(ret=options.pinchStatus.call($element,event,phase,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData),ret===!1))return!1;if(phase==PHASE_END&&validatePinch())switch(pinchDirection){case IN:$element.trigger("pinchIn",[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchIn&&(ret=options.pinchIn.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData));break;case OUT:$element.trigger("pinchOut",[pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData]),options.pinchOut&&(ret=options.pinchOut.call($element,event,pinchDirection||null,pinchDistance||0,duration||0,fingerCount,pinchZoom,fingerData))}}return gesture==TAP?phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),hasDoubleTap()&&!inDoubleTap()?(doubleTapStartTime=getTimeStamp(),singleTapTimeout=setTimeout($.proxy(function(){doubleTapStartTime=null,$element.trigger("tap",[event.target]),options.tap&&(ret=options.tap.call($element,event,event.target))},this),options.doubleTapThreshold)):(doubleTapStartTime=null,$element.trigger("tap",[event.target]),options.tap&&(ret=options.tap.call($element,event,event.target)))):gesture==DOUBLE_TAP?phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),clearTimeout(holdTimeout),doubleTapStartTime=null,$element.trigger("doubletap",[event.target]),options.doubleTap&&(ret=options.doubleTap.call($element,event,event.target))):gesture==LONG_TAP&&(phase!==PHASE_CANCEL&&phase!==PHASE_END||(clearTimeout(singleTapTimeout),doubleTapStartTime=null,$element.trigger("longtap",[event.target]),options.longTap&&(ret=options.longTap.call($element,event,event.target)))),ret}function validateSwipeDistance(){var valid=!0;return null!==options.threshold&&(valid=distance>=options.threshold),valid}function didSwipeBackToCancel(){var cancelled=!1;return null!==options.cancelThreshold&&null!==direction&&(cancelled=getMaxDistance(direction)-distance>=options.cancelThreshold),cancelled}function validatePinchDistance(){return null!==options.pinchThreshold?pinchDistance>=options.pinchThreshold:!0}function validateSwipeTime(){var result;return result=options.maxTimeThreshold?!(duration>=options.maxTimeThreshold):!0}function validateDefaultEvent(jqEvent,direction){if(options.preventDefaultEvents!==!1)if(options.allowPageScroll===NONE)jqEvent.preventDefault();else{var auto=options.allowPageScroll===AUTO;switch(direction){case LEFT:(options.swipeLeft&&auto||!auto&&options.allowPageScroll!=HORIZONTAL)&&jqEvent.preventDefault();break;case RIGHT:(options.swipeRight&&auto||!auto&&options.allowPageScroll!=HORIZONTAL)&&jqEvent.preventDefault();break;case UP:(options.swipeUp&&auto||!auto&&options.allowPageScroll!=VERTICAL)&&jqEvent.preventDefault();break;case DOWN:(options.swipeDown&&auto||!auto&&options.allowPageScroll!=VERTICAL)&&jqEvent.preventDefault();break;case NONE:}}}function validatePinch(){var hasCorrectFingerCount=validateFingers(),hasEndPoint=validateEndPoint(),hasCorrectDistance=validatePinchDistance();return hasCorrectFingerCount&&hasEndPoint&&hasCorrectDistance}function hasPinches(){return!!(options.pinchStatus||options.pinchIn||options.pinchOut)}function didPinch(){return!(!validatePinch()||!hasPinches())}function validateSwipe(){var hasValidTime=validateSwipeTime(),hasValidDistance=validateSwipeDistance(),hasCorrectFingerCount=validateFingers(),hasEndPoint=validateEndPoint(),didCancel=didSwipeBackToCancel(),valid=!didCancel&&hasEndPoint&&hasCorrectFingerCount&&hasValidDistance&&hasValidTime;return valid}function hasSwipes(){return!!(options.swipe||options.swipeStatus||options.swipeLeft||options.swipeRight||options.swipeUp||options.swipeDown)}function didSwipe(){return!(!validateSwipe()||!hasSwipes())}function validateFingers(){return fingerCount===options.fingers||options.fingers===ALL_FINGERS||!SUPPORTS_TOUCH}function validateEndPoint(){return 0!==fingerData[0].end.x}function hasTap(){return!!options.tap}function hasDoubleTap(){return!!options.doubleTap}function hasLongTap(){return!!options.longTap}function validateDoubleTap(){if(null==doubleTapStartTime)return!1;var now=getTimeStamp();return hasDoubleTap()&&now-doubleTapStartTime<=options.doubleTapThreshold}function inDoubleTap(){return validateDoubleTap()}function validateTap(){return(1===fingerCount||!SUPPORTS_TOUCH)&&(isNaN(distance)||distance<options.threshold)}function validateLongTap(){return duration>options.longTapThreshold&&DOUBLE_TAP_THRESHOLD>distance}function didTap(){return!(!validateTap()||!hasTap())}function didDoubleTap(){return!(!validateDoubleTap()||!hasDoubleTap())}function didLongTap(){return!(!validateLongTap()||!hasLongTap())}function startMultiFingerRelease(event){previousTouchEndTime=getTimeStamp(),fingerCountAtRelease=event.touches.length+1}function cancelMultiFingerRelease(){previousTouchEndTime=0,fingerCountAtRelease=0}function inMultiFingerRelease(){var withinThreshold=!1;if(previousTouchEndTime){var diff=getTimeStamp()-previousTouchEndTime;diff<=options.fingerReleaseThreshold&&(withinThreshold=!0)}return withinThreshold}function getTouchInProgress(){return!($element.data(PLUGIN_NS+"_intouch")!==!0)}function setTouchInProgress(val){$element&&(val===!0?($element.on(MOVE_EV,touchMove),$element.on(END_EV,touchEnd),LEAVE_EV&&$element.on(LEAVE_EV,touchLeave)):($element.off(MOVE_EV,touchMove,!1),$element.off(END_EV,touchEnd,!1),LEAVE_EV&&$element.off(LEAVE_EV,touchLeave,!1)),$element.data(PLUGIN_NS+"_intouch",val===!0))}function createFingerData(id,evt){var f={start:{x:0,y:0},last:{x:0,y:0},end:{x:0,y:0}};return f.start.x=f.last.x=f.end.x=evt.pageX||evt.clientX,f.start.y=f.last.y=f.end.y=evt.pageY||evt.clientY,fingerData[id]=f,f}function updateFingerData(evt){var id=void 0!==evt.identifier?evt.identifier:0,f=getFingerData(id);return null===f&&(f=createFingerData(id,evt)),f.last.x=f.end.x,f.last.y=f.end.y,f.end.x=evt.pageX||evt.clientX,f.end.y=evt.pageY||evt.clientY,f}function getFingerData(id){return fingerData[id]||null}function setMaxDistance(direction,distance){direction!=NONE&&(distance=Math.max(distance,getMaxDistance(direction)),maximumsMap[direction].distance=distance)}function getMaxDistance(direction){return maximumsMap[direction]?maximumsMap[direction].distance:void 0}function createMaximumsData(){var maxData={};return maxData[LEFT]=createMaximumVO(LEFT),maxData[RIGHT]=createMaximumVO(RIGHT),maxData[UP]=createMaximumVO(UP),maxData[DOWN]=createMaximumVO(DOWN),maxData}function createMaximumVO(dir){return{direction:dir,distance:0}}function calculateDuration(){return endTime-startTime}function calculateTouchesDistance(startPoint,endPoint){var diffX=Math.abs(startPoint.x-endPoint.x),diffY=Math.abs(startPoint.y-endPoint.y);return Math.round(Math.sqrt(diffX*diffX+diffY*diffY))}function calculatePinchZoom(startDistance,endDistance){var percent=endDistance/startDistance*1;return percent.toFixed(2)}function calculatePinchDirection(){return 1>pinchZoom?OUT:IN}function calculateDistance(startPoint,endPoint){return Math.round(Math.sqrt(Math.pow(endPoint.x-startPoint.x,2)+Math.pow(endPoint.y-startPoint.y,2)))}function calculateAngle(startPoint,endPoint){var x=startPoint.x-endPoint.x,y=endPoint.y-startPoint.y,r=Math.atan2(y,x),angle=Math.round(180*r/Math.PI);return 0>angle&&(angle=360-Math.abs(angle)),angle}function calculateDirection(startPoint,endPoint){if(comparePoints(startPoint,endPoint))return NONE;var angle=calculateAngle(startPoint,endPoint);return 45>=angle&&angle>=0?LEFT:360>=angle&&angle>=315?LEFT:angle>=135&&225>=angle?RIGHT:angle>45&&135>angle?DOWN:UP}function getTimeStamp(){var now=new Date;return now.getTime()}function getbounds(el){el=$(el);var offset=el.offset(),bounds={left:offset.left,right:offset.left+el.outerWidth(),top:offset.top,bottom:offset.top+el.outerHeight()};return bounds}function isInBounds(point,bounds){return point.x>bounds.left&&point.x<bounds.right&&point.y>bounds.top&&point.y<bounds.bottom}function comparePoints(pointA,pointB){return pointA.x==pointB.x&&pointA.y==pointB.y}var options=$.extend({},options),useTouchEvents=SUPPORTS_TOUCH||SUPPORTS_POINTER||!options.fallbackToMouseEvents,START_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerDown":"pointerdown":"touchstart":"mousedown",MOVE_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerMove":"pointermove":"touchmove":"mousemove",END_EV=useTouchEvents?SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerUp":"pointerup":"touchend":"mouseup",LEAVE_EV=useTouchEvents?SUPPORTS_POINTER?"mouseleave":null:"mouseleave",CANCEL_EV=SUPPORTS_POINTER?SUPPORTS_POINTER_IE10?"MSPointerCancel":"pointercancel":"touchcancel",distance=0,direction=null,currentDirection=null,duration=0,startTouchesDistance=0,endTouchesDistance=0,pinchZoom=1,pinchDistance=0,pinchDirection=0,maximumsMap=null,$element=$(element),phase="start",fingerCount=0,fingerData={},startTime=0,endTime=0,previousTouchEndTime=0,fingerCountAtRelease=0,doubleTapStartTime=0,singleTapTimeout=null,holdTimeout=null;try{$element.on(START_EV,touchStart),$element.on(CANCEL_EV,touchCancel)}catch(e){$.error("events not supported "+START_EV+","+CANCEL_EV+" on jQuery.swipe")}this.enable=function(){return this.disable(),$element.on(START_EV,touchStart),$element.on(CANCEL_EV,touchCancel),$element},this.disable=function(){return removeListeners(),$element},this.destroy=function(){removeListeners(),$element.data(PLUGIN_NS,null),$element=null},this.option=function(property,value){if("object"==typeof property)options=$.extend(options,property);else if(void 0!==options[property]){if(void 0===value)return options[property];options[property]=value}else{if(!property)return options;$.error("Option "+property+" does not exist on jQuery.swipe.options")}return null}}var VERSION="1.6.18",LEFT="left",RIGHT="right",UP="up",DOWN="down",IN="in",OUT="out",NONE="none",AUTO="auto",SWIPE="swipe",PINCH="pinch",TAP="tap",DOUBLE_TAP="doubletap",LONG_TAP="longtap",HORIZONTAL="horizontal",VERTICAL="vertical",ALL_FINGERS="all",DOUBLE_TAP_THRESHOLD=10,PHASE_START="start",PHASE_MOVE="move",PHASE_END="end",PHASE_CANCEL="cancel",SUPPORTS_TOUCH="ontouchstart"in window,SUPPORTS_POINTER_IE10=window.navigator.msPointerEnabled&&!window.PointerEvent&&!SUPPORTS_TOUCH,SUPPORTS_POINTER=(window.PointerEvent||window.navigator.msPointerEnabled)&&!SUPPORTS_TOUCH,PLUGIN_NS="TouchSwipe",defaults={fingers:1,threshold:75,cancelThreshold:null,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,longTapThreshold:500,doubleTapThreshold:200,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,tap:null,doubleTap:null,longTap:null,hold:null,triggerOnTouchEnd:!0,triggerOnTouchLeave:!1,allowPageScroll:"auto",fallbackToMouseEvents:!0,excludedElements:".noSwipe",preventDefaultEvents:!0};$.fn.swipe=function(method){var $this=$(this),plugin=$this.data(PLUGIN_NS);if(plugin&&"string"==typeof method){if(plugin[method])return plugin[method].apply(plugin,Array.prototype.slice.call(arguments,1));$.error("Method "+method+" does not exist on jQuery.swipe")}else if(plugin&&"object"==typeof method)plugin.option.apply(plugin,arguments);else if(!(plugin||"object"!=typeof method&&method))return init.apply(this,arguments);return $this},$.fn.swipe.version=VERSION,$.fn.swipe.defaults=defaults,$.fn.swipe.phases={PHASE_START:PHASE_START,PHASE_MOVE:PHASE_MOVE,PHASE_END:PHASE_END,PHASE_CANCEL:PHASE_CANCEL},$.fn.swipe.directions={LEFT:LEFT,RIGHT:RIGHT,UP:UP,DOWN:DOWN,IN:IN,OUT:OUT},$.fn.swipe.pageScroll={NONE:NONE,HORIZONTAL:HORIZONTAL,VERTICAL:VERTICAL,AUTO:AUTO},$.fn.swipe.fingers={ONE:1,TWO:2,THREE:3,FOUR:4,FIVE:5,ALL:ALL_FINGERS}});
function main() {
  // HIDE FULL HEIGHT MENU
  const heroNavSel = "#hero-nav";
  const toogleHeroNav = (ev) => {
    const currentEl = $(ev.currentTarget);
    const targetBlock = currentEl.data().toggleElId;
    const heroNav = $(`#${targetBlock}`);
    const isFound = Boolean(heroNav.length);
    if (isFound === false) {
      return console.error(`Error: '${heroNav}' not found`);
    }
    heroNav.toggleClass("nav--opened");
  };
  $(`[data-toggle-el-id]`).on("click", toogleHeroNav);

  // SlideShow Feedback
  const tabPanelToggle = (ev) => {
    // Activate tab
    const targetTab = $(ev.currentTarget);
    const tabList = $(".feedback__tab");
    tabList.removeClass("feedback__tab--active");
    targetTab.addClass("feedback__tab--active");
    // Activate panel
    const targetPanelId = targetTab.data().tabpanelId;
    const tabPanelList = $(".feedback__panel");
    const targetPanel = $(`#${targetPanelId}`);

    tabPanelList.removeClass("feedback__panel--active");
    targetPanel.addClass("feedback__panel--active");
  };
  $("[data-tab]").on("click", tabPanelToggle);

  // OPS

  const body = document.body;
  const pageWrapper = document.getElementById("page-wrapper");

  // FIXED NAV

  const fixedNavSection = document.getElementById("fixed-sidenav");
  function getfixedNavEl(sectionId) {
    const fixedNavEl = document.createElement("a");
    fixedNavEl.className = "fixed-sidenav__link";
    fixedNavEl.dataset.opsSectionId = sectionId;
    return fixedNavEl;
  }
  // Populate Fixed-Nav menu
  (function () {
    for (let section of pageWrapper.children) {
      fixedNavSection.append(getfixedNavEl(section.id));
    }
  })();

  // Creating Mapper {Section.id : Order Num}
  const sectionMapper = {};
  (function () {
    const section_list = pageWrapper.children;
    for (let i = 0; i < section_list.length; i++) {
      sectionMapper[section_list[i].id] = i;
    }
  })();

  let readyToScroll = true;
  let currentSection = 0;

  const opsTriggerList = document.querySelectorAll("[data-ops-section-id]");
  opsTriggerList.forEach((el) => {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      scrollToSection(this.dataset.opsSectionId);
    });
  });

  function opsSectionActivate(section) {
    const cssSectionActiveClass = "ops-active";
    const cssSideNavActiveClass = "fixed-sidenav__link--active";

    const section_list = pageWrapper.children;
    // #1 Set Css Class for current Section
    // remove
    Array.from(section_list).forEach((el) => {
      el.classList.remove(cssSectionActiveClass);
    });

    pageWrapper.children[section].classList.add(cssSectionActiveClass);
    // #2 Set ops trigger active
    opsTriggerList.forEach((el) => {
      el.classList.remove(cssSideNavActiveClass);
      if (
        (el.dataset.opsSectionId == section_list[section].id) &
        el.classList.contains("fixed-sidenav__link")
      ) {
        el.classList.add(cssSideNavActiveClass);
      }
    });
  }

  function scrollToSection(section) {
    // Scrolling content to target section. Start from 0
    // Expecting id:string or num:number

    if (!Number.isInteger(section)) {
      section = sectionMapper[section];
    }
    pageWrapper.style.transform = `translateY(${-section * 100}%)`;
    currentSection = section;
    opsSectionActivate(section);
  }

  function opsWheelHandler(ev) {
    if (!readyToScroll) return;

    let step; // aka direction

    switch (ev.type) {
      case "wheel":
        step = ev.deltaY > 0 ? 1 : -1;
        break;
      case "keydown":
        step = ev.keyCode == 40 ? 1 : ev.keyCode == 38 ? -1 : 0;
        break;
    }

    readyToScroll = false; // Animating
    let nextSectionPosition = currentSection + step;
    let isSectionExists = pageWrapper.children[nextSectionPosition];
    // Scrolling
    if (isSectionExists) {
      currentSection = nextSectionPosition;
      scrollToSection(nextSectionPosition);
    }

    setTimeout(() => {
      readyToScroll = true;
    }, 1100);
  }

  function opsKeyDownHandler(ev) {
    // console.log(ev);
    console.log(ev.keyCode);
  }
  pageWrapper.addEventListener("wheel", opsWheelHandler);
  document.addEventListener("keydown", opsWheelHandler);
  $("#page-wrapper").swipe({
    swipe: function (ev, direction) {
      if (!readyToScroll) return;
      let step;
      switch (direction) {
        case "up":
          step = 1;
          break;
        case "down":
          step = -1;
          break;
      }
      readyToScroll = false; // Animating
      let nextSectionPosition = currentSection + step;
      let isSectionExists = pageWrapper.children[nextSectionPosition];
      // Scrolling
      if (isSectionExists) {
        currentSection = nextSectionPosition;
        scrollToSection(nextSectionPosition);
      }

      setTimeout(() => {
        readyToScroll = true;
      }, 1100);
    },
  });
} // Main End
// Run main once DOMContentLoaded event fired
$.when($.ready).then(main());
function myForm() {
  // Presets
  const API_EMAIL = "https://webdev-api.loftschool.com/sendmail";

  const nonValidCssClass = "form__input--nonvalid";
  const customInputNamesForSending = ["name", "phone", "comment", "to"];

  // Selectors

  const modalEl = document.getElementById("modal");
  const modalHeader = document.querySelector(".modal__header");
  const overlay = document.getElementById("overlay");
  const orderForm = document.getElementById("order-form");

  // Support Func

  function createErrorMsgEl(msg, _class = "form__validation") {
    // Return Error Object for appending
    const errorMsgEl = document.createElement("span");
    errorMsgEl.classList.add(_class);
    errorMsgEl.textContent = msg;
    return errorMsgEl;
  }

  function removeAllErrorMsg(form) {
    // Remove non-valid css class
    Array.from(form.elements).forEach((el) =>
      el.classList.remove("form__input--nonvalid")
    );
    // Remove Error Elements
    const allErrorMsgEl = form.querySelectorAll(".form__validation");
    Array.from(allErrorMsgEl).forEach((el) => el.remove());
  }

  function clearForm(form) {
    // form.reset();
    Array.from(form.elements).forEach((el) => (el.value = ""));
  }

  function toggleBodyScroll() {
    const isScrollHidden = document.body.style.overflow == "hidden";
  }

  function toggleFixedNav() {
    const fixedSideNav = document.getElementById("fixed-sidenav");
    console.log(fixedSideNav.style.display);
    fixedSideNav.style.display =
      fixedSideNav.style.display == "none" ? "block" : "none";
  }

  function showValidationErrorMsg(el, msg) {
    const ErrorMsgEl = createErrorMsgEl(msg);
    el.after(ErrorMsgEl);
  }

  function hideModal() {
    toggleBodyScroll();
    toggleFixedNav();
    modalEl.classList.remove("modal--active");
    modalEl.classList.remove("modal--error");
    overlay.classList.remove("overlay--active");
  }

  function showModal(msg = "", error = false) {
    toggleBodyScroll();
    toggleFixedNav();
    modalEl.classList.add("modal--active");
    overlay.classList.add("overlay--active");
    // Adding Error Color for modal heading
    if (error) {
      modalEl.classList.add("modal--error");
    }
    modalHeader.innerText = msg;
  }

  function isValidForm(form) {
    // Validation Step
    const statusArr = customInputNamesForSending.map((name) => {
      const currentInput = form.elements[name];
      currentInput.checkValidity();

      if (currentInput.validationMessage) {
        showValidationErrorMsg(currentInput, currentInput.validationMessage);
        return false;
      }
      return true;
    });
    return statusArr.every((status) => status === true);
  }

  function sendRequestXHR(payload, request_url = API_EMAIL) {
    const client = new XMLHttpRequest();
    client.open("POST", request_url);
    client.responseType = "json";
    client.send(payload);
    client.onload = () => {
      const resp = client.response;
      const error = resp.status == 1 ? false : true;

      showModal(resp.message, error);
    };
  }

  // Main Logic
  orderForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    removeAllErrorMsg(this); // Clearing Last Submit Errors

    if (isValidForm(this)) {
      sendRequestXHR(new FormData(this));
      clearForm(this);
    }
  });

  overlay.addEventListener("click", () => hideModal());
}
myForm();

// Map
function init() {
  let myMap = new ymaps.Map("ymap", {
    center: [25.195137, 55.278478],
    zoom: 11,
    controls: [],
  });
  myMap.behaviors.disable('scrollZoom');
  myMap.behaviors.disable('drag');
  let coords = [
    [25.201397, 55.269513],
    [25.189938, 55.300089],
    [25.12294, 55.207095],
    [25.098174, 55.161451],
  ];
  
  const myCollection = new ymaps.GeoObjectCollection({}, {
    draggable: false, // and draggable
    iconLayout: 'default#image', //all placemarks are red
    iconImageHref: './img/img-mapmarker.png',
    iconImageSize: [46, 57],
    iconImageOffset: [-35, -52]
  });
  
  for (var i = 0; i < coords.length; i++) {
    myCollection.add(new ymaps.Placemark(coords[i]));
  }
  myMap.geoObjects.add(myCollection);
  
}




ymaps.ready(init);
// MENU SECTION

//
const desktop = '(min-width: 992px)';

// Selectors

const menu = document.getElementById("menu");
const menuTrigger = menu.querySelectorAll('.menu__trigger');

// Utils

function _addAllEventListeners(obj) { 
  for (let control of obj){
    const allElemes = document.querySelectorAll(control.selector);
    allElemes.forEach(el => {
      el.addEventListener(control.eventType, control.eventHandler);

    });
  }
}

// functions 
function hideAllMenuItemContentWrapButCurrent(el) {
  Array.from(el.parentElement.children).map(el => {
      el.dataset.menuItem = "";
    // if (el.dataset.menuItem != 'active') {
      el.querySelector('[data-menu-content-wrap]').style.width = "";
    // }
  });
  // This return need to set active item
  return "active"
}

function toggleMenuItemContentWrap(menuItemContentWrap) {

  const isDesktop = window.matchMedia(desktop).matches;
  const menuContentOffsetWidth = document.querySelector('.menu__content').offsetWidth;
  const menuTriggerOffsetWidth = document.querySelector('[data-menu-trigger]').offsetWidth;
  const width = isDesktop ? "564px": (menuContentOffsetWidth - menuTriggerOffsetWidth * 3) + 'px';

  menuItemContentWrap.style.width = menuItemContentWrap.style.width == "" ? width : "";
  
  const menuItemContent = menuItemContentWrap.querySelector('[data-menu-content');
  menuItemContent.style.width = width
}

// Handlers 

function allTriggersClickHandler(ev) {
  const currentMenuItem = this.closest('[data-menu-item]');
  const isActive = currentMenuItem.dataset.menuItem == 'active';
  currentMenuItem.dataset.menuItem = isActive ? "" : hideAllMenuItemContentWrapButCurrent(currentMenuItem);
  const menuItemContentWrap = currentMenuItem.querySelector('[data-menu-content-wrap]');
  toggleMenuItemContentWrap(menuItemContentWrap);

}

//  Logic
const AllEventsControls = [
  {selector: "[data-menu-trigger]", eventType: "click", eventHandler: allTriggersClickHandler}
]
_addAllEventListeners(AllEventsControls);

// SLider Product
$(".owl-carousel").owlCarousel({
  loop: true,
  nav: true,
  items: 1,
  dots: false,
  navContainerClass: "slider__nav-wrap",
  navClass: [
    "slider__nav slider__nav--prev",
    "slider__nav slider__nav--next",
  ],
  navText: [
    `<svg class="slider__nav-icon">
    <use xlink:href="img/sprite.svg#icon-arrow--left"></use>
  </svg>`,
    `<svg class="slider__nav-icon">
  <use xlink:href="img/sprite.svg#icon-arrow--right"></use>
</svg>`,
  ],
});
let player;
const playerWrap = document.querySelector(".player");
const playerStart = document.querySelectorAll(".player__start");
const playerVideoDuration = document.querySelector(".player__time-duration");
const playerVideoCurrent = document.querySelector(".player__time-current");
const playerPlayback = document.querySelector(".player__playback");
const playerMarker = document.querySelector(".player__marker");

const playerVolumeMarker = document.querySelector(".player__volumemarker");
const playerVolume = document.querySelector(".player__volume");
const playerVolumeIcon = document.querySelector(".player__volume-icon");

function eventsInit() {
  Array.from(playerStart).forEach((el) => {
    el.addEventListener("click", (ev) => {
      const currentState = player.getPlayerState();
      if (currentState == 1) {
        player.pauseVideo();
      }
      if (currentState == 2 || currentState == 0 || currentState == 5) {
        player.playVideo();
      }
    });
  });
  playerPlayback.addEventListener("click", (ev) => {
    const newProgress = (100 * ev.layerX) / playerPlayback.clientWidth;
    playerMarker.style.left = `${newProgress}%`;
    const newCurrentSec = Math.floor(
      (newProgress * player.getDuration()) / 100
    );
    player.seekTo(newCurrentSec);
  });

  playerVolume.addEventListener("click", (ev) => {
    const newVolume = (100 * ev.layerX) / playerVolume.clientWidth;
    setPlayerVolume(newVolume);
  });
  playerVolumeIcon.addEventListener("click", mutePlayer);
}

function converTime(sec) {
  // Converting sec to time format hh:mm:ss
  sec = Number.parseInt(sec);
  let hh = Math.trunc(sec / 3600);
  let mm = Math.trunc((sec - hh * 3600) / 60);
  let ss = Math.trunc(sec % 60);

  function _formatPeriod(t) {
    // Check
    return t < 10 ? `0${t}` : `${t}`;
  }
  let resultFormat =
    hh > 0
      ? `${_formatPeriod(hh)}:${_formatPeriod(mm)}:${_formatPeriod(ss)}`
      : `${_formatPeriod(mm)}:${_formatPeriod(ss)}`;
  return `${_formatPeriod(mm)}:${_formatPeriod(ss)}`;
}



const mutePlayerInit = () => {
  // Да детка, это замкнутная функция mutePlayerInit
  let savedVolume;
  function vol(){
    let isMuted = player.getVolume() == 0;
    if (isMuted) {
      savedVolume = savedVolume ? savedVolume : 100; // is Underfined?
      setPlayerVolume(savedVolume);
      return;
    }
    savedVolume = player.getVolume();
    setPlayerVolume(0);
  }
  return vol
};
let mutePlayer = mutePlayerInit(); 

function setPlayerVolume(vol) {
  // vol: number
  player.setVolume(Math.floor(vol));
  playerVolumeMarker.style.left = `${vol}%`;
}

function onPlayerReady(ev) {
  let interval;
  const videoDurationSec = player.getDuration();
  playerVideoDuration.textContent = converTime(videoDurationSec);

  if (typeof interval !== undefined) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    // Setting current time
    const videoCurrentSec = player.getCurrentTime();
    playerVideoCurrent.textContent = converTime(videoCurrentSec);
    // Setting marker on progress bar
    const progress = (100 * videoCurrentSec) / videoDurationSec;
    playerMarker.style.left = `${progress}%`;
  }, 1000);
  // Volume
  setPlayerVolume(player.getVolume());
}

function onPlayerStateChange(ev) {
  /*
    -1 (unstarted)
    0 (ended)
    1 (playing)
    2 (paused)
    3 (buffering)
    5 (video cued).
  */
  switch (ev.data) {
    case 1:
      playerWrap.classList.remove("player--paused");
      break;
    case 2:
      playerWrap.classList.add("player--paused");
      break;
    case 0: // end
      playerWrap.classList.add("player--paused");
  }
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    width: "662",
    height: "392",
    videoId: "Og847HVwRSI",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
    playerVars: {
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      modestbranding: 1,
      rel: 0,
    },
  });
}

eventsInit();

const accordionClickHandler = function(ev) {
  if (ev.target.hasAttribute('data-accordion-trigger')) {
    $(ev.currentTarget).siblings('.team__member').removeClass('team__member--active');
    $(ev.currentTarget).toggleClass('team__member--active');
  }
}
$("[data-accordion-name='team-member']").on('click', accordionClickHandler);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS50b3VjaFN3aXBlLm1pbi5qcyIsImFsbC5qcyIsImZvcm0uanMiLCJtYXAuanMiLCJtZW51LmpzIiwib3dsLmpzIiwicGxheWVyLmpzIiwidGVhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBAZmlsZU92ZXJ2aWV3IFRvdWNoU3dpcGUgLSBqUXVlcnkgUGx1Z2luXG4gKiBAdmVyc2lvbiAxLjYuMThcbiAqXG4gKiBAYXV0aG9yIE1hdHQgQnJ5c29uIGh0dHA6Ly93d3cuZ2l0aHViLmNvbS9tYXR0YnJ5c29uXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXR0YnJ5c29uL1RvdWNoU3dpcGUtSnF1ZXJ5LVBsdWdpblxuICogQHNlZSBodHRwOi8vbGFicy5yYW1waW50ZXJhY3RpdmUuY28udWsvdG91Y2hTd2lwZS9cbiAqIEBzZWUgaHR0cDovL3BsdWdpbnMuanF1ZXJ5LmNvbS9wcm9qZWN0L3RvdWNoU3dpcGVcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxNSBNYXR0IEJyeXNvblxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIG9yIEdQTCBWZXJzaW9uIDIgbGljZW5zZXMuXG4gKlxuICovXG4hZnVuY3Rpb24oZmFjdG9yeSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kJiZkZWZpbmUuYW1kLmpRdWVyeT9kZWZpbmUoW1wianF1ZXJ5XCJdLGZhY3RvcnkpOmZhY3RvcnkoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/cmVxdWlyZShcImpxdWVyeVwiKTpqUXVlcnkpfShmdW5jdGlvbigkKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBpbml0KG9wdGlvbnMpe3JldHVybiFvcHRpb25zfHx2b2lkIDAhPT1vcHRpb25zLmFsbG93UGFnZVNjcm9sbHx8dm9pZCAwPT09b3B0aW9ucy5zd2lwZSYmdm9pZCAwPT09b3B0aW9ucy5zd2lwZVN0YXR1c3x8KG9wdGlvbnMuYWxsb3dQYWdlU2Nyb2xsPU5PTkUpLHZvaWQgMCE9PW9wdGlvbnMuY2xpY2smJnZvaWQgMD09PW9wdGlvbnMudGFwJiYob3B0aW9ucy50YXA9b3B0aW9ucy5jbGljayksb3B0aW9uc3x8KG9wdGlvbnM9e30pLG9wdGlvbnM9JC5leHRlbmQoe30sJC5mbi5zd2lwZS5kZWZhdWx0cyxvcHRpb25zKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgJHRoaXM9JCh0aGlzKSxwbHVnaW49JHRoaXMuZGF0YShQTFVHSU5fTlMpO3BsdWdpbnx8KHBsdWdpbj1uZXcgVG91Y2hTd2lwZSh0aGlzLG9wdGlvbnMpLCR0aGlzLmRhdGEoUExVR0lOX05TLHBsdWdpbikpfSl9ZnVuY3Rpb24gVG91Y2hTd2lwZShlbGVtZW50LG9wdGlvbnMpe2Z1bmN0aW9uIHRvdWNoU3RhcnQoanFFdmVudCl7aWYoIShnZXRUb3VjaEluUHJvZ3Jlc3MoKXx8JChqcUV2ZW50LnRhcmdldCkuY2xvc2VzdChvcHRpb25zLmV4Y2x1ZGVkRWxlbWVudHMsJGVsZW1lbnQpLmxlbmd0aD4wKSl7dmFyIGV2ZW50PWpxRXZlbnQub3JpZ2luYWxFdmVudD9qcUV2ZW50Lm9yaWdpbmFsRXZlbnQ6anFFdmVudDtpZighZXZlbnQucG9pbnRlclR5cGV8fFwibW91c2VcIiE9ZXZlbnQucG9pbnRlclR5cGV8fDAhPW9wdGlvbnMuZmFsbGJhY2tUb01vdXNlRXZlbnRzKXt2YXIgcmV0LHRvdWNoZXM9ZXZlbnQudG91Y2hlcyxldnQ9dG91Y2hlcz90b3VjaGVzWzBdOmV2ZW50O3JldHVybiBwaGFzZT1QSEFTRV9TVEFSVCx0b3VjaGVzP2ZpbmdlckNvdW50PXRvdWNoZXMubGVuZ3RoOm9wdGlvbnMucHJldmVudERlZmF1bHRFdmVudHMhPT0hMSYmanFFdmVudC5wcmV2ZW50RGVmYXVsdCgpLGRpc3RhbmNlPTAsZGlyZWN0aW9uPW51bGwsY3VycmVudERpcmVjdGlvbj1udWxsLHBpbmNoRGlyZWN0aW9uPW51bGwsZHVyYXRpb249MCxzdGFydFRvdWNoZXNEaXN0YW5jZT0wLGVuZFRvdWNoZXNEaXN0YW5jZT0wLHBpbmNoWm9vbT0xLHBpbmNoRGlzdGFuY2U9MCxtYXhpbXVtc01hcD1jcmVhdGVNYXhpbXVtc0RhdGEoKSxjYW5jZWxNdWx0aUZpbmdlclJlbGVhc2UoKSxjcmVhdGVGaW5nZXJEYXRhKDAsZXZ0KSwhdG91Y2hlc3x8ZmluZ2VyQ291bnQ9PT1vcHRpb25zLmZpbmdlcnN8fG9wdGlvbnMuZmluZ2Vycz09PUFMTF9GSU5HRVJTfHxoYXNQaW5jaGVzKCk/KHN0YXJ0VGltZT1nZXRUaW1lU3RhbXAoKSwyPT1maW5nZXJDb3VudCYmKGNyZWF0ZUZpbmdlckRhdGEoMSx0b3VjaGVzWzFdKSxzdGFydFRvdWNoZXNEaXN0YW5jZT1lbmRUb3VjaGVzRGlzdGFuY2U9Y2FsY3VsYXRlVG91Y2hlc0Rpc3RhbmNlKGZpbmdlckRhdGFbMF0uc3RhcnQsZmluZ2VyRGF0YVsxXS5zdGFydCkpLChvcHRpb25zLnN3aXBlU3RhdHVzfHxvcHRpb25zLnBpbmNoU3RhdHVzKSYmKHJldD10cmlnZ2VySGFuZGxlcihldmVudCxwaGFzZSkpKTpyZXQ9ITEscmV0PT09ITE/KHBoYXNlPVBIQVNFX0NBTkNFTCx0cmlnZ2VySGFuZGxlcihldmVudCxwaGFzZSkscmV0KToob3B0aW9ucy5ob2xkJiYoaG9sZFRpbWVvdXQ9c2V0VGltZW91dCgkLnByb3h5KGZ1bmN0aW9uKCl7JGVsZW1lbnQudHJpZ2dlcihcImhvbGRcIixbZXZlbnQudGFyZ2V0XSksb3B0aW9ucy5ob2xkJiYocmV0PW9wdGlvbnMuaG9sZC5jYWxsKCRlbGVtZW50LGV2ZW50LGV2ZW50LnRhcmdldCkpfSx0aGlzKSxvcHRpb25zLmxvbmdUYXBUaHJlc2hvbGQpKSxzZXRUb3VjaEluUHJvZ3Jlc3MoITApLG51bGwpfX19ZnVuY3Rpb24gdG91Y2hNb3ZlKGpxRXZlbnQpe3ZhciBldmVudD1qcUV2ZW50Lm9yaWdpbmFsRXZlbnQ/anFFdmVudC5vcmlnaW5hbEV2ZW50OmpxRXZlbnQ7aWYocGhhc2UhPT1QSEFTRV9FTkQmJnBoYXNlIT09UEhBU0VfQ0FOQ0VMJiYhaW5NdWx0aUZpbmdlclJlbGVhc2UoKSl7dmFyIHJldCx0b3VjaGVzPWV2ZW50LnRvdWNoZXMsZXZ0PXRvdWNoZXM/dG91Y2hlc1swXTpldmVudCxjdXJyZW50RmluZ2VyPXVwZGF0ZUZpbmdlckRhdGEoZXZ0KTtpZihlbmRUaW1lPWdldFRpbWVTdGFtcCgpLHRvdWNoZXMmJihmaW5nZXJDb3VudD10b3VjaGVzLmxlbmd0aCksb3B0aW9ucy5ob2xkJiZjbGVhclRpbWVvdXQoaG9sZFRpbWVvdXQpLHBoYXNlPVBIQVNFX01PVkUsMj09ZmluZ2VyQ291bnQmJigwPT1zdGFydFRvdWNoZXNEaXN0YW5jZT8oY3JlYXRlRmluZ2VyRGF0YSgxLHRvdWNoZXNbMV0pLHN0YXJ0VG91Y2hlc0Rpc3RhbmNlPWVuZFRvdWNoZXNEaXN0YW5jZT1jYWxjdWxhdGVUb3VjaGVzRGlzdGFuY2UoZmluZ2VyRGF0YVswXS5zdGFydCxmaW5nZXJEYXRhWzFdLnN0YXJ0KSk6KHVwZGF0ZUZpbmdlckRhdGEodG91Y2hlc1sxXSksZW5kVG91Y2hlc0Rpc3RhbmNlPWNhbGN1bGF0ZVRvdWNoZXNEaXN0YW5jZShmaW5nZXJEYXRhWzBdLmVuZCxmaW5nZXJEYXRhWzFdLmVuZCkscGluY2hEaXJlY3Rpb249Y2FsY3VsYXRlUGluY2hEaXJlY3Rpb24oZmluZ2VyRGF0YVswXS5lbmQsZmluZ2VyRGF0YVsxXS5lbmQpKSxwaW5jaFpvb209Y2FsY3VsYXRlUGluY2hab29tKHN0YXJ0VG91Y2hlc0Rpc3RhbmNlLGVuZFRvdWNoZXNEaXN0YW5jZSkscGluY2hEaXN0YW5jZT1NYXRoLmFicyhzdGFydFRvdWNoZXNEaXN0YW5jZS1lbmRUb3VjaGVzRGlzdGFuY2UpKSxmaW5nZXJDb3VudD09PW9wdGlvbnMuZmluZ2Vyc3x8b3B0aW9ucy5maW5nZXJzPT09QUxMX0ZJTkdFUlN8fCF0b3VjaGVzfHxoYXNQaW5jaGVzKCkpe2lmKGRpcmVjdGlvbj1jYWxjdWxhdGVEaXJlY3Rpb24oY3VycmVudEZpbmdlci5zdGFydCxjdXJyZW50RmluZ2VyLmVuZCksY3VycmVudERpcmVjdGlvbj1jYWxjdWxhdGVEaXJlY3Rpb24oY3VycmVudEZpbmdlci5sYXN0LGN1cnJlbnRGaW5nZXIuZW5kKSx2YWxpZGF0ZURlZmF1bHRFdmVudChqcUV2ZW50LGN1cnJlbnREaXJlY3Rpb24pLGRpc3RhbmNlPWNhbGN1bGF0ZURpc3RhbmNlKGN1cnJlbnRGaW5nZXIuc3RhcnQsY3VycmVudEZpbmdlci5lbmQpLGR1cmF0aW9uPWNhbGN1bGF0ZUR1cmF0aW9uKCksc2V0TWF4RGlzdGFuY2UoZGlyZWN0aW9uLGRpc3RhbmNlKSxyZXQ9dHJpZ2dlckhhbmRsZXIoZXZlbnQscGhhc2UpLCFvcHRpb25zLnRyaWdnZXJPblRvdWNoRW5kfHxvcHRpb25zLnRyaWdnZXJPblRvdWNoTGVhdmUpe3ZhciBpbkJvdW5kcz0hMDtpZihvcHRpb25zLnRyaWdnZXJPblRvdWNoTGVhdmUpe3ZhciBib3VuZHM9Z2V0Ym91bmRzKHRoaXMpO2luQm91bmRzPWlzSW5Cb3VuZHMoY3VycmVudEZpbmdlci5lbmQsYm91bmRzKX0hb3B0aW9ucy50cmlnZ2VyT25Ub3VjaEVuZCYmaW5Cb3VuZHM/cGhhc2U9Z2V0TmV4dFBoYXNlKFBIQVNFX01PVkUpOm9wdGlvbnMudHJpZ2dlck9uVG91Y2hMZWF2ZSYmIWluQm91bmRzJiYocGhhc2U9Z2V0TmV4dFBoYXNlKFBIQVNFX0VORCkpLHBoYXNlIT1QSEFTRV9DQU5DRUwmJnBoYXNlIT1QSEFTRV9FTkR8fHRyaWdnZXJIYW5kbGVyKGV2ZW50LHBoYXNlKX19ZWxzZSBwaGFzZT1QSEFTRV9DQU5DRUwsdHJpZ2dlckhhbmRsZXIoZXZlbnQscGhhc2UpO3JldD09PSExJiYocGhhc2U9UEhBU0VfQ0FOQ0VMLHRyaWdnZXJIYW5kbGVyKGV2ZW50LHBoYXNlKSl9fWZ1bmN0aW9uIHRvdWNoRW5kKGpxRXZlbnQpe3ZhciBldmVudD1qcUV2ZW50Lm9yaWdpbmFsRXZlbnQ/anFFdmVudC5vcmlnaW5hbEV2ZW50OmpxRXZlbnQsdG91Y2hlcz1ldmVudC50b3VjaGVzO2lmKHRvdWNoZXMpe2lmKHRvdWNoZXMubGVuZ3RoJiYhaW5NdWx0aUZpbmdlclJlbGVhc2UoKSlyZXR1cm4gc3RhcnRNdWx0aUZpbmdlclJlbGVhc2UoZXZlbnQpLCEwO2lmKHRvdWNoZXMubGVuZ3RoJiZpbk11bHRpRmluZ2VyUmVsZWFzZSgpKXJldHVybiEwfXJldHVybiBpbk11bHRpRmluZ2VyUmVsZWFzZSgpJiYoZmluZ2VyQ291bnQ9ZmluZ2VyQ291bnRBdFJlbGVhc2UpLGVuZFRpbWU9Z2V0VGltZVN0YW1wKCksZHVyYXRpb249Y2FsY3VsYXRlRHVyYXRpb24oKSxkaWRTd2lwZUJhY2tUb0NhbmNlbCgpfHwhdmFsaWRhdGVTd2lwZURpc3RhbmNlKCk/KHBoYXNlPVBIQVNFX0NBTkNFTCx0cmlnZ2VySGFuZGxlcihldmVudCxwaGFzZSkpOm9wdGlvbnMudHJpZ2dlck9uVG91Y2hFbmR8fG9wdGlvbnMudHJpZ2dlck9uVG91Y2hFbmQ9PT0hMSYmcGhhc2U9PT1QSEFTRV9NT1ZFPyhvcHRpb25zLnByZXZlbnREZWZhdWx0RXZlbnRzIT09ITEmJmpxRXZlbnQuY2FuY2VsYWJsZSE9PSExJiZqcUV2ZW50LnByZXZlbnREZWZhdWx0KCkscGhhc2U9UEhBU0VfRU5ELHRyaWdnZXJIYW5kbGVyKGV2ZW50LHBoYXNlKSk6IW9wdGlvbnMudHJpZ2dlck9uVG91Y2hFbmQmJmhhc1RhcCgpPyhwaGFzZT1QSEFTRV9FTkQsdHJpZ2dlckhhbmRsZXJGb3JHZXN0dXJlKGV2ZW50LHBoYXNlLFRBUCkpOnBoYXNlPT09UEhBU0VfTU9WRSYmKHBoYXNlPVBIQVNFX0NBTkNFTCx0cmlnZ2VySGFuZGxlcihldmVudCxwaGFzZSkpLHNldFRvdWNoSW5Qcm9ncmVzcyghMSksbnVsbH1mdW5jdGlvbiB0b3VjaENhbmNlbCgpe2ZpbmdlckNvdW50PTAsZW5kVGltZT0wLHN0YXJ0VGltZT0wLHN0YXJ0VG91Y2hlc0Rpc3RhbmNlPTAsZW5kVG91Y2hlc0Rpc3RhbmNlPTAscGluY2hab29tPTEsY2FuY2VsTXVsdGlGaW5nZXJSZWxlYXNlKCksc2V0VG91Y2hJblByb2dyZXNzKCExKX1mdW5jdGlvbiB0b3VjaExlYXZlKGpxRXZlbnQpe3ZhciBldmVudD1qcUV2ZW50Lm9yaWdpbmFsRXZlbnQ/anFFdmVudC5vcmlnaW5hbEV2ZW50OmpxRXZlbnQ7b3B0aW9ucy50cmlnZ2VyT25Ub3VjaExlYXZlJiYocGhhc2U9Z2V0TmV4dFBoYXNlKFBIQVNFX0VORCksdHJpZ2dlckhhbmRsZXIoZXZlbnQscGhhc2UpKX1mdW5jdGlvbiByZW1vdmVMaXN0ZW5lcnMoKXskZWxlbWVudC5vZmYoU1RBUlRfRVYsdG91Y2hTdGFydCksJGVsZW1lbnQub2ZmKENBTkNFTF9FVix0b3VjaENhbmNlbCksJGVsZW1lbnQub2ZmKE1PVkVfRVYsdG91Y2hNb3ZlKSwkZWxlbWVudC5vZmYoRU5EX0VWLHRvdWNoRW5kKSxMRUFWRV9FViYmJGVsZW1lbnQub2ZmKExFQVZFX0VWLHRvdWNoTGVhdmUpLHNldFRvdWNoSW5Qcm9ncmVzcyghMSl9ZnVuY3Rpb24gZ2V0TmV4dFBoYXNlKGN1cnJlbnRQaGFzZSl7dmFyIG5leHRQaGFzZT1jdXJyZW50UGhhc2UsdmFsaWRUaW1lPXZhbGlkYXRlU3dpcGVUaW1lKCksdmFsaWREaXN0YW5jZT12YWxpZGF0ZVN3aXBlRGlzdGFuY2UoKSxkaWRDYW5jZWw9ZGlkU3dpcGVCYWNrVG9DYW5jZWwoKTtyZXR1cm4hdmFsaWRUaW1lfHxkaWRDYW5jZWw/bmV4dFBoYXNlPVBIQVNFX0NBTkNFTDohdmFsaWREaXN0YW5jZXx8Y3VycmVudFBoYXNlIT1QSEFTRV9NT1ZFfHxvcHRpb25zLnRyaWdnZXJPblRvdWNoRW5kJiYhb3B0aW9ucy50cmlnZ2VyT25Ub3VjaExlYXZlPyF2YWxpZERpc3RhbmNlJiZjdXJyZW50UGhhc2U9PVBIQVNFX0VORCYmb3B0aW9ucy50cmlnZ2VyT25Ub3VjaExlYXZlJiYobmV4dFBoYXNlPVBIQVNFX0NBTkNFTCk6bmV4dFBoYXNlPVBIQVNFX0VORCxuZXh0UGhhc2V9ZnVuY3Rpb24gdHJpZ2dlckhhbmRsZXIoZXZlbnQscGhhc2Upe3ZhciByZXQsdG91Y2hlcz1ldmVudC50b3VjaGVzO3JldHVybihkaWRTd2lwZSgpfHxoYXNTd2lwZXMoKSkmJihyZXQ9dHJpZ2dlckhhbmRsZXJGb3JHZXN0dXJlKGV2ZW50LHBoYXNlLFNXSVBFKSksKGRpZFBpbmNoKCl8fGhhc1BpbmNoZXMoKSkmJnJldCE9PSExJiYocmV0PXRyaWdnZXJIYW5kbGVyRm9yR2VzdHVyZShldmVudCxwaGFzZSxQSU5DSCkpLGRpZERvdWJsZVRhcCgpJiZyZXQhPT0hMT9yZXQ9dHJpZ2dlckhhbmRsZXJGb3JHZXN0dXJlKGV2ZW50LHBoYXNlLERPVUJMRV9UQVApOmRpZExvbmdUYXAoKSYmcmV0IT09ITE/cmV0PXRyaWdnZXJIYW5kbGVyRm9yR2VzdHVyZShldmVudCxwaGFzZSxMT05HX1RBUCk6ZGlkVGFwKCkmJnJldCE9PSExJiYocmV0PXRyaWdnZXJIYW5kbGVyRm9yR2VzdHVyZShldmVudCxwaGFzZSxUQVApKSxwaGFzZT09PVBIQVNFX0NBTkNFTCYmdG91Y2hDYW5jZWwoZXZlbnQpLHBoYXNlPT09UEhBU0VfRU5EJiYodG91Y2hlcz90b3VjaGVzLmxlbmd0aHx8dG91Y2hDYW5jZWwoZXZlbnQpOnRvdWNoQ2FuY2VsKGV2ZW50KSkscmV0fWZ1bmN0aW9uIHRyaWdnZXJIYW5kbGVyRm9yR2VzdHVyZShldmVudCxwaGFzZSxnZXN0dXJlKXt2YXIgcmV0O2lmKGdlc3R1cmU9PVNXSVBFKXtpZigkZWxlbWVudC50cmlnZ2VyKFwic3dpcGVTdGF0dXNcIixbcGhhc2UsZGlyZWN0aW9ufHxudWxsLGRpc3RhbmNlfHwwLGR1cmF0aW9ufHwwLGZpbmdlckNvdW50LGZpbmdlckRhdGEsY3VycmVudERpcmVjdGlvbl0pLG9wdGlvbnMuc3dpcGVTdGF0dXMmJihyZXQ9b3B0aW9ucy5zd2lwZVN0YXR1cy5jYWxsKCRlbGVtZW50LGV2ZW50LHBoYXNlLGRpcmVjdGlvbnx8bnVsbCxkaXN0YW5jZXx8MCxkdXJhdGlvbnx8MCxmaW5nZXJDb3VudCxmaW5nZXJEYXRhLGN1cnJlbnREaXJlY3Rpb24pLHJldD09PSExKSlyZXR1cm4hMTtpZihwaGFzZT09UEhBU0VfRU5EJiZ2YWxpZGF0ZVN3aXBlKCkpe2lmKGNsZWFyVGltZW91dChzaW5nbGVUYXBUaW1lb3V0KSxjbGVhclRpbWVvdXQoaG9sZFRpbWVvdXQpLCRlbGVtZW50LnRyaWdnZXIoXCJzd2lwZVwiLFtkaXJlY3Rpb24sZGlzdGFuY2UsZHVyYXRpb24sZmluZ2VyQ291bnQsZmluZ2VyRGF0YSxjdXJyZW50RGlyZWN0aW9uXSksb3B0aW9ucy5zd2lwZSYmKHJldD1vcHRpb25zLnN3aXBlLmNhbGwoJGVsZW1lbnQsZXZlbnQsZGlyZWN0aW9uLGRpc3RhbmNlLGR1cmF0aW9uLGZpbmdlckNvdW50LGZpbmdlckRhdGEsY3VycmVudERpcmVjdGlvbikscmV0PT09ITEpKXJldHVybiExO3N3aXRjaChkaXJlY3Rpb24pe2Nhc2UgTEVGVDokZWxlbWVudC50cmlnZ2VyKFwic3dpcGVMZWZ0XCIsW2RpcmVjdGlvbixkaXN0YW5jZSxkdXJhdGlvbixmaW5nZXJDb3VudCxmaW5nZXJEYXRhLGN1cnJlbnREaXJlY3Rpb25dKSxvcHRpb25zLnN3aXBlTGVmdCYmKHJldD1vcHRpb25zLnN3aXBlTGVmdC5jYWxsKCRlbGVtZW50LGV2ZW50LGRpcmVjdGlvbixkaXN0YW5jZSxkdXJhdGlvbixmaW5nZXJDb3VudCxmaW5nZXJEYXRhLGN1cnJlbnREaXJlY3Rpb24pKTticmVhaztjYXNlIFJJR0hUOiRlbGVtZW50LnRyaWdnZXIoXCJzd2lwZVJpZ2h0XCIsW2RpcmVjdGlvbixkaXN0YW5jZSxkdXJhdGlvbixmaW5nZXJDb3VudCxmaW5nZXJEYXRhLGN1cnJlbnREaXJlY3Rpb25dKSxvcHRpb25zLnN3aXBlUmlnaHQmJihyZXQ9b3B0aW9ucy5zd2lwZVJpZ2h0LmNhbGwoJGVsZW1lbnQsZXZlbnQsZGlyZWN0aW9uLGRpc3RhbmNlLGR1cmF0aW9uLGZpbmdlckNvdW50LGZpbmdlckRhdGEsY3VycmVudERpcmVjdGlvbikpO2JyZWFrO2Nhc2UgVVA6JGVsZW1lbnQudHJpZ2dlcihcInN3aXBlVXBcIixbZGlyZWN0aW9uLGRpc3RhbmNlLGR1cmF0aW9uLGZpbmdlckNvdW50LGZpbmdlckRhdGEsY3VycmVudERpcmVjdGlvbl0pLG9wdGlvbnMuc3dpcGVVcCYmKHJldD1vcHRpb25zLnN3aXBlVXAuY2FsbCgkZWxlbWVudCxldmVudCxkaXJlY3Rpb24sZGlzdGFuY2UsZHVyYXRpb24sZmluZ2VyQ291bnQsZmluZ2VyRGF0YSxjdXJyZW50RGlyZWN0aW9uKSk7YnJlYWs7Y2FzZSBET1dOOiRlbGVtZW50LnRyaWdnZXIoXCJzd2lwZURvd25cIixbZGlyZWN0aW9uLGRpc3RhbmNlLGR1cmF0aW9uLGZpbmdlckNvdW50LGZpbmdlckRhdGEsY3VycmVudERpcmVjdGlvbl0pLG9wdGlvbnMuc3dpcGVEb3duJiYocmV0PW9wdGlvbnMuc3dpcGVEb3duLmNhbGwoJGVsZW1lbnQsZXZlbnQsZGlyZWN0aW9uLGRpc3RhbmNlLGR1cmF0aW9uLGZpbmdlckNvdW50LGZpbmdlckRhdGEsY3VycmVudERpcmVjdGlvbikpfX19aWYoZ2VzdHVyZT09UElOQ0gpe2lmKCRlbGVtZW50LnRyaWdnZXIoXCJwaW5jaFN0YXR1c1wiLFtwaGFzZSxwaW5jaERpcmVjdGlvbnx8bnVsbCxwaW5jaERpc3RhbmNlfHwwLGR1cmF0aW9ufHwwLGZpbmdlckNvdW50LHBpbmNoWm9vbSxmaW5nZXJEYXRhXSksb3B0aW9ucy5waW5jaFN0YXR1cyYmKHJldD1vcHRpb25zLnBpbmNoU3RhdHVzLmNhbGwoJGVsZW1lbnQsZXZlbnQscGhhc2UscGluY2hEaXJlY3Rpb258fG51bGwscGluY2hEaXN0YW5jZXx8MCxkdXJhdGlvbnx8MCxmaW5nZXJDb3VudCxwaW5jaFpvb20sZmluZ2VyRGF0YSkscmV0PT09ITEpKXJldHVybiExO2lmKHBoYXNlPT1QSEFTRV9FTkQmJnZhbGlkYXRlUGluY2goKSlzd2l0Y2gocGluY2hEaXJlY3Rpb24pe2Nhc2UgSU46JGVsZW1lbnQudHJpZ2dlcihcInBpbmNoSW5cIixbcGluY2hEaXJlY3Rpb258fG51bGwscGluY2hEaXN0YW5jZXx8MCxkdXJhdGlvbnx8MCxmaW5nZXJDb3VudCxwaW5jaFpvb20sZmluZ2VyRGF0YV0pLG9wdGlvbnMucGluY2hJbiYmKHJldD1vcHRpb25zLnBpbmNoSW4uY2FsbCgkZWxlbWVudCxldmVudCxwaW5jaERpcmVjdGlvbnx8bnVsbCxwaW5jaERpc3RhbmNlfHwwLGR1cmF0aW9ufHwwLGZpbmdlckNvdW50LHBpbmNoWm9vbSxmaW5nZXJEYXRhKSk7YnJlYWs7Y2FzZSBPVVQ6JGVsZW1lbnQudHJpZ2dlcihcInBpbmNoT3V0XCIsW3BpbmNoRGlyZWN0aW9ufHxudWxsLHBpbmNoRGlzdGFuY2V8fDAsZHVyYXRpb258fDAsZmluZ2VyQ291bnQscGluY2hab29tLGZpbmdlckRhdGFdKSxvcHRpb25zLnBpbmNoT3V0JiYocmV0PW9wdGlvbnMucGluY2hPdXQuY2FsbCgkZWxlbWVudCxldmVudCxwaW5jaERpcmVjdGlvbnx8bnVsbCxwaW5jaERpc3RhbmNlfHwwLGR1cmF0aW9ufHwwLGZpbmdlckNvdW50LHBpbmNoWm9vbSxmaW5nZXJEYXRhKSl9fXJldHVybiBnZXN0dXJlPT1UQVA/cGhhc2UhPT1QSEFTRV9DQU5DRUwmJnBoYXNlIT09UEhBU0VfRU5EfHwoY2xlYXJUaW1lb3V0KHNpbmdsZVRhcFRpbWVvdXQpLGNsZWFyVGltZW91dChob2xkVGltZW91dCksaGFzRG91YmxlVGFwKCkmJiFpbkRvdWJsZVRhcCgpPyhkb3VibGVUYXBTdGFydFRpbWU9Z2V0VGltZVN0YW1wKCksc2luZ2xlVGFwVGltZW91dD1zZXRUaW1lb3V0KCQucHJveHkoZnVuY3Rpb24oKXtkb3VibGVUYXBTdGFydFRpbWU9bnVsbCwkZWxlbWVudC50cmlnZ2VyKFwidGFwXCIsW2V2ZW50LnRhcmdldF0pLG9wdGlvbnMudGFwJiYocmV0PW9wdGlvbnMudGFwLmNhbGwoJGVsZW1lbnQsZXZlbnQsZXZlbnQudGFyZ2V0KSl9LHRoaXMpLG9wdGlvbnMuZG91YmxlVGFwVGhyZXNob2xkKSk6KGRvdWJsZVRhcFN0YXJ0VGltZT1udWxsLCRlbGVtZW50LnRyaWdnZXIoXCJ0YXBcIixbZXZlbnQudGFyZ2V0XSksb3B0aW9ucy50YXAmJihyZXQ9b3B0aW9ucy50YXAuY2FsbCgkZWxlbWVudCxldmVudCxldmVudC50YXJnZXQpKSkpOmdlc3R1cmU9PURPVUJMRV9UQVA/cGhhc2UhPT1QSEFTRV9DQU5DRUwmJnBoYXNlIT09UEhBU0VfRU5EfHwoY2xlYXJUaW1lb3V0KHNpbmdsZVRhcFRpbWVvdXQpLGNsZWFyVGltZW91dChob2xkVGltZW91dCksZG91YmxlVGFwU3RhcnRUaW1lPW51bGwsJGVsZW1lbnQudHJpZ2dlcihcImRvdWJsZXRhcFwiLFtldmVudC50YXJnZXRdKSxvcHRpb25zLmRvdWJsZVRhcCYmKHJldD1vcHRpb25zLmRvdWJsZVRhcC5jYWxsKCRlbGVtZW50LGV2ZW50LGV2ZW50LnRhcmdldCkpKTpnZXN0dXJlPT1MT05HX1RBUCYmKHBoYXNlIT09UEhBU0VfQ0FOQ0VMJiZwaGFzZSE9PVBIQVNFX0VORHx8KGNsZWFyVGltZW91dChzaW5nbGVUYXBUaW1lb3V0KSxkb3VibGVUYXBTdGFydFRpbWU9bnVsbCwkZWxlbWVudC50cmlnZ2VyKFwibG9uZ3RhcFwiLFtldmVudC50YXJnZXRdKSxvcHRpb25zLmxvbmdUYXAmJihyZXQ9b3B0aW9ucy5sb25nVGFwLmNhbGwoJGVsZW1lbnQsZXZlbnQsZXZlbnQudGFyZ2V0KSkpKSxyZXR9ZnVuY3Rpb24gdmFsaWRhdGVTd2lwZURpc3RhbmNlKCl7dmFyIHZhbGlkPSEwO3JldHVybiBudWxsIT09b3B0aW9ucy50aHJlc2hvbGQmJih2YWxpZD1kaXN0YW5jZT49b3B0aW9ucy50aHJlc2hvbGQpLHZhbGlkfWZ1bmN0aW9uIGRpZFN3aXBlQmFja1RvQ2FuY2VsKCl7dmFyIGNhbmNlbGxlZD0hMTtyZXR1cm4gbnVsbCE9PW9wdGlvbnMuY2FuY2VsVGhyZXNob2xkJiZudWxsIT09ZGlyZWN0aW9uJiYoY2FuY2VsbGVkPWdldE1heERpc3RhbmNlKGRpcmVjdGlvbiktZGlzdGFuY2U+PW9wdGlvbnMuY2FuY2VsVGhyZXNob2xkKSxjYW5jZWxsZWR9ZnVuY3Rpb24gdmFsaWRhdGVQaW5jaERpc3RhbmNlKCl7cmV0dXJuIG51bGwhPT1vcHRpb25zLnBpbmNoVGhyZXNob2xkP3BpbmNoRGlzdGFuY2U+PW9wdGlvbnMucGluY2hUaHJlc2hvbGQ6ITB9ZnVuY3Rpb24gdmFsaWRhdGVTd2lwZVRpbWUoKXt2YXIgcmVzdWx0O3JldHVybiByZXN1bHQ9b3B0aW9ucy5tYXhUaW1lVGhyZXNob2xkPyEoZHVyYXRpb24+PW9wdGlvbnMubWF4VGltZVRocmVzaG9sZCk6ITB9ZnVuY3Rpb24gdmFsaWRhdGVEZWZhdWx0RXZlbnQoanFFdmVudCxkaXJlY3Rpb24pe2lmKG9wdGlvbnMucHJldmVudERlZmF1bHRFdmVudHMhPT0hMSlpZihvcHRpb25zLmFsbG93UGFnZVNjcm9sbD09PU5PTkUpanFFdmVudC5wcmV2ZW50RGVmYXVsdCgpO2Vsc2V7dmFyIGF1dG89b3B0aW9ucy5hbGxvd1BhZ2VTY3JvbGw9PT1BVVRPO3N3aXRjaChkaXJlY3Rpb24pe2Nhc2UgTEVGVDoob3B0aW9ucy5zd2lwZUxlZnQmJmF1dG98fCFhdXRvJiZvcHRpb25zLmFsbG93UGFnZVNjcm9sbCE9SE9SSVpPTlRBTCkmJmpxRXZlbnQucHJldmVudERlZmF1bHQoKTticmVhaztjYXNlIFJJR0hUOihvcHRpb25zLnN3aXBlUmlnaHQmJmF1dG98fCFhdXRvJiZvcHRpb25zLmFsbG93UGFnZVNjcm9sbCE9SE9SSVpPTlRBTCkmJmpxRXZlbnQucHJldmVudERlZmF1bHQoKTticmVhaztjYXNlIFVQOihvcHRpb25zLnN3aXBlVXAmJmF1dG98fCFhdXRvJiZvcHRpb25zLmFsbG93UGFnZVNjcm9sbCE9VkVSVElDQUwpJiZqcUV2ZW50LnByZXZlbnREZWZhdWx0KCk7YnJlYWs7Y2FzZSBET1dOOihvcHRpb25zLnN3aXBlRG93biYmYXV0b3x8IWF1dG8mJm9wdGlvbnMuYWxsb3dQYWdlU2Nyb2xsIT1WRVJUSUNBTCkmJmpxRXZlbnQucHJldmVudERlZmF1bHQoKTticmVhaztjYXNlIE5PTkU6fX19ZnVuY3Rpb24gdmFsaWRhdGVQaW5jaCgpe3ZhciBoYXNDb3JyZWN0RmluZ2VyQ291bnQ9dmFsaWRhdGVGaW5nZXJzKCksaGFzRW5kUG9pbnQ9dmFsaWRhdGVFbmRQb2ludCgpLGhhc0NvcnJlY3REaXN0YW5jZT12YWxpZGF0ZVBpbmNoRGlzdGFuY2UoKTtyZXR1cm4gaGFzQ29ycmVjdEZpbmdlckNvdW50JiZoYXNFbmRQb2ludCYmaGFzQ29ycmVjdERpc3RhbmNlfWZ1bmN0aW9uIGhhc1BpbmNoZXMoKXtyZXR1cm4hIShvcHRpb25zLnBpbmNoU3RhdHVzfHxvcHRpb25zLnBpbmNoSW58fG9wdGlvbnMucGluY2hPdXQpfWZ1bmN0aW9uIGRpZFBpbmNoKCl7cmV0dXJuISghdmFsaWRhdGVQaW5jaCgpfHwhaGFzUGluY2hlcygpKX1mdW5jdGlvbiB2YWxpZGF0ZVN3aXBlKCl7dmFyIGhhc1ZhbGlkVGltZT12YWxpZGF0ZVN3aXBlVGltZSgpLGhhc1ZhbGlkRGlzdGFuY2U9dmFsaWRhdGVTd2lwZURpc3RhbmNlKCksaGFzQ29ycmVjdEZpbmdlckNvdW50PXZhbGlkYXRlRmluZ2VycygpLGhhc0VuZFBvaW50PXZhbGlkYXRlRW5kUG9pbnQoKSxkaWRDYW5jZWw9ZGlkU3dpcGVCYWNrVG9DYW5jZWwoKSx2YWxpZD0hZGlkQ2FuY2VsJiZoYXNFbmRQb2ludCYmaGFzQ29ycmVjdEZpbmdlckNvdW50JiZoYXNWYWxpZERpc3RhbmNlJiZoYXNWYWxpZFRpbWU7cmV0dXJuIHZhbGlkfWZ1bmN0aW9uIGhhc1N3aXBlcygpe3JldHVybiEhKG9wdGlvbnMuc3dpcGV8fG9wdGlvbnMuc3dpcGVTdGF0dXN8fG9wdGlvbnMuc3dpcGVMZWZ0fHxvcHRpb25zLnN3aXBlUmlnaHR8fG9wdGlvbnMuc3dpcGVVcHx8b3B0aW9ucy5zd2lwZURvd24pfWZ1bmN0aW9uIGRpZFN3aXBlKCl7cmV0dXJuISghdmFsaWRhdGVTd2lwZSgpfHwhaGFzU3dpcGVzKCkpfWZ1bmN0aW9uIHZhbGlkYXRlRmluZ2Vycygpe3JldHVybiBmaW5nZXJDb3VudD09PW9wdGlvbnMuZmluZ2Vyc3x8b3B0aW9ucy5maW5nZXJzPT09QUxMX0ZJTkdFUlN8fCFTVVBQT1JUU19UT1VDSH1mdW5jdGlvbiB2YWxpZGF0ZUVuZFBvaW50KCl7cmV0dXJuIDAhPT1maW5nZXJEYXRhWzBdLmVuZC54fWZ1bmN0aW9uIGhhc1RhcCgpe3JldHVybiEhb3B0aW9ucy50YXB9ZnVuY3Rpb24gaGFzRG91YmxlVGFwKCl7cmV0dXJuISFvcHRpb25zLmRvdWJsZVRhcH1mdW5jdGlvbiBoYXNMb25nVGFwKCl7cmV0dXJuISFvcHRpb25zLmxvbmdUYXB9ZnVuY3Rpb24gdmFsaWRhdGVEb3VibGVUYXAoKXtpZihudWxsPT1kb3VibGVUYXBTdGFydFRpbWUpcmV0dXJuITE7dmFyIG5vdz1nZXRUaW1lU3RhbXAoKTtyZXR1cm4gaGFzRG91YmxlVGFwKCkmJm5vdy1kb3VibGVUYXBTdGFydFRpbWU8PW9wdGlvbnMuZG91YmxlVGFwVGhyZXNob2xkfWZ1bmN0aW9uIGluRG91YmxlVGFwKCl7cmV0dXJuIHZhbGlkYXRlRG91YmxlVGFwKCl9ZnVuY3Rpb24gdmFsaWRhdGVUYXAoKXtyZXR1cm4oMT09PWZpbmdlckNvdW50fHwhU1VQUE9SVFNfVE9VQ0gpJiYoaXNOYU4oZGlzdGFuY2UpfHxkaXN0YW5jZTxvcHRpb25zLnRocmVzaG9sZCl9ZnVuY3Rpb24gdmFsaWRhdGVMb25nVGFwKCl7cmV0dXJuIGR1cmF0aW9uPm9wdGlvbnMubG9uZ1RhcFRocmVzaG9sZCYmRE9VQkxFX1RBUF9USFJFU0hPTEQ+ZGlzdGFuY2V9ZnVuY3Rpb24gZGlkVGFwKCl7cmV0dXJuISghdmFsaWRhdGVUYXAoKXx8IWhhc1RhcCgpKX1mdW5jdGlvbiBkaWREb3VibGVUYXAoKXtyZXR1cm4hKCF2YWxpZGF0ZURvdWJsZVRhcCgpfHwhaGFzRG91YmxlVGFwKCkpfWZ1bmN0aW9uIGRpZExvbmdUYXAoKXtyZXR1cm4hKCF2YWxpZGF0ZUxvbmdUYXAoKXx8IWhhc0xvbmdUYXAoKSl9ZnVuY3Rpb24gc3RhcnRNdWx0aUZpbmdlclJlbGVhc2UoZXZlbnQpe3ByZXZpb3VzVG91Y2hFbmRUaW1lPWdldFRpbWVTdGFtcCgpLGZpbmdlckNvdW50QXRSZWxlYXNlPWV2ZW50LnRvdWNoZXMubGVuZ3RoKzF9ZnVuY3Rpb24gY2FuY2VsTXVsdGlGaW5nZXJSZWxlYXNlKCl7cHJldmlvdXNUb3VjaEVuZFRpbWU9MCxmaW5nZXJDb3VudEF0UmVsZWFzZT0wfWZ1bmN0aW9uIGluTXVsdGlGaW5nZXJSZWxlYXNlKCl7dmFyIHdpdGhpblRocmVzaG9sZD0hMTtpZihwcmV2aW91c1RvdWNoRW5kVGltZSl7dmFyIGRpZmY9Z2V0VGltZVN0YW1wKCktcHJldmlvdXNUb3VjaEVuZFRpbWU7ZGlmZjw9b3B0aW9ucy5maW5nZXJSZWxlYXNlVGhyZXNob2xkJiYod2l0aGluVGhyZXNob2xkPSEwKX1yZXR1cm4gd2l0aGluVGhyZXNob2xkfWZ1bmN0aW9uIGdldFRvdWNoSW5Qcm9ncmVzcygpe3JldHVybiEoJGVsZW1lbnQuZGF0YShQTFVHSU5fTlMrXCJfaW50b3VjaFwiKSE9PSEwKX1mdW5jdGlvbiBzZXRUb3VjaEluUHJvZ3Jlc3ModmFsKXskZWxlbWVudCYmKHZhbD09PSEwPygkZWxlbWVudC5vbihNT1ZFX0VWLHRvdWNoTW92ZSksJGVsZW1lbnQub24oRU5EX0VWLHRvdWNoRW5kKSxMRUFWRV9FViYmJGVsZW1lbnQub24oTEVBVkVfRVYsdG91Y2hMZWF2ZSkpOigkZWxlbWVudC5vZmYoTU9WRV9FVix0b3VjaE1vdmUsITEpLCRlbGVtZW50Lm9mZihFTkRfRVYsdG91Y2hFbmQsITEpLExFQVZFX0VWJiYkZWxlbWVudC5vZmYoTEVBVkVfRVYsdG91Y2hMZWF2ZSwhMSkpLCRlbGVtZW50LmRhdGEoUExVR0lOX05TK1wiX2ludG91Y2hcIix2YWw9PT0hMCkpfWZ1bmN0aW9uIGNyZWF0ZUZpbmdlckRhdGEoaWQsZXZ0KXt2YXIgZj17c3RhcnQ6e3g6MCx5OjB9LGxhc3Q6e3g6MCx5OjB9LGVuZDp7eDowLHk6MH19O3JldHVybiBmLnN0YXJ0Lng9Zi5sYXN0Lng9Zi5lbmQueD1ldnQucGFnZVh8fGV2dC5jbGllbnRYLGYuc3RhcnQueT1mLmxhc3QueT1mLmVuZC55PWV2dC5wYWdlWXx8ZXZ0LmNsaWVudFksZmluZ2VyRGF0YVtpZF09ZixmfWZ1bmN0aW9uIHVwZGF0ZUZpbmdlckRhdGEoZXZ0KXt2YXIgaWQ9dm9pZCAwIT09ZXZ0LmlkZW50aWZpZXI/ZXZ0LmlkZW50aWZpZXI6MCxmPWdldEZpbmdlckRhdGEoaWQpO3JldHVybiBudWxsPT09ZiYmKGY9Y3JlYXRlRmluZ2VyRGF0YShpZCxldnQpKSxmLmxhc3QueD1mLmVuZC54LGYubGFzdC55PWYuZW5kLnksZi5lbmQueD1ldnQucGFnZVh8fGV2dC5jbGllbnRYLGYuZW5kLnk9ZXZ0LnBhZ2VZfHxldnQuY2xpZW50WSxmfWZ1bmN0aW9uIGdldEZpbmdlckRhdGEoaWQpe3JldHVybiBmaW5nZXJEYXRhW2lkXXx8bnVsbH1mdW5jdGlvbiBzZXRNYXhEaXN0YW5jZShkaXJlY3Rpb24sZGlzdGFuY2Upe2RpcmVjdGlvbiE9Tk9ORSYmKGRpc3RhbmNlPU1hdGgubWF4KGRpc3RhbmNlLGdldE1heERpc3RhbmNlKGRpcmVjdGlvbikpLG1heGltdW1zTWFwW2RpcmVjdGlvbl0uZGlzdGFuY2U9ZGlzdGFuY2UpfWZ1bmN0aW9uIGdldE1heERpc3RhbmNlKGRpcmVjdGlvbil7cmV0dXJuIG1heGltdW1zTWFwW2RpcmVjdGlvbl0/bWF4aW11bXNNYXBbZGlyZWN0aW9uXS5kaXN0YW5jZTp2b2lkIDB9ZnVuY3Rpb24gY3JlYXRlTWF4aW11bXNEYXRhKCl7dmFyIG1heERhdGE9e307cmV0dXJuIG1heERhdGFbTEVGVF09Y3JlYXRlTWF4aW11bVZPKExFRlQpLG1heERhdGFbUklHSFRdPWNyZWF0ZU1heGltdW1WTyhSSUdIVCksbWF4RGF0YVtVUF09Y3JlYXRlTWF4aW11bVZPKFVQKSxtYXhEYXRhW0RPV05dPWNyZWF0ZU1heGltdW1WTyhET1dOKSxtYXhEYXRhfWZ1bmN0aW9uIGNyZWF0ZU1heGltdW1WTyhkaXIpe3JldHVybntkaXJlY3Rpb246ZGlyLGRpc3RhbmNlOjB9fWZ1bmN0aW9uIGNhbGN1bGF0ZUR1cmF0aW9uKCl7cmV0dXJuIGVuZFRpbWUtc3RhcnRUaW1lfWZ1bmN0aW9uIGNhbGN1bGF0ZVRvdWNoZXNEaXN0YW5jZShzdGFydFBvaW50LGVuZFBvaW50KXt2YXIgZGlmZlg9TWF0aC5hYnMoc3RhcnRQb2ludC54LWVuZFBvaW50LngpLGRpZmZZPU1hdGguYWJzKHN0YXJ0UG9pbnQueS1lbmRQb2ludC55KTtyZXR1cm4gTWF0aC5yb3VuZChNYXRoLnNxcnQoZGlmZlgqZGlmZlgrZGlmZlkqZGlmZlkpKX1mdW5jdGlvbiBjYWxjdWxhdGVQaW5jaFpvb20oc3RhcnREaXN0YW5jZSxlbmREaXN0YW5jZSl7dmFyIHBlcmNlbnQ9ZW5kRGlzdGFuY2Uvc3RhcnREaXN0YW5jZSoxO3JldHVybiBwZXJjZW50LnRvRml4ZWQoMil9ZnVuY3Rpb24gY2FsY3VsYXRlUGluY2hEaXJlY3Rpb24oKXtyZXR1cm4gMT5waW5jaFpvb20/T1VUOklOfWZ1bmN0aW9uIGNhbGN1bGF0ZURpc3RhbmNlKHN0YXJ0UG9pbnQsZW5kUG9pbnQpe3JldHVybiBNYXRoLnJvdW5kKE1hdGguc3FydChNYXRoLnBvdyhlbmRQb2ludC54LXN0YXJ0UG9pbnQueCwyKStNYXRoLnBvdyhlbmRQb2ludC55LXN0YXJ0UG9pbnQueSwyKSkpfWZ1bmN0aW9uIGNhbGN1bGF0ZUFuZ2xlKHN0YXJ0UG9pbnQsZW5kUG9pbnQpe3ZhciB4PXN0YXJ0UG9pbnQueC1lbmRQb2ludC54LHk9ZW5kUG9pbnQueS1zdGFydFBvaW50Lnkscj1NYXRoLmF0YW4yKHkseCksYW5nbGU9TWF0aC5yb3VuZCgxODAqci9NYXRoLlBJKTtyZXR1cm4gMD5hbmdsZSYmKGFuZ2xlPTM2MC1NYXRoLmFicyhhbmdsZSkpLGFuZ2xlfWZ1bmN0aW9uIGNhbGN1bGF0ZURpcmVjdGlvbihzdGFydFBvaW50LGVuZFBvaW50KXtpZihjb21wYXJlUG9pbnRzKHN0YXJ0UG9pbnQsZW5kUG9pbnQpKXJldHVybiBOT05FO3ZhciBhbmdsZT1jYWxjdWxhdGVBbmdsZShzdGFydFBvaW50LGVuZFBvaW50KTtyZXR1cm4gNDU+PWFuZ2xlJiZhbmdsZT49MD9MRUZUOjM2MD49YW5nbGUmJmFuZ2xlPj0zMTU/TEVGVDphbmdsZT49MTM1JiYyMjU+PWFuZ2xlP1JJR0hUOmFuZ2xlPjQ1JiYxMzU+YW5nbGU/RE9XTjpVUH1mdW5jdGlvbiBnZXRUaW1lU3RhbXAoKXt2YXIgbm93PW5ldyBEYXRlO3JldHVybiBub3cuZ2V0VGltZSgpfWZ1bmN0aW9uIGdldGJvdW5kcyhlbCl7ZWw9JChlbCk7dmFyIG9mZnNldD1lbC5vZmZzZXQoKSxib3VuZHM9e2xlZnQ6b2Zmc2V0LmxlZnQscmlnaHQ6b2Zmc2V0LmxlZnQrZWwub3V0ZXJXaWR0aCgpLHRvcDpvZmZzZXQudG9wLGJvdHRvbTpvZmZzZXQudG9wK2VsLm91dGVySGVpZ2h0KCl9O3JldHVybiBib3VuZHN9ZnVuY3Rpb24gaXNJbkJvdW5kcyhwb2ludCxib3VuZHMpe3JldHVybiBwb2ludC54PmJvdW5kcy5sZWZ0JiZwb2ludC54PGJvdW5kcy5yaWdodCYmcG9pbnQueT5ib3VuZHMudG9wJiZwb2ludC55PGJvdW5kcy5ib3R0b219ZnVuY3Rpb24gY29tcGFyZVBvaW50cyhwb2ludEEscG9pbnRCKXtyZXR1cm4gcG9pbnRBLng9PXBvaW50Qi54JiZwb2ludEEueT09cG9pbnRCLnl9dmFyIG9wdGlvbnM9JC5leHRlbmQoe30sb3B0aW9ucyksdXNlVG91Y2hFdmVudHM9U1VQUE9SVFNfVE9VQ0h8fFNVUFBPUlRTX1BPSU5URVJ8fCFvcHRpb25zLmZhbGxiYWNrVG9Nb3VzZUV2ZW50cyxTVEFSVF9FVj11c2VUb3VjaEV2ZW50cz9TVVBQT1JUU19QT0lOVEVSP1NVUFBPUlRTX1BPSU5URVJfSUUxMD9cIk1TUG9pbnRlckRvd25cIjpcInBvaW50ZXJkb3duXCI6XCJ0b3VjaHN0YXJ0XCI6XCJtb3VzZWRvd25cIixNT1ZFX0VWPXVzZVRvdWNoRXZlbnRzP1NVUFBPUlRTX1BPSU5URVI/U1VQUE9SVFNfUE9JTlRFUl9JRTEwP1wiTVNQb2ludGVyTW92ZVwiOlwicG9pbnRlcm1vdmVcIjpcInRvdWNobW92ZVwiOlwibW91c2Vtb3ZlXCIsRU5EX0VWPXVzZVRvdWNoRXZlbnRzP1NVUFBPUlRTX1BPSU5URVI/U1VQUE9SVFNfUE9JTlRFUl9JRTEwP1wiTVNQb2ludGVyVXBcIjpcInBvaW50ZXJ1cFwiOlwidG91Y2hlbmRcIjpcIm1vdXNldXBcIixMRUFWRV9FVj11c2VUb3VjaEV2ZW50cz9TVVBQT1JUU19QT0lOVEVSP1wibW91c2VsZWF2ZVwiOm51bGw6XCJtb3VzZWxlYXZlXCIsQ0FOQ0VMX0VWPVNVUFBPUlRTX1BPSU5URVI/U1VQUE9SVFNfUE9JTlRFUl9JRTEwP1wiTVNQb2ludGVyQ2FuY2VsXCI6XCJwb2ludGVyY2FuY2VsXCI6XCJ0b3VjaGNhbmNlbFwiLGRpc3RhbmNlPTAsZGlyZWN0aW9uPW51bGwsY3VycmVudERpcmVjdGlvbj1udWxsLGR1cmF0aW9uPTAsc3RhcnRUb3VjaGVzRGlzdGFuY2U9MCxlbmRUb3VjaGVzRGlzdGFuY2U9MCxwaW5jaFpvb209MSxwaW5jaERpc3RhbmNlPTAscGluY2hEaXJlY3Rpb249MCxtYXhpbXVtc01hcD1udWxsLCRlbGVtZW50PSQoZWxlbWVudCkscGhhc2U9XCJzdGFydFwiLGZpbmdlckNvdW50PTAsZmluZ2VyRGF0YT17fSxzdGFydFRpbWU9MCxlbmRUaW1lPTAscHJldmlvdXNUb3VjaEVuZFRpbWU9MCxmaW5nZXJDb3VudEF0UmVsZWFzZT0wLGRvdWJsZVRhcFN0YXJ0VGltZT0wLHNpbmdsZVRhcFRpbWVvdXQ9bnVsbCxob2xkVGltZW91dD1udWxsO3RyeXskZWxlbWVudC5vbihTVEFSVF9FVix0b3VjaFN0YXJ0KSwkZWxlbWVudC5vbihDQU5DRUxfRVYsdG91Y2hDYW5jZWwpfWNhdGNoKGUpeyQuZXJyb3IoXCJldmVudHMgbm90IHN1cHBvcnRlZCBcIitTVEFSVF9FVitcIixcIitDQU5DRUxfRVYrXCIgb24galF1ZXJ5LnN3aXBlXCIpfXRoaXMuZW5hYmxlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZGlzYWJsZSgpLCRlbGVtZW50Lm9uKFNUQVJUX0VWLHRvdWNoU3RhcnQpLCRlbGVtZW50Lm9uKENBTkNFTF9FVix0b3VjaENhbmNlbCksJGVsZW1lbnR9LHRoaXMuZGlzYWJsZT1mdW5jdGlvbigpe3JldHVybiByZW1vdmVMaXN0ZW5lcnMoKSwkZWxlbWVudH0sdGhpcy5kZXN0cm95PWZ1bmN0aW9uKCl7cmVtb3ZlTGlzdGVuZXJzKCksJGVsZW1lbnQuZGF0YShQTFVHSU5fTlMsbnVsbCksJGVsZW1lbnQ9bnVsbH0sdGhpcy5vcHRpb249ZnVuY3Rpb24ocHJvcGVydHksdmFsdWUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBwcm9wZXJ0eSlvcHRpb25zPSQuZXh0ZW5kKG9wdGlvbnMscHJvcGVydHkpO2Vsc2UgaWYodm9pZCAwIT09b3B0aW9uc1twcm9wZXJ0eV0pe2lmKHZvaWQgMD09PXZhbHVlKXJldHVybiBvcHRpb25zW3Byb3BlcnR5XTtvcHRpb25zW3Byb3BlcnR5XT12YWx1ZX1lbHNle2lmKCFwcm9wZXJ0eSlyZXR1cm4gb3B0aW9uczskLmVycm9yKFwiT3B0aW9uIFwiK3Byb3BlcnR5K1wiIGRvZXMgbm90IGV4aXN0IG9uIGpRdWVyeS5zd2lwZS5vcHRpb25zXCIpfXJldHVybiBudWxsfX12YXIgVkVSU0lPTj1cIjEuNi4xOFwiLExFRlQ9XCJsZWZ0XCIsUklHSFQ9XCJyaWdodFwiLFVQPVwidXBcIixET1dOPVwiZG93blwiLElOPVwiaW5cIixPVVQ9XCJvdXRcIixOT05FPVwibm9uZVwiLEFVVE89XCJhdXRvXCIsU1dJUEU9XCJzd2lwZVwiLFBJTkNIPVwicGluY2hcIixUQVA9XCJ0YXBcIixET1VCTEVfVEFQPVwiZG91YmxldGFwXCIsTE9OR19UQVA9XCJsb25ndGFwXCIsSE9SSVpPTlRBTD1cImhvcml6b250YWxcIixWRVJUSUNBTD1cInZlcnRpY2FsXCIsQUxMX0ZJTkdFUlM9XCJhbGxcIixET1VCTEVfVEFQX1RIUkVTSE9MRD0xMCxQSEFTRV9TVEFSVD1cInN0YXJ0XCIsUEhBU0VfTU9WRT1cIm1vdmVcIixQSEFTRV9FTkQ9XCJlbmRcIixQSEFTRV9DQU5DRUw9XCJjYW5jZWxcIixTVVBQT1JUU19UT1VDSD1cIm9udG91Y2hzdGFydFwiaW4gd2luZG93LFNVUFBPUlRTX1BPSU5URVJfSUUxMD13aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQmJiF3aW5kb3cuUG9pbnRlckV2ZW50JiYhU1VQUE9SVFNfVE9VQ0gsU1VQUE9SVFNfUE9JTlRFUj0od2luZG93LlBvaW50ZXJFdmVudHx8d2luZG93Lm5hdmlnYXRvci5tc1BvaW50ZXJFbmFibGVkKSYmIVNVUFBPUlRTX1RPVUNILFBMVUdJTl9OUz1cIlRvdWNoU3dpcGVcIixkZWZhdWx0cz17ZmluZ2VyczoxLHRocmVzaG9sZDo3NSxjYW5jZWxUaHJlc2hvbGQ6bnVsbCxwaW5jaFRocmVzaG9sZDoyMCxtYXhUaW1lVGhyZXNob2xkOm51bGwsZmluZ2VyUmVsZWFzZVRocmVzaG9sZDoyNTAsbG9uZ1RhcFRocmVzaG9sZDo1MDAsZG91YmxlVGFwVGhyZXNob2xkOjIwMCxzd2lwZTpudWxsLHN3aXBlTGVmdDpudWxsLHN3aXBlUmlnaHQ6bnVsbCxzd2lwZVVwOm51bGwsc3dpcGVEb3duOm51bGwsc3dpcGVTdGF0dXM6bnVsbCxwaW5jaEluOm51bGwscGluY2hPdXQ6bnVsbCxwaW5jaFN0YXR1czpudWxsLGNsaWNrOm51bGwsdGFwOm51bGwsZG91YmxlVGFwOm51bGwsbG9uZ1RhcDpudWxsLGhvbGQ6bnVsbCx0cmlnZ2VyT25Ub3VjaEVuZDohMCx0cmlnZ2VyT25Ub3VjaExlYXZlOiExLGFsbG93UGFnZVNjcm9sbDpcImF1dG9cIixmYWxsYmFja1RvTW91c2VFdmVudHM6ITAsZXhjbHVkZWRFbGVtZW50czpcIi5ub1N3aXBlXCIscHJldmVudERlZmF1bHRFdmVudHM6ITB9OyQuZm4uc3dpcGU9ZnVuY3Rpb24obWV0aG9kKXt2YXIgJHRoaXM9JCh0aGlzKSxwbHVnaW49JHRoaXMuZGF0YShQTFVHSU5fTlMpO2lmKHBsdWdpbiYmXCJzdHJpbmdcIj09dHlwZW9mIG1ldGhvZCl7aWYocGx1Z2luW21ldGhvZF0pcmV0dXJuIHBsdWdpblttZXRob2RdLmFwcGx5KHBsdWdpbixBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSkpOyQuZXJyb3IoXCJNZXRob2QgXCIrbWV0aG9kK1wiIGRvZXMgbm90IGV4aXN0IG9uIGpRdWVyeS5zd2lwZVwiKX1lbHNlIGlmKHBsdWdpbiYmXCJvYmplY3RcIj09dHlwZW9mIG1ldGhvZClwbHVnaW4ub3B0aW9uLmFwcGx5KHBsdWdpbixhcmd1bWVudHMpO2Vsc2UgaWYoIShwbHVnaW58fFwib2JqZWN0XCIhPXR5cGVvZiBtZXRob2QmJm1ldGhvZCkpcmV0dXJuIGluaXQuYXBwbHkodGhpcyxhcmd1bWVudHMpO3JldHVybiAkdGhpc30sJC5mbi5zd2lwZS52ZXJzaW9uPVZFUlNJT04sJC5mbi5zd2lwZS5kZWZhdWx0cz1kZWZhdWx0cywkLmZuLnN3aXBlLnBoYXNlcz17UEhBU0VfU1RBUlQ6UEhBU0VfU1RBUlQsUEhBU0VfTU9WRTpQSEFTRV9NT1ZFLFBIQVNFX0VORDpQSEFTRV9FTkQsUEhBU0VfQ0FOQ0VMOlBIQVNFX0NBTkNFTH0sJC5mbi5zd2lwZS5kaXJlY3Rpb25zPXtMRUZUOkxFRlQsUklHSFQ6UklHSFQsVVA6VVAsRE9XTjpET1dOLElOOklOLE9VVDpPVVR9LCQuZm4uc3dpcGUucGFnZVNjcm9sbD17Tk9ORTpOT05FLEhPUklaT05UQUw6SE9SSVpPTlRBTCxWRVJUSUNBTDpWRVJUSUNBTCxBVVRPOkFVVE99LCQuZm4uc3dpcGUuZmluZ2Vycz17T05FOjEsVFdPOjIsVEhSRUU6MyxGT1VSOjQsRklWRTo1LEFMTDpBTExfRklOR0VSU319KTsiLCJmdW5jdGlvbiBtYWluKCkge1xuICAvLyBISURFIEZVTEwgSEVJR0hUIE1FTlVcbiAgY29uc3QgaGVyb05hdlNlbCA9IFwiI2hlcm8tbmF2XCI7XG4gIGNvbnN0IHRvb2dsZUhlcm9OYXYgPSAoZXYpID0+IHtcbiAgICBjb25zdCBjdXJyZW50RWwgPSAkKGV2LmN1cnJlbnRUYXJnZXQpO1xuICAgIGNvbnN0IHRhcmdldEJsb2NrID0gY3VycmVudEVsLmRhdGEoKS50b2dnbGVFbElkO1xuICAgIGNvbnN0IGhlcm9OYXYgPSAkKGAjJHt0YXJnZXRCbG9ja31gKTtcbiAgICBjb25zdCBpc0ZvdW5kID0gQm9vbGVhbihoZXJvTmF2Lmxlbmd0aCk7XG4gICAgaWYgKGlzRm91bmQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5lcnJvcihgRXJyb3I6ICcke2hlcm9OYXZ9JyBub3QgZm91bmRgKTtcbiAgICB9XG4gICAgaGVyb05hdi50b2dnbGVDbGFzcyhcIm5hdi0tb3BlbmVkXCIpO1xuICB9O1xuICAkKGBbZGF0YS10b2dnbGUtZWwtaWRdYCkub24oXCJjbGlja1wiLCB0b29nbGVIZXJvTmF2KTtcblxuICAvLyBTbGlkZVNob3cgRmVlZGJhY2tcbiAgY29uc3QgdGFiUGFuZWxUb2dnbGUgPSAoZXYpID0+IHtcbiAgICAvLyBBY3RpdmF0ZSB0YWJcbiAgICBjb25zdCB0YXJnZXRUYWIgPSAkKGV2LmN1cnJlbnRUYXJnZXQpO1xuICAgIGNvbnN0IHRhYkxpc3QgPSAkKFwiLmZlZWRiYWNrX190YWJcIik7XG4gICAgdGFiTGlzdC5yZW1vdmVDbGFzcyhcImZlZWRiYWNrX190YWItLWFjdGl2ZVwiKTtcbiAgICB0YXJnZXRUYWIuYWRkQ2xhc3MoXCJmZWVkYmFja19fdGFiLS1hY3RpdmVcIik7XG4gICAgLy8gQWN0aXZhdGUgcGFuZWxcbiAgICBjb25zdCB0YXJnZXRQYW5lbElkID0gdGFyZ2V0VGFiLmRhdGEoKS50YWJwYW5lbElkO1xuICAgIGNvbnN0IHRhYlBhbmVsTGlzdCA9ICQoXCIuZmVlZGJhY2tfX3BhbmVsXCIpO1xuICAgIGNvbnN0IHRhcmdldFBhbmVsID0gJChgIyR7dGFyZ2V0UGFuZWxJZH1gKTtcblxuICAgIHRhYlBhbmVsTGlzdC5yZW1vdmVDbGFzcyhcImZlZWRiYWNrX19wYW5lbC0tYWN0aXZlXCIpO1xuICAgIHRhcmdldFBhbmVsLmFkZENsYXNzKFwiZmVlZGJhY2tfX3BhbmVsLS1hY3RpdmVcIik7XG4gIH07XG4gICQoXCJbZGF0YS10YWJdXCIpLm9uKFwiY2xpY2tcIiwgdGFiUGFuZWxUb2dnbGUpO1xuXG4gIC8vIE9QU1xuXG4gIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICBjb25zdCBwYWdlV3JhcHBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFnZS13cmFwcGVyXCIpO1xuXG4gIC8vIEZJWEVEIE5BVlxuXG4gIGNvbnN0IGZpeGVkTmF2U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZml4ZWQtc2lkZW5hdlwiKTtcbiAgZnVuY3Rpb24gZ2V0Zml4ZWROYXZFbChzZWN0aW9uSWQpIHtcbiAgICBjb25zdCBmaXhlZE5hdkVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgZml4ZWROYXZFbC5jbGFzc05hbWUgPSBcImZpeGVkLXNpZGVuYXZfX2xpbmtcIjtcbiAgICBmaXhlZE5hdkVsLmRhdGFzZXQub3BzU2VjdGlvbklkID0gc2VjdGlvbklkO1xuICAgIHJldHVybiBmaXhlZE5hdkVsO1xuICB9XG4gIC8vIFBvcHVsYXRlIEZpeGVkLU5hdiBtZW51XG4gIChmdW5jdGlvbiAoKSB7XG4gICAgZm9yIChsZXQgc2VjdGlvbiBvZiBwYWdlV3JhcHBlci5jaGlsZHJlbikge1xuICAgICAgZml4ZWROYXZTZWN0aW9uLmFwcGVuZChnZXRmaXhlZE5hdkVsKHNlY3Rpb24uaWQpKTtcbiAgICB9XG4gIH0pKCk7XG5cbiAgLy8gQ3JlYXRpbmcgTWFwcGVyIHtTZWN0aW9uLmlkIDogT3JkZXIgTnVtfVxuICBjb25zdCBzZWN0aW9uTWFwcGVyID0ge307XG4gIChmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgc2VjdGlvbl9saXN0ID0gcGFnZVdyYXBwZXIuY2hpbGRyZW47XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWN0aW9uX2xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHNlY3Rpb25NYXBwZXJbc2VjdGlvbl9saXN0W2ldLmlkXSA9IGk7XG4gICAgfVxuICB9KSgpO1xuXG4gIGxldCByZWFkeVRvU2Nyb2xsID0gdHJ1ZTtcbiAgbGV0IGN1cnJlbnRTZWN0aW9uID0gMDtcblxuICBjb25zdCBvcHNUcmlnZ2VyTGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1vcHMtc2VjdGlvbi1pZF1cIik7XG4gIG9wc1RyaWdnZXJMaXN0LmZvckVhY2goKGVsKSA9PiB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldikge1xuICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNjcm9sbFRvU2VjdGlvbih0aGlzLmRhdGFzZXQub3BzU2VjdGlvbklkKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gb3BzU2VjdGlvbkFjdGl2YXRlKHNlY3Rpb24pIHtcbiAgICBjb25zdCBjc3NTZWN0aW9uQWN0aXZlQ2xhc3MgPSBcIm9wcy1hY3RpdmVcIjtcbiAgICBjb25zdCBjc3NTaWRlTmF2QWN0aXZlQ2xhc3MgPSBcImZpeGVkLXNpZGVuYXZfX2xpbmstLWFjdGl2ZVwiO1xuXG4gICAgY29uc3Qgc2VjdGlvbl9saXN0ID0gcGFnZVdyYXBwZXIuY2hpbGRyZW47XG4gICAgLy8gIzEgU2V0IENzcyBDbGFzcyBmb3IgY3VycmVudCBTZWN0aW9uXG4gICAgLy8gcmVtb3ZlXG4gICAgQXJyYXkuZnJvbShzZWN0aW9uX2xpc3QpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNzc1NlY3Rpb25BY3RpdmVDbGFzcyk7XG4gICAgfSk7XG5cbiAgICBwYWdlV3JhcHBlci5jaGlsZHJlbltzZWN0aW9uXS5jbGFzc0xpc3QuYWRkKGNzc1NlY3Rpb25BY3RpdmVDbGFzcyk7XG4gICAgLy8gIzIgU2V0IG9wcyB0cmlnZ2VyIGFjdGl2ZVxuICAgIG9wc1RyaWdnZXJMaXN0LmZvckVhY2goKGVsKSA9PiB7XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNzc1NpZGVOYXZBY3RpdmVDbGFzcyk7XG4gICAgICBpZiAoXG4gICAgICAgIChlbC5kYXRhc2V0Lm9wc1NlY3Rpb25JZCA9PSBzZWN0aW9uX2xpc3Rbc2VjdGlvbl0uaWQpICZcbiAgICAgICAgZWwuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZml4ZWQtc2lkZW5hdl9fbGlua1wiKVxuICAgICAgKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoY3NzU2lkZU5hdkFjdGl2ZUNsYXNzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNjcm9sbFRvU2VjdGlvbihzZWN0aW9uKSB7XG4gICAgLy8gU2Nyb2xsaW5nIGNvbnRlbnQgdG8gdGFyZ2V0IHNlY3Rpb24uIFN0YXJ0IGZyb20gMFxuICAgIC8vIEV4cGVjdGluZyBpZDpzdHJpbmcgb3IgbnVtOm51bWJlclxuXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHNlY3Rpb24pKSB7XG4gICAgICBzZWN0aW9uID0gc2VjdGlvbk1hcHBlcltzZWN0aW9uXTtcbiAgICB9XG4gICAgcGFnZVdyYXBwZXIuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVkoJHstc2VjdGlvbiAqIDEwMH0lKWA7XG4gICAgY3VycmVudFNlY3Rpb24gPSBzZWN0aW9uO1xuICAgIG9wc1NlY3Rpb25BY3RpdmF0ZShzZWN0aW9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wc1doZWVsSGFuZGxlcihldikge1xuICAgIGlmICghcmVhZHlUb1Njcm9sbCkgcmV0dXJuO1xuXG4gICAgbGV0IHN0ZXA7IC8vIGFrYSBkaXJlY3Rpb25cblxuICAgIHN3aXRjaCAoZXYudHlwZSkge1xuICAgICAgY2FzZSBcIndoZWVsXCI6XG4gICAgICAgIHN0ZXAgPSBldi5kZWx0YVkgPiAwID8gMSA6IC0xO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJrZXlkb3duXCI6XG4gICAgICAgIHN0ZXAgPSBldi5rZXlDb2RlID09IDQwID8gMSA6IGV2LmtleUNvZGUgPT0gMzggPyAtMSA6IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJlYWR5VG9TY3JvbGwgPSBmYWxzZTsgLy8gQW5pbWF0aW5nXG4gICAgbGV0IG5leHRTZWN0aW9uUG9zaXRpb24gPSBjdXJyZW50U2VjdGlvbiArIHN0ZXA7XG4gICAgbGV0IGlzU2VjdGlvbkV4aXN0cyA9IHBhZ2VXcmFwcGVyLmNoaWxkcmVuW25leHRTZWN0aW9uUG9zaXRpb25dO1xuICAgIC8vIFNjcm9sbGluZ1xuICAgIGlmIChpc1NlY3Rpb25FeGlzdHMpIHtcbiAgICAgIGN1cnJlbnRTZWN0aW9uID0gbmV4dFNlY3Rpb25Qb3NpdGlvbjtcbiAgICAgIHNjcm9sbFRvU2VjdGlvbihuZXh0U2VjdGlvblBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlYWR5VG9TY3JvbGwgPSB0cnVlO1xuICAgIH0sIDExMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gb3BzS2V5RG93bkhhbmRsZXIoZXYpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhldik7XG4gICAgY29uc29sZS5sb2coZXYua2V5Q29kZSk7XG4gIH1cbiAgcGFnZVdyYXBwZXIuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIG9wc1doZWVsSGFuZGxlcik7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9wc1doZWVsSGFuZGxlcik7XG4gICQoXCIjcGFnZS13cmFwcGVyXCIpLnN3aXBlKHtcbiAgICBzd2lwZTogZnVuY3Rpb24gKGV2LCBkaXJlY3Rpb24pIHtcbiAgICAgIGlmICghcmVhZHlUb1Njcm9sbCkgcmV0dXJuO1xuICAgICAgbGV0IHN0ZXA7XG4gICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICBjYXNlIFwidXBcIjpcbiAgICAgICAgICBzdGVwID0gMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImRvd25cIjpcbiAgICAgICAgICBzdGVwID0gLTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZWFkeVRvU2Nyb2xsID0gZmFsc2U7IC8vIEFuaW1hdGluZ1xuICAgICAgbGV0IG5leHRTZWN0aW9uUG9zaXRpb24gPSBjdXJyZW50U2VjdGlvbiArIHN0ZXA7XG4gICAgICBsZXQgaXNTZWN0aW9uRXhpc3RzID0gcGFnZVdyYXBwZXIuY2hpbGRyZW5bbmV4dFNlY3Rpb25Qb3NpdGlvbl07XG4gICAgICAvLyBTY3JvbGxpbmdcbiAgICAgIGlmIChpc1NlY3Rpb25FeGlzdHMpIHtcbiAgICAgICAgY3VycmVudFNlY3Rpb24gPSBuZXh0U2VjdGlvblBvc2l0aW9uO1xuICAgICAgICBzY3JvbGxUb1NlY3Rpb24obmV4dFNlY3Rpb25Qb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWFkeVRvU2Nyb2xsID0gdHJ1ZTtcbiAgICAgIH0sIDExMDApO1xuICAgIH0sXG4gIH0pO1xufSAvLyBNYWluIEVuZFxuLy8gUnVuIG1haW4gb25jZSBET01Db250ZW50TG9hZGVkIGV2ZW50IGZpcmVkXG4kLndoZW4oJC5yZWFkeSkudGhlbihtYWluKCkpOyIsImZ1bmN0aW9uIG15Rm9ybSgpIHtcbiAgLy8gUHJlc2V0c1xuICBjb25zdCBBUElfRU1BSUwgPSBcImh0dHBzOi8vd2ViZGV2LWFwaS5sb2Z0c2Nob29sLmNvbS9zZW5kbWFpbFwiO1xuXG4gIGNvbnN0IG5vblZhbGlkQ3NzQ2xhc3MgPSBcImZvcm1fX2lucHV0LS1ub252YWxpZFwiO1xuICBjb25zdCBjdXN0b21JbnB1dE5hbWVzRm9yU2VuZGluZyA9IFtcIm5hbWVcIiwgXCJwaG9uZVwiLCBcImNvbW1lbnRcIiwgXCJ0b1wiXTtcblxuICAvLyBTZWxlY3RvcnNcblxuICBjb25zdCBtb2RhbEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtb2RhbFwiKTtcbiAgY29uc3QgbW9kYWxIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsX19oZWFkZXJcIik7XG4gIGNvbnN0IG92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm92ZXJsYXlcIik7XG4gIGNvbnN0IG9yZGVyRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwib3JkZXItZm9ybVwiKTtcblxuICAvLyBTdXBwb3J0IEZ1bmNcblxuICBmdW5jdGlvbiBjcmVhdGVFcnJvck1zZ0VsKG1zZywgX2NsYXNzID0gXCJmb3JtX192YWxpZGF0aW9uXCIpIHtcbiAgICAvLyBSZXR1cm4gRXJyb3IgT2JqZWN0IGZvciBhcHBlbmRpbmdcbiAgICBjb25zdCBlcnJvck1zZ0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgZXJyb3JNc2dFbC5jbGFzc0xpc3QuYWRkKF9jbGFzcyk7XG4gICAgZXJyb3JNc2dFbC50ZXh0Q29udGVudCA9IG1zZztcbiAgICByZXR1cm4gZXJyb3JNc2dFbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUFsbEVycm9yTXNnKGZvcm0pIHtcbiAgICAvLyBSZW1vdmUgbm9uLXZhbGlkIGNzcyBjbGFzc1xuICAgIEFycmF5LmZyb20oZm9ybS5lbGVtZW50cykuZm9yRWFjaCgoZWwpID0+XG4gICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9ybV9faW5wdXQtLW5vbnZhbGlkXCIpXG4gICAgKTtcbiAgICAvLyBSZW1vdmUgRXJyb3IgRWxlbWVudHNcbiAgICBjb25zdCBhbGxFcnJvck1zZ0VsID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiLmZvcm1fX3ZhbGlkYXRpb25cIik7XG4gICAgQXJyYXkuZnJvbShhbGxFcnJvck1zZ0VsKS5mb3JFYWNoKChlbCkgPT4gZWwucmVtb3ZlKCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJGb3JtKGZvcm0pIHtcbiAgICAvLyBmb3JtLnJlc2V0KCk7XG4gICAgQXJyYXkuZnJvbShmb3JtLmVsZW1lbnRzKS5mb3JFYWNoKChlbCkgPT4gKGVsLnZhbHVlID0gXCJcIikpO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9nZ2xlQm9keVNjcm9sbCgpIHtcbiAgICBjb25zdCBpc1Njcm9sbEhpZGRlbiA9IGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPT0gXCJoaWRkZW5cIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZUZpeGVkTmF2KCkge1xuICAgIGNvbnN0IGZpeGVkU2lkZU5hdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZml4ZWQtc2lkZW5hdlwiKTtcbiAgICBjb25zb2xlLmxvZyhmaXhlZFNpZGVOYXYuc3R5bGUuZGlzcGxheSk7XG4gICAgZml4ZWRTaWRlTmF2LnN0eWxlLmRpc3BsYXkgPVxuICAgICAgZml4ZWRTaWRlTmF2LnN0eWxlLmRpc3BsYXkgPT0gXCJub25lXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dWYWxpZGF0aW9uRXJyb3JNc2coZWwsIG1zZykge1xuICAgIGNvbnN0IEVycm9yTXNnRWwgPSBjcmVhdGVFcnJvck1zZ0VsKG1zZyk7XG4gICAgZWwuYWZ0ZXIoRXJyb3JNc2dFbCk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlTW9kYWwoKSB7XG4gICAgdG9nZ2xlQm9keVNjcm9sbCgpO1xuICAgIHRvZ2dsZUZpeGVkTmF2KCk7XG4gICAgbW9kYWxFbC5jbGFzc0xpc3QucmVtb3ZlKFwibW9kYWwtLWFjdGl2ZVwiKTtcbiAgICBtb2RhbEVsLmNsYXNzTGlzdC5yZW1vdmUoXCJtb2RhbC0tZXJyb3JcIik7XG4gICAgb3ZlcmxheS5jbGFzc0xpc3QucmVtb3ZlKFwib3ZlcmxheS0tYWN0aXZlXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd01vZGFsKG1zZyA9IFwiXCIsIGVycm9yID0gZmFsc2UpIHtcbiAgICB0b2dnbGVCb2R5U2Nyb2xsKCk7XG4gICAgdG9nZ2xlRml4ZWROYXYoKTtcbiAgICBtb2RhbEVsLmNsYXNzTGlzdC5hZGQoXCJtb2RhbC0tYWN0aXZlXCIpO1xuICAgIG92ZXJsYXkuY2xhc3NMaXN0LmFkZChcIm92ZXJsYXktLWFjdGl2ZVwiKTtcbiAgICAvLyBBZGRpbmcgRXJyb3IgQ29sb3IgZm9yIG1vZGFsIGhlYWRpbmdcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIG1vZGFsRWwuY2xhc3NMaXN0LmFkZChcIm1vZGFsLS1lcnJvclwiKTtcbiAgICB9XG4gICAgbW9kYWxIZWFkZXIuaW5uZXJUZXh0ID0gbXNnO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNWYWxpZEZvcm0oZm9ybSkge1xuICAgIC8vIFZhbGlkYXRpb24gU3RlcFxuICAgIGNvbnN0IHN0YXR1c0FyciA9IGN1c3RvbUlucHV0TmFtZXNGb3JTZW5kaW5nLm1hcCgobmFtZSkgPT4ge1xuICAgICAgY29uc3QgY3VycmVudElucHV0ID0gZm9ybS5lbGVtZW50c1tuYW1lXTtcbiAgICAgIGN1cnJlbnRJbnB1dC5jaGVja1ZhbGlkaXR5KCk7XG5cbiAgICAgIGlmIChjdXJyZW50SW5wdXQudmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgc2hvd1ZhbGlkYXRpb25FcnJvck1zZyhjdXJyZW50SW5wdXQsIGN1cnJlbnRJbnB1dC52YWxpZGF0aW9uTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHJldHVybiBzdGF0dXNBcnIuZXZlcnkoKHN0YXR1cykgPT4gc3RhdHVzID09PSB0cnVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRSZXF1ZXN0WEhSKHBheWxvYWQsIHJlcXVlc3RfdXJsID0gQVBJX0VNQUlMKSB7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgY2xpZW50Lm9wZW4oXCJQT1NUXCIsIHJlcXVlc3RfdXJsKTtcbiAgICBjbGllbnQucmVzcG9uc2VUeXBlID0gXCJqc29uXCI7XG4gICAgY2xpZW50LnNlbmQocGF5bG9hZCk7XG4gICAgY2xpZW50Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBjbGllbnQucmVzcG9uc2U7XG4gICAgICBjb25zdCBlcnJvciA9IHJlc3Auc3RhdHVzID09IDEgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgIHNob3dNb2RhbChyZXNwLm1lc3NhZ2UsIGVycm9yKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gTWFpbiBMb2dpY1xuICBvcmRlckZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbiAoZXYpIHtcbiAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJlbW92ZUFsbEVycm9yTXNnKHRoaXMpOyAvLyBDbGVhcmluZyBMYXN0IFN1Ym1pdCBFcnJvcnNcblxuICAgIGlmIChpc1ZhbGlkRm9ybSh0aGlzKSkge1xuICAgICAgc2VuZFJlcXVlc3RYSFIobmV3IEZvcm1EYXRhKHRoaXMpKTtcbiAgICAgIGNsZWFyRm9ybSh0aGlzKTtcbiAgICB9XG4gIH0pO1xuXG4gIG92ZXJsYXkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGhpZGVNb2RhbCgpKTtcbn1cbm15Rm9ybSgpO1xuIiwiLy8gTWFwXG5mdW5jdGlvbiBpbml0KCkge1xuICBsZXQgbXlNYXAgPSBuZXcgeW1hcHMuTWFwKFwieW1hcFwiLCB7XG4gICAgY2VudGVyOiBbMjUuMTk1MTM3LCA1NS4yNzg0NzhdLFxuICAgIHpvb206IDExLFxuICAgIGNvbnRyb2xzOiBbXSxcbiAgfSk7XG4gIG15TWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdzY3JvbGxab29tJyk7XG4gIG15TWFwLmJlaGF2aW9ycy5kaXNhYmxlKCdkcmFnJyk7XG4gIGxldCBjb29yZHMgPSBbXG4gICAgWzI1LjIwMTM5NywgNTUuMjY5NTEzXSxcbiAgICBbMjUuMTg5OTM4LCA1NS4zMDAwODldLFxuICAgIFsyNS4xMjI5NCwgNTUuMjA3MDk1XSxcbiAgICBbMjUuMDk4MTc0LCA1NS4xNjE0NTFdLFxuICBdO1xuICBcbiAgY29uc3QgbXlDb2xsZWN0aW9uID0gbmV3IHltYXBzLkdlb09iamVjdENvbGxlY3Rpb24oe30sIHtcbiAgICBkcmFnZ2FibGU6IGZhbHNlLCAvLyBhbmQgZHJhZ2dhYmxlXG4gICAgaWNvbkxheW91dDogJ2RlZmF1bHQjaW1hZ2UnLCAvL2FsbCBwbGFjZW1hcmtzIGFyZSByZWRcbiAgICBpY29uSW1hZ2VIcmVmOiAnLi9pbWcvaW1nLW1hcG1hcmtlci5wbmcnLFxuICAgIGljb25JbWFnZVNpemU6IFs0NiwgNTddLFxuICAgIGljb25JbWFnZU9mZnNldDogWy0zNSwgLTUyXVxuICB9KTtcbiAgXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbXlDb2xsZWN0aW9uLmFkZChuZXcgeW1hcHMuUGxhY2VtYXJrKGNvb3Jkc1tpXSkpO1xuICB9XG4gIG15TWFwLmdlb09iamVjdHMuYWRkKG15Q29sbGVjdGlvbik7XG4gIFxufVxuXG5cblxuXG55bWFwcy5yZWFkeShpbml0KTsiLCIvLyBNRU5VIFNFQ1RJT05cblxuLy9cbmNvbnN0IGRlc2t0b3AgPSAnKG1pbi13aWR0aDogOTkycHgpJztcblxuLy8gU2VsZWN0b3JzXG5cbmNvbnN0IG1lbnUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lbnVcIik7XG5jb25zdCBtZW51VHJpZ2dlciA9IG1lbnUucXVlcnlTZWxlY3RvckFsbCgnLm1lbnVfX3RyaWdnZXInKTtcblxuLy8gVXRpbHNcblxuZnVuY3Rpb24gX2FkZEFsbEV2ZW50TGlzdGVuZXJzKG9iaikgeyBcbiAgZm9yIChsZXQgY29udHJvbCBvZiBvYmope1xuICAgIGNvbnN0IGFsbEVsZW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY29udHJvbC5zZWxlY3Rvcik7XG4gICAgYWxsRWxlbWVzLmZvckVhY2goZWwgPT4ge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihjb250cm9sLmV2ZW50VHlwZSwgY29udHJvbC5ldmVudEhhbmRsZXIpO1xuXG4gICAgfSk7XG4gIH1cbn1cblxuLy8gZnVuY3Rpb25zIFxuZnVuY3Rpb24gaGlkZUFsbE1lbnVJdGVtQ29udGVudFdyYXBCdXRDdXJyZW50KGVsKSB7XG4gIEFycmF5LmZyb20oZWwucGFyZW50RWxlbWVudC5jaGlsZHJlbikubWFwKGVsID0+IHtcbiAgICAgIGVsLmRhdGFzZXQubWVudUl0ZW0gPSBcIlwiO1xuICAgIC8vIGlmIChlbC5kYXRhc2V0Lm1lbnVJdGVtICE9ICdhY3RpdmUnKSB7XG4gICAgICBlbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tZW51LWNvbnRlbnQtd3JhcF0nKS5zdHlsZS53aWR0aCA9IFwiXCI7XG4gICAgLy8gfVxuICB9KTtcbiAgLy8gVGhpcyByZXR1cm4gbmVlZCB0byBzZXQgYWN0aXZlIGl0ZW1cbiAgcmV0dXJuIFwiYWN0aXZlXCJcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTWVudUl0ZW1Db250ZW50V3JhcChtZW51SXRlbUNvbnRlbnRXcmFwKSB7XG5cbiAgY29uc3QgaXNEZXNrdG9wID0gd2luZG93Lm1hdGNoTWVkaWEoZGVza3RvcCkubWF0Y2hlcztcbiAgY29uc3QgbWVudUNvbnRlbnRPZmZzZXRXaWR0aCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZW51X19jb250ZW50Jykub2Zmc2V0V2lkdGg7XG4gIGNvbnN0IG1lbnVUcmlnZ2VyT2Zmc2V0V2lkdGggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tZW51LXRyaWdnZXJdJykub2Zmc2V0V2lkdGg7XG4gIGNvbnN0IHdpZHRoID0gaXNEZXNrdG9wID8gXCI1NjRweFwiOiAobWVudUNvbnRlbnRPZmZzZXRXaWR0aCAtIG1lbnVUcmlnZ2VyT2Zmc2V0V2lkdGggKiAzKSArICdweCc7XG5cbiAgbWVudUl0ZW1Db250ZW50V3JhcC5zdHlsZS53aWR0aCA9IG1lbnVJdGVtQ29udGVudFdyYXAuc3R5bGUud2lkdGggPT0gXCJcIiA/IHdpZHRoIDogXCJcIjtcbiAgXG4gIGNvbnN0IG1lbnVJdGVtQ29udGVudCA9IG1lbnVJdGVtQ29udGVudFdyYXAucXVlcnlTZWxlY3RvcignW2RhdGEtbWVudS1jb250ZW50Jyk7XG4gIG1lbnVJdGVtQ29udGVudC5zdHlsZS53aWR0aCA9IHdpZHRoXG59XG5cbi8vIEhhbmRsZXJzIFxuXG5mdW5jdGlvbiBhbGxUcmlnZ2Vyc0NsaWNrSGFuZGxlcihldikge1xuICBjb25zdCBjdXJyZW50TWVudUl0ZW0gPSB0aGlzLmNsb3Nlc3QoJ1tkYXRhLW1lbnUtaXRlbV0nKTtcbiAgY29uc3QgaXNBY3RpdmUgPSBjdXJyZW50TWVudUl0ZW0uZGF0YXNldC5tZW51SXRlbSA9PSAnYWN0aXZlJztcbiAgY3VycmVudE1lbnVJdGVtLmRhdGFzZXQubWVudUl0ZW0gPSBpc0FjdGl2ZSA/IFwiXCIgOiBoaWRlQWxsTWVudUl0ZW1Db250ZW50V3JhcEJ1dEN1cnJlbnQoY3VycmVudE1lbnVJdGVtKTtcbiAgY29uc3QgbWVudUl0ZW1Db250ZW50V3JhcCA9IGN1cnJlbnRNZW51SXRlbS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tZW51LWNvbnRlbnQtd3JhcF0nKTtcbiAgdG9nZ2xlTWVudUl0ZW1Db250ZW50V3JhcChtZW51SXRlbUNvbnRlbnRXcmFwKTtcblxufVxuXG4vLyAgTG9naWNcbmNvbnN0IEFsbEV2ZW50c0NvbnRyb2xzID0gW1xuICB7c2VsZWN0b3I6IFwiW2RhdGEtbWVudS10cmlnZ2VyXVwiLCBldmVudFR5cGU6IFwiY2xpY2tcIiwgZXZlbnRIYW5kbGVyOiBhbGxUcmlnZ2Vyc0NsaWNrSGFuZGxlcn1cbl1cbl9hZGRBbGxFdmVudExpc3RlbmVycyhBbGxFdmVudHNDb250cm9scyk7XG4iLCIvLyBTTGlkZXIgUHJvZHVjdFxuJChcIi5vd2wtY2Fyb3VzZWxcIikub3dsQ2Fyb3VzZWwoe1xuICBsb29wOiB0cnVlLFxuICBuYXY6IHRydWUsXG4gIGl0ZW1zOiAxLFxuICBkb3RzOiBmYWxzZSxcbiAgbmF2Q29udGFpbmVyQ2xhc3M6IFwic2xpZGVyX19uYXYtd3JhcFwiLFxuICBuYXZDbGFzczogW1xuICAgIFwic2xpZGVyX19uYXYgc2xpZGVyX19uYXYtLXByZXZcIixcbiAgICBcInNsaWRlcl9fbmF2IHNsaWRlcl9fbmF2LS1uZXh0XCIsXG4gIF0sXG4gIG5hdlRleHQ6IFtcbiAgICBgPHN2ZyBjbGFzcz1cInNsaWRlcl9fbmF2LWljb25cIj5cbiAgICA8dXNlIHhsaW5rOmhyZWY9XCJpbWcvc3ByaXRlLnN2ZyNpY29uLWFycm93LS1sZWZ0XCI+PC91c2U+XG4gIDwvc3ZnPmAsXG4gICAgYDxzdmcgY2xhc3M9XCJzbGlkZXJfX25hdi1pY29uXCI+XG4gIDx1c2UgeGxpbms6aHJlZj1cImltZy9zcHJpdGUuc3ZnI2ljb24tYXJyb3ctLXJpZ2h0XCI+PC91c2U+XG48L3N2Zz5gLFxuICBdLFxufSk7IiwibGV0IHBsYXllcjtcbmNvbnN0IHBsYXllcldyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnBsYXllclwiKTtcbmNvbnN0IHBsYXllclN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5wbGF5ZXJfX3N0YXJ0XCIpO1xuY29uc3QgcGxheWVyVmlkZW9EdXJhdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWVyX190aW1lLWR1cmF0aW9uXCIpO1xuY29uc3QgcGxheWVyVmlkZW9DdXJyZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXJfX3RpbWUtY3VycmVudFwiKTtcbmNvbnN0IHBsYXllclBsYXliYWNrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXJfX3BsYXliYWNrXCIpO1xuY29uc3QgcGxheWVyTWFya2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXJfX21hcmtlclwiKTtcblxuY29uc3QgcGxheWVyVm9sdW1lTWFya2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXJfX3ZvbHVtZW1hcmtlclwiKTtcbmNvbnN0IHBsYXllclZvbHVtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucGxheWVyX192b2x1bWVcIik7XG5jb25zdCBwbGF5ZXJWb2x1bWVJY29uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wbGF5ZXJfX3ZvbHVtZS1pY29uXCIpO1xuXG5mdW5jdGlvbiBldmVudHNJbml0KCkge1xuICBBcnJheS5mcm9tKHBsYXllclN0YXJ0KS5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXYpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpO1xuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PSAxKSB7XG4gICAgICAgIHBsYXllci5wYXVzZVZpZGVvKCk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFN0YXRlID09IDIgfHwgY3VycmVudFN0YXRlID09IDAgfHwgY3VycmVudFN0YXRlID09IDUpIHtcbiAgICAgICAgcGxheWVyLnBsYXlWaWRlbygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgcGxheWVyUGxheWJhY2suYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldikgPT4ge1xuICAgIGNvbnN0IG5ld1Byb2dyZXNzID0gKDEwMCAqIGV2LmxheWVyWCkgLyBwbGF5ZXJQbGF5YmFjay5jbGllbnRXaWR0aDtcbiAgICBwbGF5ZXJNYXJrZXIuc3R5bGUubGVmdCA9IGAke25ld1Byb2dyZXNzfSVgO1xuICAgIGNvbnN0IG5ld0N1cnJlbnRTZWMgPSBNYXRoLmZsb29yKFxuICAgICAgKG5ld1Byb2dyZXNzICogcGxheWVyLmdldER1cmF0aW9uKCkpIC8gMTAwXG4gICAgKTtcbiAgICBwbGF5ZXIuc2Vla1RvKG5ld0N1cnJlbnRTZWMpO1xuICB9KTtcblxuICBwbGF5ZXJWb2x1bWUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldikgPT4ge1xuICAgIGNvbnN0IG5ld1ZvbHVtZSA9ICgxMDAgKiBldi5sYXllclgpIC8gcGxheWVyVm9sdW1lLmNsaWVudFdpZHRoO1xuICAgIHNldFBsYXllclZvbHVtZShuZXdWb2x1bWUpO1xuICB9KTtcbiAgcGxheWVyVm9sdW1lSWNvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbXV0ZVBsYXllcik7XG59XG5cbmZ1bmN0aW9uIGNvbnZlclRpbWUoc2VjKSB7XG4gIC8vIENvbnZlcnRpbmcgc2VjIHRvIHRpbWUgZm9ybWF0IGhoOm1tOnNzXG4gIHNlYyA9IE51bWJlci5wYXJzZUludChzZWMpO1xuICBsZXQgaGggPSBNYXRoLnRydW5jKHNlYyAvIDM2MDApO1xuICBsZXQgbW0gPSBNYXRoLnRydW5jKChzZWMgLSBoaCAqIDM2MDApIC8gNjApO1xuICBsZXQgc3MgPSBNYXRoLnRydW5jKHNlYyAlIDYwKTtcblxuICBmdW5jdGlvbiBfZm9ybWF0UGVyaW9kKHQpIHtcbiAgICAvLyBDaGVja1xuICAgIHJldHVybiB0IDwgMTAgPyBgMCR7dH1gIDogYCR7dH1gO1xuICB9XG4gIGxldCByZXN1bHRGb3JtYXQgPVxuICAgIGhoID4gMFxuICAgICAgPyBgJHtfZm9ybWF0UGVyaW9kKGhoKX06JHtfZm9ybWF0UGVyaW9kKG1tKX06JHtfZm9ybWF0UGVyaW9kKHNzKX1gXG4gICAgICA6IGAke19mb3JtYXRQZXJpb2QobW0pfToke19mb3JtYXRQZXJpb2Qoc3MpfWA7XG4gIHJldHVybiBgJHtfZm9ybWF0UGVyaW9kKG1tKX06JHtfZm9ybWF0UGVyaW9kKHNzKX1gO1xufVxuXG5cblxuY29uc3QgbXV0ZVBsYXllckluaXQgPSAoKSA9PiB7XG4gIC8vINCU0LAg0LTQtdGC0LrQsCwg0Y3RgtC+INC30LDQvNC60L3Rg9GC0L3QsNGPINGE0YPQvdC60YbQuNGPIG11dGVQbGF5ZXJJbml0XG4gIGxldCBzYXZlZFZvbHVtZTtcbiAgZnVuY3Rpb24gdm9sKCl7XG4gICAgbGV0IGlzTXV0ZWQgPSBwbGF5ZXIuZ2V0Vm9sdW1lKCkgPT0gMDtcbiAgICBpZiAoaXNNdXRlZCkge1xuICAgICAgc2F2ZWRWb2x1bWUgPSBzYXZlZFZvbHVtZSA/IHNhdmVkVm9sdW1lIDogMTAwOyAvLyBpcyBVbmRlcmZpbmVkP1xuICAgICAgc2V0UGxheWVyVm9sdW1lKHNhdmVkVm9sdW1lKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2F2ZWRWb2x1bWUgPSBwbGF5ZXIuZ2V0Vm9sdW1lKCk7XG4gICAgc2V0UGxheWVyVm9sdW1lKDApO1xuICB9XG4gIHJldHVybiB2b2xcbn07XG5sZXQgbXV0ZVBsYXllciA9IG11dGVQbGF5ZXJJbml0KCk7IFxuXG5mdW5jdGlvbiBzZXRQbGF5ZXJWb2x1bWUodm9sKSB7XG4gIC8vIHZvbDogbnVtYmVyXG4gIHBsYXllci5zZXRWb2x1bWUoTWF0aC5mbG9vcih2b2wpKTtcbiAgcGxheWVyVm9sdW1lTWFya2VyLnN0eWxlLmxlZnQgPSBgJHt2b2x9JWA7XG59XG5cbmZ1bmN0aW9uIG9uUGxheWVyUmVhZHkoZXYpIHtcbiAgbGV0IGludGVydmFsO1xuICBjb25zdCB2aWRlb0R1cmF0aW9uU2VjID0gcGxheWVyLmdldER1cmF0aW9uKCk7XG4gIHBsYXllclZpZGVvRHVyYXRpb24udGV4dENvbnRlbnQgPSBjb252ZXJUaW1lKHZpZGVvRHVyYXRpb25TZWMpO1xuXG4gIGlmICh0eXBlb2YgaW50ZXJ2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICB9XG5cbiAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgLy8gU2V0dGluZyBjdXJyZW50IHRpbWVcbiAgICBjb25zdCB2aWRlb0N1cnJlbnRTZWMgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcbiAgICBwbGF5ZXJWaWRlb0N1cnJlbnQudGV4dENvbnRlbnQgPSBjb252ZXJUaW1lKHZpZGVvQ3VycmVudFNlYyk7XG4gICAgLy8gU2V0dGluZyBtYXJrZXIgb24gcHJvZ3Jlc3MgYmFyXG4gICAgY29uc3QgcHJvZ3Jlc3MgPSAoMTAwICogdmlkZW9DdXJyZW50U2VjKSAvIHZpZGVvRHVyYXRpb25TZWM7XG4gICAgcGxheWVyTWFya2VyLnN0eWxlLmxlZnQgPSBgJHtwcm9ncmVzc30lYDtcbiAgfSwgMTAwMCk7XG4gIC8vIFZvbHVtZVxuICBzZXRQbGF5ZXJWb2x1bWUocGxheWVyLmdldFZvbHVtZSgpKTtcbn1cblxuZnVuY3Rpb24gb25QbGF5ZXJTdGF0ZUNoYW5nZShldikge1xuICAvKlxuICAgIC0xICh1bnN0YXJ0ZWQpXG4gICAgMCAoZW5kZWQpXG4gICAgMSAocGxheWluZylcbiAgICAyIChwYXVzZWQpXG4gICAgMyAoYnVmZmVyaW5nKVxuICAgIDUgKHZpZGVvIGN1ZWQpLlxuICAqL1xuICBzd2l0Y2ggKGV2LmRhdGEpIHtcbiAgICBjYXNlIDE6XG4gICAgICBwbGF5ZXJXcmFwLmNsYXNzTGlzdC5yZW1vdmUoXCJwbGF5ZXItLXBhdXNlZFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIHBsYXllcldyYXAuY2xhc3NMaXN0LmFkZChcInBsYXllci0tcGF1c2VkXCIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAwOiAvLyBlbmRcbiAgICAgIHBsYXllcldyYXAuY2xhc3NMaXN0LmFkZChcInBsYXllci0tcGF1c2VkXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uWW91VHViZUlmcmFtZUFQSVJlYWR5KCkge1xuICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKFwicGxheWVyXCIsIHtcbiAgICB3aWR0aDogXCI2NjJcIixcbiAgICBoZWlnaHQ6IFwiMzkyXCIsXG4gICAgdmlkZW9JZDogXCJPZzg0N0hWd1JTSVwiLFxuICAgIGV2ZW50czoge1xuICAgICAgb25SZWFkeTogb25QbGF5ZXJSZWFkeSxcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IG9uUGxheWVyU3RhdGVDaGFuZ2UsXG4gICAgfSxcbiAgICBwbGF5ZXJWYXJzOiB7XG4gICAgICBjb250cm9sczogMCxcbiAgICAgIGRpc2FibGVrYjogMSxcbiAgICAgIGVuYWJsZWpzYXBpOiAxLFxuICAgICAgbW9kZXN0YnJhbmRpbmc6IDEsXG4gICAgICByZWw6IDAsXG4gICAgfSxcbiAgfSk7XG59XG5cbmV2ZW50c0luaXQoKTtcbiIsImNvbnN0IGFjY29yZGlvbkNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uKGV2KSB7XG4gIGlmIChldi50YXJnZXQuaGFzQXR0cmlidXRlKCdkYXRhLWFjY29yZGlvbi10cmlnZ2VyJykpIHtcbiAgICAkKGV2LmN1cnJlbnRUYXJnZXQpLnNpYmxpbmdzKCcudGVhbV9fbWVtYmVyJykucmVtb3ZlQ2xhc3MoJ3RlYW1fX21lbWJlci0tYWN0aXZlJyk7XG4gICAgJChldi5jdXJyZW50VGFyZ2V0KS50b2dnbGVDbGFzcygndGVhbV9fbWVtYmVyLS1hY3RpdmUnKTtcbiAgfVxufVxuJChcIltkYXRhLWFjY29yZGlvbi1uYW1lPSd0ZWFtLW1lbWJlciddXCIpLm9uKCdjbGljaycsIGFjY29yZGlvbkNsaWNrSGFuZGxlcik7Il19
