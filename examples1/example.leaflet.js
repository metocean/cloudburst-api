var add_cloudburst_tile_layer, appendElements, cloudburst, get_cloudburst_tileLayer, get_supplementary_tileLayer, layer_control, make_map, removeOptions, tileHost;

tileHost = "http://localhost:6060";

make_map = function(layers, mapdiv) {
  var map;
  mapdiv = mapdiv != null ? mapdiv : 'map';
  map = new L.Map(mapdiv, {
    layers: layers,
    center: new L.LatLng(39.50, -98.35),
    zoom: 5,
    attributionControl: false
  });
  return map;
};

get_cloudburst_tileLayer = function(urlTemplate, times, levels, bounds, options) {
  var cloudburstTileLayer;
  cloudburstTileLayer = L.cloudburstTileLayer(urlTemplate, times, levels, bounds, {
    maxZoom: 21,
    maxNativeZoom: 21,
    reuseTiles: true,
    detectRetina: true
  });
  return cloudburstTileLayer;
};

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

get_supplementary_tileLayer = function() {
  var supplementary;
  supplementary = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
    maxZoom: 21,
    reuseTiles: true,
    detectRetina: true
  });
  return supplementary;
};

add_cloudburst_tile_layer = function(map, json, layerid) {
  var instance, layer;
  layer = json.filter(function(obj) {
    return obj.id === layerid;
  })[0];
  map.eachLayer(function(lyr) {
    if (lyr._url.indexOf('basemaps') === -1) {
      return map.removeLayer(lyr);
    }
  });
  return instance = cloudburst.loadInstance(layer.id, layer.instances[0].id).then(function(instance) {
    var times;
    return times = cloudburst.loadTimes(layer.id, layer.instances[0].id).then(function(times) {
      var levels;
      return levels = cloudburst.loadLevels(layer.id, layer.instances[0].id).then(function(levels) {
        var cloudburstTileLayer;
        cloudburstTileLayer = get_cloudburst_tileLayer(tileHost + instance.resources.tile, times, levels, layer.bounds);
        cloudburstTileLayer.addTo(map);
        map.fitBounds(cloudburstTileLayer.getBounds());
        return cloudburstTileLayer;
      });
    });
  });
};

layer_control = function(json) {
  var i, instance, j, layer, len, len1, lyr, map, ref;
  layer = json[0];
  removeOptions('layers');
  for (i = 0, len = json.length; i < len; i++) {
    lyr = json[i];
    appendElements('layers', 'option', lyr.meta.name, lyr.id);
  }
  ref = layer.instances;
  for (j = 0, len1 = ref.length; j < len1; j++) {
    instance = ref[j];
    appendElements('instances', 'option', instance.id);
  }
  cloudburst.loadTimes(layer.id, layer.instances[0].id).then(function(times) {
    var k, len2, results, t;
    results = [];
    for (k = 0, len2 = times.length; k < len2; k++) {
      t = times[k];
      results.push(appendElements('indexes', 'option', t, t));
    }
    return results;
  });
  map = make_map([get_supplementary_tileLayer()]);
  add_cloudburst_tile_layer(map, json, layer.id);
  $('#layers').change(function() {
    return cloudburst.loadLayer($('option:selected', this).attr('title')).then(function(layer) {
      var k, len2, ref1;
      removeOptions('instances');
      ref1 = layer.instances;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        instance = ref1[k];
        appendElements('instances', 'option', instance.id);
      }
      removeOptions('indexes');
      return cloudburst.loadTimes(layer.id, layer.instances[0].id).then(function(times) {
        var l, len3, t;
        for (l = 0, len3 = times.length; l < len3; l++) {
          t = times[l];
          appendElements('indexes', 'option', t, t);
        }
        return add_cloudburst_tile_layer(map, json, layer.id);
      });
    });
  });
  $('#instances').change(function() {
    return cloudburst.loadLayer($('option:selected', this).attr('title')).then(function(layer) {
      removeOptions('indexes');
      return cloudburst.loadTimes(layer.id, layer.instances[0].id).then(function(times) {
        var k, len2, t;
        for (k = 0, len2 = times.length; k < len2; k++) {
          t = times[k];
          appendElements('indexes', 'option', t, t);
        }
        return add_cloudburst_tile_layer(map, json, layer.id);
      });
    });
  });
  $('#indexes').change(function() {
    var new_time;
    new_time = $('option:selected', this).attr('title');
    return map.eachLayer(function(lyr) {
      if (lyr._url.indexOf('basemaps') === -1) {
        return lyr.setTime(new_time);
      }
    });
  });
  $('#step-forward').click(function() {
    return map.eachLayer(function(lyr) {
      if (lyr._url.indexOf('basemaps') === -1) {
        lyr.back();
        if (lyr.getTimes().indexOf(lyr.getTime()) === 0) {
          $('#step-backward').addClass('disabled');
        } else {
          $('#step-backward').removeClass('disabled');
        }
        $('#step-forward').removeClass('disabled');
        return $("#indexes").val(lyr.getTime());
      }
    });
  });
  return $('#step-forward').click(function() {
    return map.eachLayer(function(lyr) {
      if (lyr._url.indexOf('basemaps') === -1) {
        lyr.forward();
        console.log(lyr.getTime());
        if (lyr.getTimes().indexOf(lyr.getTime()) === lyr.getTimes().length - 1) {
          $('#step-forward').addClass('disabled');
        } else {
          $('#step-forward').removeClass('disabled');
        }
        $('#step-backward').removeClass('disabled');
        return $("#indexes").val(lyr.getTime());
      }
    });
  });
};

cloudburst = new Cloudburst();

cloudburst.loadConfiguration(layer_control);
