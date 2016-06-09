var addCloudburstCGM, cloudburst;

addCloudburstCGM = function(json) {
  var i, layer, layerid, len, map;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 39.50,
      lng: -98.35
    },
    zoom: 5
  });
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
          var cgm;
          cgm = new CloudburstMapType(CBCONFIG.host + layer.resources.tile.replace('<instance>', instance.id), times, levels, layer.bounds, map);
          return map.overlayMapTypes.insertAt(0, cgm);
        });
      });
    });
  });
};

cloudburst = new Cloudburst();

cloudburst.loadConfiguration(addCloudburstCGM);
