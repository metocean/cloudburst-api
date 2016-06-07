tileHost = "http://localhost:6060";

mapboxgl.accessToken = 'pk.eyJ1IjoibWV0b2NlYW4iLCJhIjoia1hXZjVfSSJ9.rQPq6XLE0VhVPtcD9Cfw6A';
// var map = new mapboxgl.Map({
//     container: 'map', // container id
//     style: 'mapbox://styles/mapbox/light-v8', //stylesheet location
//     center: [-74.50, 40], // starting position
//     zoom: 3 // starting zoom
// });

function main(layers) {

  // Add zoom and rotation controls to the map.
  // map.addControl(new mapboxgl.Navigation());

  // Just for this demo look for the MSLP vector tile; no choice
  for (i = 0, len = layers.length; i < len; i++) {
    lyr = layers[i];
    if (lyr.instances[0].resources.vtile !== undefined) {
      break;
    }
  }

  url = tileHost + lyr.instances[0].resources.vtile;
  cloudburst.loadTimes(lyr.id, lyr.instances[0].id, function(times) {
    // Take a random available time
    // time = times[Math.floor(Math.random()*times.length)];
    url = url.replace('<time>', 0); //times.indexOf(time));
    console.log(url);

    sample = {
      "version": 8,
      "sources": {
        "osm": {
          "type": "vector",
          "tiles": ["https://vector.mapzen.com/osm/all/{z}/{x}/{y}.mvt?api_key=vector-tiles-LM25tq4"]
        },
        "msl": {
          "type": "vector",
          "tiles": [url]
        }
      },
      "layers": [
        {
          "id": "background",
          "type": "background",
          "paint": {
            "background-color": "#41afa5"
          }
        }, {
          "id": "water",
          "type": "fill",
          "source": "osm",
          "source-layer": "water",
          "filter": ["==", "$type", "Polygon"],
          "paint": {
            "fill-color": "#3887be"
          }
        }, {
          "id": "contours",
          "type": "line",
          "source": "msl",
          "source-layer": "contours",
          "filter": ["==", "$type", "LineString"],
          "interactive": true,
          "layout": {
            "line-join": "round",
            "line-cap": "round"
          },
          "paint": {
            "line-color": "#000000",
            "line-width": 1
          }
        }, {
          "id": "contours-labels",
          "type": "symbol",
          "source": "msl",
          "source-layer": "contours-label",
          "layout": {
            "symbol-placement": "line",
            "text-field": "{level}",
            "text-size": 10,
            "text-anchor": "bottom",
            "text-padding": 5,
            "text-rotation-alignment": "viewport"
          },
          "paint": {
            "text-color": "red",
            "text-halo-color": "white",
            "text-halo-width": 2
            // "text-halo-blur": 3
          }
        }, {
          "id": "contours-hover",
          "type": "line",
          "source": "msl",
          "source-layer": "contours-hover",
          "paint": {
            "line-color": "rgba(255,25,0,0.5)",
            "line-width": 4
          },
          "filter": ['all',
            [ '==', 'level', ''] // Start with a filter that doesn't select anything
          ]
        }
      ]
    }
    var map = new mapboxgl.Map({
      container: "map",
      style: sample,
      zoom: 1,
      center: [-14, 35]
    });
    map.on('mousemove', function (e) {
      // query the map for the feature under the mouse
      map.featuresAt(e.point, {
        radius: 20,
        layer: ['contours'],
        includeGeometry: true
      }, function (err, features) {
        if (!err && features.length) {
          // set the filter on the hover style layer to only select the features
          // currently under the mouse
          var ids = features.map(function (feat) {return feat.properties.level })
          map.setFilter('contours-hover', ['all',
              [ 'in', 'level' ].concat(ids)
          ])
        } else {
          map.setFilter('contours-hover', ['==', 'level', '']);
        }
      });
    });
  });
};

if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
  cloudburst = new Cloudburst();
  cloudburst.loadConfiguration(main);
}
