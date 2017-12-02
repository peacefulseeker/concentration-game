var gulp = require("gulp"),
  // currPath = require( "path" ),
  /* An object where all the pacakages are stored. */
  $ = require("gulp-load-plugins")({
    pattern: "*"
  });

/* CONSTANTS & SETTINGS */
const css_files = ["css/style.css"];
const sass_files_to_watch = ["sass/**/*.scss"];
const sass_file_to_compile = [
  /* Any file contains style */
  "sass/style*.scss"
];
const js_files = ["js/*.js", "!js/*.min.js"];
const text_files = ["*.php", "*.html"];
const path_to_php_core = "C:/xampp/php/";

const html_start_page = $.glob.sync("*.html");

/* -- CONSTANTS & SETTINGS -- */

gulp.task("glob", function(done) {
  console.log(html_start_page);
  done();
});

/* Log the available plugins to load */
gulp.task("$", function(done) {
  console.log($);
  done();
});

/* Default task with BrowserSync Server Launch and Watching the files */
gulp.task("default", gulp.series(browserSyncServer, watchTasks));

/* Setting up the file watcher tasks */
function watchTasks() {
  gulp.watch(sass_files_to_watch).on("all", gulp.series(styles));
  gulp.watch(text_files).on("all", gulp.series(browserSyncReload));
  gulp.watch(js_files).on("all", gulp.series(js, browserSyncReload));
  gulp.watch(css_files).on("all", gulp.series(css));
}

/* Setting up the local server with PHP and livereload supports */
function browserSyncServer(done) {
  $.connectPhp.server({
      bin: path_to_php_core + "php.exe",
      ini: path_to_php_core + "php.ini",
      port: 8080,
      keepalive: true
    },
    () => {
      $.browserSync.init({
        notify: false,
        debugInfo: true,
        host: "192.168.1.120",
        port: 8080,
        open: true,
        proxy: "127.0.0.1:8080/" + html_start_page
      });
    }
  );
  done();
}

/* Browser reload where necessary */
function browserSyncReload() {
  return $.browserSync.reload();
}

/* Watching css files as well */
function css() {
  return gulp.src(css_files).pipe($.browserSync.reload({
    stream: true
  }));
}

/* SASS file compiling, debugging, minifaction. autoprefixing */
function styles() {
  return (
    gulp
    .src(sass_file_to_compile)
    .pipe($.sass().on("error", $.sass.logError))
    /* Auto prefixing */
    .pipe($.autoprefixer({
      browsers: ["> 0%", "IE 9"],
      cascade: false
    }))
    .pipe(gulp.dest("css/"))
    /* Minifying */
    .pipe($.cleanCss({
      compatibility: "ie8"
    }))
    .pipe($.rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("css/"))
    .pipe($.browserSync.reload({
      stream: true
    }))
  );
}

/* Uglifying and minifying main.js file. */
function js() {
  return gulp
    .src(js_files)
    .pipe(
      $.plumber({
        errorHandler: function(error) {
          console.log(error.message);
          this.emit("end");
        }
      })
    )
    .pipe($.uglify())
    .pipe($.rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("js/"));
}
