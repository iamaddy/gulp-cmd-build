var gutil = require('gulp-util');
var path = require('path');
var file = new gutil.File({
  base: path.join(__dirname, './fixtures/'),
  cwd: __dirname,
  path: path.join(__dirname, './fixtures/test.coffee'),
  contents: new Buffer("hello world")
});

console.log(file.relative)
console.log(file.isBuffer());
