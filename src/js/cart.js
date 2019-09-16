function __cart_send(selector, action, data) {
  var e = new CustomEvent('message', {detail: [action, data]});

  var targets = $(selector);
  for (var i = 0; i < targets.length; i++)
    targets[i].dispatchEvent(e);
}


var __cart_common = {
  computed: {
    items: function () {
      var items = [];

      if (typeof this.cart == 'undefined' ||
          typeof this.cart.items == 'undefined') return items;

      for (var i = 0; i < this.cart.items.length; i++)
        if (this.cart.items[i].parent === null)
          items.push(this.cart.items[i]);

      return items;
    },


    quantity: function () {
      var qty = 0;

      for (var i = 0; i < this.items.length; i++)
        qty += this.items[i].quantity;

      return qty;
    }
  }
}


var __cart_app = {
  el: '#cart',
  template: '#cart-template',


  data: function () {
    return {
      do_checkout: false,
      cart: {}
    }
  },


  mounted: function() {this.reload()},


  methods: {
    cookie_set: function (name, value, days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie =
        name + '=' + value + '; expires=' + date.toUTCString() + '; path=/';
    },


    cookie_get: function (name) {
      var nameEQ = name + '=';
      var ca = document.cookie.split(';');

      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }

      return null;
    },


    dispatch: function (e) {this[e.detail[0]](e.detail[1])},


    load: function (cart) {
      this.cart = cart;
      this.cookie_set('cart', JSON.stringify(cart), 365);

      if (this.do_checkout) this.checkout();

      Vue.nextTick(function () {__cart_send('.cart-view', 'load', cart)})
    },


    clear: function () {this.load({})},


    reload: function () {
      // Load cart from cookie
      if (!this.cart.id)
        try {
          var cart = JSON.parse(this.cookie_get('cart'));

          if (typeof cart == 'object' && cart !== null)
            this.cart = cart;
        } catch (e) {}

      // Check if we have a valid cart
      if (this.cart.id)
        $.get({url: '/jmpapi/carts/' + this.cart.id, cache: false})
        .done(this.load)
        .fail(this.clear);
    },


    checkout: function () {
      this.do_checkout = true;

      if (typeof this.cart.checkout != 'undefined')
        location.href = this.cart.checkout;
    },


    item_get: function (item) {
      for (var i = 0; i < this.items.length; i++)
        if (item == this.items[i].id)
          return this.items[i];

      return undefined;
    },


    item_post: function (item, data) {
      var config = {
        url: '/jmpapi/carts/' + this.cart.id + '/items/' + item,
        method: 'PUT',
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: 'json'
      }

      $.ajax(config).done(function (cart) {
        this.load(cart);
      }.bind(this));
    },


    item_inc: function (item_id) {
      var item = this.item_get(item_id);

      this.item_post(item_id, {
        "quantity": item.quantity + 1,
        "product": item.product
      });
    },


    item_dec: function (item_id) {
      var item = this.item_get(item_id);

      if (item.quantity == 1) this.item_remove(item_id);
      else
        this.item_post(item_id, {
          "quantity": item.quantity - 1,
          "product": item.product
        });
    },


    item_remove: function (item) {
      var config = {
        url: '/jmpapi/carts/' + this.cart.id + '/items/' + item,
        method: 'DELETE',
        contentType: "application/json",
        dataType: 'json'
      }

      $.ajax(config).done(function (cart) {
        this.load(cart);

      }.bind(this)).fail(function () {
        if (this.items.length == 1) this.clear();
        else alert('Failed to remove cart item');
      }.bind(this));
    },


    add: function (items) {
      var url  ='/jmpapi/carts';
      if (typeof this.cart.id != 'undefined') url += '/' + this.cart.id;

      var config = {
        url: url,
        data: JSON.stringify(items),
        contentType: "application/json",
        dataType: 'json'
      }

      $.post(config).done(function (cart) {
        this.load(cart);
        location.href = '/cart';

      }.bind(this)).fail(function () {
        alert('Failed to add to cart');
      });
    }
  },


  mixins: [__cart_common]
}


var __cart_item = {
  template: '#cart-item-template',
  props: ['item', 'cart'],


  computed: {
    options: function () {
      var options = [];

      for (var i = 0; i < this.cart.items.length; i++)
        if (this.cart.items[i].parent == this.item.id)
          options.push(this.cart.items[i]);

      return options;
    }
  },


  methods: {
    send: function (action) {__cart_send('.cart', action, this.item.id)},
    inc: function () {this.send('item_inc')},
    dec: function () {this.send('item_dec')},
    remove: function () {this.send('item_remove')}
  }
}


var __cart_view_app = {
  el: '#cart-view',
  template: '#cart-view-template',


  data: function () {
    return {
      cart: undefined
    }
  },


  components: {
    'cart-item': __cart_item
  },


  methods: {
    dispatch: function (e) {this[e.detail[0]](e.detail[1])},


    load: function (cart) {this.cart = cart}
  },


  mixins: [__cart_common]
}


$(function () {
  new Vue(__cart_app)
  new Vue(__cart_view_app)
})


// Force page reload on return with back button
$(window).bind("pageshow", function(event) {
  if (event.originalEvent.persisted)
    __cart_send('.cart', 'reload');
});
