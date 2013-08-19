/**
 * Parse a CSS file, add a new rule based on dom ID
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('add a new rule to a CSS file based on dom ID', function (t) {

  t.plan(1);

  var inFile = "./test/data/css/insertRule/before.css"
  var expectedFile = "./test/data/css/insertRule/after.css"
  var outFile = "/tmp/insertId.css"
  var newId = "xxxx3"
  var newProperties = {
    "font-family": "Times New Roman",
    "-moz-border-radius": "10px",
    "border-radius": "10px",
    "overflow-x": "hidden"
  }

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.css.parse(inFile,function(css) {
      var newCss = mkSrc.css.insertId(css,newId,newProperties)
      mkSrc.css.write(outFile,newCss,function(rawCss) {
        //console.log("Wrote CSS " + rawCss)
        cb(rawCss)
      })
    })
  })

});