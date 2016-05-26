
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
    function get_cloudburst_tileLayer(templateUrl, options) {
      return L.cloudburstTileLayer(templateUrl, options)
    }

    function LayersViewModel() {
      var self = this;
      self.layersURI = 'http://localhost:6060/layer';
      self.tilesURI = 'http://localhost:6060/tile'
      // self.layersURI = 'http://tapa01.unisys.metocean.co.nz/layer';
      self.layers = ko.observableArray();

      self.ajax = function(uri, method, data) {
        var request = {
          url: uri,
          type: method,
          jsonpCallback: 'read_layers_callback',
          contentType: "application/json",
          accepts: "application/json",
          cache: false,
          dataType: 'jsonp',
          data: JSON.stringify(data),
          error: function(jqXHR) {
            console.log("ajax error " + jqXHR.status);
          }
        };
        return $.ajax(request);
      }

      self.ajax(self.layersURI, 'GET').done(function(data) {
        var layers = Object.keys(data);
        for (var i = 0; i < layers.length; i++) {
          self.layers.push({
            layerID: ko.observable(layers[i]),
            instances: ko.observableArray(Object.keys(data[layers[i]].dataset)),
            title: ko.observable(data[layers[i]].meta.name),
            description: ko.observable(data[layers[i]].meta.description),
            units: ko.observable(data[layers[i]].meta.unit_system)
          });
        }
      });

      self.getLayer = function(layer) {
        var path = self.layersURI + '/' + layer.layerID();
        self.ajax(path, 'GET').done(function(data) {
          return data;
        });
      }

      self.getInstances = function(layer) {
        return layer.instances();
      }

      self.getInstance = function(layer, instanceID, callback) {
        var path = self.layersURI + '/' + layer.layerID() + '/' + instanceID;
        self.ajax(path, 'GET').done(function(data) {
          return callback(data);
        });
      }

      self.getTimes = function(layer, instanceID, callback) {
        var path = self.layersURI + '/' + layer.layerID() + '/' + instanceID + '/times';
        self.ajax(path, 'GET').done(function(data) {
          return callback(data);
        })
      }

      // self.getLevels = function(layer, instanceID, callback)

      self.getSampleTile = function(layer) {
        var instance = self.getInstance(layer, layer.instances()[0], function(data) {
          var templateURL = self.tilesURI + data.links; // TODO this will change to an object, where we'd want data.resources.tile, and these substitutions won't be required
          templateURL = templateURL.replace('<zoom>', '{z}');
          templateURL = templateURL.replace('<x>', '{x}');
          templateURL = templateURL.replace('<y>', '{y}');
          self.getTimes(layer, layer.instances()[0], function(data) {
            var times = new Array;
            for (var t in data) {
              times.push(data[t]);
            }
            var levels;
            var cbtl = get_cloudburst_tileLayer(templateURL, times, levels, cloudburstOptions);
            // var ntl = templateURL.replace('<time>', 0)
            // L.tileLayer(ntl, {
            //   tms: true,
            //   minZoom: 0,
            //   maxZoom: 21,
            //   zoomOffset: 0,
            //   detectRetina: true
            // }).addTo(map);

            // console.log(cbtl);
            // console.log(templateURL);
            cbtl.addTo(map);
          });
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
