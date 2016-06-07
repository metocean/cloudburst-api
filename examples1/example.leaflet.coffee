make_map = (layers, mapdiv) ->
  # Create a leaflet map centred over New Zealand with two tile layers
  mapdiv = if mapdiv? then mapdiv else 'map'
  map = new L.Map mapdiv,
  	layers: layers
  	center: new L.LatLng 39.50, -98.35
  	zoom: 5
  	attributionControl: no
  return map

get_cloudburst_tileLayer = (urlTemplate, times, levels, bounds, options) ->
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer urlTemplate, times, levels, bounds,
    maxZoom: 21
    maxNativeZoom: 21
    reuseTiles: yes
    detectRetina: yes

  return cloudburstTileLayer

removeOptions = (container_id) ->
  $("##{container_id}").find('option').remove()

appendElements = (container_id, element, content, title) ->
  el = document.createElement(element)
  el.innerHTML = content
  if title?
    el.setAttribute('title', title)
  document.getElementById(container_id).appendChild(el)
  return

get_supplementary_tileLayer = ->
  supplementary = L.tileLayer 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  	maxZoom: 21
  	reuseTiles: yes
  	detectRetina: yes
  return supplementary

add_cloudburst_tile_layer = (map, json, layerid) ->

  layer = json.filter((obj) ->
    return obj.id == layerid
  )[0]

  map.eachLayer (lyr) ->
    if lyr._url.indexOf('basemaps') == -1
      map.removeLayer(lyr)

  instance = cloudburst.loadInstance(layer.id, layer.instances[0].id).then (instance) ->
    times = cloudburst.loadTimes(layer.id, layer.instances[0].id).then (times) ->
      levels = cloudburst.loadLevels(layer.id, layer.instances[0].id).then (levels) ->
        cloudburstTileLayer = get_cloudburst_tileLayer CBCONFIG.host + instance.resources.tile, times, levels, layer.bounds

        cloudburstTileLayer.addTo(map)
        map.fitBounds(cloudburstTileLayer.getBounds())

        return cloudburstTileLayer

layer_control = (json) ->

  layer = json[0]

  removeOptions('layers')
  appendElements('layers', 'option', lyr.meta.name, lyr.id) for lyr in json
  appendElements('instances', 'option', instance.id) for instance in layer.instances
  cloudburst.loadTimes(layer.id, layer.instances[0].id).then (times) ->
    appendElements('indexes', 'option', t, t) for t in times

  map = make_map([get_supplementary_tileLayer()])

  add_cloudburst_tile_layer(map, json, layer.id)

  $('#layers').change ->
    cloudburst.loadLayer($('option:selected', this).attr('title')).then (layer) ->
      # Refresh instances
      removeOptions('instances')
      appendElements('instances', 'option', instance.id) for instance in layer.instances
      removeOptions('indexes')
      cloudburst.loadTimes(layer.id, layer.instances[0].id).then (times) ->
        appendElements('indexes', 'option', t, t) for t in times
        add_cloudburst_tile_layer(map, json, layer.id)
  $('#instances').change ->
    cloudburst.loadLayer($('option:selected', this).attr('title')).then (layer) ->
      removeOptions('indexes')
      cloudburst.loadTimes(layer.id, layer.instances[0].id).then (times) ->
        appendElements('indexes', 'option', t, t) for t in times
        add_cloudburst_tile_layer(map, json, layer.id)
  $('#indexes').change ->
    new_time = $('option:selected', this).attr('title')
    map.eachLayer (lyr) ->
      if lyr._url.indexOf('basemaps') == -1
        lyr.setTime(new_time)
  $('#step-forward').click ->
    map.eachLayer (lyr) ->
      if lyr._url.indexOf('basemaps') == -1
        lyr.back()
        if lyr.getTimes().indexOf(lyr.getTime()) == 0
          $('#step-backward').addClass('disabled')
        else
          $('#step-backward').removeClass('disabled')
        $('#step-forward').removeClass('disabled')
        $("#indexes").val(lyr.getTime());
  $('#step-forward').click ->
    map.eachLayer (lyr) ->
      if lyr._url.indexOf('basemaps') == -1
        lyr.forward()
        console.log lyr.getTime()
        if lyr.getTimes().indexOf(lyr.getTime()) == lyr.getTimes().length - 1
          $('#step-forward').addClass('disabled')
        else
          $('#step-forward').removeClass('disabled')
        $('#step-backward').removeClass('disabled')
        $("#indexes").val(lyr.getTime());

# New Cloudburst
cloudburst = new Cloudburst()
# Load the configuration file, with callback
cloudburst.loadConfiguration(layer_control)
