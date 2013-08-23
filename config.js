var fs = require('fs-extra')
var _ = require('underscore')

var configFile = false;
var configEnv = null;
var configData = null;

/**
 * Tell everybody where the config file is.
 * @param path
 */
exports.setConfigFileLocation = function(path) {
  if (path) {
    configFile = path
  } else if (process.env.MAKOMICONF) {
    configFile = process.env.MAKOMICONF;
  } else {
    configFile = '/etc/makomi/makomi.conf'
  }
}

// returns the config file location
var getConfigFileLocation = function() {
  if (!configFile) {
    throw new Error("Config file location not set")
  }
  return configFile
}

// set the environment
exports.setEnv = function(env) {
  configEnv = env
}

/**
 * Mostly for unit tests; reset the config data, forcing a reload
 */
exports.resetConfig = function() {
  configData = null;
  configEnv = null;
}

/**
 * Load config file and store it in memory
 * @param env The environment to use
 * @param cb
 */
exports.loadConfig = function(cb) {
  if(!configEnv) {
    throw new Error("Config environment not set")
  }
  if (configData) {
    cb(configData)
  } else {
    fs.readJSON(getConfigFileLocation(),function(er,configObj) {
      if (er) {
        console.log(er)
        throw new Error("Could not load config file at " + getConfigFileLocation())
      }
      if (!configObj[configEnv]) {
        throw new Error("Config does not have an environment " + env)
      }
      configData = configObj
      cb(configData)
    })
  }
}

exports.saveConfig = function(config,cb) {
  fs.writeJSON(getConfigFileLocation(),config,function(er) {
    if (er) {
      console.log(er)
      throw new Error("Could not write config file at " + getConfigFileLocation())
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
  console.log("Config env " + configEnv)
  exports.loadConfig(function(config) {
    cb(exports.getSync(keyString));
  })
}

/**
 * Synchronous get. Call only if you know you're somewhere inside a loadConfig() callback
 * @param keyString
 * @returns {null}
 */
exports.getSync = function(keyString) {
  keyString = configEnv + '.' + keyString
  var keyParts = keyString.split('.')
  var obj = configData;
  var key;
  while(key = keyParts.shift()) {
    if (obj[key]) {
      obj = obj[key]
    } else {
      throw new Error("Key " + key + " not found")
    }
  }
  return obj;
}

/**
 * Convert dotted.key.chain into a key in the config and set that value
 * @param keyString
 * @param value
 * @param cb
 */
exports.set = function(keyString,value,cb) {
  keyString = configEnv + '.' + keyString
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