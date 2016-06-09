
    var map = L.map('map').setView([51.505, -0.09], 7);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var cloudburstOptions = {
      maxZoom: 21,
      maxNativeZoom: 21,
      reuseTiles: true,
      detectRetina: true,
      opacity: 1.0,
      zIndex: null,
      tms: true,
      zoomOffset: 0
    };

    function LayersViewModel() {
      var self = this;
      self.tileHost = CBCONFIG.host;
      self.layersURI = CBCONFIG.layers;
      self.layers = ko.observableArray();

      self.ajax = function(uri, method, data) {
        if (!(uri.endsWith('/'))) {
          uri = uri + '/';
        }
        var request = {
          url: uri,
          type: method,
          contentType: "application/json",
          accepts: "application/json",
          cache: false,
          dataType: 'json',
          data: JSON.stringify(data),
          error: function(jqXHR) {
            console.log("ajax error " + jqXHR.status);
          }
        };
        return $.ajax(request);
      }

      self.ajax(self.layersURI + '/', 'GET').done(function(layers) {
        for (var i = 0; i < layers.length; i++) {
          var instances = [];
          for (j = 0, len = layers[i].instances.length; j < len; j++) {
            instances.push(layers[i].instances[j].id);
          }
          // NOTE: example doesn't really use instances, so
          legend = CBCONFIG.host + layers[i].resources.legend
          .replace('<instance>', layers[i].instances[0].id)
          .replace('<size>', 'small')
          .replace('<orientation>', 'horizontal');
          self.layers.push({
            layerID: ko.observable(layers[i].id),
            bounds: ko.observable(layers[i].bounds),
            instances: ko.observableArray(instances),
            title: ko.observable(layers[i].meta.name),
            description: ko.observable(layers[i].meta.description),
            units: ko.observable(layers[i].meta.unit_system),
            legend: ko.observable(legend),
            resources: ko.observable(layers[i].resources)
          });
        }
      });

      self.getLayer = function(layer) {
        var path = [self.layersURI, layer.layerID()].join('/');
        self.ajax(path, 'GET').done(function(data) {
          return data;
        });
      }

      self.getInstances = function(layer) {
        console.log(layer.instances());
        return layer.instances();
      }

      self.getInstance = function(layer, instanceID, callback) {
        var path = [self.layersURI, layer.layerID(), instanceID].join('/');
        console.log(path);
        self.ajax(path, 'GET').done(function(data) {
          return callback(data);
        });
      }

      self.getTimes = function(layer, instanceID, callback) {
        var path = [self.layersURI, layer.layerID(), instanceID, 'times'].join('/');
        self.ajax(path, 'GET').done(function(data) {
          return callback(data);
        })
      }

      // self.getLevels = function(layer, instanceID, callback)

      self.getSampleTile = function(layer) {
        var templateURL = self.tileHost + layer.resources().tile
        .replace('<instance>', layer.instances()[0]);
        self.getTimes(layer, layer.instances()[0], function(times) {
          var levels;
          var bounds = layer.bounds();
          var cbTileLayer = new L.cloudburstTileLayer(templateURL, times, levels, bounds, cloudburstOptions);
          cbTileLayer.addTo(map);
          map.fitBounds(cbTileLayer.getBounds());
        });
      }
    }

    function LayerViewModel() {
      var self = this;
      self.layerID = ko.observable();

      LayersViewModel.getLayer(self.layerID());
    }

    var LayersViewModel = new LayersViewModel();
    ko.applyBindings(LayersViewModel, $('#main')[0]);
