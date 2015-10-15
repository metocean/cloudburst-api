L.CloudburstTileLayer = L.TileLayer.extend({
  options: {
    minZoom: 0,
    maxZoom: 17,
    tms: true,
    subdomains: 'abc',
    zoomOffset: 0
  },
  setUrl: void 0,
  initialize: function(config, options) {
    this._config = config;
    this.setLayer(this._config.layers[0], false);
    this.setInstance(this._config.layers[0].instances[0], false);
    this.setIndex(this._config.layers[0].instances[0].index[0], false);
    return L.TileLayer.prototype.initialize.call(this, '[cloudburst]/{z}/{x}/{y}.png', options);
  },
  getConfig: function() {
    return this._config;
  },
  setLayer: function(layer, noRedraw) {
    this._layer = layer;
    this._config.layer = layer;
    if ((noRedraw == null) || !noRedraw) {
      this.redraw();
    }
    return this;
  },
  getLayer: function() {
    return this._layer;
  },
  setInstance: function(instance, noRedraw) {
    this._instance = instance;
    if ((noRedraw == null) || !noRedraw) {
      this.redraw();
    }
    return this;
  },
  getInstance: function() {
    return this._instance;
  },
  setTindex: function(tindex, noRedraw) {
    this._tindex = tindex;
    if ((noRedraw == null) || !noRedraw) {
      this.redraw();
    }
    return this;
  },
  getTindex: function() {
    return this._tindex;
  },
  back: function(noRedraw) {
    var index;
    index = this._config.layers.indexOf(this._instance);
    index--;
    index %= this._config.layers.length;
    return this.setLayer(this._config.layers[index], noRedraw);
  },
  forward: function(noredraw) {
    var index;
    index = this._config.layers.indexOf(this._key);
    index++;
    index %= this._config.layers.length;
    return this.setLayer(this._config.layers[index], noRedraw);
  },
  getTileUrl: function(coords) {
    return L.TileLayer.prototype.getTileUrl.call(this, coords).replace(/\[wxtiles\]/, this._config.url + "/tile/mpl/" + this._layer.layerid + "/" + this._instance + "/" + this._tindex);
  }
});

L.cloudburstTileLayer = function(config, options) {
  return new L.CloudburstTileLayer(config, options);
};
