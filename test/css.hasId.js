/**
 * Check a CSS file contains a rule for the given id
 */
var test = require('tape');
var mkSrc = require('../index.js');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')

test('CSS file has a rule for the given ID', function (t) {

  t.plan(2);

  var inFile = "./test/data/css/hasId.css"
  var targetId1 = "xxxx1"
  var targetId2 = "xxxx2"

  mkSrc.css.parse(inFile,function(css) {
    t.ok(mkSrc.css.hasId(css,targetId1),"has ID " + targetId1);
    t.notOk(mkSrc.css.hasId(css,targetId2), "does not have ID " + targetId2);
  })

});