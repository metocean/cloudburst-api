// tileHost = "http://localhost:6060";
tileHost = "http://172.16.1.12:8080/v0"; // no cache

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
    if (lyr.resources.vtile !== undefined) {
      break;
    }
  }

  url = tileHost + lyr.resources.vtile;
  cloudburst.loadTimes(lyr.id, lyr.instances[0].id, function(times) {
    // Take a random available time
    time = times[Math.floor(Math.random()*times.length)];
    url = url.replace('<time>', time);
    url = url.replace('<instance>', lyr.instances[0].id)
    // console.log(url);

    hs = {
      "property": "foo",
      "stops": [
        [0, '#151d44'],
        [0.1, '#1b3a54'],
        [0.2, '#1b5666'],
        [0.3, '#137275'],
        [0.4, '#1f8e7e'],
        [0.5, '#58a585'],
        [0.6, '#90ba98'],
        [0.7, '#c0cfb7'],
        [0.8, '#ebe8df'],
        [0.9, '#f5e4dc'],
        [1, '#e8bfab'],
        [2, '#df9982'],
        [3, '#d27468'],
        [4, '#be5260'],
        [5, '#a23560'],
        [6, '#811e5f'],
        [7, '#5b1452'],
        [8, '#340d35']
      ]
    };

    infrared = {
      "property": "foo",
      "stops": [
        [170, '#f8f8f1'],
        [188, '#ffff60'],
        [206, '#b6379f'],
        [224, '#444444'],
        [242, '#ff1d00'],
        [260, '#83ff00'],
        [278, '#00325d'],
        [296, '#009fca'],
        [314, '#7c7c7c'],
        [332, '#060606']
      ]
    };

    sample = {
      "version": 8,
      "name": "demo",
      "sources": {
        "osm": {
          "type": "vector",
          "tiles": ["https://vector.mapzen.com/osm/all/{z}/{x}/{y}.mvt?api_key=vector-tiles-LM25tq4"]
        },
        "msl": {
          "type": "vector",
          "tiles": [url],
          "scheme": "tms"
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
          "id": "facets",
          "source": "msl",
          "source-layer": "foo_0",
          "type": "fill",
          // "filter": ["==", "$type", "Polygon"],
          // "interactive": true,
          "paint": {
            "fill-color": infrared,
            "fill-opacity": 0.75,
            // "fill-outline-color": "#ffffff"
          }
        }, {
          "id": "facet-hover",
          "source-layer": "foo_0",
          "type": "fill",
          "source": "msl",
          "layout": {},
          "paint": {
              "fill-color": infrared,
              "fill-opacity": 1,
              "fill-outline-color": "#000000"
            },
          "filter": ["==", "foo", ""]
          }
        // {
        //   "id": "facet-hover",
        //   "type": "polygon",
        //   "source": "fill",
        //   "source-layer": "facet-hover",
        //   "paint": {
        //     "fill-color": "rgba(255,25,0,0.5)",
        //   },
        //   "filter": ['all',
        //     [ '==', 'foo', ''] // Start with a filter that doesn't select anything
        //   ]
        // }
      ]
    }
    var map = new mapboxgl.Map({
      container: "map",
      style: sample,
      zoom: 1,
      center: [-14, 35]
    });
    map.on("mousemove", function(e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ["facets"],
        // radius: 2,
        includeGeometry: true
      });
      if (features.length) {
        map.setFilter("facet-hover", [">=", "foo", features[0].properties.foo]);
      } else {
        map.setFilter("facet-hover", ["==", "foo", ""]);
      }

    });
    // Reset the route-hover layer's filter when the mouse leaves the map
    map.on("mouseout", function() {
        map.setFilter("facet-hover", ["==", "foo", ""]);
    });
  });
};

if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
  cloudburst = new Cloudburst();
  cloudburst.loadConfiguration(main);
}
