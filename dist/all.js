(function(){
  let closeBtn = document.querySelectorAll(".btn-close");
  Array.from(closeBtn).forEach(el => {
    el.addEventListener('click', event => {
      let nav = event.currentTarget.closest('.nav');
      nav.classList.remove('nav--opened');
    });
  });

  let heroNav = document.getElementById('hero-nav');
  let openBtn = document.querySelectorAll(".btn-burger");
  Array.from(openBtn).forEach(el => {
    el.addEventListener('click', event => {
      heroNav.classList.add('nav--opened');
    });
  });
})();