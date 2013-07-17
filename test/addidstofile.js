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

  t.plan(20);

  var infile = "./test/data/idify/default.html"
  var outfile = "/tmp/addidstofile.test"

  var expectedIds = 18 // the IDs themselves change every time

  // create a working copy
  fs.copy(infile,outfile,function() {
    mkSrc.addIdsToFile('',outfile,function(annotatedDom,newIds) {

      // verify as many IDs as elements
      t.equal(_.size(newIds),expectedIds)

      fs.readFile(outfile,'utf-8',function(er,html) {
        fs.readFile(infile,'utf-8',function(er,original) {

          // verify number of lines matches original
          t.equal(html.split("\n").length,original.split("\n").length)

          // verify we can find each ID in the file
          _.each(newIds,function(value,key,ids) {
            t.ok( html.indexOf(key) !== 0, 'found ' + key + ' in file' )
          })
        })
      })
    })
  })


});
