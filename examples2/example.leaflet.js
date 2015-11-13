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
  var appendElements, cloudburstTileLayer, do_appendElements, get_opacity_slider, get_remove_layer_button, make_opacity_slider, map, removeOptions;
  HTMLElement.prototype.removeClass = function(remove) {
    var classes, i, j, newClassName, ref;
    classes = this.className.split(" ");
    newClassName = '';
    for (i = j = 0, ref = classes.length; j < ref; i = j += 1) {
      if (classes[i] !== remove) {
        newClassName += classes[i] + " ";
      }
    }
    return this.className = newClassName;
  };
  cloudburstTileLayer = get_cloudburst_tileLayer(json);
  map = make_map([get_supplementary_tileLayer()]);
  removeOptions = function(container_id) {
    return $("#" + container_id).find('option').remove();
  };
  appendElements = function(container_id, element, content, title, className, role, id) {
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
  get_remove_layer_button = function(id) {
    '<button id="ncep_mslp-remove" class="btn btn-warning" type="button">\n  <span class="glyphicon glyphicon-minus"></span>\n</button>';
    var btn, span;
    btn = document.createElement('button');
    span = document.createElement('span');
    span.setAttribute('class', 'glyphicon glyphicon-minus');
    btn.innerHTML = span.outerHTML;
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', 'btn btn-warning btn-xs');
    btn.setAttribute('id', id);
    return btn.outerHTML;
  };
  get_opacity_slider = function(slider_id) {
    var input;
    input = document.createElement('input');
    input.setAttribute('id', slider_id);
    input.setAttribute('data-slider-id', slider_id);
    input.setAttribute('type', 'text');
    return input.outerHTML;
  };
  make_opacity_slider = function(slider_id, layer) {
    var s, step, value;
    return s = $("#" + slider_id).slider({
      min: 0,
      max: 100
    }, value = 100, step = 10).on('slideStop', function() {
      return layer.setOpacity(s.val() / 100);
    });
  };
  do_appendElements(true, true, true);
  document.getElementById("modal-layer-info").innerHTML = cloudburstTileLayer.getLayerDescription();
  $('#layers').change(function() {
    var candidateLayer;
    candidateLayer = $.extend({}, cloudburstTileLayer);
    candidateLayer.setLayer($('option:selected', this).attr('title'));
    do_appendElements(false, true, true);
    document.getElementById("modal-layer-info").innerHTML = candidateLayer.getLayerDescription();
    return document.getElementById("modal-layer-info").removeClass('hide');
  });
  return $('#modal-confirm-add').click(function() {
    var candidateLayer, layerTitle, row, rowi;
    candidateLayer = $.extend({}, cloudburstTileLayer);
    layerTitle = $('option:selected', $('#layers')).attr('title');
    candidateLayer.setLayer(layerTitle);
    candidateLayer.addTo(map);
    row = document.getElementById("layer-table").insertRow(-1);
    rowi = document.getElementById("layer-table").rows.length;
    row.insertCell(0).innerHTML = get_remove_layer_button('remove-layer-' + rowi);
    row.insertCell(1).innerHTML = candidateLayer.getLayerName() + '<br>' + candidateLayer.getInstance();
    row.insertCell(2).innerHTML = get_opacity_slider('opacity-slider-' + rowi);
    row.insertCell(3).innerHTML = 'TODO!';
    return make_opacity_slider('opacity-slider-' + rowi, candidateLayer);
  });
};

get_host = function() {
  return 'http://localhost:6060';
};

cloudburst = new Cloudburst(get_host());

callback = sample_layer_control;

cloudburst.loadConfiguration(callback);
