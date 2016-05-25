var logging,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

logging = true;

L.CloudburstTileLayer = L.TileLayer.extend({
  options: {
    minZoom: 0,
    maxZoom: 17,
    tms: true,
    zoomOffset: 0,
    detectRetina: true
  },
  initialize: function(cloudbursturl, config, options) {
    var layer_i;
    if (!config) {
      return;
    }
    this._host = cloudbursturl;
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
    this.setLevel(this.getLevels()[0], false);
    this.setRenderer('mpl', false);
    return L.TileLayer.prototype.initialize.call(this, "[cloudburst]/{z}/{x}/{y}.png", options);
  },
  getConfig: function() {
    return this._config;
  },
  getLayers: function(asObj, sorted) {
    var lyr, lyrs;
    sorted = sorted != null ? sorted : true;
    if (this._config != null) {
      if ((asObj == null) || !asObj) {
        lyrs = Object.keys(this._config);
      } else {
        lyrs = (function() {
          var j, len, ref, results;
          ref = Object.keys(this._config);
          results = [];
          for (j = 0, len = ref.length; j < len; j++) {
            lyr = ref[j];
            results.push([lyr, this._config[lyr]]);
          }
          return results;
        }).call(this);
      }
      if (sorted) {
        lyrs.sort();
      }
      return lyrs;
    }
  },
  setLayer: function(layer, noRedraw) {
    if ((indexOf.call(Object.keys(this._config), layer) >= 0)) {
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
  getLayerLegendUrl: function(size, orientation) {
    var layerurl;
    if ((size == null) || !size) {
      size = "small";
    }
    if ((orientation == null) || !orientation) {
      orientation = "horiztonal";
    }
    layerurl = this._host + "/legend/" + size + "/" + orientation + "/" + (this.getLayer()) + "/" + (this.getInstance()) + ".png";
    return layerurl;
  },
  getBounds: function() {
    var bounds;
    if ((this._layer != null) && (this._instance != null)) {
      bounds = this._config[this._layer]['dataset'][this._instance]['bounds'];
      return new L.latLngBounds(L.latLng(bounds['south'], bounds['west']), L.latLng(bounds['north'], bounds['east']));
    }
  },
  getLayerMetadata: function() {
    if ((this._layer != null) && (this._instance != null)) {
      return this._config[this._layer].meta;
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
  getLayerUnitSystem: function() {
    if (this._layer != null) {
      return this.getLayerMetadata().unit_system;
    }
  },
  getLayerPlotDefinitions: function() {
    if (this._layer) {
      return this._config.layers[this._layer].plot_defs;
    }
  },
  getInstances: function(asObj, sorted) {
    var i, instances;
    sorted = sorted != null ? sorted : true;
    if (this._layer != null) {
      instances = Object.keys(this._config[this._layer]['dataset']);
      if ((asObj != null) && asObj) {
        instances = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = instances.length; j < len; j++) {
            i = instances[j];
            results.push([i, this._config[this._layer]['dataset'][i]]);
          }
          return results;
        }).call(this);
      }
      if (sorted) {
        instances.sort().reverse();
      }
      return instances;
    }
  },
  setInstance: function(instance, noRedraw) {
    if (instance == null) {
      console.log("WARNING: instance undefined");
    }
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
  getLevels: function(asObj) {
    var i, levels;
    if ((this._instance != null) && (this._layer != null) && indexOf.call(Object.keys(this._config[this._layer]['dataset'][this._instance]), 'levels') >= 0) {
      levels = Object.keys(this._config[this._layer]['dataset'][this._instance]['levels']);
      if ((asObj != null) && asObj) {
        levels = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = levels.length; j < len; j++) {
            i = levels[j];
            results.push([i, this._config[this._layer]['dataset'][this._instance]['levels'][i]]);
          }
          return results;
        }).call(this);
      }
      return levels;
    }
    if (!asObj) {
      return ["0"];
    } else {
      return {
        "0": void 0
      };
    }
  },
  setLevel: function(level, noRedraw) {
    var ref;
    if (ref = level.toString(), indexOf.call(this.getLevels(), ref) >= 0) {
      this._level = level.toString();
      if ((noRedraw == null) || !noRedraw) {
        this.redraw();
      }
      if (logging === true) {
        console.log("Level set to: " + this._level);
      }
    }
    return this;
  },
  getLevel: function() {
    return this._level;
  },
  getTindexes: function(asObj) {
    var i, tindexes;
    if ((this._instance != null) && (this._layer != null) && indexOf.call(Object.keys(this._config[this._layer]['dataset'][this._instance]), 'times') >= 0) {
      tindexes = Object.keys(this._config[this._layer]['dataset'][this._instance].times);
      if ((asObj != null) && asObj) {
        tindexes = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = tindexes.length; j < len; j++) {
            i = tindexes[j];
            results.push([i, this._config[this._layer]['dataset'][this._instance].times[i]]);
          }
          return results;
        }).call(this);
      }
      return tindexes;
    }
    if (!asObj) {
      return ["0"];
    } else {
      return [["0", void 0]];
    }
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
  higher: function(noRedraw) {
    if (logging === true) {
      console.log("Going higher: " + this._level);
    }
    if (parseInt(this._level) > 0) {
      return this.setLevel(Math.max(parseInt(this._level) - 1, 0), noRedraw);
    }
  },
  deeper: function(noRedraw) {
    if (logging === true) {
      console.log("Going deeper: " + this._level);
    }
    if (parseInt(this._level) < this.getLevels().length - 1) {
      return this.setLevel(Math.min(parseInt(this._level) + 1, this.getLevels().length - 1), noRedraw);
    }
  },
  getTileUrl: function(coords) {
    return L.TileLayer.prototype.getTileUrl.call(this, coords).replace(/\[cloudburst\]/, this._host + "/tile/" + this._renderer + "/" + this._layer + "/" + this._instance + "/" + this._tindex + "/" + this._level);
  },
  getTindexesAsPercetagePositions: function() {
    var diff, max_ts, min_ts, t, ts;
    ts = (function() {
      var j, len, ref, results;
      ref = this.getTindexes();
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        t = ref[j];
        results.push(moment(t[1], moment.ISO_8601) / 1000);
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

L.cloudburstTileLayer = function(cloudbursturl, json, options) {
  return new L.CloudburstTileLayer(cloudbursturl, json, options);
};
