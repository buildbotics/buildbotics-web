'use strict'


function do_analytics() {
  // Session ID
  let session_id = window.bb_sid
  if (!session_id) {
    session_id = '' + Math.random()
    window.bb_sid = session_id
  }

  // Client ID
  let client_id = localStorage.getItem('bb_cid')
  if (!client_id) {
    client_id = Date.now() + '' + Math.random()
    localStorage.setItem('bb_cid', client_id)
  }

  // Ping analytics
  let params = {
    v:   2,
    tid: 'G-8C1G04EMLZ',
    cid: client_id,
    sid: session_id,
    sr:  screen.width + 'x' + screen.height,
    en:  'page_view',
    dl:  location.href,
    dt:  document.title,
    dr:  document.referrer,
    _et: 1000,
  }

  let url = new URL('https://region1.google-analytics.com/g/collect')
  url.search = new URLSearchParams(params).toString()
  fetch(url, {method:  'POST', mode: 'no-cors'})
}

addEventListener('load', do_analytics)
