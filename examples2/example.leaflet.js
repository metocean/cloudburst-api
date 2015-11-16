var callback, cloudburst, get_cloudburst_tileLayer, get_host, get_supplementary_tileLayer, make_map, sample_add_random_layer, sample_layer_control, sample_stack_n_layers, supplementaryUrl;

supplementaryUrl = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png';

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
  supplementary = L.tileLayer(supplementaryUrl, {
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
  var activate_layers, active_layers, appendElements, cloudburstTileLayer, create_layer_table, do_appendElements, get_button, get_opacity_slider, make_opacity_slider, map, on_modal_layer_change, on_modal_layer_confirm, prepare_modal_dialogue, removeOptions;
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
  Array.prototype.move = function(old_index, new_index) {
    var k;
    if (new_index >= this.length) {
      k = new_index - this.length;
    }
    return this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  };
  cloudburstTileLayer = get_cloudburst_tileLayer(json);
  active_layers = [];
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
  do_appendElements = function(refresh_layers, refresh_instances) {
    var j, l, len, len1, lyr, ref, ref1;
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
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        lyr = ref1[l];
        appendElements('instances', 'option', lyr);
      }
    }
  };
  get_button = function(id, icon_classes, button_classes) {
    var btn, span;
    btn = document.createElement('button');
    span = document.createElement('span');
    span.setAttribute('class', icon_classes.join(' '));
    btn.innerHTML = span.outerHTML;
    btn.setAttribute('type', 'button');
    btn.setAttribute('class', button_classes.join(' '));
    btn.setAttribute('id', id);
    return btn.outerHTML;
  };
  make_opacity_slider = function(slider_id, lyr, value, step) {
    var s;
    return s = $("#" + slider_id).slider({
      min: 0,
      max: 100,
      value: value != null ? value : lyr.options.opacity * 100,
      step: step != null ? step : 10,
      stop: function(event, ui) {
        slider_id = parseInt(this.id.split("-").slice(-1)[0]);
        return active_layers[slider_id].setOpacity(ui.value / 100);
      }
    });
  };
  get_opacity_slider = function(slider_id) {
    var input;
    input = document.createElement('div');
    input.setAttribute('id', slider_id);
    console.log(input.outerHTML);
    return input.outerHTML;
  };
  create_layer_table = function(table_id) {
    var j, len, lyr, ref, row, rowi;
    table_id = table_id != null ? table_id : "layer-table";
    document.getElementById(table_id).innerHTML = null;
    ref = active_layers.reverse();
    for (j = 0, len = ref.length; j < len; j++) {
      lyr = ref[j];
      row = document.getElementById(table_id).insertRow(-1);
      rowi = document.getElementById(table_id).rows.length - 1;
      row.insertCell(0).innerHTML = get_button("remove-layer-" + rowi, ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer']);
      row.insertCell(1).innerHTML = (lyr.getLayerName()) + "<br>" + (lyr.getInstance());
      row.insertCell(2).innerHTML = get_opacity_slider("opacity-slider-" + rowi);
      row.insertCell(3).innerHTML = 'TODO!';
      make_opacity_slider("opacity-slider-" + rowi, lyr);
    }
    $(".remove-layer").click(function() {
      active_layers.splice(parseInt(this.id.split("-").slice(-1)[0]), 1);
      return activate_layers();
    });
    $("#layer-table-parent tbody").sortable({
      start: function(event, ui) {
        return ui.item.startPos = ui.item.index();
      },
      update: function(event, ui) {
        active_layers.move(ui.item.startPos, ui.item.index());
        return activate_layers();
      }
    }).disableSelection();
  };
  activate_layers = function() {
    var j, len, lyr, ref;
    map.eachLayer(function(lyr) {
      if (!(lyr._url === supplementaryUrl)) {
        return map.removeLayer(lyr);
      }
    });
    ref = active_layers.reverse();
    for (j = 0, len = ref.length; j < len; j++) {
      lyr = ref[j];
      lyr.addTo(map);
    }
    return create_layer_table();
  };
  on_modal_layer_change = function(selected_list) {
    var candidateLayer;
    candidateLayer = $.extend({}, cloudburstTileLayer);
    candidateLayer.setLayer($('option:selected', selected_list).attr('title'));
    do_appendElements(false, true);
    document.getElementById("modal-layer-info").innerHTML = candidateLayer.getLayerDescription();
  };
  on_modal_layer_confirm = function() {
    var selected_lyr;
    selected_lyr = $.extend({}, cloudburstTileLayer);
    selected_lyr.setLayer($('option:selected', $('#layers')).attr('title'));
    selected_lyr.setInstance($('option:selected', $('#instances')).attr('title'));
    active_layers.push(selected_lyr);
    return activate_layers();
  };
  prepare_modal_dialogue = function(modal_div) {
    do_appendElements(true, true);
    modal_div = modal_div != null ? modal_div : "modal-layer-info";
    return document.getElementById(modal_div).innerHTML = cloudburstTileLayer.getLayerDescription();
  };
  prepare_modal_dialogue();
  $('#layers').change(function() {
    return on_modal_layer_change(this);
  });
  return $('#modal-confirm-add').click(function() {
    return on_modal_layer_confirm();
  });
};

get_host = function() {
  return 'http://localhost:6060';
};

cloudburst = new Cloudburst(get_host());

callback = sample_layer_control;

cloudburst.loadConfiguration(callback);
