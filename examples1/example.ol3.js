var key, layers, map;

key = "20865bd31bcc4e4dbea2181b9a23d825";

layers = [
  new ol.layer.Tile({
    source: new ol.source.XYZ({
      attributions: [
        new ol.Attribution({
          html: 'TODO'
        })
      ],
      maxZoom: 21,
      tileUrlFunction: function(tileCoord, pixelRatio, projection) {
        var instance, layer, renderer, t, url, x, y, z;
        z = tileCoord[0];
        x = tileCoord[1];
        y = tileCoord[2] + (1 << z);
        renderer = 'mpl';
        layer = 'ncep_hs';
        instance = '20150922_12z';
        t = 0;
        url = "http://localhost:6060/tile/" + renderer + "/" + layer + "/" + instance + "/" + t + "/" + z + "/" + x + "/" + y + ".png";
        console.log(url);
        return url;
      }
    })
  })
];

console.log(layers);

map = new ol.Map({
  target: 'map',
  layers: layers,
  view: new ol.View({
    center: new ol.proj.fromLonLat([174.7772, -41.2889]),
    zoom: 4
  })
});
