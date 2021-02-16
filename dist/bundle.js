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

AllEventsControls = [
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