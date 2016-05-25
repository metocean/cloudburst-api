var appendElements, basemap_dark, basemap_light_labels, basemapnames, basemaps, basemaps_urls, callback, closest, cloudburst, debug, diff, do_appendElements, get_button, get_cloudburst_tileLayer, get_opacity_slider, get_supplementary_tileLayer, global_time, make_map, move_in_array, on_modal_layer_change, prepare_modal_dialogue, removeOptions, sample_layer_control, toggle_el_property, url, zoom_to_layer,
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

do_appendElements = function(tileLayer, refresh_layers, refresh_instances) {
  var instance, j, k, len, len1, lyr, ref, ref1;
  if ((refresh_layers == null) || refresh_layers) {
    removeOptions('layers');
    ref = tileLayer.getLayers(true);
    for (j = 0, len = ref.length; j < len; j++) {
      lyr = ref[j];
      appendElements('layers', 'option', lyr[1].meta.name, lyr[0]);
    }
  }
  if ((refresh_instances == null) || refresh_instances) {
    removeOptions('instances');
    ref1 = tileLayer.getInstances();
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      instance = ref1[k];
      appendElements('instances', 'option', instance);
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

on_modal_layer_change = function(tileLayer, selected_list) {
  tileLayer.setLayer($('option:selected', selected_list).attr('title'));
  do_appendElements(tileLayer, false, true);
  document.getElementById("modal-layer-info").innerHTML = tileLayer.getLayerDescription();
};

prepare_modal_dialogue = function(tileLayer, modal_div) {
  do_appendElements(tileLayer, true, true);
  modal_div = modal_div != null ? modal_div : "modal-layer-info";
  return document.getElementById(modal_div).innerHTML = tileLayer.getLayerDescription();
};

zoom_to_layer = function(map, tileLayer) {
  return map.fitBounds(tileLayer.getBounds());
};

get_cloudburst_tileLayer = function(host, json, opacity, zIndex) {
  var cloudburstTileLayer;
  cloudburstTileLayer = L.cloudburstTileLayer(host, json, {
    maxZoom: 21,
    maxNativeZoom: 21,
    reuseTiles: false,
    detectRetina: true,
    opacity: opacity != null ? opacity : 1.0,
    zIndex: zIndex != null ? zIndex : null,
    edgeBufferTiles: 2
  });
  return cloudburstTileLayer;
};

sample_layer_control = function(json, host) {
  var activate_layers, active_layers, cloudburstTileLayer, create_layer_table, make_global_slider, make_opacity_slider, map, on_modal_layer_confirm;
  cloudburstTileLayer = get_cloudburst_tileLayer(host, json);
  active_layers = [];
  map = make_map();
  make_global_slider = function(off_on, values, slider_class, slider_id) {
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
          for (j = 0, len = active_layers.length; j < len; j++) {
            lyr = active_layers[j];
            lyr_moments = (function() {
              var k, len1, ref, results;
              ref = lyr.getTindexes(true);
              results = [];
              for (k = 0, len1 = ref.length; k < len1; k++) {
                t = ref[k];
                results.push(moment(t[1], moment.ISO_8601).unix());
              }
              return results;
            })();
            selected_moment_str = closest(lyr_moments, global_time);
            lyr.setTindex(lyr_moments.indexOf(selected_moment_str));
          }
          return activate_layers(false);
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
  make_opacity_slider = function(slider_id, lyr, value, step) {
    $("#" + slider_id).slider({
      min: 0,
      max: 100,
      value: value != null ? value : lyr.options.opacity * 100,
      suffix: "%",
      step: step != null ? step : 10,
      stop: function(event, ui) {
        slider_id = parseInt(this.id.split("-").slice(-1)[0]);
        active_layers[slider_id].setOpacity(ui.value / 100);
      }
    }).slider("float", {
      pips: true
    });
  };
  create_layer_table = function(table_id) {
    var _dt, decrease, depth, dt, increase, j, layer_name, layer_utils, legend, legendsrc, len, lyr, opacity_slider, ref, remove_button, row, rowi, zoom_to_layer_button;
    table_id = table_id != null ? table_id : "layer-table";
    document.getElementById(table_id).innerHTML = null;
    ref = active_layers.reverse();
    for (rowi = j = 0, len = ref.length; j < len; rowi = ++j) {
      lyr = ref[rowi];
      row = document.getElementById(table_id).insertRow(-1);
      rowi = document.getElementById(table_id).rows.length - 1;
      layer_utils = row.insertCell(0);
      remove_button = get_button("remove-layer-" + rowi, ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer']);
      zoom_to_layer_button = get_button("zoom-layer-" + rowi, ['glyphicon', 'glyphicon-screenshot'], ['btn', 'btn-default', 'btn-xs', 'zoom-to-layer']);
      layer_utils.innerHTML = remove_button + zoom_to_layer_button;
      $(layer_utils).addClass('col-md-1');
      layer_name = row.insertCell(1);
      layer_name.innerHTML = "<strong>" + (lyr.getLayerName()) + "</strong><br>" + (lyr.getInstance());
      $(layer_name).addClass('col-md-3');
      opacity_slider = row.insertCell(2);
      opacity_slider.innerHTML = get_opacity_slider("opacity-slider-" + rowi);
      $(opacity_slider).addClass('col-md-2');
      dt = row.insertCell(3);
      _dt = lyr.getTindex(true);
      if (_dt != null) {
        dt.innerHTML = moment(_dt, moment.ISO_8601).format('llll');
      } else {
        dt.innerHTML = "<span>N/A<span>";
      }
      $(dt).addClass('col-md-2');
      depth = row.insertCell(4);
      $(depth).addClass('col-md-1');
      if (lyr.getLevels().length > 1) {
        increase = get_button("increase-depth-" + rowi, ['glyphicon', 'glyphicon-circle-arrow-up'], ['btn', 'btn-md', 'decrease-depth', "decrease-depth-" + rowi, 'depth']);
        decrease = get_button("decrease-depth-" + rowi, ['glyphicon', 'glyphicon-circle-arrow-down'], ['btn', 'btn-md', 'increase-depth', "increase-depth-" + rowi, 'depth']);
        depth.innerHTML = increase + decrease;
        $(".increase-depth-" + rowi).on('click', function() {
          var btn_row;
          btn_row = parseInt(this.id.split("-").slice(-1)[0]);
          return active_layers[btn_row].deeper(false);
        });
        $(".decrease-depth-" + rowi).on('click', function() {
          var btn_row;
          btn_row = parseInt(this.id.split("-").slice(-1)[0]);
          return active_layers[btn_row].higher(false);
        });
      } else {
        depth.innerHTML = "<span>No depth</span>";
      }
      legendsrc = lyr.getLayerLegendUrl('small', 'horizontal');
      legend = row.insertCell(5);
      legend.innerHTML = "<img src=\"" + legendsrc + "\" alt='' />";
      $(legend).addClass('col-md-3');
      make_opacity_slider("opacity-slider-" + rowi, lyr, lyr.options.opacity * 100);
    }
    $(".remove-layer").click(function() {
      active_layers.splice(parseInt(this.id.split("-").slice(-1)[0]), 1);
      return activate_layers();
    });
    $(".zoom-to-layer").click(function() {
      return zoom_to_layer(map, active_layers[this.id.split("-").slice(-1)[0]]);
    });
    $("#layer-table-parent tbody").sortable({
      start: function(event, ui) {
        return ui.item.startPos = ui.item.index();
      },
      update: function(event, ui) {
        active_layers = move_in_array(active_layers, ui.item.startPos, ui.item.index());
        return activate_layers();
      }
    }).disableSelection();
  };
  activate_layers = function(refresh_slider) {
    var _tindexes, j, k, l, len, len1, len2, len3, lyr, m, ref, ref1, ref2, t, t_set, z;
    refresh_slider = refresh_slider != null ? refresh_slider : true;
    map.eachLayer(function(lyr) {
      var ref;
      if (!(ref = lyr._url, indexOf.call(basemaps_urls, ref) >= 0)) {
        return map.removeLayer(lyr);
      }
    });
    ref = active_layers.reverse();
    for (j = 0, len = ref.length; j < len; j++) {
      lyr = ref[j];
      ref1 = active_layers.reverse();
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        lyr = ref1[k];
        lyr.addTo(map);
      }
    }
    t_set = new Set();
    z = basemaps.length + 1;
    for (l = 0, len2 = active_layers.length; l < len2; l++) {
      lyr = active_layers[l];
      lyr.setZIndex(!(ref2 = lyr._url, indexOf.call(basemaps_urls, ref2) >= 0) ? z + 1 : 0);
      z += 1;
      _tindexes = lyr.getTindexes(true);
      if (_tindexes[0][1] != null) {
        for (m = 0, len3 = _tindexes.length; m < len3; m++) {
          t = _tindexes[m];
          t_set.add(moment(t[1], moment.ISO_8601).unix());
        }
      }
    }
    if (refresh_slider) {
      make_global_slider(false, Array.from(t_set));
    }
    return create_layer_table();
  };
  on_modal_layer_confirm = function() {
    var _lyr_t, lyr_moments, selected_lyr, selected_moment_str, t;
    selected_lyr = get_cloudburst_tileLayer(host, json);
    selected_lyr.setLayer($('option:selected', $('#layers'))[0].title);
    selected_lyr.setInstance($('option:selected', $('#instances')).val());
    if (global_time != null) {
      _lyr_t = selected_lyr.getTindexes(true);
      if (_lyr_t[0][1] != null) {
        lyr_moments = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = _lyr_t.length; j < len; j++) {
            t = _lyr_t[j];
            results.push(moment(t[1], moment.ISO_8601).unix());
          }
          return results;
        })();
        selected_moment_str = closest(lyr_moments, global_time);
        selected_lyr.setTindex(lyr_moments.indexOf(selected_moment_str));
      } else {
        selected_lyr.setTindex(0);
      }
    }
    active_layers.push(selected_lyr);
    zoom_to_layer(map, active_layers[active_layers.length - 1]);
    return activate_layers();
  };
  prepare_modal_dialogue(cloudburstTileLayer);
  $('#layers').change(function() {
    return on_modal_layer_change(cloudburstTileLayer, this);
  });
  $('#modal-confirm-add').click(function() {
    return on_modal_layer_confirm();
  });
  return make_global_slider(true);
};

cloudburst = new Cloudburst();

callback = sample_layer_control;

cloudburst.loadConfiguration(callback);
