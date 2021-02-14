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