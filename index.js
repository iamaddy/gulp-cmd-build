// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var JS = require('./lib/script');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-cmd-build';

function prefixStream(prefixText) {
  var stream = through();
  stream.write(prefixText);
  return stream;
}

// plugin level function (dealing with files)
function cmdTransport(destFile) {
  var destDir = path.dirname(destFile);
  var buffer = [];
  var firstFile = null;

  var AllDeps = {};
  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    if(!firstFile) {
      firstFile = file;
    }

    var id = path.relative(file.cwd, file.path);
    id = id.replace('.js', "");
    id = id.replace(/\\/g, '/');
    var search = /\bdefine\(/;

    
    if (file.isNull()) {
       // do nothing if no contents
    }
    if (file.isBuffer()) {
        var deps = JS.deps(file);
        deps = parseNormalId(id, deps);
        id = '"' + id + '"';
        buffer.push(id + ':' + deps.toString());
        if(deps.length){
          var replacement = 'define(' + id + ', ["' + deps.join('","') + '"], ';
        }else{
          replacement = 'define(' + id + ', [], ';
        }
        file.contents = new Buffer(String(file.contents).replace(search, replacement));
    }

    if (file.isStream()) {
        // 插件不支持对 Stream 对直接操作，出异常
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return cb();
    }
    this.push(file);
    return cb();
  }, function(cb) {
    var concatenatedFile = new gutil.File({
      base: firstFile.base,
      cwd: firstFile.cwd,
      path: path.join(firstFile.base, destFile),
      contents: new Buffer(buffer.join(gutil.linefeed))
    });
    console.log(firstFile.base, firstFile.cwd, path.join(firstFile.base, destFile));
    console.log(concatenatedFile)
    this.push(concatenatedFile);
    return;
    cb();
  });
  
  // returning the file stream
  return stream;
};
// make deps module relative path(./|../) to normal id, base with module
function parseNormalId(baseId, deps){
  if(!baseId) return;
  var ret = [], 
      pathDep, 
      baseSem = baseId.replace(/\"/g,'').split('/'), 
      single = [],
      baseSemLen = baseSem.length || 0, 
      pathDepLen;

  deps.forEach(function(item){
    pathDep = item.split('../');
    pathDepLen = pathDep.length || 0;
    single = [];
    if(pathDepLen > 1){
      for(var i = 0 ,len = baseSemLen;i < len - pathDepLen; i++){
        single.push(baseSem[i]);
      }
      single.push(pathDep[pathDepLen - 1]);
      ret.push(single.join('/'));
    }else if((pathDep = item.split('./')).length > 1){
      if(pathDep.length > 2) return;
      single = baseSem.slice(0, baseSemLen - 1);
      single.push(pathDep[1]);
      ret.push(single.join('/'));
    }
  })
  return ret;
}

// exporting the plugin main function
module.exports = cmdTransport;