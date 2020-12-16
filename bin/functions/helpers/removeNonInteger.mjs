/**
 * Remove all non integer values from a string
 *
 * @exports
 * @function
 * @param {string} str - The string which is to be parsed
 * @returns {string} - The final string
 */
export function removeNonIntegerValues(str) {
  return str.replace(/\D+/, '');
}
