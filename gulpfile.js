const { src, dest, task, series, watch, parallel } = require("gulp");
const rm = require("gulp-rm");
const sass = require("gulp-sass");
const concat = require("gulp-concat");
const sassGlob = require("gulp-sass-glob");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const bs = require("browser-sync").create();
const svgo = require("gulp-svgo");
const sprite = require("gulp-svg-sprite");
const gulpIf = require("gulp-if");
const autoprefixer = require("gulp-autoprefixer");
const px2rem = require("gulp-smile-px2rem");
const gcmq = require("gulp-group-css-media-queries");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");

const pug = require("gulp-pug");

const env = process.env.NODE_ENV;
sass.compiler = require("node-sass");

const styles_list = [
  "node_modules/normalize.css/normalize.css",
  "src/sass/main.sass",
];

const js_list = [
  "node_modules/jquery-touchswipe/jquery.touchSwipe.min.js",
  "src/js/**/*.js",
];

const img_list = ["src/img/**/*"];

const sprite_src = ["src/img/*.svg"];

const clean = () => {
  return src("dist/**/*", { read: false }).pipe(rm(""));
};

const make_sprite = function () {
  return src(sprite_src)
    .pipe(
      svgo({
        plugins: [
          { removeAttrs: { attrs: "(fill|stroke|style|width|height|data.*)" } },
        ],
      })
    )
    .pipe(
      sprite({
        mode: {
          symbol: {
            sprite: "sprite.svg",
          },
        },
      })
    )
    .pipe(dest("dist/img/"));
};

const server = () => {
  return bs.init({
    server: {
      baseDir: "./dist",
    },
    port: 8000,
    open: false,
  });
};

task("copy:img", () => {
  return src(img_list)
  .pipe(imagemin([
    imagemin.mozjpeg({quality: 75, progressive: true})
  ]))
  .pipe(dest("dist/img", { overwrite: true }));
});

function style() {
  console.log(`ENV = ${env}`);
  return src(styles_list)
    .pipe(gulpIf(env === "dev", sourcemaps.init()))
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(concat("main.css", { newLine: ";" }))
    // .pipe(px2rem())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulpIf(env === "prod", gcmq()))
    .pipe(cleanCSS())
    .pipe(gulpIf(env === "dev", sourcemaps.write()))
    .pipe(dest("dist/css", { overwrite: true }));
}

function javascript() {
  return (
    src(js_list)
      .pipe(gulpIf(env === "dev", sourcemaps.init()))
      .pipe(concat("bundle.js"))
      .pipe(gulpIf(env === "prod", babel({presets: ['@babel/env']})))
      .pipe(gulpIf(env === "prod",uglify()))
      .pipe(gulpIf(env === "dev", sourcemaps.write()))
      .pipe(dest("dist"), { overwrite: true })
  );
}

function views() {
  return src("src/pug/index.pug")
    .pipe(pug({ doctype: "html" }))
    .pipe(dest("dist", { overwrite: true }));
}


task("watch",() =>{
  watch("src/**/*.pug", series(views));
  watch("src/**/*.sass", series(style,views));
  watch("src/**/*.js", series(javascript,views));
  watch("src/img/*", series("copy:img",views));
});

task("default", series(clean, parallel(style, javascript, "copy:img"), views, "watch"));
task("build", series(clean, parallel(style, javascript, views, "copy:img")));