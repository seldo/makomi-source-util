var fs = require('fs-extra')

/**
 * Given a test case, reads the expected output of an operation from a file
 * and compares it line-by-line to the value passed back to the callback of
 * toCompare, e.g.
 * util.compareToExpectedOutput(t,expectedFilePath,function(cb) {
 *   // do your operation
 *   cb(outputOfOperation)
 * })
 * @param test
 * @param expectedOutputFile
 * @param toCompare
 */

exports.compareToExpectedOutput = function(test,expectedOutputFile,toCompare) {

  toCompare(function(output) {
    fs.readFile(
      expectedOutputFile,
      'utf-8',
      function(er,expected) {
        var outputLines = output.split("\n")
        var expectedLines = expected.split("\n")

        test.plan(outputLines.length)

        outputLines.forEach(function(line,index) {
          test.equal(line,expectedLines[index])
        })
      }
    )
  })
}