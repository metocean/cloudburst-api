supplementaryUrl = 'http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png'

global_time = undefined

make_map = (layers, mapdiv) ->
  # Create a leaflet map centred over New Zealand with a list of tilelayers
  mapdiv = if mapdiv? then mapdiv else 'map'
  map = new L.Map mapdiv,
  	layers: layers
  	center: new L.LatLng -37.7772, 175.2756
  	zoom: 6
  	attributionControl: no
  return map

get_cloudburst_tileLayer = (host, json, opacity, zIndex) ->
  # Create a CloudburstTileLayer
  cloudburstTileLayer = L.cloudburstTileLayer host, json,
    maxZoom: 14
    maxNativeZoom: 14
    reuseTiles: yes
    detectRetina: yes
    opacity: if opacity? then opacity else 1.0
    zIndex: if zIndex? then zIndex else null

  return cloudburstTileLayer

get_supplementary_tileLayer = ->
  supplementary = L.tileLayer supplementaryUrl,
  	maxZoom: 14
  	reuseTiles: yes
  	detectRetina: yes
  return supplementary

sample_stack_n_layers = (json, host) ->
  layers = [get_supplementary_tileLayer()]
  for i in [0...3] by 1
    cloudburstTileLayer = get_cloudburst_tileLayer(host, json, 0.6)
    cloudburstTileLayer.setLayer(Object.keys(json.layers)[i])
    layers.push cloudburstTileLayer

  make_map layers

sample_add_random_layer = (json, host) ->
  # For this example we are displaying a randomly selected field.
  # Generally you would want to select the field that was relevant to your application.
  cloudburstTileLayer = get_cloudburst_tileLayer(host, json)
  randomindex = Math.floor(Math.random() * Object.keys(json.layers).length)
  cloudburstTileLayer.setLayer(Object.keys(json.layers)[randomindex])

  make_map([get_supplementary_tileLayer(), cloudburstTileLayer])

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
    if (new_index >= array.length)
        k = new_index - array.length
        # while ((k--) + 1)
            # this.push(undefined)
    array.splice(new_index, 0, array.splice(old_index, 1)[0])
    return array

  cloudburstTileLayer = get_cloudburst_tileLayer(host, json)

  active_layers = []

  # Start the map with a simple contextual tile layer
  map = make_map([get_supplementary_tileLayer()])

  toggle_el_property = (elem_id, property, off_on) ->
    console.log "Turning #{elem_id} #{property} #{off_on}"
    $("##{elem_id}").prop(property, off_on)

  closest = (array, target) ->
    # Returns the Number in array that is closest in value to Number target
    array.reduce (prev, curr) ->
      if (Math.abs(curr - target) < Math.abs(prev - target)) then curr else prev

  make_global_slider = (off_on, values, step, slider_class, slider_id) ->
    toggle_el_property(slider_id, 'hidden', off_on)
    if values?
      slider_class = if slider_class? then slider_class else 'slider'
      slider_id = if slider_id? then slider_id else 'global-slider'
      $(".#{slider_class}")
      .slider
        min: Math.min.apply(Math, values)
        max: Math.max.apply(Math, values)
        step: if step? then step else 10800 # Smallest step present in values
        change: (event, ui) ->
          for lyr in active_layers
            lyr_moments = (moment(t[1]).unix() for t in lyr.getTindexes(yes))
            selected_moment_str = closest(lyr_moments, ui.value)
            lyr.setTindex(lyr_moments.indexOf(selected_moment_str))
          global_time = ui.value # Global, used when new layers are added
          activate_layers()
        slide: (event, ui) ->
          # this is a bit of a hack
          $('[data-toggle="tooltip"]').prop('title', moment.unix(ui.value).format('LLLL'))
          return
      .slider "pips",
        first: 'label'
        last: 'label'
        rest: 'pip'
        labels: moment.unix(t).fromNow() for t in values

      # Filter pips, marking them along the slider at appropriate and possibly irregular intervals
      $pips = $(".#{slider_class}").find(".ui-slider-pip") # Hold all the pips for filtering
      for val in values
        $pips.filter(".ui-slider-pip-#{val}").show()

      # Tooltip of slider drag button
      # TODO this is a bit of a hack
      tooltip = '<a href="#" id="global-slider-tooltip" data-toggle="tooltip">&nbsp&nbsp&nbsp&nbsp</a>'
      $(".#{slider_class} .ui-slider-handle").html(tooltip)
      $('[data-toggle="tooltip"]').tooltip
        placement: 'top'

      return

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
      appendElements('instances', 'option', lyr) for lyr in cloudburstTileLayer.getInstances()
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
    $("##{slider_id}").slider
      min: 0
      max: 100
      value: if value? then value else lyr.options.opacity * 100
      step: if step? then step else 10
      stop: (event, ui) ->
        slider_id = parseInt(this.id.split("-")[-1..][0])
        active_layers[slider_id].setOpacity(ui.value/100)
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
      # rowi = document.getElementById(table_id).rows.length - 1
      row.insertCell(0).innerHTML = get_button("remove-layer-#{rowi}", ['glyphicon', 'glyphicon-remove'], ['btn', 'btn-warning', 'btn-xs', 'remove-layer'])
      row.insertCell(1).innerHTML = "#{lyr.getLayerName()}<br>#{lyr.getInstance()}"
      row.insertCell(2).innerHTML = get_opacity_slider("opacity-slider-#{rowi}")
      row.insertCell(3).innerHTML = moment(lyr.getTindex(yes)).format('LLLL')
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

  activate_layers = ->
    map.eachLayer (lyr) ->
      map.removeLayer(lyr) if !(lyr._url is supplementaryUrl)
    # Displays active layers on the map
    lyr.addTo(map) for lyr in active_layers.reverse()
    # Adds indexes to time slider # TODO may not be time
    t_set = new Set()
    for lyr in active_layers
      t_set.add(moment(t[1]).unix()) for t in lyr.getTindexes(yes)
    make_global_slider(off, Array.from(t_set))
    # Adds all active layers to the table of layers
    create_layer_table()

  on_modal_layer_change = (selected_list) ->
    candidateLayer = get_cloudburst_tileLayer(host, json)
    candidateLayer.setLayer($('option:selected', selected_list).attr('title'))
    do_appendElements(no, yes)
    document.getElementById("modal-layer-info").innerHTML = candidateLayer.getLayerDescription()
    return

  on_modal_layer_confirm = ->
    selected_lyr = get_cloudburst_tileLayer(host, json)
    selected_lyr.setLayer $('option:selected', $('#layers'))[0].title
    selected_lyr.setInstance $('option:selected', $('#instances')).val() #$('option:selected', $('#instances')).attr('title')

    if global_time?
      lyr_moments = (moment(t[1]).unix() for t in selected_lyr.getTindexes(yes))
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
