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


    // Form
    let orderForm = $("#order-form");
    let orderFormSubmitHandler = ev => {
      ev.preventDefault();
      let name = orderForm.find("#order-name").val();
      let phoneNum = orderForm.find("#order-phone").val();
      let street = orderForm.find("#order-street").val();
      let paymentMethod = orderForm.find('input[name=order-payment]:checked').val();
      let needCallBack = orderForm.find('input[name=order-callback]').is(':checked');
      console.log(needCallBack);
    };

    orderForm.on('submit', orderFormSubmitHandler)
    
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

    
}

// Run main once DOMContentLoaded event fired
$.when($.ready)
  .then(main());