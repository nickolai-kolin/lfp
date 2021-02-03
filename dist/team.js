const accordionClickHandler = function(ev) {
  if ($(ev.target).attr('data-accordion-trigger')) {
    $(ev.currentTarget).siblings('.team__member').removeClass('team__member--active');
    $(ev.currentTarget).toggleClass('team__member--active');

  }
}
$("[data-accordion-name='team-member']").on('click', accordionClickHandler);