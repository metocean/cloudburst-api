var callback, cloudburst, get_cloudburst_tileLayer, get_host, get_supplementary_tileLayer, make_map, sample_add_random_layer, sample_layer_control, sample_stack_n_layers;

make_map = function(layers, mapdiv) {
  var map;
  mapdiv = mapdiv != null ? mapdiv : 'map';
  map = new L.Map(mapdiv, {
    layers: layers,
    center: new L.LatLng(-37.7772, 175.2756),
    zoom: 6,
    attributionControl: false
  });
  return map;
};

get_cloudburst_tileLayer = function(json, opacity, zIndex) {
  var cloudburstTileLayer;
  cloudburstTileLayer = L.cloudburstTileLayer(get_host(), json, {
    maxZoom: 8,
    maxNativeZoom: 9,
    reuseTiles: true,
    detectRetina: true,
    opacity: opacity != null ? opacity : 1.0,
    zIndex: zIndex != null ? zIndex : null
  });
  return cloudburstTileLayer;
};

get_supplementary_tileLayer = function() {
  var supplementary;
  supplementary = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 9,
    reuseTiles: true,
    detectRetina: true
  });
  return supplementary;
};

sample_stack_n_layers = function(json) {
  var cloudburstTileLayer, i, j, layers;
  layers = [get_supplementary_tileLayer()];
  for (i = j = 0; j < 3; i = j += 1) {
    cloudburstTileLayer = get_cloudburst_tileLayer(json, 0.6);
    cloudburstTileLayer.setLayer(Object.keys(json.layers)[i]);
    layers.push(cloudburstTileLayer);
  }
  return make_map(layers);
};

sample_add_random_layer = function(json) {
  var cloudburstTileLayer, randomindex;
  cloudburstTileLayer = get_cloudburst_tileLayer(json);
  randomindex = Math.floor(Math.random() * Object.keys(json.layers).length);
  cloudburstTileLayer.setLayer(Object.keys(json.layers)[randomindex]);
  return make_map([get_supplementary_tileLayer(), cloudburstTileLayer]);
};

sample_layer_control = function(json) {
  var appendElements, cloudburstTileLayer, do_appendElements, make_slider, removeOptions;
  cloudburstTileLayer = get_cloudburst_tileLayer(json);
  make_map([get_supplementary_tileLayer(), cloudburstTileLayer]);
  removeOptions = function(container_id) {
    return $("#" + container_id).find('option').remove();
  };
  appendElements = function(container_id, element, content, title) {
    var el;
    el = document.createElement(element);
    el.innerHTML = content;
    if (title != null) {
      el.setAttribute('title', title);
    }
    document.getElementById(container_id).appendChild(el);
  };
  do_appendElements = function(refresh_layers, refresh_instances, refresh_tindexes) {
    var j, k, len, len1, lyr, ref, ref1;
    if ((refresh_layers == null) || refresh_layers) {
      removeOptions('layers');
      ref = cloudburstTileLayer.getLayers(true);
      for (j = 0, len = ref.length; j < len; j++) {
        lyr = ref[j];
        appendElements('layers', 'option', lyr[1].meta.name, lyr[0]);
      }
    }
    if ((refresh_instances == null) || refresh_instances) {
      removeOptions('instances');
      ref1 = cloudburstTileLayer.getInstances();
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        lyr = ref1[k];
        appendElements('instances', 'option', lyr);
      }
    }
  };
  do_appendElements(true, true, true);
  $('#layers').change(function() {
    cloudburstTileLayer.setLayer($('option:selected', this).attr('title'));
    return do_appendElements(false, true, true);
  });
  $('#instances').change(function() {
    cloudburstTileLayer.setInstance($(this).val());
    return do_appendElements(false, false, true);
  });
  $('#step-backward').click(function() {
    var newval;
    cloudburstTileLayer.back();
    newval = parseInt(cloudburstTileLayer.getTindex());
    if (newval === 0) {
      $('#step-backward').addClass('disabled');
    } else {
      $('#step-backward').removeClass('disabled');
    }
    $('#step-forward').removeClass('disabled');
    return $('#indexes').prop("selectedIndex", newval);
  });
  $('#step-forward').click(function() {
    var newval;
    cloudburstTileLayer.forward();
    newval = parseInt(cloudburstTileLayer.getTindex());
    if (newval === cloudburstTileLayer.getTindexes().length - 1) {
      $('#step-forward').addClass('disabled');
    } else {
      $('#step-forward').removeClass('disabled');
    }
    $('#step-backward').removeClass('disabled');
    return $('#indexes').prop("selectedIndex", newval);
  });
  make_slider = function() {
    var s, t;
    return s = $('#ex1').slider({
      ticks: (function() {
        var j, len, ref, results;
        ref = cloudburstTileLayer.getTindexes(true);
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          t = ref[j];
          results.push(parseInt(t[0]));
        }
        return results;
      })(),
      tick_positions: cloudburstTileLayer.getTindexesAsPercetagePositions(),
      ticks_snap_bounds: 1,
      value: parseInt(cloudburstTileLayer.getTindex()),
      formatter: function(value) {
        return cloudburstTileLayer.getTindexes(true)[value][1];
      }
    }).on('slideStop', function() {
      return cloudburstTileLayer.setTindex(s.val());
    });
  };
  return make_slider();
};

get_host = function() {
  return 'http://localhost:6060';
};

cloudburst = new Cloudburst(get_host());

callback = sample_layer_control;

cloudburst.loadConfiguration(callback);
