var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('read JSON and write it as HTML', function (t) {

  t.plan(1);

  var inFile = "./test/data/write.json"
  var outFile = "/tmp/write.html"

  fs.readFile(inFile,'utf-8',function(er,data) {
    var dom = JSON.parse(data);
    mkSrc.writeHtml(outFile,dom,function(html) {
      console.log("Wrote HTML " + html)
    })
  })

});