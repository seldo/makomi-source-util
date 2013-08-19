var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('read JSON and write it as HTML', function (t) {

  t.plan(1);

  var inFile = "./test/data/writeHtml/read.json"
  var outFile = "/tmp/writeHtml.html"
  var expectedFile = "./test/data/writeHtml/write.html"

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    fs.readJson(inFile,function(er,dom) {
      mkSrc.writeHtml(outFile,dom,function(html) {
        console.log("Wrote HTML " + html)
        cb(html)
      })
    })
  })

});