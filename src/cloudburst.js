// Generated by CoffeeScript 1.9.3
var Cloudburst;

Cloudburst = (function() {
  function Cloudburst(url) {
    this.url = url;
  }

  Cloudburst.prototype.do_log = function() {
    console.log(this.url);
  };

  Cloudburst.prototype.loadConfiguration = function(cb) {
    var resource;
    resource = this.url.replace(/{s}/, '');
    resource += '/layers.jsonp?callback=read_layers_callback';
    return $.ajax({
      url: resource,
      type: 'GET',
      jsonpCallback: 'read_layers_callback',
      dataType: 'jsonp',
      success: function(data, status, response) {
        if (cb && status === 'success') {
          return cb(data);
        }
      }
    });
  };

  return Cloudburst;

})();
