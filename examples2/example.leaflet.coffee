make_map = (layers, mapdiv) ->
  # Create a leaflet map centred over New Zealand with two tile layers
  mapdiv = if mapdiv? then mapdiv else 'map'
  map = new L.Map mapdiv,
  	layers: layers
  	center: new L.LatLng -37.7772, 175.2756
  	zoom: 6
  	attributionControl: no
  return map

get_cloudburst_tileLayer = (json, opacity, zIndex) ->
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer get_host(), json,
    maxZoom: 8
    maxNativeZoom: 9
    reuseTiles: yes
    detectRetina: yes
    opacity: if opacity? then opacity else 1.0
    zIndex: if zIndex? then zIndex else null

  return cloudburstTileLayer

get_supplementary_tileLayer = ->
  supplementary = L.tileLayer 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  	maxZoom: 9
  	reuseTiles: yes
  	detectRetina: yes
  return supplementary

sample_stack_n_layers = (json) ->
  layers = [get_supplementary_tileLayer()]
  for i in [0...3] by 1
    cloudburstTileLayer = get_cloudburst_tileLayer(json, 0.6)
    cloudburstTileLayer.setLayer(Object.keys(json.layers)[i])
    layers.push cloudburstTileLayer

  make_map layers

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
  # display, as well as a time slider

  HTMLElement.prototype.removeClass = (remove) ->
    classes = this.className.split(" ")
    newClassName = ''
    for i in [0...classes.length] by 1
      if classes[i] != remove
        newClassName += classes[i] + " "
    this.className = newClassName

  cloudburstTileLayer = get_cloudburst_tileLayer(json)

  # Start the map with a simple contextual tile layer
  map = make_map([get_supplementary_tileLayer()])

  removeOptions = (container_id) ->
    $("##{container_id}").find('option').remove()

  appendElements = (container_id, element, content, title, className, role, id) ->
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
    return

  get_remove_layer_button = (id) ->
    '''
    <button id="ncep_mslp-remove" class="btn btn-warning" type="button">
      <span class="glyphicon glyphicon-minus"></span>
    </button>
    '''
    btn = document.createElement('button')
    span = document.createElement('span')
    span.setAttribute('class', 'glyphicon glyphicon-minus')
    btn.innerHTML = span.outerHTML
    btn.setAttribute('type', 'button')
    btn.setAttribute('class', 'btn btn-warning btn-xs')
    btn.setAttribute('id', id)
    return btn.outerHTML

  get_opacity_slider = (slider_id)->
    input = document.createElement('input')
    input.setAttribute('id', slider_id)
    input.setAttribute('data-slider-id', slider_id)
    input.setAttribute('type', 'text')
    return input.outerHTML

  make_opacity_slider = (slider_id, layer) ->
    s = $("##{slider_id}").slider
      min: 0
      max: 100
      value = 100
      step = 10
    .on 'slideStop', ->
      layer.setOpacity(s.val()/100)


  # Controlling the drop-down menus for layer control
  do_appendElements(yes, yes, yes)
  document.getElementById("modal-layer-info").innerHTML = cloudburstTileLayer.getLayerDescription()
  $('#layers').change ->
    candidateLayer = $.extend({}, cloudburstTileLayer)
    candidateLayer.setLayer($('option:selected', this).attr('title'))
    do_appendElements(no, yes, yes)
    document.getElementById("modal-layer-info").innerHTML = candidateLayer.getLayerDescription()
    document.getElementById("modal-layer-info").removeClass('hide')

  # When user confirms modal add layer
  $('#modal-confirm-add').click ->
    # TODO ability to reorder layers
    # Add the selected layer to the map # TODO instance
    candidateLayer = $.extend({}, cloudburstTileLayer)
    layerTitle = $('option:selected', $('#layers')).attr('title')
    candidateLayer.setLayer(layerTitle)
    candidateLayer.addTo(map)
    # Add the selected layer to the time widget
    row = document.getElementById("layer-table").insertRow(-1)
    rowi = document.getElementById("layer-table").rows.length
    row.insertCell(0).innerHTML = get_remove_layer_button('remove-layer-' + rowi)
    row.insertCell(1).innerHTML = candidateLayer.getLayerName() + '<br>' + candidateLayer.getInstance()
    row.insertCell(2).innerHTML = get_opacity_slider('opacity-slider-' + rowi)
    row.insertCell(3).innerHTML = 'TODO!'

    make_opacity_slider('opacity-slider-' + rowi, candidateLayer)



  # $('#step-backward').click ->
  #   cloudburstTileLayer.back()
  #   newval = parseInt(cloudburstTileLayer.getTindex())
  #   if newval == 0
  #     $('#step-backward').addClass('disabled')
  #   else
  #     $('#step-backward').removeClass('disabled')
  #   $('#step-forward').removeClass('disabled')
  #   $('#indexes').prop("selectedIndex", newval)
  #
  # $('#step-forward').click ->
  #   cloudburstTileLayer.forward()
  #   newval = parseInt(cloudburstTileLayer.getTindex())
  #   if newval == cloudburstTileLayer.getTindexes().length - 1
  #     $('#step-forward').addClass('disabled')
  #   else
  #     $('#step-forward').removeClass('disabled')
  #   $('#step-backward').removeClass('disabled')
  #   $('#indexes').prop("selectedIndex", newval)

  # # Make a time slider to control the time
  # make_slider = ->
  #   s = $('#ex1').slider
  #     ticks: (parseInt(t[0]) for t in cloudburstTileLayer.getTindexes(yes))
  #     # ticks_labels: (t[1] for t in cloudburstTileLayer.getTindexes(yes))
  #     tick_positions: cloudburstTileLayer.getTindexesAsPercetagePositions()
  #     ticks_snap_bounds: 1
  #     value: parseInt(cloudburstTileLayer.getTindex())
  #     formatter: (value) ->
  #       cloudburstTileLayer.getTindexes(yes)[value][1]
  #   .on 'slideStop', ->
  #     # Refresh the t-index
  #     cloudburstTileLayer.setTindex(s.val())
  #
  # make_slider()

get_host = ->
  'http://localhost:6060'

# New Cloudburst, given a compatible host
cloudburst = new Cloudburst(get_host())
# Define a callback function, called when the config is ready
callback = sample_layer_control
# Load the configuration file, and launch your own callback
cloudburst.loadConfiguration(callback)
