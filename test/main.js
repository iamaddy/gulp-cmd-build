var cmdTransport = require('gulp-cmd-build');

gulp.task('default', function(){
  gulp.src(['example/*.js'])
    .pipe(cmdTransport('hello world'))
    .pipe(gulp.dest('build/'));
});