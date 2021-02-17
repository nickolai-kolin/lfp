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