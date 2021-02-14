const {src, dest, task, series, watch} = require('gulp');
const rm = require('gulp-rm');
const sass = require("gulp-sass");
const gulpConcat = require("gulp-concat");
const sassGlob = require('gulp-sass-glob');

sass.compiler = require("node-sass");

const styles_list = [
  'node_modules/normalize.css/normalize.css',
  'src/sass/main.sass'
]

task("rm:ts", ()=>{
  return src('dist/*.ts', {read:false}).pipe(rm());
});


function remove() {
  return src('dist/**/*.ts', {read: false}).pipe(rm());
}

function copy() {
  return src('src/js/*.ts').pipe(dest('dist'));
}

function style() {
  return src(styles_list)
  .pipe(sassGlob())
  .pipe(sass())
  .pipe(gulpConcat("test.css"))
  .pipe(dest('dist'));
}

// exports.build = series(copy,remove);
 
task("default", style)
watch('src/**/*.sass', style);