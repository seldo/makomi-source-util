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

  t.plan(1);

  var indir = "./test/data/"
  var outdir = "/tmp/idify/"
  var copyDest = outdir + 'views/'

  fs.mkdirs(copyDest,function() {
    fs.copy(indir,copyDest,function() {
      mkSrc.idify(outdir,function(fileMaps,idMap) {
        // verify expected number of IDs in map
        t.equals(_.size(idMap),46)
      })
    })
  })


});