$(function () {
  $('.owl-carousel').owlCarousel({
    dots: false,
    loop: true,
    margin: 5,
    autoWidth: true,
    nav: true,
    navText: [
      '<i class="fa fa-chevron-left" aria-hidden="true"></i>',
      '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
    ],

    responsiveClass: true,
    responsive: {
      0: {
        items: 1
      },

      500: {
        items: 2
      }
    }
  });
})
