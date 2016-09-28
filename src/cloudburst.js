var CBCONFIG, Cloudburst, ajax;

CBCONFIG = {
  "host": 'http://172.16.1.13:8080/v0',
  "layers": 'http://172.16.1.15/v0/wxtiles/layer'
};

ajax = function(uri, method, data) {
  var request;
  if (!uri.endsWith('/')) {
    uri = uri + '/';
  }
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
    this.layersURI = "" + CBCONFIG.layers;
  }

  Cloudburst.prototype.loadConfiguration = function(cb) {
    return ajax(this.layersURI, 'GET').done(function(layers) {
      if (cb != null) {
        cb(layers);
      }
      return cb;
    });
  };

  Cloudburst.prototype.loadLayer = function(layerID, cb) {
    return ajax([this.layersURI, layerID].join('/'), 'GET').done(function(layer) {
      if (cb != null) {
        cb(layer);
      }
      return cb;
    });
  };

  Cloudburst.prototype.loadInstance = function(layerID, instanceID, cb) {
    return ajax([this.layersURI, layerID, 'instance', instanceID].join('/'), 'GET').done(function(instance) {
      if (cb != null) {
        cb(instance);
      }
      return cb;
    });
  };

  Cloudburst.prototype.loadTimes = function(layerID, instanceID, cb) {
    return ajax([this.layersURI, layerID, 'instance', instanceID, 'times'].join('/'), 'GET').done(function(times) {
      if (cb != null) {
        cb(times);
      }
      return cb;
    });
  };

  Cloudburst.prototype.loadLevels = function(layerID, instanceID, cb) {
    return ajax([this.layersURI, layerID, 'instance', instanceID, 'levels'].join('/'), 'GET').done(function(levels) {
      if (cb != null) {
        cb(levels);
      }
      return cb;
    });
  };

  return Cloudburst;

})();
