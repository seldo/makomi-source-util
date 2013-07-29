/**
 * Set the value of text in a given tree.
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var testUtil = require('./util.js')
var util = require('util')

test('change the text content of one element exactly.', function (t) {

  t.plan(1);

  var inFile = "./test/data/setTextContent/before.html"
  var expectedFile = "./test/data/setTextContent/after.html"
  var outFile = "/tmp/setTextContent.html"
  var changeId = "xxxxx5"
  var newContent = "I have been changed\n      "

  testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
    mkSrc.parseFile(inFile,function(er,dom) {
      mkSrc.setTextContent(dom,changeId,newContent,function(newDom) {
        mkSrc.writeHtml(outFile,newDom,function(html) {
          cb(html)
        })
      })
    })
  })

});