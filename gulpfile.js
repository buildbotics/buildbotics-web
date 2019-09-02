const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
const livereload   = require('gulp-livereload');
const stylus       = require('gulp-stylus');
const pug          = require('gulp-pug');
const autoprefixer = require('gulp-autoprefixer');
const zip          = require('gulp-zip');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
const gap          = require('gulp-append-prepend');
const ampify       = require('gulp-ampify');
const beeper       = require('beeper');

function serve(done) {
  livereload.listen();
  done();
}


const handleError = (done) => {
  return function (err) {
    if (err) beeper();
    return done(err);
  };
};


var hbs_src = ['src/hbs/*.hbs', 'src/hbs/partials/*.hbs'];

function hbs(done) {
  pump([src(hbs_src), livereload()], handleError(done));
}


function css(done) {
  pump([
    src(['style.styl', 'amp.styl', 'cart.styl', 'logo.styl', 'header.styl',
         'footer.styl'],
        {cwd: 'src/stylus'}),
    stylus({compress: true}),
    autoprefixer(),
    gap.prependText('{{{{raw}}}}'),
    gap.appendText('{{{{/raw}}}}'),
    rename({extname: '.css.hbs'}),
    dest('build/root/partials/assets/'),
    livereload()
  ], handleError(done));
}


function fonts(done) {
  pump([
    src(['src/css/*.css']),
    rename({extname: '.css.hbs'}),
    gap.prependText('{{{{raw}}}}'),
    gap.appendText('{{{{/raw}}}}'),
    dest('build/root/partials/assets/'),
  ], handleError(done));
}


function js(done) {
  pump([
    src('src/js/*.js'),
    uglify(),
    gap.prependText('{{{{raw}}}}'),
    gap.appendText('{{{{/raw}}}}'),
    rename({extname: '.js.hbs'}),
    dest('build/root/partials/assets/'),
    livereload()
  ], handleError(done));
}


function _pug(done) {
  pump([
    src(['cart-tmpl.pug', 'header.pug', 'footer.pug'],
        {cwd: 'src/pug/partials'}),
    pug(),
    gap.prependText('{{{{raw}}}}'),
    gap.appendText('{{{{/raw}}}}'),
    rename({extname: '.html.hbs'}),
    dest('build/root/partials/assets/')
  ], handleError(done));
}


function amp_pug(done) {
  pump([
    src(['header.pug', 'footer.pug'], {cwd: 'src/pug/partials'}),
    pug(),
    ampify('build'),
    gap.prependText('{{{{raw}}}}'),
    gap.appendText('{{{{/raw}}}}'),
    rename({extname: '.amp.hbs'}),
    dest('build/root/partials/assets/')
  ], handleError(done));
}


function zipper(done) {
  pump([
    src(['src/hbs/**', 'build/root/**', 'package.json', 'gulpfile.js']),
    zip(require('./package.json').name + '.zip'),
    dest('build/')
  ], handleError(done));
}


const cssWatcher = () => watch('src/stylus/**', css);
const hbsWatcher = () => watch(hbs_src, hbs);
const watcher = parallel(cssWatcher, hbsWatcher);
const build = series(css, fonts, js, _pug, amp_pug);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;
