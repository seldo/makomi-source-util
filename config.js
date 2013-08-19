var fs = require('fs-extra')
var _ = require('underscore')

var configFile = process.env.MAKOMICONF || '/etc/makomi/makomi.conf'
var configData = null;

/**
 * Load config file and store it in memory
 * @param cb
 */
exports.loadConfig = function(cb) {
  if (configData) {
    cb(configData)
  } else {
    fs.readJSON(configFile,function(er,configObj) {
      if (er) {
        console.log(er)
        throw new Error("Could not load config file at " + configFile)
      }
      configData = configObj
      cb(configData)
    })
  }
}

exports.saveConfig = function(config,cb) {
  fs.writeJSON(configFile,config,function(er) {
    if (er) {
      console.log(er)
      throw new Error("Could not write config file at " + configFile)
    }
    configData = config
    cb()
  })
}

/**
 * Convert dotted.key.chain into a key in the config and get that value
 * @param keyString
 * @param cb
 */
exports.get = function(keyString,cb) {
  exports.loadConfig(function(config) {
    var keyParts = keyString.split('.')
    var obj = config;
    var key;
    while(key = keyParts.shift()) {
      if (obj[key]) {
        obj = obj[key]
      } else {
        throw new Error("Key " + key + "not found")
      }
    }
    cb(obj);
  })
}

/**
 * Convert dotted.key.chain into a key in the config and set that value
 * @param keyString
 * @param value
 * @param cb
 */
exports.set = function(keyString,value,cb) {
  exports.loadConfig(function(config) {
    var keyParts = keyString.split('.')
    var obj = config;
    var key;
    while(key = keyParts.shift()) {
      if (keyParts.length > 0) {
        if(!_.isObject(obj)) {
          throw new Error("Cannot set child value of a string (" + key + ")")
        }
        if(!obj[key]) {
          obj[key] = {}
        }
        obj = obj[key]
      } else {
        obj[key] = value
      }
    }
    exports.saveConfig(config,cb)
  })
}