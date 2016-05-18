var addCloudburstCGM, initMap, logging;

logging = false;

addCloudburstCGM = function(json, host) {
  var cgm, map;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 39.50,
      lng: -98.35
    },
    zoom: 5
  });
  cgm = new CloudburstMapType(json, host, map);
  return map.overlayMapTypes.insertAt(0, cgm);
};

initMap = function() {
  var callback, cloudburst;
  cloudburst = new Cloudburst();
  callback = addCloudburstCGM;
  return cloudburst.loadConfiguration(callback);
};

initMap();
