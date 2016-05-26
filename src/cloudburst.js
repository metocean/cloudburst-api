(function() {
  var Cloudburst, HOST;

  HOST = 'http://tapa01.unisys.metocean.co.nz';

  Cloudburst = (function() {
    function Cloudburst() {
      this.url = HOST + "/layer";
    }

    Cloudburst.prototype.loadConfiguration = function(cb) {
      return $.ajax({
        url: this.url,
        type: 'GET',
        jsonpCallback: 'read_layers_callback',
        dataType: 'jsonp',
        success: (function(_this) {
          return function(data, status, response) {
            if ((cb != null) && status === 'success') {
              return cb(data, HOST);
            }
          };
        })(this)
      });
    };

    return Cloudburst;

  })();

}).call(this);
