var fs = require('fs-extra')

/**
 * Find JSON files in a given directory, return as an array of bare names
 * @param dir
 * @param cb
 */
exports.listJSON = function(dir,cb) {
  exports.list(dir, function(er,files) {

    var fileList = []

    var count = files.length
    if (count == 0) cb(fileList)
    var complete = function() {
      count--
      if (count==0) cb(fileList)
    }

    files.forEach(function(file) {
      var fileParts = file.split('.')
      if(fileParts.length > 1) {
        if (fileParts.pop() == 'json') {
          fileList.push(fileParts.join('.'))
        }
      }
      complete()
    })

  })
}

/**
 * Simply lists all files in a directory, exactly like readdir
 * TODO: in future, will filter out extra guff.
 * @param dir
 * @param cb
 */
exports.list = function(dir,cb) {
  fs.readdir(dir, function (er, files) {
    // TODO: filter stuff out
    cb(er,files)
  })
}

/**
 * Writes body to dir + name
 * @param dir A directory
 * @param name A filename
 * @param body Body of the file
 * @param cb
 */
exports.writeToDir = function (dir, name, body, cb) {

  var path = dir + name
  fs.writeFile(path, body, function (er) {
    if (er) {
      console.log(er);
    } else {
      console.log("Wrote " + path);
    }
    cb(er);
  });

}