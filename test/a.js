var concatCss = require('gulp-concat-css');
var gulp = require('gulp');

gulp.src('assets/a.css')
    .pipe(concatCss("styles/b.css"))
    .pipe(gulp.dest('out/'));