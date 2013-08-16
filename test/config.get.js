var test = require('tape');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('get a value from a config file', function (t) {

  t.plan(1);

  var inFile = "./test/data/config/get.json"
  var key = "key3.key32.key322"
  var expectedValue = "value322"

  process.env.MAKOMICONF = inFile;

  var mkSrc = require('../index.js'); // do this here to get process value

  mkSrc.config.get(key,function(value) {
    t.equals(value,expectedValue)
  })

});