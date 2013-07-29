/**
 * Insert an element before the selected element
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var testUtil = require('./util.js')
var util = require('util')
var htmlparser = require("htmlparser");

test('insert an element before the target element in the tree', function (t) {

  t.plan(1);

  var inFile = "./test/data/insertBefore/before.html"
  var expectedFile = "./test/data/insertBefore/after.html"
  var outFile = "/tmp/insertBefore.html"
  var targetId = "xxxxx6"
  var newHtml = "<h1 makomi-id=\"yyyyy1\">I'm a new element</h1>"


  var handler = new htmlparser.DefaultHandler(function (error, insertDom) {
    testUtil.compareToExpectedOutput(t,expectedFile,function(cb) {
      mkSrc.parseFile(inFile,function(er,dom) {
        mkSrc.insertBefore(dom,targetId,insertDom,function(newDom) {
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