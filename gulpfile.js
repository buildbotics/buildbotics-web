const {series, watch, src, dest, parallel} = require('gulp');
const pump = require('pump');

// gulp plugins and utils
const livereload   = require('gulp-livereload');
const stylus       = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const zip          = require('gulp-zip');
const uglify       = require('gulp-uglify');
const rename       = require('gulp-rename');
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
    src(['src/stylus/style.styl', 'src/stylus/amp.styl']),
    stylus({compress: true}),
    autoprefixer(),
    rename({extname: '.css.hbs'}),
    dest('build/root/partials/assets/'),
    livereload()
  ], handleError(done));
}


function fonts(done) {
  pump([
    src(['src/css/*.css']),
    rename({extname: '.css.hbs'}),
    dest('build/root/partials/assets/'),
  ], handleError(done));
}


function js(done) {
  pump([
    src('src/js/*.js'),
    uglify(),
    rename({extname: '.js.hbs'}),
    dest('build/root/partials/assets/'),
    livereload()
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
const build = series(css, fonts, js);
const dev = series(build, serve, watcher);

exports.build = build;
exports.zip = series(build, zipper);
exports.default = dev;
