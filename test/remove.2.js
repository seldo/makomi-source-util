/**
 * Remove an element (and all its children) from the tree
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var testUtil = require('./util.js')
var util = require('util')
var htmlparser = require("htmlparser");

test('remove the given element from the tree', function (t) {

  t.plan(1);

  var inFile = "./test/data/remove/2/before.html"
  var expectedFile = "./test/data/remove/2/after.html"
  var outFile = "/tmp/remove.2.html"
  var targetId = "12"

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.parseFile(inFile,function(er,dom) {
      mkSrc.remove(dom,targetId,function(newDom) {
        mkSrc.writeHtml(outFile,newDom,function(html) {
          cb(html)
        })
      })
    })
  })

});