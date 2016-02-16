var callback, cloudburst, get_cloudburst_tileLayer, get_supplementary_tileLayer, make_map, sample_add_random_layer, sample_layer_control;

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

get_cloudburst_tileLayer = function(json, host) {
  var cloudburstTileLayer;
  cloudburstTileLayer = L.cloudburstTileLayer(host, json, {
    maxZoom: 21,
    maxNativeZoom: 21,
    reuseTiles: true,
    detectRetina: true
  });
  return cloudburstTileLayer;
};

get_supplementary_tileLayer = function() {
  var supplementary;
  supplementary = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 21,
    reuseTiles: true,
    detectRetina: true
  });
  return supplementary;
};

sample_add_random_layer = function(json) {
  var cloudburstTileLayer, randomindex;
  cloudburstTileLayer = get_cloudburst_tileLayer(json, host);
  randomindex = Math.floor(Math.random() * Object.keys(json.layers).length);
  cloudburstTileLayer.setLayer(Object.keys(json.layers)[randomindex]);
  return make_map([get_supplementary_tileLayer(), cloudburstTileLayer]);
};

sample_layer_control = function(json, host) {
  var appendElements, cloudburstTileLayer, do_appendElements, removeOptions;
  cloudburstTileLayer = get_cloudburst_tileLayer(json, host);
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
    var i, instances, j, k, len, len1, len2, lyr, ref, ref1, ref2, tindex;
    if ((refresh_layers == null) || refresh_layers) {
      removeOptions('layers');
      ref = cloudburstTileLayer.getLayers(true);
      for (i = 0, len = ref.length; i < len; i++) {
        lyr = ref[i];
        appendElements('layers', 'option', lyr[1].meta.name, lyr[0]);
      }
    }
    if ((refresh_instances == null) || refresh_instances) {
      removeOptions('instances');
      ref1 = cloudburstTileLayer.getInstances();
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        instances = ref1[j];
        appendElements('instances', 'option', instances);
      }
      cloudburstTileLayer.setInstance($('#instances').val());
    }
    if ((refresh_tindexes == null) || refresh_tindexes) {
      removeOptions('indexes');
      ref2 = cloudburstTileLayer.getTindexes(true);
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        tindex = ref2[k];
        appendElements('indexes', 'option', tindex[1], tindex[0]);
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
  $('#indexes').change(function() {
    return cloudburstTileLayer.setTindex($('option:selected', this).attr('title'));
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
  return $('#step-forward').click(function() {
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
};

cloudburst = new Cloudburst();

callback = sample_layer_control;

cloudburst.loadConfiguration(callback);
