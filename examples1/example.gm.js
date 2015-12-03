var initMap, logging;

logging = true;

initMap = function() {
  var cloudburstGM, getNormalizedCoord, map;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 8
  });
  cloudburstGM = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var bound, normalizedCoord, url, x, y;
      normalizedCoord = getNormalizedCoord(coord, zoom);
      if (!normalizedCoord) {
        return null;
      }
      bound = Math.pow(2, zoom);
      x = normalizedCoord.x;
      y = bound - normalizedCoord.y - 1;
      url = "http://localhost:6060/tile/mpl/ncep_mslp/20150922_12z/0/" + zoom + "/" + x + "/" + y + ".png";
      if (logging === true) {
        console.log(url);
      }
      return url;
    },
    tileSize: new google.maps.Size(256, 256)
  });
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
  return map.overlayMapTypes.push(cloudburstGM);
};
