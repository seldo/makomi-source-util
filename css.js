var fs = require('fs-extra'),
  _ = require('underscore')
  css = require('css');

/**
 * Utility functions for CSS handling
 */

/**
 * Parse CSS into an object
 */
exports.parse = function(path,cb) {
  fs.readFile(path,'utf-8',function(er,rawCss) {
    var parsed = css.parse(rawCss)
    cb(parsed)
  })
}

/**
 * Write CSS object back to a file
 * @param obj
 * @param path
 * @param cb
 */
exports.write = function(path,obj,cb) {
  var stringified = css.stringify(obj);
  fs.writeFile(path,stringified,function(er) {
    if (er) throw er;
    cb(stringified)
  });
}

/**
 * If a stylesheet has a rule for this DOM id, modify it, otherwise
 * create a new rule for this DOM id.
 * @param tree
 * @param id
 * @param properties
 */
exports.insertOrModifyId = function(tree,id,properties) {
  return exports.insertOrModify(tree,'#'+id,properties)
}

/**
 * If a stylesheet has a matching rule, modify it, otherwise insert
 * a new rule
 * @param tree
 * @param selector
 * @param properties
 */
exports.insertOrModify = function(tree,selector,properties) {
  if (exports.hasRule(tree,selector)) {
    return exports.modify(tree,selector,properties)
  } else {
    return exports.insertRule(tree,selector,properties)
  }
}

/**
 * Find a rule that applies to a specific dom ID and set properties.
 * Existing properties are left unchanged. Properties set to null or
 * empty string will be deleted.
 * @param id
 * @param properties
 * @param cb
 */
exports.modifyId = function(tree,id,properties) {
  return exports.modify(tree,'#'+id,properties)
}

/**
 * Find a rule matching a selector and update the properties.
 * @param tree
 * @param id
 * @param properties
 * @returns {*}
 */
exports.modify = function(tree,selector,properties) {

  var modifyFn = function(declarations) {

    // modify any existing properties
    _.map(declarations,function(declaration,index) {
      var propertyName = declaration.property
      if (properties.hasOwnProperty(propertyName)) {
        if (declaration.value === null || declaration.value === '') {
          declaration = null
        } else {
          declaration.value = properties[propertyName]
        }
        delete(properties[propertyName])
      }
      return declaration;
    })

    // append any new properties
    _.each(properties,function(value,propertyName) {
      declarations.push({
        "type": "declaration",
        "property": propertyName,
        "value": value
      })
    })

    return declarations;

  }

  return exports.findRuleAndApply(tree,selector,modifyFn)

}

/**
 * CSS is both simpler and dumber than HTML. We can find IDs very simply,
 * but we cannot find them quickly.
 * @param tree
 * @param id
 * @param applyFn
 */
exports.findRuleAndApply = function(tree,selector,applyFn) {
  //console.log(util.inspect(tree,{depth:null}))
  _.map(tree.stylesheet.rules,function(rule,index) {
    if (_.contains(rule['selectors'],selector)) {
      rule.declarations = applyFn(rule.declarations)
    }
    return rule;
  })
  return tree;
}

/**
 * Like insertRule, except it assumes the selector is an ID.
 * @param tree
 * @param id
 * @param properties
 */
exports.insertId = function(tree,id,properties) {
  return exports.insertRule(tree,'#'+id,properties);
}

/**
 * Append a new rule to a stylesheet
 * @param tree
 * @param selector
 * @param properties
 * @returns {*}
 */
exports.insertRule = function(tree,selector,properties) {

  var rule = {
    "type": "rule",
    "selectors": [selector],
    "declarations": []
  }
  _.each(properties,function(value,propertyName) {
    rule.declarations.push({
      "type": "declaration",
      "property": propertyName,
      "value": value
    })
  })

  tree.stylesheet.rules.push(rule)

  return tree;
}

/**
 * Checks whether the given stylesheet has a rule for the given DOM id.
 * @param tree
 * @param id
 * @param cb
 */
exports.hasId = function(tree,id) {
  return exports.hasRule(tree,'#'+id)
}

/**
 * Checks whether a given stylesheet contains any rule with the given selector.
 * NB: returns false if not found, true if any found -- can match more than one
 * @param tree
 * @param selector
 * @param cb
 */
exports.hasRule = function(tree,selector) {
  //console.log(util.inspect(tree.stylesheet.rules,{depth:null}))
  var found = false;
  tree.stylesheet.rules.forEach(function(rule,index) {
    if (_.contains(rule['selectors'],selector)) {
      found = true
    }
  })
  return found
}
