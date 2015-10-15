var cloudburst;

cloudburst = (function() {
  function cloudburst() {}

  cloudburst.prototype.do_log = function(url) {
    return console.log(url);
  };

  return cloudburst;

})();

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = new cloudburst();
} else if (typeof define === 'function' && define.amd) {
  define(new cloudburst());
} else if (typeof window !== "undefined" && window !== null) {
  window.wxtiles = new cloudburst();
}
