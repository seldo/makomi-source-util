var test = require('tape');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')
var mkSrc = require('../index.js');

test('save a config file', function (t) {

  t.plan(1);

  var inFile = "./test/data/config/get.json"
  var outFile = "/tmp/config.set.json"
  var expectedFile = "./test/data/config/set.json"

  mkSrc.config.resetConfig()
  mkSrc.config.setConfigFileLocation(outFile)

  // copy the inFile to the outfile location, as set() will read from there
  fs.copy(inFile,outFile,function(er) {
    testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
      // change a key
      mkSrc.config.set("key3.key32.key322","changedvalue1",function() {
        // create a new key
        mkSrc.config.set("key4.key42.key421","newvalue1",function() {
          // read the file back and compare it to our expected file
          fs.readFile(outFile,'utf-8',function(er,data) {
            cb(data)
          })
        })
      })
    })
  })

});