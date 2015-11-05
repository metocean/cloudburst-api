make_map = (layers, mapdiv) ->
  # Create a leaflet map centred over New Zealand with two tile layers
  mapdiv = if mapdiv? then mapdiv else 'map'
  map = new L.Map mapdiv,
  	layers: layers
  	center: new L.LatLng -37.7772, 175.2756
  	zoom: 6
  	attributionControl: no
  return map

get_cloudburst_tileLayer = (json) ->
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer get_host(), json,
    maxZoom: 8
    maxNativeZoom: 9
    reuseTiles: yes
    detectRetina: yes
  return cloudburstTileLayer

get_supplementary_tileLayer = ->
  supplementary = L.tileLayer 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  	maxZoom: 9
  	reuseTiles: yes
  	detectRetina: yes
  return supplementary

sample_add_random_layer = (json) ->
  # For this example we are displaying a randomly selected field.
  # Generally you would want to select the field that was relevant to your application.
  cloudburstTileLayer = get_cloudburst_tileLayer(json)
  randomindex = Math.floor(Math.random() * Object.keys(json.layers).length)
  cloudburstTileLayer.setLayer(Object.keys(json.layers)[randomindex])

  make_map([get_supplementary_tileLayer(), cloudburstTileLayer])

sample_layer_control = (json) ->
  # For this example, we display the first layer, and then add dropdown menus
  # populated from the configuration, that allow the user to change the map
  # display

  cloudburstTileLayer = get_cloudburst_tileLayer(json)

  make_map([get_supplementary_tileLayer(), cloudburstTileLayer])

  removeOptions = (container_id) ->
    $("##{container_id}").find('option').remove()

  appendElements = (container_id, element, content, title) ->
    console.log "appendElements", container_id, element, content, title
    el = document.createElement(element)
    el.innerHTML = content
    if title?
      el.setAttribute('title', title)
    document.getElementById(container_id).appendChild(el)
    return

  do_appendElements = (refresh_layers, refresh_instances, refresh_tindexes) ->
    if (!refresh_layers? or refresh_layers)
      removeOptions('layers')
      appendElements('layers', 'option', lyr[1].meta.name, lyr[0]) for lyr in cloudburstTileLayer.getLayers(yes)
    if (!refresh_instances? or refresh_instances)
      removeOptions('instances')
      appendElements('instances', 'option', lyr) for lyr in cloudburstTileLayer.getInstances()
    if (!refresh_tindexes? or refresh_tindexes)
      removeOptions('indexes')
      appendElements('indexes', 'option', lyr[1], lyr[0]) for lyr in cloudburstTileLayer.getTindexes(yes)
    return

  # Controlling the drop-down menus for layer control
  do_appendElements(yes, yes, yes)
  $('#layers').change ->
    cloudburstTileLayer.setLayer($('option:selected', this).attr('title'))
    do_appendElements(no, yes, yes)
  $('#instances').change ->
    cloudburstTileLayer.setInstance($(this).val())
    do_appendElements(no, no, yes)
  $('#indexes').change ->
    cloudburstTileLayer.setTindex($('option:selected', this).attr('title'))

  $('#step-backward').click ->
    cloudburstTileLayer.back()
    newval = parseInt(cloudburstTileLayer.getTindex())
    if newval == 0
      $('#step-backward').addClass('disabled')
    else
      $('#step-backward').removeClass('disabled')
    $('#step-forward').removeClass('disabled')
    $('#indexes').prop("selectedIndex", newval)

  $('#step-forward').click ->
    cloudburstTileLayer.forward()
    newval = parseInt(cloudburstTileLayer.getTindex())
    if newval == cloudburstTileLayer.getTindexes().length - 1
      $('#step-forward').addClass('disabled')
    else
      $('#step-forward').removeClass('disabled')
    $('#step-backward').removeClass('disabled')
    $('#indexes').prop("selectedIndex", newval)


  # # We can dynamically update the key by calling back, forward or setting a key directly.
  # setInterval ->
  #   # cloudburstTileLayer.forward(yes)
  #   console.log cloudburstTileLayer.getLayers(yes)
  # , 5000

get_host = ->
  'http://localhost:6060'

# New Cloudburst, given a compatible host
cloudburst = new Cloudburst(get_host())
# Define a callback function, called when the config is ready
callback = sample_layer_control
# Load the configuration file, and launch your own callback
cloudburst.loadConfiguration(callback)
