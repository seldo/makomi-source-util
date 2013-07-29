/**
 * Javascript's Array.splice() method is fucking useless.
 *
 * Usage:
 * var parent = [1,2,99,5,6]
 * var splice = [3,4]
 * var removed = array-splice.splice(parent,2,1,splice)
 *
 * Now:
 * parent = [1,2,3,4,5,6]
 * removed = [99]
 *
 * @param parentArray   The array into which you want to splice
 * @param index         The index of the element to start at
 * @param length        How many elements to remove
 * @param arrayToInsert The elements to insert in the gap
 */
exports.splice = function(parentArray, index, length, arrayToInsert) {
  return Array.prototype.splice.apply(parentArray, [index, length].concat(arrayToInsert));
}