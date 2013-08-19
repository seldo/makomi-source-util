/**
 * Parse a CSS file, write it back, confirm no change.
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('parse a CSS file and re-output it', function (t) {

  t.plan(1);

  var inFile = "./test/data/css/parseAndWrite.css"
  var outFile = "/tmp/parseAndWrite.css"

  mkSrc.css.parse(inFile,function(css) {
    testUtil.compareToExpectedOutput(t,inFile,function(cb) {
      mkSrc.css.write(outFile,css,function(rawCss) {
        //console.log("Wrote CSS " + rawCss)
        cb(rawCss)
      })
    })
  })

});