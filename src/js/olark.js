(function(o, l, a, r, k, y) {
  if (o.olark) return;

  r = "script";
  y = l.createElement(r);
  r = l.getElementsByTagName(r)[0];

  y.async = 1;
  y.src = "//" + a;
  r.parentNode.insertBefore(y, r);

  y = o.olark = function() {
    k.s.push(arguments);
    k.t.push(+new Date)
  };
  y.extend    = function(i, j) {y("extend", i, j)};
  y.identify  = function(i)    {y("identify", k.i = i)};
  y.configure = function(i, j) {y("configure", i, j); k.c[i] = j};

  k= y._ = {s: [], t: [+new Date], c: {}, l: a};
})(window, document, "static.olark.com/jsclient/loader.js");

olark.configure('system.hb_disable_mobile', true);
olark.configure('features.greeter', false);
olark.configure('system.hb_chatbox_size', 'sm'); // Small
olark.configure('system.hb_dark_theme', true);
olark.configure('system.hb_primary_color', '#e5aa3d');
olark.identify('4256-519-10-7257');
