/**
 * Wraps async functions to handle errors without try/catch blocks
 * @param {Function} fn - The async function to wrap
 * @returns {Function} The wrapped function
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}; 