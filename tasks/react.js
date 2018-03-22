import gulp from 'gulp'
import gulpif from 'gulp-if'
import args from './lib/args'
import plumber from 'gulp-plumber'
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var react = require('gulp-react');
var using = require('gulp-using'); // ファイル名の出力

const ENV = args.production ? 'production' : 'development'

var config = {
  watchFiles: ['app/scripts/*.jsx', './app/scripts/**/*.jsx'],
  entryFile: ['app/scripts/App.jsx', 'app/scripts/Option.jsx'],
  destDir: `dist/${args.vendor}/scripts`,
  destFile: ['react_app.js', 'react_option.js'],
};

// jsx形式 => jsファイル
gulp.task('react', function() {
  // 参考: https://github.com/babel/babelify
  // watchify, livereload: https://github.com/angkywilliam/ReactGulpBoilerPlate/blob/master/gulpfile.js

  return config.entryFile.map((_, i) => {
    browserify({
      entries: config.entryFile[i],
      debug: args.sourcemaps,
    })
    .transform(babelify,{presets: ["es2015", "react"]})
    .bundle()
    .on("error", function (err) {
      console.log("ERROR: " + err.message);
      console.log(err.stack);
    })
    .pipe(plumber({
      // Webpack will log the errors
      errorHandler () {
      }
    }))
    .pipe(source(config.destFile[i]))
    .pipe(gulp.dest(config.destDir));
  });
});

gulp.task('react-watch', function() {
  if (args.watch) {
    return gulp.watch(config.watchFiles, ['react']);
  }
});
