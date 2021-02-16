const { src, dest, task, series, watch, parallel } = require("gulp");
const rm = require("gulp-rm");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const sassGlob = require("gulp-sass-glob");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const bs = require("browser-sync").create();

const pug = require("gulp-pug");

sass.compiler = require("node-sass");

const styles_list = [
  "node_modules/normalize.css/normalize.css",
  "src/sass/main.sass",
];
const js_list = [
  // "node_modules/jquery/jquery.min.js",
  "src/js/**/*.js"];

const img_list = [
  "src/img/**/*", 
]

const clean = ()=>{
  return src("dist/**/*", { read: false }).pipe(rm(''))
}


const server = () => {
  return bs.init({
    server: {
      baseDir: "./dist",
    },
    port: 8000,
    open: false
  });
}

task("copy:img", () => {
  return src(img_list).pipe(dest("dist/img", {overwrite: true}))
})

function style() {
  return src(styles_list)
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(concat("main.css"))
    .pipe(dest("dist/css",{overwrite: true}));
}

function javascript() {
  return src(js_list)
  .pipe(concat("bundle.js"))
  // .pipe(babel({presets: ['@babel/env']}))
  .pipe(uglify())
  .pipe(dest('dist'),{overwrite: true});
}

function views(){
  return src('src/pug/index.pug')
  .pipe(pug({doctype: 'html',}))
  .pipe(dest('dist', {overwrite: true}));
}
// exports.build = series(copy,remove);

task("default", series(parallel(style, javascript, views, "copy:img")));
watch(["src/**/*.pug", "src/**/*.sass", "src/**/*.js"], series(parallel(style, views, javascript)));
watch("src/img/*", series("copy:img"));
