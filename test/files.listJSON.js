/**
 * Various basic file operations
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')

test('list json files', function(t) {

  t.plan(1)

  var inDir = './test/data/files/'
  var expected = [
    'multi.part',
    'one',
    'two'
  ]

  mkSrc.files.listJSON(inDir,function(files) {
    t.deepEquals(files,expected)
  })

})