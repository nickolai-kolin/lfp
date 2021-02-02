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

}

// Run main once DOMContentLoaded event fired
$.when($.ready)
  .then(main());