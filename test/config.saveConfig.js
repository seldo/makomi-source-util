var test = require('tape');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('save a config file', function (t) {

  t.plan(1);

  var outFile = "/tmp/config.saveConfig.json"
  var expectedFile = "./test/data/config/loadConfig.json"
  var config = {
    "workspace": "/Users/seldo/Workspace/Makomi/makomi/workspace/",
    "scratchpad": "/tmp/makomi/",
    "sessions": {
      "key": "mks",
      "secret": "this is totes a secret"
    }
  }

  process.env.MAKOMICONF = outFile;

  var mkSrc = require('../index.js'); // do this here to get process value

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.config.saveConfig(config,function() {
      fs.readFile(outFile,'utf-8',function(er,data) {
        cb(data)
      })
    })
  })

});