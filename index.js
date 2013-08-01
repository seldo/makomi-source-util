/**
 * Utility functions for working with makomi project source structures
 */

var fs = require('fs-extra'),
  htmlparser = require('htmlparser'),
  shortid = require('short-id'),
  _ = require('underscore'),
  util = require('util'),
  npm = require('npm'),
  betterSplice = require('array-splice');

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
    if (er || !data) {
      throw new Error("Could not load definition at " + definitionFile)
    }
    exports.definition = JSON.parse(data)
    cb(exports.definition);
  });

}

/**
 * Load the routes files
 */
exports.loadRoutes = function(sourceDir,cb) {

  var routesFile = sourceDir+constants.files.routes;

  fs.readFile(routesFile,'utf-8',function (er, data) {
    // TODO: handle parse errors
    exports.routes = JSON.parse(data)
    cb(exports.routes)
  });

}

/**
 * Get the object defining a controller
 * @param sourceDir
 * @param controller
 * @param action
 * @param cb
 */
exports.loadController = function(sourceDir,controller,action,cb) {
  console.log("Loading " + action + " in controller " + controller)

  fs.readFile(
    sourceDir+'controllers/'+controller+'/'+action+'.json',
    'utf-8',
    function(er,data) {
      if (er || !data) {
        cb({error:"Error loading controller " + controller + "/" + action})
      } else {
        cb(JSON.parse(data))
      }
    }
  )
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
exports.generateWorkingCopy = function(sourceDir,outputDir,cb) {

  // pre-process the source to add IDs
  fs.copy(sourceDir,outputDir,function(){
    exports.idify(outputDir,function(fileMap,idMap) {
      cb(fileMap,idMap)
    })
  })
}

/**
 * Replaces the existing file in the source
 * @param appDefinition
 * @param sourceDir
 * @param fileToUpdate The location of the file in the view folder
 * @param newDom
 * @param cb
 */
exports.updateViewFile = function(sourceDir,fileToUpdate,newDom,cb) {

  // FIXME: hard-coding location
  var viewSource = sourceDir + '.makomi/views'
  var fullPath = viewSource + fileToUpdate

  // convert the dom into html and write it to the given location
  // we assume it is already fully id-ified
  exports.writeHtml(fullPath,newDom,function(html) {
    cb()
  })
}

/**
 * Create a full working version of the app, and npm install it.
 * Produces a ready-to-run copy of the app.
 * @param appDefinition
 * @param sourceDir
 * @param outputDir
 * @param cb
 */
exports.generateFullApp = function(appDefinition,sourceDir,outputDir,cb) {

  // FIXME: hard-coding location
  var scratchApp = outputDir + 'app/'

  exports.generateWorkingCopy(appDefinition,sourceDir,outputDir,function(fileMap,idMap) {
    // npm install the app
    // FIXME: link isn't doing what we want here
    npm.load({link:true, prefix: scratchApp},function(er,npm){
      npm.commands.install([scratchApp],function(er,data) {
        console.log("npm installed. Ready to go!")
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
  exports.parseFile(fullPath,function(er,dom) {
    // TODO: handle errors
    exports.addIds(filePath,dom,function(newDom,newIds) {
      exports.writeHtml(fullPath,newDom,function() {
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
 * Recursively remove makomi-id attributes from all elements
 */
exports.removeIds = function(dom,cb) {

  var count = dom.length;
  if (count == 0) cb([])
  var complete = function() {
    count--
    if (count == 0) {
      cb(dom)
    }
  }

  dom.forEach(function(element,index) {
    if (element.attribs && element.attribs['makomi-id']) {
      delete(element.attribs['makomi-id'])
      dom[index] = element
    }
    if (element.children && element.children.length > 0) {
      exports.removeIds(element.children,function(newChildren) {
        dom[index].children = newChildren
        complete()
      })
    } else {
      complete()
    }
  })

}

/**
 * Generate a mini-idMap for the given dom, to be spliced into a bigger one
 * @param path
 */
exports.createIdMap = function(path,dom,cb) {

  var idMap = {}

  var count = dom.length;
  if (count == 0) cb([])
  var complete = function() {
    count--
    if (count == 0) {
      cb(idMap)
    }
  }

  dom.forEach(function(element,index) {
    if (element.attribs && element.attribs['makomi-id']) {
      idMap[element.attribs['makomi-id']] = path
    }
    if (element.children && element.children.length > 0) {
      exports.createIdMap(path,element.children,function(childIdMap) {
        _.extend(idMap,childIdMap)
        complete()
      })
    } else {
      complete()
    }
  })


}

/**
 * Take a DOM tree and write an HTML file to disk
 * @param path
 * @param dom
 * @param cb
 */
exports.writeHtml = function(path,dom,cb) {
  exports.toHtml(dom,function(er,html) {
    fs.writeFile(path,html,function(er) {
      if (er) throw er;
      cb(html)
    });
  })
}

/**
 * Like writeHtml, expect it strips makomi-id attributes before writing.
 * @param path
 * @param dom
 * @param cb
 */
exports.writeStrippedHtml = function(path,dom,cb) {
  exports.removeIds(dom,function(strippedDom) {
    exports.writeHtml(path,strippedDom,function(html) {
      cb(html)
    })
  })
}

/**
 * Take a dom tree, return a (nicely formatted) string of HTML.
 * Recursive.
 * @param dom
 * @param cb
 * @param depth
 */
exports.toHtml = function(dom,cb,depth) {
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
        if (element.attribs && _.size(element.attribs) > 0) {
          output += " " + _.map(element.attribs,function(attribVal,attrib,element) {
            return attrib + '="' + attribVal + '"'
          }).join(" ")
        }
        var selfClosing = false
        if (element.raw.charAt(element.raw.length - 1) == '/') {
          selfClosing = true
          output += "/>"
        } else {
          output += ">"
        }
        var endTag = function() {
          // can be self-closing
          if(!selfClosing) {
            output += "</" + element.name + ">"
          }
        }
        if (element.children) {
          exports.toHtml(element.children,function(er,html) {
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
exports.parseFile = function(path,cb) {
  fs.readFile(path,'utf-8',function(er,rawHtml) {
    // get HTMLparser to do the heavy lifting
    var handler = new htmlparser.DefaultHandler(function (er, dom) {
      cb(er,dom)
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(rawHtml);
  })
}

exports.getSrc = function(idMap,mkId) {
  var src = idMap[mkId];
  if (src) {
    console.log("found " + mkId + " in file " + src)
    return src
  } else {
    console.log(idMap)
    throw new Error("Could not find " + mkId + " in the above ID map")
  }
}

/**
 * Get the in-memory representation of the file which contains a given makomi ID
 * @param idMap
 * @param fileMap
 * @param mkId
 * @returns {*}
 */
exports.getTree = function(idMap,fileMap,mkId) {
  var srcDom = fileMap[exports.getSrc(idMap,mkId)]
  return srcDom;
}

/**
 * Modify the (top-level) text content of a given node.
 * @param domTree
 * @param mkId
 * @param newContent
 * @param cb
 */
exports.setTextContent = function(domTree,mkId,newContent,cb) {

  var changeFn = function(element,cb) {
    // we look for the first text element and change that.
    // FIXME: this needs to be much more sophisticated than just "element 0"
    element.children[0].raw = newContent
    element.children[0].data = newContent
    // findElementAndApply expects an array of elements to splice in
    cb([element]);
  }

  exports.findElementAndApply(domTree,mkId,changeFn,function(newDom){
    cb(newDom)
  })

}

/**
 * Insert an element as a sibling of the target, immediately before the target
 * in the tree.
 * @param domTree
 * @param mkId
 * @param newContent
 * @param cb
 */
exports.insertBefore = function(domTree,mkId,newContent,cb) {

  var changeFn = function(element,cb) {
    // we push our element on to the end of the new content
    newContent.push(element)
    cb(newContent)
  }

  exports.findElementAndApply(domTree,mkId,changeFn,function(newDom) {
    cb(newDom)
  })

}

/**
 * Remove the target element (and all its children) from the tree.
 * @param domTree
 * @param mkId
 * @param cb
 */
exports.remove = function(domTree,mkId,cb) {

  var changeFn = function(element,cb) {
    cb([]) // that was easy
  }

  exports.findElementAndApply(domTree,mkId,changeFn,function(newDom) {
    cb(newDom)
  })

}

/**
 * Replace the element with a different tree
 * @param domTree
 * @param mkId
 * @param cb
 */
exports.replace = function(domTree,mkId,newDom,cb) {

  var changeFn = function(element,cb) {
    cb(newDom) // that was also pretty easy
  }

  exports.findElementAndApply(domTree,mkId,changeFn,function(newDom) {
    cb(newDom)
  })

}


/**
 * Locate the element identified by makomi-id in a dom tree and
 * replace it with the output of applyFn.
 * The element can be modified, deleted, or replaced by an arbitrary
 * number of additional elements.
 * @param domTree
 * @param mkId
 * @param applyFn
 * @param cb
 */
exports.findElementAndApply = function(domTree,mkId,applyFn,cb) {

  var count = domTree.length
  var doneFn = function() {}
  if (count == 0) cb(domTree)
  var complete = function(done) {
    if (typeof(done) != 'undefined') doneFn = done
    count--
    if (count == 0) {
      doneFn()
      cb(domTree)
    }
  }

  domTree.forEach(function(element,index) {
    if(element.attribs &&
      element.attribs['makomi-id'] &&
      element.attribs['makomi-id'] == mkId) {

      applyFn(element,function(newElements) {
        complete(function() {
          // we don't splice until we're done going through the array
          // because any other way leads to madness
          betterSplice.splice(domTree,index,1,newElements)
        })
      })
    } else if (element.children && element.children.length > 0) {
      exports.findElementAndApply(element.children,mkId,applyFn,function(newChildren) {
        domTree[index].children = newChildren
        complete()
      });
    } else {
      complete()
    }
  })
}