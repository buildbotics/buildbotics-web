var product_id = 113;

var __app = {
  el: '#content',


  data: function ()  {
    return {
      product: {}
    }
  },


  computed: {
    images: function () {
      if (typeof this.product.images == 'undefined') return [];
      Vue.nextTick(this.load_carousel);
      return this.product.images.sort(function(a, b) {
        return a.order - b.order;
      });
    },


    price: function () {
      if (typeof this.product.modifiers == 'undefined') return 0;
      var price = this.product.price;

      for (var i = 0; i < this.product.modifiers.length; i++) {
        var mod = this.product.modifiers[i];
        price += mod.options[mod.option].price;
      }

      return price;
    }
  },


  mounted: function () {
    this.get_product();
  },


  methods: {
    get_product: function () {
      $.get('/jmpapi/products/' + product_id)
        .done(this.load_product).fail(this.get_product);
      // TODO limit retry
    },


    load_product: function (product) {
      var sum = 0;

      for (var i = 0; i < product.modifiers.length; i++) {
        var mod = product.modifiers[i];

        var none = {
          label: 'No ' + mod.name.toLowerCase(),
          price: 0,
          inventory: 1,
          thumbnails: []
        }

        mod.options.unshift(none);
        mod.option = 0;

        // TODO Remove this hack
        for (var j = 0; j < mod.options.length; j++) {
          var opt = mod.options[j];
          opt.label = opt.label.split('(')[0];
        }
      }

      for (var i = 0; i < product.reviews.length; i++) {
        var review = product.reviews[i];
        review.full = false;
        sum += review.rating;
      }

      product.average_review = (sum / product.reviews.length).toFixed(1);
      this.product = product;
    },


    load_carousel: function () {
      if (typeof this.owl == 'undefined')
        this.owl = $(".owl-carousel").owlCarousel({
          lazyLoad: true,
          autoHeight: true,
          items: 1,
          loop: 1,
          margin: 10,
          URLhashListener: true,
          transitionStyle: "fade",
          checkVisible: true
        });
      else this.owl.trigger('refresh.owl.carousel');
    },


    review_has_more: function (index) {
      var e = $('#product-review-' + index + ' .product-review-wrapper');
      if (!e.length) return true;

      if (e[0].offsetHeight < e[0].scrollHeight) {
        this.product.reviews[index].has_more = true;
        return true;

      } else return false;
    }
  }
}


$(function () {
  if (!Object.defineProperty) {alert('Incompatible browser');}
  new Vue(__app);
})
