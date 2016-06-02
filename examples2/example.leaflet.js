var activate_layers, appendElements, basemap_dark, basemap_light_labels, basemapnames, basemaps, basemaps_urls, closest, cloudburst, create_layer_table, debug, diff, do_appendInstances, do_appendLayers, get_button, get_cloudburst_tileLayer, get_opacity_slider, get_supplementary_tileLayer, global_time, layer_control, make_global_slider, make_map, make_opacity_slider, move_in_array, on_modal_layer_change, on_modal_layer_confirm, prepare_modal_dialogue, removeOptions, tileHost, toggle_el_property, url, zoom_to_layer,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

get_supplementary_tileLayer = function(url) {
  var supplementary;
  url = url != null ? url : basemap_light;
  supplementary = L.tileLayer(url, {
    maxZoom: 21,
    reuseTiles: true,
    zindex: 0,
    detectRetina: true,
    edgeBufferTiles: 2
  });
  return supplementary;
};

basemap_dark = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png';

basemap_light_labels = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

basemaps_urls = [basemap_dark, basemap_light_labels];

basemaps = (function() {
  var j, len, results;
  results = [];
  for (j = 0, len = basemaps_urls.length; j < len; j++) {
    url = basemaps_urls[j];
    results.push(get_supplementary_tileLayer(url));
  }
  return results;
})();

basemapnames = {
  'Dark': basemaps[0],
  'Light & Labelled': basemaps[1]
};

global_time = void 0;

debug = false;

tileHost = "http://localhost:6060";

make_map = function(mapdiv) {
  var map;
  mapdiv = mapdiv != null ? mapdiv : 'map';
  map = new L.Map(mapdiv, {
    layers: basemaps[1],
    center: new L.LatLng(39.50, -98.35),
    zoom: 5,
    attributionControl: true,
    loadingControl: true
  });
  if (debug === true) {
    map.on('click', function(e) {
      return alert("Lat (" + e.latlng.lat + ", lon (" + e.latlng.lng + ")");
    });
  }
  L.control.layers(basemapnames).addTo(map);
  return map;
};

diff = function(ary) {
  var i, newA;
  newA = [];
  i = 1;
  while (i < ary.length) {
    newA.push(ary[i] - ary[i - 1]);
    i++;
  }
  return newA;
};

move_in_array = function(array, old_index, new_index) {
  array.splice(new_index, 0, array.splice(old_index, 1)[0]);
  return array;
};

toggle_el_property = function(elem_id, property, off_on) {
  if (debug === true) {
    console.log("Turning " + elem_id + " " + property + " " + off_on);
  }
  return $("#" + elem_id).prop(property, off_on);
};

closest = function(array, target) {
  if (array === null) {
    return;
  }
  return array.reduce(function(prev, curr) {
    if (Math.abs(curr - target) < Math.abs(prev - target)) {
      return curr;
    } else {
      return prev;
    }
  });
};

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

get_opacity_slider = function(slider_id) {
  var input;
  input = document.createElement('div');
  input.setAttribute('id', slider_id);
  return input.outerHTML;
};

make_opacity_slider = function(layers, slider_id, value, step) {
  console.log(layers[parseInt(slider_id.split("-").slice(-1)[0])][0].options.opacity);
  $("#" + slider_id).slider({
    min: 0,
    max: 100,
    value: value != null ? value : layers[parseInt(slider_id.split("-").slice(-1)[0])][0].options.opacity * 100,
    suffix: "%",
    step: step != null ? step : 10,
    stop: function(event, ui) {
      slider_id = parseInt(this.id.split("-").slice(-1)[0]);
      layers[slider_id][0].setOpacity(ui.value / 100);
    }
  }).slider("float", {
    pips: true
  });
};

do_appendLayers = function(layersJson, refresh_layers) {
  var j, len, lyr;
  if ((refresh_layers == null) || refresh_layers) {
    removeOptions('layers');
    for (j = 0, len = layersJson.length; j < len; j++) {
      lyr = layersJson[j];
      appendElements('layers', 'option', lyr.meta.name, lyr.id);
    }
  }
};

do_appendInstances = function(layerJson, refresh_instances) {
  var instance, j, len, ref;
  if ((refresh_instances == null) || refresh_instances) {
    removeOptions('instances');
    ref = layerJson.instances;
    for (j = 0, len = ref.length; j < len; j++) {
      instance = ref[j];
      appendElements('instances', 'option', instance.id);
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

create_layer_table = function(map, layers, table_id) {
  var decrease, depth, dt, increase, instance, j, l, layer, layer_name, layer_utils, legend, legendURL, len, lyr, opacity_slider, ref, remove_button, row, rowi, zoom_to_layer_button;
  table_id = table_id != null ? table_id : "layer-table";
  document.getElementById(table_id).innerHTML = null;
  ref = layers.reverse();
  for (rowi = j = 0, len = ref.length; j < len; rowi = ++j) {
    l = ref[rowi];
    lyr = l[0];
    layer = l[1];
    instance = l[2];
    row = document.getElementById(table_id).insertRow(-1);
    rowi = document.getElementById(table_id).rows.length - 1;
    layer_utils = row.insertCell(0);
    remove_button = get_button("remove-layer-" + rowi, ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer']);
    zoom_to_layer_button = get_button("zoom-layer-" + rowi, ['glyphicon', 'glyphicon-screenshot'], ['btn', 'btn-default', 'btn-xs', 'zoom-to-layer']);
    layer_utils.innerHTML = remove_button + zoom_to_layer_button;
    $(layer_utils).addClass('col-md-1');
    layer_name = row.insertCell(1);
    layer_name.innerHTML = "<strong>" + layer.meta.name + "</strong><br>" + instance.id;
    $(layer_name).addClass('col-md-3');
    opacity_slider = row.insertCell(2);
    opacity_slider.innerHTML = get_opacity_slider("opacity-slider-" + rowi);
    $(opacity_slider).addClass('col-md-2');
    make_opacity_slider(layers, "opacity-slider-" + rowi);
    dt = row.insertCell(3);
    if (lyr.hasTimes) {
      dt.innerHTML = moment(lyr.getTime(), moment.ISO_8601).format('llll');
    } else {
      dt.innerHTML = "<span>N/A<span>";
    }
    $(dt).addClass('col-md-2');
    depth = row.insertCell(4);
    $(depth).addClass('col-md-1');
    if (lyr.hasLevels) {
      increase = get_button("increase-depth-" + rowi, ['glyphicon', 'glyphicon-circle-arrow-up'], ['btn', 'btn-md', 'decrease-depth', "decrease-depth-" + rowi, 'depth']);
      decrease = get_button("decrease-depth-" + rowi, ['glyphicon', 'glyphicon-circle-arrow-down'], ['btn', 'btn-md', 'increase-depth', "increase-depth-" + rowi, 'depth']);
      depth.innerHTML = increase + decrease;
      $(".increase-depth-" + rowi).on('click', function() {
        var btn_row;
        btn_row = parseInt(this.id.split("-").slice(-1)[0]);
        return layers[btn_row].deeper(false);
      });
      $(".decrease-depth-" + rowi).on('click', function() {
        var btn_row;
        btn_row = parseInt(this.id.split("-").slice(-1)[0]);
        return layers[btn_row].higher(false);
      });
    } else {
      depth.innerHTML = "<span>No depth</span>";
    }
    legend = row.insertCell(5);
    legendURL = instance.resources.legend.replace('<size>', 'small').replace('<orientation>', 'horizontal');
    legend.innerHTML = "<img src=\"" + tileHost + legendURL + "\" alt='' />";
    $(legend).addClass('col-md-3');
  }
  $(".remove-layer").click(function() {
    layers.splice(parseInt(this.id.split("-").slice(-1)[0]), 1);
    return activate_layers(map, layers);
  });
  $(".zoom-to-layer").click(function() {
    return zoom_to_layer(map, layers[this.id.split("-").slice(-1)[0]][0]);
  });
  return $("#layer-table-parent tbody").sortable({
    start: function(event, ui) {
      return ui.item.startPos = ui.item.index();
    },
    update: function(event, ui) {
      layers = move_in_array(layers, ui.item.startPos, ui.item.index());
      return activate_layers(map, layers);
    }
  }).disableSelection();
};

make_global_slider = function(map, layers, values, off_on, slider_class, slider_id) {
  var closest_to_now, labels, moments, now, t, times;
  toggle_el_property(slider_id, 'hidden', off_on);
  if ((values != null) && values.length > 0) {
    moments = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = values.length; j < len; j++) {
        t = values[j];
        results.push(moment.unix(t));
      }
      return results;
    })();
    labels = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = moments.length; j < len; j++) {
        t = moments[j];
        results.push(t.fromNow());
      }
      return results;
    })();
    times = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = moments.length; j < len; j++) {
        t = moments[j];
        results.push(t.unix());
      }
      return results;
    })();
    now = (new Date).getTime() / 1000;
    closest_to_now = closest(times, now);
    slider_class = slider_class != null ? slider_class : 'slider';
    slider_id = slider_id != null ? slider_id : 'global-slider';
    return $("." + slider_class).slider({
      min: Math.min.apply(Math, times),
      max: Math.max.apply(Math, times),
      step: Math.min.apply(Math, diff(times)),
      value: closest_to_now,
      change: function(event, ui) {
        var j, len, lyr, lyr_moments, selected_moment_str;
        global_time = ui.value;
        for (j = 0, len = layers.length; j < len; j++) {
          lyr = layers[j];
          lyr_moments = (function() {
            var k, len1, ref, results;
            ref = lyr[0].getTimes();
            results = [];
            for (k = 0, len1 = ref.length; k < len1; k++) {
              t = ref[k];
              results.push(moment(t, moment.ISO_8601).unix());
            }
            return results;
          })();
          selected_moment_str = closest(lyr_moments, global_time);
          lyr[0].setTime(lyr[0].getTimes()[lyr_moments.indexOf(selected_moment_str)]);
        }
        return activate_layers(map, layers, false);
      }
    }).slider("pips", {
      first: 'label',
      last: 'label',
      rest: 'pip',
      labels: labels
    }).slider("float", {
      labels: labels,
      handle: true,
      pips: true
    });
  }
};

on_modal_layer_change = function(json, selected_list) {
  var layerID;
  layerID = $('option:selected', selected_list).attr('title');
  return cloudburst.loadLayer(layerID, do_appendInstances).then(function(layer) {
    document.getElementById("modal-layer-info").innerHTML = layer.meta.description;
  });
};

on_modal_layer_confirm = function(map, cb) {
  var instanceID, layerID;
  layerID = $('option:selected', $('#layers')).attr('title');
  instanceID = $('option:selected', $('#instances')).val();
  return cloudburst.loadLayer(layerID, function(layer) {
    return cloudburst.loadInstance(layerID, instanceID, function(instance) {
      var tileTemplate;
      tileTemplate = [tileHost, instance.resources.tile].join('');
      return cloudburst.loadTimes(layerID, instanceID, function(times) {
        var selected_lyr;
        selected_lyr = new L.cloudburstTileLayer(tileTemplate, times, void 0, layer.bounds);
        if (cb != null) {
          return cb([selected_lyr, layer, instance]);
        }
        return [selected_lyr, layer, instance];
      });
    });
  });
};

prepare_modal_dialogue = function(json, modal_div) {
  do_appendLayers(json, true);
  cloudburst.loadLayer(json[0].id, do_appendInstances);
  modal_div = modal_div != null ? modal_div : "modal-layer-info";
  document.getElementById(modal_div).innerHTML = json[0].meta.description;
};

zoom_to_layer = function(map, tileLayer) {
  return map.fitBounds(tileLayer.getBounds());
};

activate_layers = function(map, layers, refresh_slider) {
  var j, k, len, len1, len2, lyr, m, ref, t, t_set, times;
  refresh_slider = refresh_slider != null ? refresh_slider : true;
  map.eachLayer(function(lyr) {
    var ref;
    if (!(ref = lyr._url, indexOf.call(basemaps_urls, ref) >= 0)) {
      return map.removeLayer(lyr);
    }
  });
  ref = layers.reverse();
  for (j = 0, len = ref.length; j < len; j++) {
    lyr = ref[j];
    lyr[0].addTo(map).bringToFront();
  }
  t_set = new Set();
  for (k = 0, len1 = layers.length; k < len1; k++) {
    lyr = layers[k];
    times = lyr[0].getTimes();
    if (times != null) {
      for (m = 0, len2 = times.length; m < len2; m++) {
        t = times[m];
        t_set.add(moment(t, moment.ISO_8601).unix());
      }
    }
  }
  if (refresh_slider) {
    make_global_slider(map, layers, Array.from(t_set), false);
  }
  return create_layer_table(map, layers);
};

get_cloudburst_tileLayer = function(urlTemplate, times, levels, bounds, options) {
  var cloudburstTileLayer;
  cloudburstTileLayer = L.cloudburstTileLayer(urlTemplate, times, levels, bounds, {
    maxZoom: 21,
    maxNativeZoom: 21,
    reuseTiles: false,
    detectRetina: true,
    opacity: typeof opacity !== "undefined" && opacity !== null ? opacity : 1.0,
    zIndex: typeof zIndex !== "undefined" && zIndex !== null ? zIndex : null,
    edgeBufferTiles: 2
  });
  return cloudburstTileLayer;
};

layer_control = function(json, host) {
  var active_layers, map;
  map = make_map();
  active_layers = [];
  prepare_modal_dialogue(json);
  $('#layers').change(function() {
    return on_modal_layer_change(json, this);
  });
  return $('#modal-confirm-add').click(function() {
    return on_modal_layer_confirm(map, function(l) {
      active_layers.push(l);
      activate_layers(map, active_layers);
      return zoom_to_layer(map, l[0]);
    });
  });
};

cloudburst = new Cloudburst();

cloudburst.loadConfiguration(layer_control);
