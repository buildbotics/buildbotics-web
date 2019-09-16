document.addEventListener('DOMContentLoaded', function() {
  if (!$('.add-toc').length) return;

  var counts = [0, 0, 0];
  var lastDepth = 0;
  var toc = $('<ul>');

  $('h2, h3, h4').each(function (index, hdr) {
    var depth = parseInt(hdr.nodeName.substr(1)) - 2;

    if (lastDepth < depth) counts[depth] = 0;
    lastDepth = depth;
    counts[depth] += 1;
    var section = section = counts.slice(0, depth + 1).join('.') + '.';

    $('<li>')
      .addClass('toc-' + depth)
      .append($('<div>')
              .addClass('section-number')
              .text(section))
      .append($('<a>')
              .attr('href', '#' + hdr.id)
              .html(hdr.innerHTML))
      .appendTo(toc);

    hdr.innerHTML =
      '<div class="section-number">' + section + '</div>' + hdr.innerHTML;
  })

  $('<div>')
    .addClass('table-of-contents')
    .append($('<h2>').text('Table of Contents'))
    .append(toc)
    .prependTo('.site-wrapper');

  $('body').addClass('toc');
}, false);
