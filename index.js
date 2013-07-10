/**
 * Utility functions for working with makomi project source structures
 */

var fs = require('fs-extra'),
  htmlparser = require('htmlparser'),
  shortid = require('short-id'),
  _ = require('underscore'),
  util = require('util');

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
  console.log("Definition file in " + definitionFile)

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
    console.log("Copied app from " + sourceDir + " to " + scratchSource)
    exports.idify(scratchSource,function(fileMap,idMap) {
      console.log("ID-ified source in " + scratchSource)
      mkEx.generate(scratchSource,scratchApp,"all",function() {
        // send the source map back so peeps can use it
        console.log("Generated app in " + scratchSource + " as " + scratchApp)
        cb(fileMap,idMap)
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

  var viewDir = scratchSource + 'views'

  var recursiveModify = function(path,cb) {

    // holds the annotated tree structures of every file and path
    var fileMaps = {}
    // holds all the IDs mapped back to the file that contains them
    var idMap = {}

    var fullPath = viewDir + path
    console.log("Looking in path " + fullPath)
    fs.readdir(fullPath,function(er,files) {

      var count = files.length
      var complete = function() {
        count--
        if (count == 0) {
          cb(fileMaps,idMap)
        }
      }

      files.forEach(function(file) {
        var filePath = path+'/'+file
        fs.stat(viewDir+filePath,function(er,stats) {
          if (er) {
            console.log("Could not stat file: " + er)
            complete()
            return;
          }
          if(stats.isDirectory()) {
            // it's a folder, so recurse
            recursiveModify(filePath,function(childFiles,childIds) {
              _.extend(fileMaps,childFiles)
              _.extend(idMap,childIds)
              complete()
            })
          } else {
            // it's a file, so parse and modify
            exports.addIdsToFile(viewDir,filePath,function(annotatedDom,newIds) {
              fileMaps[filePath] = annotatedDom
              _.extend(idMap,newIds)
              complete()
            })
          }
        })
      })
    })
  }

  // start at root of view dir
  recursiveModify('',function(fileMaps,idMap) {
    cb(fileMaps,idMap)
  })

}

/**
 * Read in a single file, parse the HTML
 * Add unique IDs to all elements
 * Return the parsed DOM structure and a list of the new IDs mapped to the path of the file
 * @param fullPath
 * @param filePath
 * @param cb
 */
exports.addIdsToFile = function(basePath,filePath,cb) {
  var fullPath = basePath+filePath
  parseFile(fullPath,function(er,dom) {
    // TODO: handle errors
    exports.addIds(filePath,dom,function(newDom,newIds) {
      writeHtml(fullPath,newDom,function() {
        cb(newDom,newIds)
      })
    })
  })
}

/**
 * Recursively add unique makomi IDs to any elements which do not
 * already have one.
 * @param path
 * @param dom
 * @param cb
 */
exports.addIds = function(path,dom,cb) {

  var ids = {}

  var count = dom.length
  var complete = function() {
    count--
    if (count == 0) {
      cb(dom,ids)
    }
  }

  dom.forEach(function(element,index) {
    if (element.type != 'tag') {
      complete();
      return
    }
    // handle children
    if (element.children) {
      count++
      exports.addIds(path,element.children,function(childDom,childIds) {
        dom[index].children = childDom
        _.extend(ids,childIds)
        complete()
      })
    }
    // handle element itself
    if (!element.attribs) element.attribs = {}
    if (!element.attribs['makomi-id']) {
      element.attribs['makomi-id'] = shortid.generate()
    }
    // "this ID will be found in this file"
    ids[element.attribs['makomi-id']] = path
    // TODO: do we need to refer to the element directly here?
    complete()
  })

}

/**
 * Take a DOM tree and write an HTML file to disk
 * @param path
 * @param dom
 * @param cb
 */
var writeHtml = function(path,dom,cb) {
  toHtml(dom,function(er,html) {
    fs.writeFile(path,html,function(er) {
      if (er) throw er;
      cb()
    });
  })
}

/**
 * Take a dom tree, return a (nicely formatted) string of HTML.
 * Recursive.
 * @param dom
 * @param cb
 * @param depth
 */
var toHtml = function(dom,cb,depth) {
  if (!depth) depth = 0;

  var er = null; // TODO: error handling
  var output = "";

  // counter+callback idiom
  var count = dom.length
  var complete = function() {
    count--;
    if (count == 0) {
      cb(er,output)
    }
  }

  // FIXME: this doesn't produce elements out of order but I'm not sure why
  dom.forEach(function(element,index) {
    switch(element.type) {
      case "comment":
        output += "<!-- " + element.raw + " -->"
        complete()
        break;
      case "directive":
        output += "<" + element.raw + ">"
        complete();
        break;
      case "tag":
        output += "<" + element.name
        if (element.attribs) {
          output += " " + _.map(element.attribs,function(attribVal,attrib,element) {
            return attrib + '="' + attribVal + '"'
          }).join(" ")
        }
        output += ">"
        var endTag = function() {
          output += "</" + element.name + ">"
        }
        if (element.children) {
          toHtml(element.children,function(er,html) {
            output += html
            endTag()
            complete()
          },depth+2)
        } else {
          endTag()
          complete()
        }
        break;
      default:
        output += element.raw
        complete()
        break;
    }
  })

}

/**
 * Read HTML from disk and parse into DOM structure
 * @param filename
 * @param cb
 */
var parseFile = function(path,cb) {
  fs.readFile(path,'utf-8',function(er,rawHtml) {
    // get HTMLparser to do the heavy lifting
    var handler = new htmlparser.DefaultHandler(function (er, dom) {
      cb(er,dom)
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
  })
}
