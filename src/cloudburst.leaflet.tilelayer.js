var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

L.CloudburstTileLayer = L.TileLayer.extend({
  initialize: function(urlTemplate, times, levels, bounds, options) {
    this._times = (times != null) && times.length ? times : null;
    this._levels = (levels != null) && levels.length > 0 ? levels : null;
    this.hasTimes = this._times ? true : false;
    this.hasLevels = this._levels ? true : false;
    this.setTime(this._times != null ? this._times[0] : 0);
    this.setLevel(this._levels != null ? this._levels[0] : 0);
    this.bounds = bounds != null ? bounds : null;
    if (options == null) {
      options = {
        minZoom: 0,
        maxZoom: 21,
        tms: true,
        zoomOffset: 0,
        detectRetina: true
      };
    }
    if ((this.bounds != null) && !(indexOf.call(options, 'bounds') >= 0) && (this.bounds['west'] < this.bounds['east'])) {
      options.bounds = this.getBounds();
    }
    return L.TileLayer.prototype.initialize.call(this, urlTemplate, options);
  },
  getBounds: function() {
    if (this.bounds != null) {
      return new L.latLngBounds(L.latLng(this.bounds['south'], this.bounds['west']), L.latLng(this.bounds['north'], this.bounds['east']));
    }
  },
  getLevels: function() {
    return this._levels;
  },
  setLevel: function(level, noRedraw) {
    var ref;
    if (!this.hasLevels || (level == null)) {
      return this;
    }
    if (ref = level.toString(), indexOf.call(this.getLevels(), ref) >= 0) {
      this._level = level.toString();
      if ((noRedraw == null) || !noRedraw) {
        this.redraw();
      }
    }
    return this;
  },
  getLevel: function() {
    return this._level;
  },
  getTimes: function() {
    return this._times;
  },
  setTime: function(time, noRedraw) {
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
  },
  getTime: function() {
    return this._time;
  },
  back: function(noRedraw) {
    var t, times;
    if (!this.hasTimes) {
      return;
    }
    t = this.getTime();
    times = this.getTimes();
    if ((t != null) && times.indexOf(t) > 0) {
      return this.setTime(times[times.indexOf(t) - 1], noRedraw);
    }
  },
  forward: function(noRedraw) {
    var t, times;
    if (!this.hasTimes) {
      return;
    }
    t = this.getTime();
    times = this.getTimes();
    if ((t != null) && times.indexOf(t) < times.length - 1) {
      return this.setTime(times[times.indexOf(t) + 1], noRedraw);
    }
  },
  higher: function(noRedraw) {
    var l, levels;
    if (!this.hasLevels) {
      return;
    }
    l = this.getLevel();
    levels = this.getLevels();
    if (levels.indexOf(l) > 0) {
      return this.setLevel(levels[levels.indexOf(l) - 1], noRedraw);
    }
  },
  deeper: function(noRedraw) {
    var l, levels;
    if (!this.hasLevels) {
      return;
    }
    l = this.getLevel();
    levels = this.getLevels();
    if (levels.indexOf(l) < levels.length + 1) {
      return this.setLevel(levels[levels.indexOf(l) + 1], noRedraw);
    }
  },
  getTileUrl: function(coords) {
    return L.TileLayer.prototype.getTileUrl.call(this, coords).replace('<time>', !this.hasTimes ? 0 : this.getTime()).replace('<level>', !this.hasLevels ? 0 : this.getLevel());
  }
});

L.cloudburstTileLayer = function(urlTemplate, times, levels, bounds, options) {
  return new L.CloudburstTileLayer(urlTemplate, times, levels, bounds, options);
};
