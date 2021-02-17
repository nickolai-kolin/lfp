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
