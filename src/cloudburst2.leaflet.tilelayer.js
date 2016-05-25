var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

L.CloudburstTileLayer = L.TileLayer.extend({
  options: {
    minZoom: 0,
    maxZoom: 17,
    tms: true,
    zoomOffset: 0,
    detectRetina: true
  },
  initialize: function(urlTemplate, times, levels, options) {
    this._times = times != null ? times : null;
    this._levels = levels != null ? levels : null;
    this.hasTimes = this._times ? true : false;
    this.hasLevels = this._levels ? true : false;
    this.setTime(this._times != null ? this._times[0] : 0);
    this.setLevel(this._levels != null ? this._levels[0] : 0);
    return L.TileLayer.prototype.initialize.call(this, urlTemplate, options);
  },
  getLevels: function() {
    return this._levels;
  },
  setLevel: function(level, noRedraw) {
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
    var t;
    if (!this.hasTimes) {
      return;
    }
    t = this.getTime();
    if ((t != null) && this.getTimes().indexOf(t) > 0) {
      return this.setTime(t - 1, noRedraw);
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
      console.log('now is', this.getTime());
      this.setTime(t + 1, noRedraw);
      return console.log('forward!', this.getTime());
    }
  },
  higher: function(noRedraw) {
    var l, levels;
    if (!this.hasLevels) {
      return;
    }
    l = this.getLevel();
    levels = this.getLevels();
    if ((l != null) && levels.indexOf(l) < levels.length - 1) {
      return this.setLevel(l, noRedraw);
    }
  },
  deeper: function(noRedraw) {
    var l, levels;
    if (!this.hasLevels) {
      return;
    }
    l = this.getLevel();
    levels = this.getLevels();
    if ((l != null) && levels.indexOf(l) > 0) {
      return this.setLevel(l, noRedraw);
    }
  },
  getTileUrl: function(coords) {
    return L.TileLayer.prototype.getTileUrl.call(this, coords).replace('<time>', this.getTime()).replace('<level>', this.getLevel());
  }
});

L.cloudburstTileLayer = function(urlTemplate, options) {
  return new L.CloudburstTileLayer(urlTemplate, options);
};