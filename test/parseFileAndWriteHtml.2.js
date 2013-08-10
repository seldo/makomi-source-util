/**
 * Parse an HTML file into an object, write it back to HTML
 * Confirm the two are the same
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('parse an HTML file and re-output it', function (t) {

  t.plan(1);

  var inFile = "./test/data/parse.2.html"
  var outFile = "/tmp/parse.2.html"

  mkSrc.parseFile(inFile,function(er,dom) {
    testUtil.compareToExpectedOutput(t,inFile,function(cb) {
      mkSrc.writeHtml(outFile,dom,function(html) {
        console.log("Wrote HTML " + html)
        cb(html)
      })
    })
  })

});