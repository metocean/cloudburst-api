var CloudburstOL3,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

CloudburstOL3 = (function() {
  function CloudburstOL3(urlTemplate, times, levels, bounds, host) {
    this.setOL3LayerTile = bind(this.setOL3LayerTile, this);
    this._htmlattr = '&copy;<a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>';
    this._times = times != null ? times : null;
    this._levels = levels != null ? levels : null;
    this.hasTimes = this._times ? true : false;
    this.hasLevels = this._levels ? true : false;
    this.setTime(this._times != null ? this._times[0] : 0);
    this.setLevel(this._levels != null ? this._levels[0] : 0);
    this.bounds = bounds != null ? bounds : null;
    this.urlTemplate = urlTemplate;
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

  CloudburstOL3.prototype.setOL3LayerTile = function(options) {
    var tileLayer;
    options = options == null ? {} : options;
    tileLayer = new ol.layer.Tile({
      opacity: options.opacity != null ? options.opacity : void 0,
      preload: options.preload != null ? options.preload : void 0,
      visible: options.visible != null ? options.visible : void 0,
      extent: options.extent != null ? options.extent : void 0,
      minResolution: options.minResolution != null ? options.minResolution : void 0,
      maxResolution: options.maxResolution != null ? options.maxResolution : void 0,
      userInterimTilesOnError: options.userInterimTilesOnError != null ? options.userInterimTilesOnError : void 0,
      extent: options.extent != null ? options.extent : this.getLayerBounds(),
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

  CloudburstOL3.prototype.getLayerBounds = function() {
    if (this.bounds != null) {
      return ol.proj.transformExtent([this.bounds['west'], this.bounds['south'], this.bounds['east'], this.bounds['north']], 'EPSG:4326', 'EPSG:3857');
    }
  };

  CloudburstOL3.prototype.getLevels = function() {
    return this._levels;
  };

  CloudburstOL3.prototype.setLevel = function(level, noRedraw) {
    var ref;
    if (!this.hasLevels) {
      return this;
    }
    if (ref = level.toString(), indexOf.call(this.getLevels(), ref) >= 0) {
      this._level = level.toString();
      if ((noRedraw == null) || !noRedraw) {
        this.redraw();
      }
    }
    return this;
  };

  CloudburstOL3.prototype.getLevel = function() {
    return this._level;
  };

  CloudburstOL3.prototype.getTimes = function() {
    return this._times;
  };

  CloudburstOL3.prototype.setTime = function(time, noRedraw) {
    if (!this.hasTimes) {
      this._time = 0;
      return this;
    } else if (indexOf.call(this.getTimes(), time) >= 0) {
      this._time = time.toString();
      if ((noRedraw == null) || !noRedraw) {
        this.redraw();
      }
    }
    return this;
  };

  CloudburstOL3.prototype.getTime = function(as_time_string) {
    return this._time;
  };

  CloudburstOL3.prototype.back = function(noRedraw) {
    var t, times;
    if (!this.hasTimes) {
      return;
    }
    t = this.getTime();
    times = this.getTimes();
    if ((t != null) && times.indexOf(t) > 0) {
      return this.setTime(times[times.indexOf(t) - 1], noRedraw);
    }
  };

  CloudburstOL3.prototype.forward = function(noRedraw) {
    var t, times;
    if (!this.hasTimes) {
      return;
    }
    t = this.getTime();
    times = this.getTimes();
    if ((t != null) && times.indexOf(t) < times.length - 1) {
      return this.setTime(times[times.indexOf(t) + 1], noRedraw);
    }
  };

  CloudburstOL3.prototype.higher = function(noRedraw) {
    var l, levels;
    if (!this.hasLevels) {
      return;
    }
    l = this.getLevel();
    levels = this.getLevels();
    if ((l != null) && levels.indexOf(l) < levels.length - 1) {
      return this.setLevel(levels[levels.indexOf(l) + 1], noRedraw);
    }
  };

  CloudburstOL3.prototype.deeper = function(noRedraw) {
    var l, levels;
    if (!this.hasLevels) {
      return;
    }
    l = this.getLevel();
    levels = this.getLevels();
    if ((l != null) && levels.indexOf(l) > 0) {
      return this.setLevel(levels[levels.indexOf(l) - 1], noRedraw);
    }
  };

  CloudburstOL3.prototype.tileUrl = function(tileCoord, pixelRatio, projection) {
    var x, y, z;
    z = tileCoord[0];
    x = tileCoord[1];
    y = tileCoord[2] + (1 << z);
    return this.urlTemplate.replace('<time>', !this.hasTimes ? 0 : this.getTimes().indexOf(this.getTime())).replace('<level>', !this.hasLevels ? 0 : this.getLevels().indexOf(this.getLevel())).replace('{z}', z).replace('{x}', x).replace('{y}', y);
  };

  return CloudburstOL3;

})();
