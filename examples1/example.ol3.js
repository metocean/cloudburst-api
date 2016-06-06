var change_header, init, main, tileHost;

tileHost = "http://localhost:6060";

change_header = function(new_t) {
  var t;
  t = document.getElementById('time');
  if (t != null) {
    t.innerHTML = ": " + new_t;
  }
};

init = function() {
  var cloudburst;
  cloudburst = new Cloudburst();
  return cloudburst.loadConfiguration().then(function(json) {
    var i, layer, layerid, len;
    layerid = 3;
    for (i = 0, len = json.length; i < len; i++) {
      layer = json[i];
      if (layer.id.indexOf('1440') > -1) {
        layerid = layer.id;
      }
    }
    return cloudburst.loadLayer(layerid).then(function(layer) {
      return cloudburst.loadInstance(layer.id, layer.instances[0].id).then(function(instance) {
        return cloudburst.loadTimes(layer.id, instance.id).then(function(times) {
          return cloudburst.loadLevels(layer.id, instance.id).then(function(levels) {
            var basemap, cb, map, osm;
            cb = new CloudburstOL3(tileHost + instance.resources.tile, times, levels, layer.bounds);
            cb.setOL3LayerTile();
            basemap = new ol.layer.Tile({
              source: new ol.source.XYZ({
                attributons: [
                  new ol.Attribution({
                    html: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
                  })
                ],
                url: 'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
              })
            });
            osm = new ol.layer.Tile({
              source: new ol.source.XYZ({
                attributions: [
                  new ol.Attribution({
                    html: '&copy; <a href="http://www.openseamap.org/">OpenSeaMap</a>'
                  }, ol.source.OSM.ATTRIBUTION)
                ],
                crossOrigin: null,
                url: 'http://t1.openseamap.org/seamark/{z}/{x}/{y}.png'
              })
            });
            map = new ol.Map({
              target: 'map',
              renderer: 'canvas',
              layers: [basemap, cb.tileLayer],
              view: new ol.View({
                center: new ol.proj.fromLonLat([-98.35, 39.5]),
                zoom: 4
              })
            });
            return $(document).ready(function() {
              if (cb.hasTimes != null) {
                return setInterval(function() {
                  var source;
                  cb.forward();
                  change_header(cb.getTime());
                  cb.setOL3LayerTile({
                    'opacity': 0.1,
                    'visible': false
                  });
                  map.getLayers().set(1, cb.tileLayer);
                  source = map.getLayers().item(1).getSource();
                  return source.setTileLoadFunction(source.getTileLoadFunction());
                }, 20 * 1000);
              }
            });
          });
        });
      });
    });
  });
};

main = function() {
  return init();
};
