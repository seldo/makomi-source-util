/**
 * Remove IDs from a file
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')

test('remove IDs from a file', function (t) {

  t.plan(1);

  var inFile = "./test/data/idified.html"
  var expectedFile = "./test/data/un-idified.html"

  mkSrc.parseFile(inFile,function(er,dom) {
    mkSrc.removeIds(dom,function(newDom) {
      mkSrc.toHtml(newDom,function(er,html) {
        fs.readFile(expectedFile,'utf-8',function(er,data) {
          t.equal(html,data)
        })
      })
    })
  })

});