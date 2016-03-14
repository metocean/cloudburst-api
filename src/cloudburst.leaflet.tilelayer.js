(function() {
  var logging,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  logging = true;

  L.CloudburstTileLayer = L.TileLayer.extend({
    options: {
      minZoom: 0,
      maxZoom: 17,
      tms: true,
      zoomOffset: 0,
      detectRetina: true
    },
    setUrl: void 0,
    initialize: function(serverurl, config, options) {
      var layer_i;
      if (!config.layers) {
        return;
      }
      this._host = serverurl;
      this._config = config;
      this._layers = this.getLayers();
      layer_i = 0;
      while (!this._instance && layer_i < this._layers.length) {
        this.setLayer(this._layers[layer_i], false);
        this.setInstance(this.getInstances()[0], false);
        if (!this._instance) {
          layer_i = layer_i + 1;
          console.log("WARNING: no instances of layer " + this._layer + " found");
        }
      }
      this.setTindex(this.getTindexes()[0], false);
      this.setRenderer('mpl', false);
      return L.TileLayer.prototype.initialize.call(this, "[cloudburst]/{z}/{x}/{y}.png", options);
    },
    getConfig: function() {
      return this._config;
    },
    getLayers: function(asObj) {
      var lyr, lyrs;
      if (this._config != null) {
        if ((asObj == null) || !asObj) {
          lyrs = Object.keys(this._config.layers);
        } else {
          lyrs = (function() {
            var _i, _len, _ref, _results;
            _ref = Object.keys(this._config.layers);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              lyr = _ref[_i];
              _results.push([lyr, this._config.layers[lyr]]);
            }
            return _results;
          }).call(this);
        }
        return lyrs;
      }
    },
    setLayer: function(layer, noRedraw) {
      if ((__indexOf.call(Object.keys(this._config.layers), layer) >= 0)) {
        this._layer = layer;
        if ((noRedraw == null) || !noRedraw) {
          this.redraw();
        }
        if (logging === true) {
          console.log("Layer set to: " + this._layer);
        }
      }
      return this;
    },
    getLayer: function() {
      return this._layer;
    },
    getLayerMetadata: function() {
      if (this._layer != null) {
        return this._config.layers[this._layer].meta;
      }
    },
    getLayerDescription: function() {
      if (this._layer != null) {
        return this.getLayerMetadata().description;
      }
    },
    getLayerName: function() {
      if (this._layer != null) {
        return this.getLayerMetadata().name;
      }
    },
    getLayerUnits: function() {
      if (this._layer != null) {
        return this.getLayerMetadata().units;
      }
    },
    getLayerPlotDefinitions: function() {
      if (this._layer) {
        return this._config.layers[this._layer].plot_defs;
      }
    },
    getInstances: function() {
      if (this._layer != null) {
        return Object.keys(this._config.layers[this._layer].instances);
      }
    },
    setInstance: function(instance, noRedraw) {
      if (instance == null) {
        console.log("WARNING: instance undefined");
      }
      if (__indexOf.call(this.getInstances(), instance) >= 0) {
        this._instance = instance;
        if ((noRedraw == null) || !noRedraw) {
          this.redraw();
        }
        if (logging === true) {
          console.log("Instance set to: " + this._instance);
        }
      }
      return this;
    },
    getInstance: function() {
      return this._instance;
    },
    getTindexes: function(asObj) {
      var i, tindexes;
      if ((this._instance != null) && (this._layer != null)) {
        tindexes = Object.keys(this._config.layers[this._layer].instances[this._instance].indexes);
        if ((asObj != null) && asObj) {
          tindexes = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tindexes.length; _i < _len; _i++) {
              i = tindexes[_i];
              _results.push([i, this._config.layers[this._layer].instances[this._instance].indexes[i]]);
            }
            return _results;
          }).call(this);
        }
      }
      return tindexes;
    },
    setTindex: function(tindex, noRedraw) {
      var _ref;
      if (_ref = tindex.toString(), __indexOf.call(this.getTindexes(), _ref) >= 0) {
        this._tindex = tindex.toString();
        if ((noRedraw == null) || !noRedraw) {
          this.redraw();
        }
        if (logging === true) {
          console.log("Tindex set to: " + this._tindex);
        }
      }
      return this;
    },
    getTindex: function(as_time_string) {
      if (as_time_string == null) {
        return this._tindex;
      } else {
        return this.getTindexes(true)[this._tindex][1];
      }
    },
    getRenderer: function() {
      return this._renderer;
    },
    setRenderer: function(renderer, noRedraw) {
      this._renderer = renderer;
      if ((noRedraw == null) || !noRedraw) {
        this.redraw();
      }
      return this;
    },
    back: function(noRedraw) {
      if (this._tindex != null) {
        if (parseInt(this._tindex) > 0) {
          return this.setTindex(Math.max(parseInt(this._tindex) - 1, 0), noRedraw);
        }
      }
    },
    forward: function(noRedraw) {
      if (this._tindex != null) {
        if (parseInt(this._tindex) < this.getTindexes().length - 1) {
          return this.setTindex(Math.min(parseInt(this._tindex) + 1, this.getTindexes().length - 1), noRedraw);
        }
      }
    },
    getTileUrl: function(coords) {
      return L.TileLayer.prototype.getTileUrl.call(this, coords).replace(/\[cloudburst\]/, "" + this._host + "/tile/" + this._renderer + "/" + this._layer + "/" + this._instance + "/" + this._tindex);
    },
    getTindexesAsPercetagePositions: function() {
      var diff, max_ts, min_ts, t, ts;
      ts = (function() {
        var _i, _len, _ref, _results;
        _ref = this.getTindexes(true);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          _results.push(Date.parse(t[1]) / 1000);
        }
        return _results;
      }).call(this);
      min_ts = Math.min.apply(null, ts);
      max_ts = Math.max.apply(null, ts);
      diff = max_ts - min_ts;
      return (function() {
        var _i, _len, _ref, _results;
        _ref = (function() {
          var _j, _len, _results1;
          _results1 = [];
          for (_j = 0, _len = ts.length; _j < _len; _j++) {
            t = ts[_j];
            _results1.push(t - min_ts);
          }
          return _results1;
        })();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          _results.push(t / diff * 100);
        }
        return _results;
      })();
    }
  });

  L.cloudburstTileLayer = function(hosturl, json, options) {
    return new L.CloudburstTileLayer(hosturl, json, options);
  };

}).call(this);
