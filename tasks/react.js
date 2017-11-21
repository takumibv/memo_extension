import gulp from 'gulp'
import gulpif from 'gulp-if'
import args from './lib/args'
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var react = require('gulp-react');
var using = require('gulp-using'); // ファイル名の出力

const ENV = args.production ? 'production' : 'development'

var config = {
  watchFiles: ['app/scripts/*.jsx', './app/scripts/**/*.jsx'],
  entryFile: ['app/scripts/App.jsx'],
  destDir: `dist/${args.vendor}/scripts`,
  destFile: 'react_app.js',
};

// jsx形式 => jsファイル
gulp.task('react', function() {
  // 参考: https://github.com/babel/babelify
  // watchify, livereload: https://github.com/angkywilliam/ReactGulpBoilerPlate/blob/master/gulpfile.js

  return browserify({
    entries: config.entryFile,
    debug: true
  })
  .transform(babelify,{presets: ["react"]})
  .bundle()
  .on("error", function (err) {
    console.log("ERROR: " + err.message);
    console.log(err.stack);
  })
  .pipe(source(config.destFile))
  .pipe(gulp.dest(config.destDir));
});

gulp.task('react-watch', function() {
  if (args.watch) {
    return gulp.watch(config.watchFiles, ['react']);
  }
});
