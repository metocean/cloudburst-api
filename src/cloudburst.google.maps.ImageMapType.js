var CloudburstMapType, getNormalizedCoord,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

getNormalizedCoord = function(coord, zoom) {
  var tileRange, x, y;
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

CloudburstMapType = function(urlTemplate, times, levels, bounds, map) {
  this.tileSize = new google.maps.Size(256, 256);
  this._map = map;
  this.opacity = 0.8;
  this._times = times != null ? times : null;
  this._levels = levels != null ? levels : null;
  this.hasTimes = this._times ? true : false;
  this.hasLevels = this._levels ? true : false;
  this.setTime(this._times != null ? this._times[0] : 0);
  this.setLevel(this._levels != null ? this._levels[0] : 0);
  this.bounds = bounds != null ? bounds : null;
  this.urlTemplate = urlTemplate;
  return this;
};

CloudburstMapType.prototype.redraw = function() {
  return google.maps.event.trigger(this._map, 'resize');
};

CloudburstMapType.prototype.setOpacity = function(opacity) {
  return this.opacity = opacity;
};

CloudburstMapType.prototype.getLevels = function() {
  return this._levels;
};

CloudburstMapType.prototype.setLevel = function(level, noRedraw) {
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

CloudburstMapType.prototype.getLevel = function() {
  return this._level;
};

CloudburstMapType.prototype.getTimes = function(asObj) {
  return this._times;
};

CloudburstMapType.prototype.setTime = function(time, noRedraw) {
  if (!this.hasTimes) {
    this._time = 0;
    return this;
  } else if (indexOf.call(this.getTimes(), time) >= 0) {
    this._time = time.toString();
    if ((noRedraw == null) || !noRedraw) {
      return this.redraw();
    }
  }
};

CloudburstMapType.prototype.getTime = function() {
  return this._time;
};

CloudburstMapType.prototype.back = function(noRedraw) {
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

CloudburstMapType.prototype.forward = function(noRedraw) {
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

CloudburstMapType.prototype.higher = function(noRedraw) {
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

CloudburstMapType.prototype.deeper = function(noRedraw) {
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

CloudburstMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
  var bound, div, img, normalizedCoord, url, x, y;
  normalizedCoord = getNormalizedCoord(coord, zoom);
  if (!normalizedCoord) {
    return null;
  }
  bound = Math.pow(2, zoom);
  x = normalizedCoord.x;
  y = bound - normalizedCoord.y - 1;
  url = this.urlTemplate.replace('<time>', !this.hasTimes ? 0 : this.getTimes().indexOf(this.getTime())).replace('<level>', !this.hasLevels ? 0 : this.getLevels().indexOf(this.getLevel())).replace('{z}', zoom).replace('{x}', x).replace('{y}', y);
  div = ownerDocument.createElement('div');
  img = ownerDocument.createElement('img');
  img.src = url;
  img.style.opacity = this.opacity;
  div.innerHTML = img.outerHTML;
  div.style.width = this.tileSize.width + "px";
  div.style.height = this.tileSize.height + "px";
  return div;
};
