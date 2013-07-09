/**
 * Test adding IDs to a single file
 * @type {*}
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');

test('id-ify a single file', function (t) {

  t.plan(1);

  var file = "./test/data/default.html"

  mkSrc.idify()

});
