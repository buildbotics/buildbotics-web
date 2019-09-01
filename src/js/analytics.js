'use strict'


function do_analytics() {
  function set_cookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie =
      name + '=' + value + '; expires=' + date.toUTCString() + '; path=/';
  }


  function get_cookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  }

  // Lookup ID
  var id = get_cookie('cid');
  if (!id) id = Date.now() + '' + Math.random();
  set_cookie('cid', id, 365);

  // Ping analytics
  var config = {
    v:   1,
    tid: 'UA-57023811-3',
    cid: id,
    aip: 1, // Tell Google to anonymize the user's IP for better privacy
    t:   'pageview',
    dh:  location.hostname,
    dp:  location.pathname,
    dt:  document.title,
    dr:  document.referrer
  };

  // Page load time
  try {
    config.plt = new Date().getTime() - performance.timing.navigationStart;
  } catch (e) {}

  var data = [];
  for (var name in config)
    data.push(name + '=' + encodeURIComponent(config[name]));

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '//www.google-analytics.com/collect?_=' + Math.random(),
           true);
  xhr.setRequestHeader('Content-Type',
                       'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.send(data.join('&'));
}

addEventListener('load', do_analytics);
