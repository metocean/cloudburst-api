get_supplementary_tileLayer = (url) ->
  url = if url? then url else basemap_light
  supplementary = L.tileLayer url,
    maxZoom: 21
    reuseTiles: yes
    zindex: 0
    detectRetina: yes
    edgeBufferTiles: 2
  return supplementary

basemap_dark = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'
basemap_light_labels = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'

basemaps_urls = [basemap_dark, basemap_light_labels]
basemaps = (get_supplementary_tileLayer(url) for url in basemaps_urls)
basemapnames = {
  'Dark': basemaps[0],
  'Light & Labelled': basemaps[1],
}

global_time = undefined

debug = off

tileHost = "http://localhost:6060"

make_map = (mapdiv) ->
  # Create a leaflet map with a list of tilelayers
  mapdiv = if mapdiv? then mapdiv else 'map'
  map = new L.Map mapdiv,
    layers: basemaps[1]
    center: new L.LatLng 39.50, -98.35
    zoom: 5
    attributionControl: yes
    loadingControl: yes
  if debug is on
    map.on 'click', (e) -> alert "Lat (#{e.latlng.lat}, lon (#{e.latlng.lng})"

  L.control.layers(basemapnames).addTo(map)

  return map

diff = (ary) ->
  newA = []
  i = 1
  while i < ary.length
    newA.push ary[i] - (ary[i - 1])
    i++
  newA

move_in_array = (array, old_index, new_index) ->
  array.splice(new_index, 0, array.splice(old_index, 1)[0])
  return array

toggle_el_property = (elem_id, property, off_on) ->
  if debug is on
    console.log "Turning #{elem_id} #{property} #{off_on}"
  $("##{elem_id}").prop(property, off_on)

closest = (array, target) ->
  # Returns the Number in array that is closest in value to Number target
  if array == null
    return
  array.reduce (prev, curr) ->
    if (Math.abs(curr - target) < Math.abs(prev - target)) then curr else prev

removeOptions = (container_id) ->
  $("##{container_id}").find('option').remove()

appendElements = (container_id, element, content, title, className, role, id) ->
  el = document.createElement(element)
  el.innerHTML = content
  if title?
    el.setAttribute('title', title)
  document.getElementById(container_id).appendChild(el)
  return

get_opacity_slider = (slider_id) ->
  input = document.createElement('div')
  input.setAttribute('id', slider_id)
  return input.outerHTML

make_opacity_slider = (layers, slider_id, value, step) ->
  console.log layers[parseInt(slider_id.split("-")[-1..][0])][0].options.opacity
  $("##{slider_id}")
  .slider
    min: 0
    max: 100
    value: if value? then value else layers[parseInt(slider_id.split("-")[-1..][0])][0].options.opacity*100
    suffix: "%"
    step: if step? then step else 10
    stop: (event, ui) ->
      slider_id = parseInt(this.id.split("-")[-1..][0])
      layers[slider_id][0].setOpacity(ui.value/100)
      return
  .slider "float",
    pips: true
  return

do_appendLayers = (layersJson, refresh_layers) ->
  if (!refresh_layers? or refresh_layers)
    removeOptions('layers')
    appendElements('layers', 'option', lyr.meta.name, lyr.id) for lyr in layersJson
  return

do_appendInstances = (layerJson, refresh_instances) ->
  if (!refresh_instances? or refresh_instances)
    removeOptions('instances')
    appendElements('instances', 'option', instance.id) for instance in layerJson.instances
  return

get_button = (id, icon_classes, button_classes) ->
  btn = document.createElement('button')
  span = document.createElement('span')
  span.setAttribute('class', icon_classes.join(' '))
  btn.innerHTML = span.outerHTML
  btn.setAttribute('type', 'button')
  btn.setAttribute('class', button_classes.join(' '))
  btn.setAttribute('id', id)
  return btn.outerHTML

create_layer_table = (map, layers, table_id) ->
  table_id = if table_id? then table_id else "layer-table"
  # Clear table
  document.getElementById(table_id).innerHTML = null
  for l, rowi in layers.reverse()
    lyr = l[0] # L.cloudburstTileLayer
    layer = l[1]
    instance = l[2]

    row = document.getElementById(table_id).insertRow(-1)
    rowi = document.getElementById(table_id).rows.length - 1
    layer_utils = row.insertCell(0)
    remove_button = get_button("remove-layer-#{rowi}", ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer'])
    zoom_to_layer_button = get_button("zoom-layer-#{rowi}", ['glyphicon', 'glyphicon-screenshot'], ['btn', 'btn-default', 'btn-xs', 'zoom-to-layer'])
    layer_utils.innerHTML = remove_button + zoom_to_layer_button
    $(layer_utils).addClass 'col-md-1'

    layer_name = row.insertCell(1)
    layer_name.innerHTML = "<strong>#{layer.meta.name}</strong><br>#{instance.id}"
    $(layer_name).addClass 'col-md-3'

    opacity_slider = row.insertCell(2)
    opacity_slider.innerHTML = get_opacity_slider("opacity-slider-#{rowi}")
    $(opacity_slider).addClass 'col-md-2'
    make_opacity_slider(layers, "opacity-slider-#{rowi}")

    dt = row.insertCell(3)
    if lyr.hasTimes
      dt.innerHTML = moment(lyr.getTime(), moment.ISO_8601).format('llll')
    else
      dt.innerHTML = "<span>N/A<span>"
    $(dt).addClass 'col-md-2'

    depth = row.insertCell(4)
    $(depth).addClass 'col-md-1'
    if lyr.hasLevels
      increase = get_button("increase-depth-#{rowi}", ['glyphicon', 'glyphicon-circle-arrow-up'], ['btn', 'btn-md', 'decrease-depth', "decrease-depth-#{rowi}", 'depth'])
      decrease = get_button("decrease-depth-#{rowi}", ['glyphicon', 'glyphicon-circle-arrow-down'], ['btn', 'btn-md', 'increase-depth', "increase-depth-#{rowi}", 'depth'])
      depth.innerHTML = increase + decrease
      $(".increase-depth-#{rowi}").on 'click', ->
        btn_row = parseInt(this.id.split("-")[-1..][0])
        layers[btn_row].deeper(no)
      $(".decrease-depth-#{rowi}").on 'click', ->
        btn_row = parseInt(this.id.split("-")[-1..][0])
        layers[btn_row].higher(no)
    else
      depth.innerHTML = "<span>No depth</span>"

    legend = row.insertCell(5)
    legendURL = instance.resources.legend
    .replace('<size>', 'small')
    .replace('<orientation>', 'horizontal')
    legend.innerHTML = "<img src=\"#{tileHost}#{legendURL}\" alt='' />"
    $(legend).addClass 'col-md-3'


  $(".remove-layer").click ->
    layers.splice(parseInt(this.id.split("-")[-1..][0]), 1)
    activate_layers(map, layers)
  $(".zoom-to-layer").click ->
    zoom_to_layer(map, layers[this.id.split("-")[-1..][0]][0])
  $("#layer-table-parent tbody").sortable
    start: (event, ui) ->
      ui.item.startPos = ui.item.index()
    update: (event, ui) ->
      layers = move_in_array(layers, ui.item.startPos, ui.item.index())
      activate_layers(map, layers)
  .disableSelection()

make_global_slider = (map, layers, values, off_on, slider_class, slider_id) ->
  toggle_el_property(slider_id, 'hidden', off_on)
  if values? and values.length > 0
    moments = (moment.unix(t) for t in values)
    labels = (t.fromNow() for t in moments)
    times = (t.unix() for t in moments)
    now = (new Date).getTime()/1000
    closest_to_now = closest(times, now)
    slider_class = if slider_class? then slider_class else 'slider'
    slider_id = if slider_id? then slider_id else 'global-slider'
    $(".#{slider_class}")
    .slider
      min: Math.min.apply(Math, times)
      max: Math.max.apply(Math, times)
      step: Math.min.apply(Math, diff(times))
      value: closest_to_now
      change: (event, ui) ->
        # When user picks a new time, update the layers on map
        global_time = ui.value # Global, used when new layers are added
        for lyr in layers
          lyr_moments = (moment(t, moment.ISO_8601).unix() for t in lyr[0].getTimes())
          selected_moment_str = closest(lyr_moments, global_time)
          lyr[0].setTime(lyr[0].getTimes()[lyr_moments.indexOf(selected_moment_str)])
        activate_layers(map, layers, false)
    .slider "pips",
      first: 'label'
      last: 'label'
      rest: 'pip'
      labels: labels
    .slider "float",
      labels: labels
      handle: true
      pips: true
    # $pips = $(".#{slider_class}").find(".ui-slider-pip") # Hold all the pips for filtering
    # $pips.filter(".ui-slider-pip-#{t}").show() for t in times

on_modal_layer_change = (json, selected_list) ->
  layerID = $('option:selected', selected_list).attr('title')
  cloudburst.loadLayer(layerID, do_appendInstances).then( (layer) ->
    document.getElementById("modal-layer-info").innerHTML = layer.meta.description
    return
  )

on_modal_layer_confirm = (map, cb) ->
  layerID = $('option:selected', $('#layers')).attr('title')
  instanceID = $('option:selected', $('#instances')).val()
  cloudburst.loadLayer(layerID, (layer) ->
    cloudburst.loadInstance(layerID, instanceID, (instance) ->
      tileTemplate = [tileHost, instance.resources.tile].join('')
      cloudburst.loadTimes(layerID, instanceID, (times) ->
        selected_lyr = new L.cloudburstTileLayer(tileTemplate, times, undefined, layer.bounds)
        if cb?
          return cb([selected_lyr, layer, instance])
        return [selected_lyr, layer, instance]
      )
    )
  )

prepare_modal_dialogue = (json, modal_div) ->
  # Controlling the drop-down menus for modal layer control
  do_appendLayers(json, yes)
  cloudburst.loadLayer(json[0].id, do_appendInstances)
  modal_div = if modal_div? then modal_div else "modal-layer-info"
  document.getElementById(modal_div).innerHTML = json[0].meta.description
  return

zoom_to_layer = (map, tileLayer) ->
  map.fitBounds tileLayer.getBounds()

activate_layers = (map, layers, refresh_slider) ->
  refresh_slider = if refresh_slider? then refresh_slider else true
  map.eachLayer (lyr) ->
    map.removeLayer(lyr) if !(lyr._url in basemaps_urls)
  # Displays active layers on the map
  lyr[0].addTo(map).bringToFront() for lyr in layers.reverse()
  t_set = new Set()
  for lyr in layers
    times = lyr[0].getTimes()
    if times?
      t_set.add(moment(t, moment.ISO_8601).unix()) for t in times
  if refresh_slider
    make_global_slider(map, layers, Array.from(t_set), off)
  # Adds all active layers to the table of layers
  create_layer_table(map, layers)

get_cloudburst_tileLayer = (urlTemplate, times, levels, bounds, options) ->
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer urlTemplate, times, levels, bounds,
    maxZoom: 21
    maxNativeZoom: 21
    reuseTiles: no
    detectRetina: yes
    opacity: if opacity? then opacity else 1.0
    zIndex: if zIndex? then zIndex else null
    edgeBufferTiles: 2

  return cloudburstTileLayer

layer_control = (json, host) ->

  # Start the map with some simple contextual tile layers
  map = make_map()

  # Will hold layers that are on map
  active_layers = []

  # Prepare a dialogue for selecting a tilelayer
  prepare_modal_dialogue(json)
  $('#layers').change ->
    # When the selected layer changes
    on_modal_layer_change(json, this)
  $('#modal-confirm-add').click ->
    # When user confirms modal add layer
    on_modal_layer_confirm(map, (l) ->
      active_layers.push(l)
      activate_layers(map, active_layers)
      zoom_to_layer(map, l[0])
    )

# New Cloudburst
cloudburst = new Cloudburst()
# Load the configuration file, with callback
cloudburst.loadConfiguration(layer_control)
