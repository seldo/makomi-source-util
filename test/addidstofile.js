/**
 * Test adding IDs to a single file
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')

test('id-ify a single file', function (t) {

  t.plan(2);

  var infile = "./test/data/default.html"
  var outfile = "/tmp/addidstofile.test"

  var expectedIds = 18 // the IDs themselves change every time

  // create a working copy
  fs.copy(infile,outfile,function() {
    mkSrc.addIdsToFile('',outfile,function(annotatedDom,newIds) {
      t.equal(_.size(newIds),expectedIds)
      fs.readFile(outfile,'utf-8',function(er,html) {
        // can't compare file directly because the IDs change all the time
        fs.readFile(infile,'utf-8',function(er,original) {
          t.equal(html.split("\n").length,original.split("\n").length)
        })
      })
    })
  })


});
