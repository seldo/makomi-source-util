/**
 * Parse a CSS file, modify an ID-based rule or append a new one as appropriate
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('Parse a CSS file, modify an ID-based rule or append a new one as appropriate', function (t) {

  t.plan(1);

  var inFile = "./test/data/css/insertOrModifyId/before.css"
  var expectedFile = "./test/data/css/insertOrModifyId/after.css"
  var outFile = "/tmp/insertOrModifyId.css"

  var modifyId = "xxxx1"
  var modifyProperties = {
    "position": "relative",
    "left": "200px",
    "top": "100px"
  }

  var newId = "xxxx3"
  var newProperties = {
    "font-family": "Times New Roman",
    "-moz-border-radius": "10px",
    "border-radius": "10px",
    "overflow-x": "hidden"
  }

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.css.parse(inFile,function(css) {
      console.log(css)
      var newCss1 = mkSrc.css.insertOrModifyId(css,modifyId,modifyProperties)
      var newCss2 = mkSrc.css.insertOrModifyId(newCss1,newId,newProperties)
      mkSrc.css.write(outFile,newCss2,function(rawCss) {
        console.log("Wrote CSS " + rawCss)
        cb(rawCss)
      })
    })
  })

});