/**
 * Add IDs to all the files in a directory
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')

test('id-ify all the files in a directory', function (t) {

  t.plan(2);

  var indir = "./test/data/"
  var outdir = "/tmp/idify/"

  fs.copy(indir,outdir+'views/',function() {
    mkSrc.idify(outdir,function(fileMaps,idMap) {
      console.log("Filemap:")
      console.log(util.inspect(fileMaps,{depth:null}))
      console.log("IDmap:")
      console.log(idMap)
    })
  })


});
