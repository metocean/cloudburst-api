(function() {
  var callback, cloudburst, debug, get_cloudburst_tileLayer, get_supplementary_tileLayer, global_time, make_map, sample_add_random_layer, sample_layer_control, sample_stack_n_layers, supplementaryUrl;

  supplementaryUrl = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png';

  global_time = void 0;

  debug = false;

  make_map = function(layers, mapdiv) {
    var map;
    mapdiv = mapdiv != null ? mapdiv : 'map';
    map = new L.Map(mapdiv, {
      layers: layers,
      center: new L.LatLng(-37.7772, 175.2756),
      zoom: 6,
      attributionControl: false
    });
    if (debug === true) {
      map.on('click', function(e) {
        return alert("Lat (" + e.latlng.lat + ", lon (" + e.latlng.lng + ")");
      });
    }
    return map;
  };

  get_cloudburst_tileLayer = function(host, json, opacity, zIndex) {
    var cloudburstTileLayer;
    cloudburstTileLayer = L.cloudburstTileLayer(host, json, {
      maxZoom: 21,
      maxNativeZoom: 21,
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
      maxZoom: 14,
      reuseTiles: true,
      detectRetina: true
    });
    return supplementary;
  };

  sample_stack_n_layers = function(json, host) {
    var cloudburstTileLayer, i, layers, _i;
    layers = [get_supplementary_tileLayer()];
    for (i = _i = 0; _i < 3; i = _i += 1) {
      cloudburstTileLayer = get_cloudburst_tileLayer(host, json, 0.6);
      cloudburstTileLayer.setLayer(Object.keys(json.layers)[i]);
      layers.push(cloudburstTileLayer);
    }
    return make_map(layers);
  };

  sample_add_random_layer = function(json, host) {
    var cloudburstTileLayer, randomindex;
    cloudburstTileLayer = get_cloudburst_tileLayer(host, json);
    randomindex = Math.floor(Math.random() * Object.keys(json.layers).length);
    cloudburstTileLayer.setLayer(Object.keys(json.layers)[randomindex]);
    return make_map([get_supplementary_tileLayer(), cloudburstTileLayer]);
  };

  sample_layer_control = function(json, host) {
    var activate_layers, active_layers, appendElements, closest, cloudburstTileLayer, create_layer_table, do_appendElements, get_button, get_opacity_slider, make_global_slider, make_opacity_slider, map, move_in_array, on_modal_layer_change, on_modal_layer_confirm, prepare_modal_dialogue, removeOptions, toggle_el_property;
    HTMLElement.prototype.removeClass = function(remove) {
      var classes, i, newClassName, _i, _ref;
      classes = this.className.split(" ");
      newClassName = '';
      for (i = _i = 0, _ref = classes.length; _i < _ref; i = _i += 1) {
        if (classes[i] !== remove) {
          newClassName += classes[i] + " ";
        }
      }
      return this.className = newClassName;
    };
    move_in_array = function(array, old_index, new_index) {
      var k;
      if (new_index >= array.length) {
        k = new_index - array.length;
      }
      array.splice(new_index, 0, array.splice(old_index, 1)[0]);
      return array;
    };
    cloudburstTileLayer = get_cloudburst_tileLayer(host, json);
    active_layers = [];
    map = make_map([get_supplementary_tileLayer()]);
    toggle_el_property = function(elem_id, property, off_on) {
      console.log("Turning " + elem_id + " " + property + " " + off_on);
      return $("#" + elem_id).prop(property, off_on);
    };
    closest = function(array, target) {
      return array.reduce(function(prev, curr) {
        if (Math.abs(curr - target) < Math.abs(prev - target)) {
          return curr;
        } else {
          return prev;
        }
      });
    };
    make_global_slider = function(off_on, values, slider_class, slider_id) {
      var $pips, t, tooltip, val, _i, _len;
      toggle_el_property(slider_id, 'hidden', off_on);
      if (values != null) {
        slider_class = slider_class != null ? slider_class : 'slider';
        slider_id = slider_id != null ? slider_id : 'global-slider';
        $("." + slider_class).slider({
          min: Math.min.apply(Math, values),
          max: Math.max.apply(Math, values),
          change: function(event, ui) {
            var lyr, lyr_moments, selected_moment_str, _i, _len;
            for (_i = 0, _len = active_layers.length; _i < _len; _i++) {
              lyr = active_layers[_i];
              lyr_moments = (function() {
                var _j, _len1, _ref, _results;
                _ref = lyr.getTindexes(true);
                _results = [];
                for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                  t = _ref[_j];
                  _results.push(moment(t[1]).unix());
                }
                return _results;
              })();
              selected_moment_str = closest(lyr_moments, ui.value);
              lyr.setTindex(lyr_moments.indexOf(selected_moment_str));
            }
            global_time = ui.value;
            return activate_layers();
          },
          slide: function(event, ui) {
            $('[data-toggle="tooltip"]').prop('title', moment.unix(ui.value).format('LLLL'));
          }
        }).slider("pips", {
          first: 'label',
          last: 'label',
          rest: 'pip',
          labels: (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = values.length; _i < _len; _i++) {
              t = values[_i];
              _results.push(moment.unix(t).fromNow());
            }
            return _results;
          })()
        });
        $pips = $("." + slider_class).find(".ui-slider-pip");
        for (_i = 0, _len = values.length; _i < _len; _i++) {
          val = values[_i];
          $pips.filter(".ui-slider-pip-" + val).show();
        }
        tooltip = '<a href="#" id="global-slider-tooltip" data-toggle="tooltip">&nbsp&nbsp&nbsp&nbsp</a>';
        $("." + slider_class + " .ui-slider-handle").html(tooltip);
        $('[data-toggle="tooltip"]').tooltip({
          placement: 'top'
        });
      }
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
    do_appendElements = function(refresh_layers, refresh_instances) {
      var instance, lyr, _i, _j, _len, _len1, _ref, _ref1;
      if ((refresh_layers == null) || refresh_layers) {
        removeOptions('layers');
        _ref = cloudburstTileLayer.getLayers(true);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          lyr = _ref[_i];
          appendElements('layers', 'option', lyr[1].meta.name, lyr[0]);
        }
      }
      if ((refresh_instances == null) || refresh_instances) {
        removeOptions('instances');
        _ref1 = cloudburstTileLayer.getInstances();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          instance = _ref1[_j];
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
    make_opacity_slider = function(slider_id, lyr, value, step) {
      return $("#" + slider_id).slider({
        min: 0,
        max: 100,
        value: value != null ? value : lyr.options.opacity * 100,
        step: step != null ? step : 10,
        stop: function(event, ui) {
          slider_id = parseInt(this.id.split("-").slice(-1)[0]);
          active_layers[slider_id].setOpacity(ui.value / 100);
        }
      });
    };
    get_opacity_slider = function(slider_id) {
      var input;
      input = document.createElement('div');
      input.setAttribute('id', slider_id);
      return input.outerHTML;
    };
    create_layer_table = function(table_id) {
      var legendsrc, lyr, row, rowi, _i, _len, _ref;
      table_id = table_id != null ? table_id : "layer-table";
      document.getElementById(table_id).innerHTML = null;
      _ref = active_layers.reverse();
      for (rowi = _i = 0, _len = _ref.length; _i < _len; rowi = ++_i) {
        lyr = _ref[rowi];
        row = document.getElementById(table_id).insertRow(-1);
        row.insertCell(0).innerHTML = get_button("remove-layer-" + rowi, ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer']);
        row.insertCell(1).innerHTML = "" + (lyr.getLayerName()) + "<br>" + (lyr.getInstance());
        row.insertCell(2).innerHTML = get_opacity_slider("opacity-slider-" + rowi);
        row.insertCell(3).innerHTML = moment(lyr.getTindex(true)).format('LLLL');
        legendsrc = lyr.getLayerLegendUrl('small', 'horizontal');
        row.insertCell(4).innerHTML = "<img src=\"" + legendsrc + "\" alt='' />";
        make_opacity_slider("opacity-slider-" + rowi, lyr, lyr.options.opacity * 100);
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
          active_layers = move_in_array(active_layers, ui.item.startPos, ui.item.index());
          return activate_layers();
        }
      }).disableSelection();
    };
    activate_layers = function() {
      var lyr, t, t_set, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      map.eachLayer(function(lyr) {
        if (!(lyr._url === supplementaryUrl)) {
          return map.removeLayer(lyr);
        }
      });
      _ref = active_layers.reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lyr = _ref[_i];
        lyr.addTo(map);
      }
      t_set = new Set();
      for (_j = 0, _len1 = active_layers.length; _j < _len1; _j++) {
        lyr = active_layers[_j];
        _ref1 = lyr.getTindexes(true);
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          t = _ref1[_k];
          t_set.add(moment(t[1]).unix());
        }
      }
      make_global_slider(false, Array.from(t_set));
      return create_layer_table();
    };
    on_modal_layer_change = function(selected_list) {
      cloudburstTileLayer.setLayer($('option:selected', selected_list).attr('title'));
      do_appendElements(false, true);
      document.getElementById("modal-layer-info").innerHTML = cloudburstTileLayer.getLayerDescription();
    };
    on_modal_layer_confirm = function() {
      var lyr_moments, selected_lyr, selected_moment_str, t;
      selected_lyr = get_cloudburst_tileLayer(host, json);
      selected_lyr.setLayer($('option:selected', $('#layers'))[0].title);
      selected_lyr.setInstance($('option:selected', $('#instances')).val());
      if (global_time != null) {
        lyr_moments = (function() {
          var _i, _len, _ref, _results;
          _ref = selected_lyr.getTindexes(true);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            _results.push(moment(t[1]).unix());
          }
          return _results;
        })();
        selected_moment_str = closest(lyr_moments, global_time);
        selected_lyr.setTindex(lyr_moments.indexOf(selected_moment_str));
      }
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
    $('#modal-confirm-add').click(function() {
      return on_modal_layer_confirm();
    });
    return make_global_slider(true);
  };

  cloudburst = new Cloudburst();

  callback = sample_layer_control;

  cloudburst.loadConfiguration(callback);

}).call(this);
