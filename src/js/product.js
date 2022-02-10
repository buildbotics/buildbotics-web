var emailRE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


var __product_review_form = {
  template: '#product-review-form-template',
  props: ['id'],

  data: function () {
    return {
      rating: '',
      name: '',
      email: '',
      title: '',
      text: '',
      errors: [],
      message: ''
    }
  },


  methods: {
    get_time: function () {
      function pad(number) {return number < 10 ? '0' + number : number}

      var now = new Date();

      return now.getUTCFullYear()  + '-' +
        pad(now.getUTCMonth() + 1) + '-' +
        pad(now.getUTCDate())      + 'T' +
        pad(now.getUTCHours())     + ':' +
        pad(now.getUTCMinutes())   + ':' +
        pad(now.getUTCSeconds())   + 'Z'
    },


    rating_valid: function () {return this.rating != ''},
    email_valid: function () {return emailRE.test(this.email.trim())},
    title_valid: function () {return 1 < this.title.trim().length},


    text_valid: function () {
      var len = this.text.trim().length;
      return 100 < len && len < 10000;
    },


    validate: function () {
      var errors = [];

      if (!this.rating_valid()) errors.push('Choose a rating.');
      if (!this.email_valid()) errors.push('Enter a valid email address.');
      if (!this.title_valid()) errors.push('Enter a valid title');
      if (!this.text_valid())
        errors.push('Review body must be at least 100 characters but ' +
                    'no more than 10,000.');

      this.errors = errors;
    },


    submit: function () {
      this.validate();
      if (this.errors.length) return;

      var name = this.name.trim();

      var data = {
        rating: parseInt(this.rating),
        name: name.length ? name : 'Anonymous',
        email: this.email.trim(),
        title: this.title.trim(),
        text: this.text.trim(),
        time: this.get_time()
      }

      $.post({
        url: '/jmpapi/products/' + this.id + '/reviews',
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'

      }).done(function (response) {
        this.message = response.message;

        this.rating = '';
        this.name = '';
        this.email = '';
        this.title = '';
        this.text = '';

      }.bind(this)).fail(function (xhr) {
        this.message = JSON.parse(xhr.responseText).error;
      }.bind(this))
    }
  }
}


var __product_images = {
  template: '#product-images-template',
  props: ['images'],


  data: function () {
    return {
      current: 0,
      timer: undefined
    }
  },


  computed: {
    ordered: function () {
      if (typeof this.images == 'undefined') return [];
      Vue.nextTick(this.load);

      return this.images.sort(function(a, b) {
        return a.order - b.order;
      });
    }
  },


  methods: {
    load: function () {
      if (typeof this.owl == 'undefined')
        this.owl = $(".owl-carousel").owlCarousel({
          dots: false,
          lazyLoad: true,
          autoHeight: true,
          items: 1,
          loop: 1,
          margin: 10,
          URLhashListener : true,
          startPosition: 'URLHash'
        });
      else this.owl.trigger('refresh.owl.carousel');
    },


    mouse_leave: function (index) {
      if (typeof this.timer != 'undefined') clearTimeout(this.timer);
      this.timer = undefined;
    },


    mouse_enter: function (index) {
      this.timer = setTimeout(function () {
        location.hash = '#image-' + index;
        this.timer = undefined;
      }.bind(this), 500);
    }
  }
}


var __product_rating = {
  template: '#product-rating-template',
  props: ['reviews'],


  computed: {
    rating: function () {
      var sum = 0;

      for (var i = 0; i < this.reviews.length; i++)
        sum += this.reviews[i].rating;

      return sum / this.reviews.length;
    }
  }
}


var __product_modifier = {
  template: '#product-modifier-template',
  props: ['modifier'],


  methods: {
    option_class: function (option) {
      var opt = this.modifier.options[option];

      var klass = [];
      if (this.modifier.option == option) klass.push('selected');
      if (!opt.inventory) klass.push('disabled');

      return klass.join(' ');
    },


    option_select: function (option) {
      var opt = this.modifier.options[option];
      if (opt.inventory) this.modifier.option = option;
    }
  }
}


var __product_review = {
  template: '#product-review-template',
  props: ['review'],


  data: function () {
    return {
      full: false,
      wrapper: null
    }
  },


  computed: {
    has_more: function () {
      if (this.wrapper === null) return false;
      return this.wrapper.offsetHeight < this.wrapper.scrollHeight;
    }
  },


  mounted: function () {
    this.wrapper = this.$el.querySelector('.product-review-wrapper');
  }
}


var __product = {
  template: '#product-template',
  props: ['product_id'],


  data: function ()  {
    return {
      product: undefined,
      error: ''
    }
  },


  components: {
    'product-rating':      __product_rating,
    'product-images':      __product_images,
    'product-modifier':    __product_modifier,
    'product-review':      __product_review,
    'product-review-form': __product_review_form
  },


  computed: {
    price: function () {
      if (typeof this.product.id == 'undefined') return 0;
      var price = this.product.price;

      if (this.product.modifiers)
        for (var i = 0; i < this.product.modifiers.length; i++) {
          var mod = this.product.modifiers[i];
          price += mod.options[mod.option].price;
        }

      return price;
    },


    reviews: function () {
      if (typeof this.product == 'undefined' ||
          typeof this.product.reviews == 'undefined') return [];

      return this.product.reviews.slice(0).reverse();
    },


    order_button_text: function () {
      return this.product.preorder ? 'Preorder' : 'Add to Cart';
    },


    product_message: function () {
      return this.product.preorder ? this.product.preorder_message : '';
    }
  },


  mounted: function () {this.get_product()},


  methods: {
    get_product: function () {
      $.get('/jmpapi/products/' + this.product_id)
        .done(this.load_product).fail(function (xhr) {
          try {
            this.error = JSON.parse(xhr.responseText).error;

          } catch (e) {
            // Wait 1 sec then try again
            setTimeout(this.get_product, 1000);
          }
        }.bind(this));
    },


    load_modifiers: function (modifiers) {
      for (var i = 0; i < modifiers.length; i++) {
        var mod = modifiers[i];

        // Prepend "none" option
        mod.options.unshift({
          label: 'No ' + mod.name.toLowerCase(),
          price: 0,
          inventory: 1,
          thumbnails: []
        });

        // TODO Remove this hack, strips price from label
        for (var j = 0; j < mod.options.length; j++)
          mod.options[j].label = mod.options[j].label.split('(')[0];

        mod.option = 0; // Select "none" option by default
      }
    },


    load_product: function (product) {
      var canonical = 'https://buildbotics.com/product/' + product.id + '/' +
          product.name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();

      $('<link>')
        .attr('rel', 'canonical')
        .attr('href', canonical)
        .appendTo('head');

      if (product.modifiers) this.load_modifiers(product.modifiers);
      this.product = product;
    },


    add_to_cart: function () {
      var options = [];

      if (this.product.modifiers)
        for (var i = 0; i < this.product.modifiers.length; i++) {
          var mod = this.product.modifiers[i];
          var opt = mod.options[mod.option];
          if (typeof opt.id != 'undefined')
            options.push({id: mod.id, value: opt.id});
        }

      var items = [{
        quantity: 1,
        product: this.product.id,
        options: options
      }]

      __cart_send('.cart', 'add', {items: items});
    }
  }
}


var __product_app = {
  el: '.site-main .inner',


  data: function () {
    return {
      product: this.get_product()
    }
  },


  components: {
    'product-component': __product
  },


  methods: {
    get_product: function () {
      var parts = location.pathname.split('/');
      if (parts.length < 3) return 0;

      try {
        return parseInt(parts[2]);
      } catch (e) {}

      return 0;
    }
  }
}



$(function () {
  if (!Object.defineProperty) {alert('Incompatible browser');}
  new Vue(__product_app);
})
