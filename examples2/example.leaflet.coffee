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

make_map = (mapdiv) ->
  # Create a leaflet map with a list of tilelayers
  mapdiv = if mapdiv? then mapdiv else 'map'
  map = new L.Map mapdiv,
    layers: basemaps
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

get_cloudburst_tileLayer = (host, json, opacity, zIndex) ->
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer host, json,
    maxZoom: 21
    maxNativeZoom: 21
    reuseTiles: no
    detectRetina: yes
    opacity: if opacity? then opacity else 1.0
    zIndex: if zIndex? then zIndex else null
    edgeBufferTiles: 2

  return cloudburstTileLayer

sample_layer_control = (json, host) ->
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

  move_in_array = (array, old_index, new_index) ->
    array.splice(new_index, 0, array.splice(old_index, 1)[0])
    return array

  cloudburstTileLayer = get_cloudburst_tileLayer(host, json)

  active_layers = []

  # Start the map with some simple contextual tile layers
  map = make_map()

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

  make_global_slider = (off_on, values, slider_class, slider_id) ->
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
          for lyr in active_layers
            lyr_moments = (moment(t[1], moment.ISO_8601).unix() for t in lyr.getTindexes(yes))
            selected_moment_str = closest(lyr_moments, global_time)
            lyr.setTindex(lyr_moments.indexOf(selected_moment_str))
          activate_layers(false)
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

  removeOptions = (container_id) ->
    $("##{container_id}").find('option').remove()

  appendElements = (container_id, element, content, title, className, role, id) ->
    el = document.createElement(element)
    el.innerHTML = content
    if title?
      el.setAttribute('title', title)
    document.getElementById(container_id).appendChild(el)
    return

  do_appendElements = (refresh_layers, refresh_instances) ->
    if (!refresh_layers? or refresh_layers)
      removeOptions('layers')
      appendElements('layers', 'option', lyr[1].meta.name, lyr[0]) for lyr in cloudburstTileLayer.getLayers(yes)
    if (!refresh_instances? or refresh_instances)
      removeOptions('instances')
      appendElements('instances', 'option', instance) for instance in cloudburstTileLayer.getInstances()
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

  make_opacity_slider = (slider_id, lyr, value, step) ->
    $("##{slider_id}")
    .slider
      min: 0
      max: 100
      value: if value? then value else lyr.options.opacity * 100
      suffix: "%"
      step: if step? then step else 10
      stop: (event, ui) ->
        slider_id = parseInt(this.id.split("-")[-1..][0])
        active_layers[slider_id].setOpacity(ui.value/100)
        return
    .slider "float",
      pips: true
    return

  get_opacity_slider = (slider_id)->
    input = document.createElement('div')
    input.setAttribute('id', slider_id)
    return input.outerHTML

  create_layer_table = (table_id) ->
    table_id = if table_id? then table_id else "layer-table"
    # Clear table
    document.getElementById(table_id).innerHTML = null
    for lyr, rowi in active_layers.reverse()
      row = document.getElementById(table_id).insertRow(-1)
      rowi = document.getElementById(table_id).rows.length - 1
      remove_button = row.insertCell(0)
      remove_button.innerHTML = get_button("remove-layer-#{rowi}", ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer'])
      $(remove_button).addClass 'col-md-1'

      layer_name = row.insertCell(1)
      layer_name.innerHTML = "<strong>#{lyr.getLayerName()}</strong><br>#{lyr.getInstance()}"
      $(layer_name).addClass 'col-md-3'

      opacity_slider = row.insertCell(2)
      opacity_slider.innerHTML = get_opacity_slider("opacity-slider-#{rowi}")
      $(opacity_slider).addClass 'col-md-2'

      dt = row.insertCell(3)
      dt.innerHTML = moment(lyr.getTindex(yes), moment.ISO_8601).format('llll')
      $(dt).addClass 'col-md-2'

      depth = row.insertCell(4)
      $(depth).addClass 'col-md-1'
      if lyr.getLevels().length > 1
        increase = get_button("increase-depth-#{rowi}", ['glyphicon', 'glyphicon-circle-arrow-up'], ['btn', 'btn-md', 'decrease-depth', "decrease-depth-#{rowi}", 'depth'])
        decrease = get_button("decrease-depth-#{rowi}", ['glyphicon', 'glyphicon-circle-arrow-down'], ['btn', 'btn-md', 'increase-depth', "increase-depth-#{rowi}", 'depth'])
        depth.innerHTML = increase + decrease
        $(".increase-depth-#{rowi}").on 'click', ->
          btn_row = parseInt(this.id.split("-")[-1..][0])
          active_layers[btn_row].deeper(no)
        $(".decrease-depth-#{rowi}").on 'click', ->
          btn_row = parseInt(this.id.split("-")[-1..][0])
          active_layers[btn_row].higher(no)
      else
        depth.innerHTML = "<span>No depth</span>"

      legendsrc = lyr.getLayerLegendUrl('small', 'horizontal')
      legend = row.insertCell(5)
      legend.innerHTML = "<img src=\"#{legendsrc}\" alt='' />"
      $(legend).addClass 'col-md-3'

      make_opacity_slider("opacity-slider-#{rowi}", lyr, lyr.options.opacity * 100)
    $(".remove-layer").click ->
      active_layers.splice(parseInt(this.id.split("-")[-1..][0]), 1)
      activate_layers()
    $("#layer-table-parent tbody").sortable
      start: (event, ui) ->
        ui.item.startPos = ui.item.index()
      update: (event, ui) ->
        active_layers = move_in_array(active_layers, ui.item.startPos, ui.item.index())
        activate_layers()
    .disableSelection()
    return

  activate_layers = (refresh_slider)->
    refresh_slider = if refresh_slider? then refresh_slider else true
    map.eachLayer (lyr) ->
      map.removeLayer(lyr) if !(lyr._url in basemaps_urls)
    # Displays active layers on the map
    for lyr in active_layers.reverse()
      lyr.addTo(map) for lyr in active_layers.reverse()
    # Adds indexes to time slider # TODO may not be time
    t_set = new Set()
    z = basemaps.length + 1
    for lyr in active_layers
      lyr.setZIndex(if !(lyr._url in basemaps_urls) then z + 1 else 0)
      z += 1
      t_set.add(moment(t[1], moment.ISO_8601).unix()) for t in lyr.getTindexes(yes)
    if refresh_slider
      make_global_slider(off, Array.from(t_set))
    # Adds all active layers to the table of layers
    create_layer_table()

  on_modal_layer_change = (selected_list) ->
    cloudburstTileLayer.setLayer($('option:selected', selected_list).attr('title'))
    do_appendElements(no, yes) # update instances for this layer
    document.getElementById("modal-layer-info").innerHTML = cloudburstTileLayer.getLayerDescription()
    return

  on_modal_layer_confirm = ->
    selected_lyr = get_cloudburst_tileLayer(host, json)
    selected_lyr.setLayer $('option:selected', $('#layers'))[0].title
    selected_lyr.setInstance $('option:selected', $('#instances')).val() #$('option:selected', $('#instances')).attr('title')

    if global_time?
      lyr_moments = (moment(t[1], moment.ISO_8601).unix() for t in selected_lyr.getTindexes(yes))
      selected_moment_str = closest(lyr_moments, global_time)
      selected_lyr.setTindex(lyr_moments.indexOf(selected_moment_str))

    active_layers.push(selected_lyr)
    activate_layers()

  prepare_modal_dialogue = (modal_div) ->
    # TODO: remove ability to add same layer/instance twice?
    # Controlling the drop-down menus for modal layer control
    do_appendElements(yes, yes)
    modal_div = if modal_div? then modal_div else "modal-layer-info"
    document.getElementById(modal_div).innerHTML = cloudburstTileLayer.getLayerDescription()

  # Modal add layer dialogue
  prepare_modal_dialogue()
  $('#layers').change ->
    # When the selected layer changes
    on_modal_layer_change this
  $('#modal-confirm-add').click ->
    # When user confirms modal add layer
    on_modal_layer_confirm()

  # Prepare global slider
  make_global_slider(on)

# New Cloudburst, given a compatible host
cloudburst = new Cloudburst()
# Define a callback function, called when the config is ready
callback = sample_layer_control
# Load the configuration file, and launch your own callback
cloudburst.loadConfiguration(callback)
