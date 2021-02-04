function main() {
    // let closeBtn = document.querySelectorAll(".btn-close");
    
    // Array.from(closeBtn).forEach(el => {
      //   el.addEventListener('click', event => {
        //     let nav = event.currentTarget.closest('.nav');
        //     nav.classList.remove('nav--opened');
        //   });
        // });
    // let heroNav = document.getElementById('hero-nav');
    // let openBtn = document.querySelectorAll(".btn-burger");
    // Array.from(openBtn).forEach(el => {
    //   el.addEventListener('click', event => {
    //     heroNav.classList.add('nav--opened');
    //   });
    // });
      
    // HIDE FULL HEIGHT MENU 
    const heroNavSel = '#hero-nav';
    const toogleHeroNav = () => {
      const heroNav = $(heroNavSel);
      const isFound = heroNav.length > 0
      const err = () => console.error(`Error: '${heroNavSel}' not found`);
      isFound ? heroNav.toggleClass("nav--opened") : err();
    } 
    $(`[data-toggle-el-id='${heroNavSel}']`).on('click', toogleHeroNav);

    // $(".btn-close").on('click', toogleHeroNav)
    // $("#burger").on('click', toogleHeroNav);



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

    // Slider product
    // let teamSlider = $('#team-slider');
    // let teamSliderItems = teamSlider.find(".slider__item");
    // let teamSliderScreen = teamSlider.find(".slider__screen");
    // let teamSliderRibbon = teamSlider.find(".slider__ribbon");
    // $(window).on('resize', (ev) => {
    //   let slideHeight = teamSliderItems.outerHeight(true);
    //   teamSliderScreen.height(slideHeight + 2);
    //   let sliderWidth = $(teamSlider).width();
    //   console.log(sliderWidth);
    //   teamSliderItems.width(sliderWidth);
    // });
    // let teamSliderControlPrev = teamSlider.find(".slider__nav--prev");
    // let teamSliderControlNext = teamSlider.find(".slider__nav--Next");
    // teamSliderControlPrev.on('click',ev => {
    //   let sliderWidth = $(teamSlider).width();
    //   teamSliderRibbon.css('margin-left', -sliderWidth);
    // });
    // teamSliderControlPrev.on('click',ev => {
    //   let sliderWidth = $(teamSlider).width();
    //   teamSliderRibbon.css('margin-left', sliderWidth);});

    



}

// Run main once DOMContentLoaded event fired
$.when($.ready)
  .then(main());