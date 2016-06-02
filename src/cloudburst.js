var Cloudburst, HOST, ajax;

HOST = 'http://localhost:9090';

ajax = function(uri, method, data) {
  var request;
  console.log(method + ' request to ' + uri);
  request = {
    url: uri,
    type: method,
    contentType: "application/json",
    accepts: "application/json",
    cache: false,
    dataType: 'json',
    data: JSON.stringify(data),
    error: function(jqXHR) {
      return console.log("ajax error " + jqXHR.status);
    }
  };
  return $.ajax(request);
};

Cloudburst = (function() {
  function Cloudburst() {
    this.layersURI = "http://localhost:9090/wxtiles/layer";
  }

  Cloudburst.prototype.loadConfiguration = function(cb) {
    return ajax(this.layersURI, 'GET').done(function(layers) {
      if (cb != null) {
        return cb(layers);
      }
    });
  };

  Cloudburst.prototype.loadLayer = function(layerID, cb) {
    return ajax([this.layersURI, layerID].join('/'), 'GET').done(function(layer) {
      if (cb != null) {
        return cb(layer);
      }
    });
  };

  Cloudburst.prototype.loadInstance = function(layerID, instanceID, cb) {
    return ajax([this.layersURI, layerID, instanceID].join('/'), 'GET').done(function(instance) {
      if (cb != null) {
        return cb(instance);
      }
    });
  };

  Cloudburst.prototype.loadTimes = function(layerID, instanceID, cb) {
    return ajax([this.layersURI, layerID, instanceID, 'times/'].join('/'), 'GET').done(function(times) {
      if (cb != null) {
        return cb(times);
      }
    });
  };

  return Cloudburst;

})();
