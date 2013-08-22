var test = require('tape');
var fs = require('fs-extra');
var util = require('util');
var _ = require('underscore')
var testUtil = require('./util.js')
var mkSrc = require('../index.js');

test('load a datasource object', function (t) {

  t.plan(1);

  var sourceDir = "./test/data/"
  var datasourceName = "userdb"

  mkSrc.loadDatasource(sourceDir,datasourceName,function(data) {
    t.equals(data.adapter,'makomi-adapter-mysql')
  })

});