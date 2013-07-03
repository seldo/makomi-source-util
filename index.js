/**
 * Utility functions for working with makomi project source structures
 */

var fs = require('fs-extra'),
  htmlparser = require('htmlparser');

/**
 * Where to find various important files. Always the same.
 */
var constants = {
  source: '.makomi/',
  files: {
    makomi: 'makomi.json',
    routes: 'routes.json'
  }
}

exports.definition;
exports.routes;
exports.srcDir = constants.srcDir

/**
 * Load the app definition file
 */
exports.loadDefinition = function(sourceDir,cb) {

  var definitionFile = sourceDir+constants.files.makomi;

  fs.readFile(definitionFile,'utf-8',function (er, data) {
    // TODO: handle parsing errors
    exports.definition = JSON.parse(data)
    cb(exports.definition);
  });

}

/**
 * Load the routes files
 */
exports.loadRoutes = function(sourceDir,cb) {

  var routesFile = sourceDir+constants.files.routes;

  console.log("Looking for routes in " + routesFile)

  fs.readFile(routesFile,'utf-8',function (er, data) {
    // TODO: handle parse errors
    exports.routes = JSON.parse(data)
    cb(exports.routes)
  });

}

/**
 * Prepare a source directory for editing by makomi.
 * This primarily means adding IDs to everything so the editor
 * knows how to edit things.
 * @param appDefinition
 * @param sourceDir
 * @param outputDir
 * @param cb
 */
exports.generateWorkingCopy = function(appDefinition,sourceDir,outputDir,cb) {

  var scratchSource = outputDir + '.makomi/'
  var scratchApp = outputDir + 'app/'

  // pre-process the source to add IDs
  fs.copy(sourceDir,scratchSource,function(){
    exports.idify(scratchSource,function(idMap) {
      mkEx.generate(scratchSource,scratchApp,"all",function() {
        // send the source map back so peeps can use it
        cb(idMap)
      })
    })
  })
}

/**
 * Read every template file in the views directory
 * Add a unique ID to the makomi-id attribute of every tag
 *
 * @param scratchSource
 * @param cb
 */
exports.idify = function(scratchSource,cb) {
  var viewDir = scratchSource + 'views/'

  var recursiveModify = function(dir,cb) {
    fs.readdir(dir,function(er,files) {

      // TODO: build a tree

      var count = files.length
      var complete = function() {
        count--
        if (count == 0) cb()
      }

      files.forEach(function(file) {
        fs.stat(dir+'/'+file,function(er,stats) {
          if(stats.isDirectory()) {
            // it's a folder, so recurse
            recursiveModify(dir+'/'+file,function() {
              complete()
            })
          } else {
            // it's a file, so parse and modify
            parseFile(dir+'/'+file,function(dom) {
              addIds(dom,function(newDom) {
                toHtml(newDom,function(html) {
                  fs.writeFile(dir+'/'+file,html,function() {
                    complete()
                  })
                })
              })
            })
          }
        })
      })
    })
  }

}