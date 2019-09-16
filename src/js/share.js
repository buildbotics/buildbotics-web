$(function () {
  function share_facebook(e) {
    var url = encodeURI(location.href);
    var href = '//www.facebook.com/sharer/sharer.php?u=' + url;
    window.open(href, '_blank');
    e.preventDefault();
  }


  function share_twitter(e) {
    var title = encodeURI(document.title);
    var url = encodeURI(location.href);
    var href = '//twitter.com/share?text=' + title + '&url=' + url;
    window.open(href, '_blank');
    e.preventDefault();
  }


  $('a.facebook')
    .attr('title', 'Share this page on Facebook.')
    .on('click', share_facebook);

  $('a.twitter')
    .attr('title', 'Share this page on Twitter.')
    .on('click', share_twitter);
})
