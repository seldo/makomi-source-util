/**
 * Parse a CSS file, modify
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('parse a CSS file and re-output it', function (t) {

  t.plan(1);

  var inFile = "./test/data/css/modifyId/before.css"
  var expectedFile = "./test/data/css/modifyId/after.css"
  var outFile = "/tmp/modifyId.css"
  var targetId = "xxxx1"
  var newProperties = {
    "position": "relative",
    "left": "200px",
    "top": "100px"
  }

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.css.parse(inFile,function(css) {
      mkSrc.css.modifyId(css,targetId,newProperties,function(newCss) {
        mkSrc.css.write(outFile,newCss,function(rawCss) {
          console.log("Wrote CSS " + rawCss)
          cb(rawCss)
        })
      })
    })
  })

});