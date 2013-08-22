var test = require('tape');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')
var mkSrc = require('../index.js');

test('save a config file', function (t) {

  t.plan(1);

  var outFile = "/tmp/config.saveConfig.json"
  var expectedFile = "./test/data/config/loadConfig.json"
  var config = {
    "test": {
      "workspace": "/Users/seldo/Workspace/Makomi/makomi/workspace/",
      "scratchpad": "/tmp/makomi/",
      "sessions": {
        "key": "mks",
        "secret": "this is totes a secret"
      }
    }
  }

  mkSrc.config.resetConfig()
  mkSrc.config.setConfigFileLocation(outFile)
  mkSrc.config.setEnv('test')

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.config.saveConfig(config,function() {
      fs.readFile(outFile,'utf-8',function(er,data) {
        cb(data)
      })
    })
  })

});