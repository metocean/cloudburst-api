var CloudburstOL3, logging,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

logging = false;

CloudburstOL3 = (function() {
  function CloudburstOL3(config, host) {
    this.setOL3LayerTile = bind(this.setOL3LayerTile, this);
    this._host = host;
    this._config = config;
    this._layers = this.getLayers();
    this._htmlattr = '&copy;<a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>';
    this.setLayer(this._layers[0], false);
    this.setInstance(this.getInstances()[0], false);
    this.setTindex(this.getTindexes()[0], false);
    this.setLevel(this._levels[0], false);
    this.setRenderer('mpl', false);
    this.tileLayer = void 0;
    this;
  }

  CloudburstOL3.prototype.getAttribution = function() {
    var attr;
    attr = new ol.Attribution({
      html: this._htmlattr
    });
    return attr;
  };

  CloudburstOL3.prototype.redraw = function() {
    if (this.tileLayer != null) {
      return this.tileLayer.getSource().changed();
    }
  };

  CloudburstOL3.prototype.tileUrl = function(tileCoord, pixelRatio, projection) {
    var x, y, z;
    z = tileCoord[0];
    x = tileCoord[1];
    y = tileCoord[2] + (1 << z);
    return this._host + "/tile/" + this._renderer + "/" + this._layer + "/" + this._instance + "/" + this._tindex + "/" + z + "/" + x + "/" + y + ".png";
  };

  CloudburstOL3.prototype.setOL3LayerTile = function(options) {
    var tileLayer;
    options = options == null ? {} : options;
    tileLayer = new ol.layer.Tile({
      brightness: options.brightness != null ? options.brightness : void 0,
      contrast: options.contrast != null ? options.contrast : void 0,
      hue: options.hue != null ? options.hue : void 0,
      opacity: options.opacity != null ? options.opacity : void 0,
      preload: options.preload != null ? options.preload : void 0,
      saturation: options.saturation != null ? options.saturation : void 0,
      visible: options.visible != null ? options.visible : void 0,
      extent: options.extent != null ? options.extent : void 0,
      minResolution: options.minResolution != null ? options.minResolution : void 0,
      maxResolution: options.maxResolution != null ? options.maxResolution : void 0,
      userInterimTilesOnError: options.userInterimTilesOnError != null ? options.userInterimTilesOnError : void 0,
      source: new ol.source.XYZ({
        attributions: [this.getAttribution()],
        tileUrlFunction: (function(_this) {
          return function(tileCoord, pixelRatio, projection) {
            return _this.tileUrl(tileCoord, pixelRatio, projection);
          };
        })(this)
      })
    });
    this.tileLayer = tileLayer;
    return this.tileLayer;
  };

  CloudburstOL3.prototype.getConfig = function() {
    return this._config;
  };

  CloudburstOL3.prototype.getLayers = function(asObj) {
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
  };

  CloudburstOL3.prototype.setLayer = function(layer, noRedraw) {
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
  };

  CloudburstOL3.prototype.getLayer = function() {
    return this._layer;
  };

  CloudburstOL3.prototype.getLayerLegendUrl = function(size, orientation) {
    var layerurl;
    if ((size == null) || !size) {
      size = "small";
    }
    if ((orientation == null) || !orientation) {
      orientation = "horiztonal";
    }
    layerurl = this._host + "/legend/" + size + "/" + orientation + "/" + (this.getLayer()) + "/" + (this.getInstance()) + ".png";
    return layerurl;
  };

  CloudburstOL3.prototype.getLayerMetadata = function() {
    if (this._layer != null) {
      return this._config.layers[this._layer].meta;
    }
  };

  CloudburstOL3.prototype.getLayerDescription = function() {
    if (this._layer != null) {
      return this.getLayerMetadata().description;
    }
  };

  CloudburstOL3.prototype.getLayerName = function() {
    if (this._layer != null) {
      return this.getLayerMetadata().name;
    }
  };

  CloudburstOL3.prototype.getLayerUnits = function() {
    if (this._layer != null) {
      return this.getLayerMetadata().units;
    }
  };

  CloudburstOL3.prototype.getLayerPlotDefinitions = function() {
    if (this._layer) {
      return this._config.layers[this._layer].plot_defs;
    }
  };

  CloudburstOL3.prototype.getInstances = function() {
    if (this._layer != null) {
      return Object.keys(this._config.layers[this._layer].instances);
    }
  };

  CloudburstOL3.prototype.setInstance = function(instance, noRedraw) {
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
  };

  CloudburstOL3.prototype.getInstance = function() {
    return this._instance;
  };

  CloudburstOL3.prototype.getLevels = function(asObj) {
    var i, levels;
    if ((this._instance != null) && (this._layer != null)) {
      levels = Object.keys(this._config.layers[this._layer].instances[this._instance].levels);
      if ((asObj != null) && asObj) {
        levels = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = levels.length; j < len; j++) {
            i = levels[j];
            results.push([i, this._config.layers[this._layer].instances[this._instance].levels[i]]);
          }
          return results;
        }).call(this);
      }
    }
    return levels;
  };

  CloudburstOL3.prototype.setLevel = function(level, noRedraw) {
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
  };

  CloudburstOL3.prototype.getLevel = function() {
    return this._level;
  };

  CloudburstOL3.prototype.getTindexes = function(asObj) {
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
  };

  CloudburstOL3.prototype.setTindex = function(tindex, noRedraw) {
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
  };

  CloudburstOL3.prototype.getTindex = function(as_time_string) {
    if (as_time_string == null) {
      return this._tindex;
    } else {
      return this.getTindexes(true)[this._tindex][1];
    }
  };

  CloudburstOL3.prototype.getRenderer = function() {
    return this._renderer;
  };

  CloudburstOL3.prototype.setRenderer = function(renderer, noRedraw) {
    this._renderer = renderer;
    if ((noRedraw == null) || !noRedraw) {
      this.redraw();
    }
    return this;
  };

  CloudburstOL3.prototype.back = function(noRedraw) {
    if (this._tindex != null) {
      if (parseInt(this._tindex) > 0) {
        return this.setTindex(Math.max(parseInt(this._tindex) - 1, 0), noRedraw);
      }
    }
  };

  CloudburstOL3.prototype.forward = function(noRedraw) {
    if (this._tindex != null) {
      if (parseInt(this._tindex) < this.getTindexes().length - 1) {
        return this.setTindex(Math.min(parseInt(this._tindex) + 1, this.getTindexes().length - 1), noRedraw);
      }
    }
  };

  CloudburstOL3.prototype.higher = function(noRedraw) {
    if (this._layer != null) {
      if (parseInt(this._layer) < this.getLayers().length - 1) {
        return this.getLayers(Math.min(parseInt(this._layer) + 1, this.getLayers().length - 1), noRedraw);
      }
    }
  };

  CloudburstOL3.prototype.deeper = function(noRedraw) {
    if (this._layer != null) {
      if (parseInt(this._layer) > 0) {
        return this.setLayer(Math.max(parseInt(this._layer) - 1, 0), noRedraw);
      }
    }
  };

  CloudburstOL3.prototype.getTindexesAsPercetagePositions = function() {
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
  };

  return CloudburstOL3;

})();
