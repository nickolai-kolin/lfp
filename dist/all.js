function main() {
      
    // HIDE FULL HEIGHT MENU 
    const heroNavSel = '#hero-nav';
    const toogleHeroNav = (ev) => {
      const currentEl = $(ev.currentTarget);
      const targetBlock = currentEl.data().toggleElId;

      const heroNav = $(`#${targetBlock}`);
      const isFound = Boolean(heroNav.length)

      if (isFound === false){
        return console.error(`Error: '${heroNav}' not found`);
      }
      heroNav.toggleClass("nav--opened");
    } 
    $(`[data-toggle-el-id]`).on('click', toogleHeroNav);
    
    // SLider Product
    $(".owl-carousel").owlCarousel({
      loop: true,
      nav: true,
      items: 1,
      dots: false,
      navContainerClass: "slider__nav-wrap",
      navClass: ['slider__nav slider__nav--prev','slider__nav slider__nav--next'],
      navText: [
        `<svg class="slider__nav-icon">
        <use xlink:href="img/sprite.svg#icon-arrow--left"></use>
      </svg>`,
      `<svg class="slider__nav-icon">
      <use xlink:href="img/sprite.svg#icon-arrow--right"></use>
    </svg>`
      ]
    });

    // SlideShow Feedback
    const tabPanelToggle = ev => {
      // Activate tab
      const targetTab = $(ev.currentTarget);
      const tabList = $('.feedback__tab')
      tabList.removeClass('feedback__tab--active');
      targetTab.addClass('feedback__tab--active');
      // Activate panel
      const targetPanelId = targetTab.data().tabpanelId;
      const tabPanelList = $('.feedback__panel');
      const targetPanel = $(`#${targetPanelId}`);
      
      tabPanelList.removeClass('feedback__panel--active');
      targetPanel.addClass('feedback__panel--active');

    }
    $('[data-tab]').on('click',tabPanelToggle);


    // MENU SECTION
    const menu = document.getElementById("menu");
    const menuTrigger = menu.querySelectorAll('.menu__trigger');
    
}

// Run main once DOMContentLoaded event fired
$.when($.ready)
  .then(main());