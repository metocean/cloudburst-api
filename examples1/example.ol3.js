var init, main;

init = function(json, host) {
  var basemap, cb, change_header, map, osm;
  cb = new CloudburstOL3(json, host);
  cb.setLayer('ncep_mslp');
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
    layers: [basemap, cb.tileLayer, osm],
    view: new ol.View({
      center: new ol.proj.fromLonLat([174.7772, -41.2889]),
      zoom: 5
    })
  });
  change_header = function(new_t) {
    var t;
    t = document.getElementById('time');
    if (t != null) {
      t.innerHTML = ": " + new_t;
    }
  };
  return $(document).ready(function() {
    return setInterval(function() {
      var source;
      cb.forward();
      change_header(cb.getTindex(true));
      cb.setOL3LayerTile({
        'opacity': 0.1,
        'visible': false
      });
      map.getLayers().set(1, cb.tileLayer);
      source = map.getLayers().item(1).getSource();
      return source.setTileLoadFunction(source.getTileLoadFunction());
    }, 15 * 1000);
  });
};

main = function() {
  var callback, cloudburst;
  cloudburst = new Cloudburst();
  callback = init;
  return cloudburst.loadConfiguration(callback);
};
