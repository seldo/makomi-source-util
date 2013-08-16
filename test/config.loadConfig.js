var test = require('tape');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('load a config file', function (t) {

  t.plan(1);

  var inFile = "./test/data/config/loadConfig.json"
  var expected = {
    "workspace": "/Users/seldo/Workspace/Makomi/makomi/workspace/",
    "scratchpad": "/tmp/makomi/",
    "sessions": {
      "key": "mks",
      "secret": "this is totes a secret"
    }
  }

  process.env.MAKOMICONF = inFile;

  var mkSrc = require('../index.js'); // do this here to get process value

  mkSrc.config.loadConfig(function(config) {
    t.deepEquals(config,expected)
  })

});