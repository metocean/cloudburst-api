var logging,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

logging = false;

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
    if (!config.layers) {
      return;
    }
    this._host = serverurl;
    this._config = config;
    this._layers = this.getLayers();
    this.setLayer(this._layers[0], false);
    this.setInstance(this.getInstances()[0], false);
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
          var j, len, ref, results;
          ref = Object.keys(this._config.layers);
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            lyr = ref[j];
            results.push([lyr, this._config.layers[lyr]]);
          }
          return results;
        }).call(this);
      }
      return lyrs;
    }
  },
  setLayer: function(layer, noRedraw) {
    if ((indexOf.call(Object.keys(this._config.layers), layer) >= 0)) {
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
    if (indexOf.call(this.getInstances(), instance) >= 0) {
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
          var j, len, results;
          results = [];
          for (j = 0, len = tindexes.length; j < len; j++) {
            i = tindexes[j];
            results.push([i, this._config.layers[this._layer].instances[this._instance].indexes[i]]);
          }
          return results;
        }).call(this);
      }
    }
    return tindexes;
  },
  setTindex: function(tindex, noRedraw) {
    var ref;
    if (ref = tindex.toString(), indexOf.call(this.getTindexes(), ref) >= 0) {
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
    return L.TileLayer.prototype.getTileUrl.call(this, coords).replace(/\[cloudburst\]/, this._host + "/tile/" + this._renderer + "/" + this._layer + "/" + this._instance + "/" + this._tindex);
  },
  getTindexesAsPercetagePositions: function() {
    var diff, max_ts, min_ts, t, ts;
    ts = (function() {
      var j, len, ref, results;
      ref = this.getTindexes(true);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        t = ref[j];
        results.push(Date.parse(t[1]) / 1000);
      }
      return results;
    }).call(this);
    min_ts = Math.min.apply(null, ts);
    max_ts = Math.max.apply(null, ts);
    diff = max_ts - min_ts;
    return (function() {
      var j, len, ref, results;
      ref = (function() {
        var k, len, results1;
        results1 = [];
        for (k = 0, len = ts.length; k < len; k++) {
          t = ts[k];
          results1.push(t - min_ts);
        }
        return results1;
      })();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        t = ref[j];
        results.push(t / diff * 100);
      }
      return results;
    })();
  }
});

L.cloudburstTileLayer = function(hosturl, json, options) {
  return new L.CloudburstTileLayer(hosturl, json, options);
};
