let base = '/jmpapi'

if (location.host == 'localhost')
  base = 'http://localhost:7000'


var __product_rating = {
  template: '#product-rating-template',
  props: ['count', 'sum'],


  computed: {
    rating() {return (this.sum / this.count).toFixed(1)}
  }
}


var __products_app = {
  el: '.site-main .inner',


  data: function () {
    return {
      products: [],
      message: 'Loading...'
    }
  },


  components: {
    'product-rating': __product_rating
  },


  mounted: function () {this.get_products()},


  methods: {
    get_products: function () {
      $.get(base + '/products')
        .done((products) => {
          this.products = products
          this.message = ''

        }).fail((xhr) => {
          try {
            this.message = JSON.parse(xhr.responseText).error

          } catch (e) {
            // Wait 1 sec then try again
            setTimeout(this.get_products, 1000)
          }
        })
    }
  }
}



$(function () {
  if (!Object.defineProperty) {alert('Incompatible browser');}
  new Vue(__products_app);
})
