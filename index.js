/**
 * Utility functions for working with makomi project source structures
 */

var fs = require('fs');
exports.definition;
exports.routes;

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