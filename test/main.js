var cmdTransport = require('../');
var gulp = require('gulp');

gulp.src(['example/**/*.js'])
    .pipe(cmdTransport('ret.js'))
    .pipe(gulp.dest('build/'));

var concatCss = require('gulp-concat-css');

//gulp.src('assets/a.css')
   // .pipe(concatCss("styles/b.css"))
    //.pipe(gulp.dest('out/'));