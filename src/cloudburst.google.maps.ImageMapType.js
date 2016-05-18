var CloudburstMapType, logging,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

logging = true;

CloudburstMapType = function(config, host, map) {
  this.tileSize = new google.maps.Size(256, 256);
  this._config = config;
  this._host = host;
  this._layers = this.getLayers();
  this._map = map;
  this.opacity = 0.8;
  this.setLayer(this.getLayers()[0], false);
  this.setInstance(this.getInstances()[0], false);
  this.setTindex(this.getTindexes()[0], false);
  this.setLevel(this.getLevels()[0], false);
  this.setRenderer('mpl', false);
  return this;
};

CloudburstMapType.prototype.redraw = function() {
  return google.maps.event.trigger(this._map, 'resize');
};

CloudburstMapType.prototype.getConfig = function() {
  return this._config;
};

CloudburstMapType.prototype.setOpacity = function(opacity) {
  return this.opacity = opacity;
};

CloudburstMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var bound, div, getNormalizedCoord, img, normalizedCoord, url, x, y;
  getNormalizedCoord = function(coord, zoom) {
    var tileRange, x, y;
    if (logging === true) {
      console.log(coord, zoom);
    }
    y = coord.y;
    x = coord.x;
    tileRange = 1 << zoom;
    if (y < 0 || y >= tileRange) {
      return null;
    }
    if (x < 0 || x >= tileRange) {
      x = (x % tileRange + tileRange) % tileRange;
    }
    return {
      x: x,
      y: y
    };
  };
  normalizedCoord = getNormalizedCoord(coord, zoom);
  if (!normalizedCoord) {
    return null;
  }
  bound = Math.pow(2, zoom);
  x = normalizedCoord.x;
  y = bound - normalizedCoord.y - 1;
  url = this._host + "/tile/" + this._renderer + "/" + this._layer + "/" + this._instance + "/" + this._tindex + "/" + this._level + "/" + zoom + "/" + x + "/" + y + ".png";
  if ((logging == null) && logging) {
    console.log(url);
  }
  div = ownerDocument.createElement('div');
  img = ownerDocument.createElement('img');
  img.src = url;
  img.style.opacity = this.opacity;
  div.innerHTML = img.outerHTML;
  div.style.width = this.tileSize.width + "px";
  div.style.height = this.tileSize.height + "px";
  return div;
};

CloudburstMapType.prototype.getLayers = function(asObj) {
  var lyr, lyrs;
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
    return lyrs;
  }
};

CloudburstMapType.prototype.setLayer = function(layer, noRedraw) {
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
};

CloudburstMapType.prototype.getLayer = function() {
  return this._layer;
};

CloudburstMapType.prototype.getLayerLegendUrl = function(size, orientation) {
  var layerurl;
  if ((size == null) || !size) {
    size = "small";
  }
  if ((orientation == null) || !orientation) {
    orientation = "horiztonal";
  }
  layerurl = this._host + "/legend/" + size + "/" + orientation + "/" + this._layer + "/" + (this._instance()) + ".png";
  return layerurl;
};

CloudburstMapType.prototype.getLayerMetadata = function() {
  if (this._layer != null) {
    return this._config.layers[this._layer].meta;
  }
};

CloudburstMapType.prototype.getLayerDescription = function() {
  if (this._layer != null) {
    return this.getLayerMetadata().description;
  }
};

CloudburstMapType.prototype.getLayerName = function() {
  if (this._layer != null) {
    return this.getLayerMetadata().name;
  }
};

CloudburstMapType.prototype.getLayerUnits = function() {
  if (this._layer != null) {
    return this.getLayerMetadata().units;
  }
};

CloudburstMapType.prototype.getLayerPlotDefinitions = function() {
  if (this._layer != null) {
    return this._config.layers[this._layer].plot_defs;
  }
};

CloudburstMapType.prototype.getInstances = function() {
  if (this._layer != null) {
    return Object.keys(this._config[this._layer]['dataset']);
  }
};

CloudburstMapType.prototype.setInstance = function(instance, noRedraw) {
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

CloudburstMapType.prototype.getInstance = function() {
  return this._instance;
};

CloudburstMapType.prototype.getLevels = function(asObj) {
  var i, levels;
  if ((this._instance != null) && (this._layer != null) && indexOf.call(Object.keys(this._config[this._layer]['dataset'][this._instance]), 'levels') >= 0) {
    levels = Object.keys(this._config[this._layer]['dataset'][this._instance]['levels']);
    if ((asObj != null) && asObj) {
      levels = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = levels.length; j < len; j++) {
          i = levels[j];
          results.push([i, this._config.layers[this._layer]['dataset'][this._instance]['levels'][i]]);
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
};

CloudburstMapType.prototype.setLevel = function(level, noRedraw) {
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

CloudburstMapType.prototype.getLevel = function() {
  return this._level;
};

CloudburstMapType.prototype.getTindexes = function(asObj) {
  var i, tindexes;
  if ((this._instance != null) && (this._layer != null)) {
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
  }
  return tindexes;
};

CloudburstMapType.prototype.setTindex = function(tindex, noRedraw) {
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

CloudburstMapType.prototype.getTindex = function(as_time_string) {
  if (as_time_string == null) {
    return this._tindex;
  } else {
    return this.getTindexes(true)[this._tindex][1];
  }
};

CloudburstMapType.prototype.getRenderer = function() {
  return this._renderer;
};

CloudburstMapType.prototype.setRenderer = function(renderer, noRedraw) {
  this._renderer = renderer;
  if ((noRedraw == null) || !noRedraw) {
    this.redraw();
  }
  return this;
};

CloudburstMapType.prototype.back = function(noRedraw) {
  if (this._tindex != null) {
    if (parseInt(this._tindex) > 0) {
      return this.setTindex(Math.max(parseInt(this._tindex) - 1, 0), noRedraw);
    }
  }
};

CloudburstMapType.prototype.forward = function(noRedraw) {
  if (this._tindex != null) {
    if (parseInt(this._tindex) < this.getTindexes().length - 1) {
      return this.setTindex(Math.min(parseInt(this._tindex) + 1, this.getTindexes().length - 1), noRedraw);
    }
  }
};

CloudburstMapType.prototype.higher = function(noRedraw) {
  if (this._layer != null) {
    if (parseInt(this._layer) < this.getLayers().length - 1) {
      return this.setLayer(Math.min(parseInt(this._layer) + 1, this.getLayers().length - 1), noRedraw);
    }
  }
};

CloudburstMapType.prototype.deeper = function(noRedraw) {
  if (this._layer != null) {
    if (parseInt(this._layer) > 0) {
      return this.setLayer(Math.max(parseInt(this._layer) - 1, 0), noRedraw);
    }
  }
};
