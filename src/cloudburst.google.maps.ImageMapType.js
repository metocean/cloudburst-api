var CloudburstMapType, logging,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

logging = true;

CloudburstMapType = function(config, host, map) {
  this.tileSize = new google.maps.Size(256, 256);
  this._config = config;
  this._host = host;
  this._layers = this.getLayers();
  this._map = map;
  this.opacity = 0.5;
  this.setLayer(this._layers[3], false);
  this.setInstance(this.getInstances()[0], false);
  this.setTindex(this.getTindexes()[0], false);
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
  url = this._host + "/tile/" + this._renderer + "/" + this._layer + "/" + this._instance + "/" + this._tindex + "/" + zoom + "/" + x + "/" + y + ".png";
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

CloudburstMapType.prototype.setLayer = function(layer, noRedraw) {
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

CloudburstMapType.prototype.getLayer = function() {
  return this._layer;
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
  if (this._layer) {
    return this._config.layers[this._layer].plot_defs;
  }
};

CloudburstMapType.prototype.getInstances = function() {
  if (this._layer != null) {
    return Object.keys(this._config.layers[this._layer].instances);
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

CloudburstMapType.prototype.getTindexes = function(asObj) {
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
