/**
 * Replace an element with new element(s)
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var testUtil = require('./util.js')
var util = require('util')
var htmlparser = require("htmlparser");

test('replace the given element with a new one', function (t) {

  t.plan(1);

  var inFile = "./test/data/replace/before.html"
  var expectedFile = "./test/data/replace/after.html"
  var outFile = "/tmp/replace.html"
  var targetId = "xxxxx6"
  var newHtml = '<div makomi-id="xxxxx61"><span makomi-id="xxxxx62">New stuff</span></div>'

  var handler = new htmlparser.DefaultHandler(function (error, replaceDom) {
    testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
      mkSrc.parseFile(inFile,function(er,dom) {
        mkSrc.replace(dom,targetId,replaceDom,function(newDom) {
          mkSrc.writeHtml(outFile,newDom,function(html) {
            cb(html)
          })
        })
      })
    })
  });
  var parser = new htmlparser.Parser(handler);
  parser.parseComplete(newHtml);




});