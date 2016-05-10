var Cloudburst;

Cloudburst = (function() {
  function Cloudburst() {
    this.url = 'http://localhost:6060';
  }

  Cloudburst.prototype.loadConfiguration = function(cb) {
    var json_config;
    json_config = JSON.parse(JSON.stringify(this.url));
    json_config = json_config.replace(/{s}/, '');
    json_config += '/layer?show=times';
    return $.ajax({
      url: json_config,
      type: 'GET',
      jsonpCallback: 'read_layers_callback',
      dataType: 'jsonp',
      success: (function(_this) {
        return function(data, status, response) {
          if ((cb != null) && status === 'success') {
            return cb(data, _this.url);
          }
        };
      })(this)
    });
  };

  return Cloudburst;

})();
