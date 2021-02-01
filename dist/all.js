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
    let closeBtnClickHanlder = ev => {
      `Close fullheight hero nav by removing class`
      let navSelector = $(ev.currentTarget).attr('data-close');
      $(navSelector).removeClass("nav--opened");
    }
    // Add Event Listener
    $(".btn-close").on('click', closeBtnClickHanlder)
    
    // OPEN FULL HEIGHT MENU
    let burgerButtonClickHandler = ev => {
      ` Open Full Height Menu by adding class`
      let navSelector = $(ev.currentTarget).attr('data-open');
      $(navSelector).addClass("nav--opened");
    }

    // Add Event Listener
    $("#burger").on('click', burgerButtonClickHandler);

}

// Run main once DOMContentLoaded event fired
$.when($.ready).then(main());
// $(main());