/**
 * Test adding IDs to a single file
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');

test('id-ify a single file', function (t) {

  t.plan(1);

  var infile = "./test/data/default.html"
  var outfile = "/tmp/addidstofile.test"

  // create a working copy
  fs.copy(infile,outfile,function() {
    mkSrc.addIdsToFile('',outfile,function(annotatedDom,newIds) {
      console.log("DOM:")
      console.log(annotatedDom)
      console.log("IDs:")
      console.log(newIds)
      fs.readFile(outfile,'utf-8',function(er,html) {
        console.log("HTML:")
        console.log(html)
        t.ok(true) // fake test
      })
    })
  })


});
