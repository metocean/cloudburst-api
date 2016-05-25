logging = on

L.CloudburstTileLayer = L.TileLayer.extend
  options:
    minZoom: 0
    maxZoom: 17
    tms: yes
    zoomOffset: 0
    detectRetina: true

  initialize: (cloudbursturl, config, options) ->
    # cloudbursturl: host for capability requests
    if not config
      return
    @_host = cloudbursturl
    @_config = config
    @_layers = @getLayers()

    # Select the first available layer, and first instance, index
    layer_i = 0
    while !@_instance and layer_i < @_layers.length
      @setLayer(@_layers[layer_i], no) # Initially set to first layer
      @setInstance(@getInstances()[0], no) # Initially set to first instance of layer
      if !@_instance
        layer_i = layer_i + 1
        console.log("WARNING: no instances of layer #{@_layer} found")

    @setTindex(@getTindexes()[0], no)
    @setLevel(@getLevels()[0], no)
    @setRenderer('mpl', no)

    L.TileLayer.prototype.initialize.call @, "[cloudburst]/{z}/{x}/{y}.png", options

  getConfig: ->
    @_config

  getLayers: (asObj, sorted) ->
    # asObj (bool):
    # - true: returns the layers as an array of tuples: (short name, json)
    # - false: returns the layers as an array of short names
    sorted = if sorted? then sorted else true
    if @_config?
      if !asObj? or !asObj
        lyrs = Object.keys(@_config)
      else
        lyrs = ([lyr, @_config[lyr]] for lyr in Object.keys(@_config))
      # console.log lyrs[0][1].meta.name
      if sorted
        lyrs.sort()
      return lyrs

  setLayer: (layer, noRedraw) ->
    if (layer in Object.keys(@_config))
      @_layer = layer
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Layer set to: #{@_layer}")
    @

  getLayer: ->
    @_layer

  getLayerLegendUrl: (size, orientation) ->
    if !size? or !size
      size = "small" # or "large"
    if !orientation? or !orientation
      orientation = "horiztonal" # or "vertical"
    layerurl = "#{@_host}/legend/#{size}/#{orientation}/#{@getLayer()}/#{@getInstance()}.png"
    return layerurl

  getBounds: ->
    # Returns bounds as L.latLngBounds
    # TODO enforce this for layers by default to avoid requesting blank tiles
    if @_layer? and @_instance?
      bounds = @_config[@_layer]['dataset'][@_instance]['bounds']
      return new L.latLngBounds(
        L.latLng(bounds['south'], bounds['west']),
        L.latLng(bounds['north'], bounds['east'])
      )

  getLayerMetadata: ->
    if @_layer? and @_instance?
      @_config[@_layer].meta

  getLayerDescription: ->
    if @_layer?
      @getLayerMetadata().description

  getLayerName: ->
    if @_layer?
      @getLayerMetadata().name

  getLayerUnitSystem: ->
    if @_layer?
      @getLayerMetadata().unit_system

  getLayerPlotDefinitions: ->
    if @_layer
      @_config.layers[@_layer].plot_defs

  getInstances: (asObj, sorted)->
    sorted = if sorted? then sorted else true
    if @_layer?
      instances = Object.keys(@_config[@_layer]['dataset'])
      if asObj? and asObj
        instances = ([i, @_config[@_layer]['dataset'][i]] for i in instances)
      if sorted
        instances.sort().reverse() # Newest first
      return instances

  setInstance: (instance, noRedraw) ->
    if !instance?
      console.log("WARNING: instance undefined")
    if instance in @getInstances()
      @_instance = instance
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Instance set to: #{@_instance}")
    @

  getInstance: ->
    @_instance

  getLevels: (asObj) ->
    # Vertical dimension
    if @_instance? and @_layer? and 'levels' in Object.keys @_config[@_layer]['dataset'][@_instance]
      levels = Object.keys(@_config[@_layer]['dataset'][@_instance]['levels'])
      if asObj? and asObj
        levels = ([i, @_config[@_layer]['dataset'][@_instance]['levels'][i]] for i in levels)
      return levels
    return if !asObj then ["0"] else {"0": undefined}

  setLevel: (level, noRedraw) ->
    if level.toString() in @getLevels()
      @_level = level.toString()
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Level set to: #{@_level}")
    @

  getLevel: ->
    @_level

  getTindexes: (asObj) ->
    # Time-indexes (tindexes)
    if @_instance? and @_layer? and 'times' in Object.keys @_config[@_layer]['dataset'][@_instance]
      tindexes = Object.keys(@_config[@_layer]['dataset'][@_instance].times)
      if asObj? and asObj
        tindexes = ([i, @_config[@_layer]['dataset'][@_instance].times[i]] for i in tindexes)
      return tindexes
    return if !asObj then ["0"] else [["0", undefined]]

  setTindex: (tindex, noRedraw) ->
    if tindex.toString() in @getTindexes()
      @_tindex = tindex.toString()
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Tindex set to: #{@_tindex}")
    @

  getTindex: (as_time_string) ->
    if !as_time_string?
      return @_tindex
    else
      return @getTindexes(yes)[@_tindex][1]

  getRenderer: ->
    @_renderer

  setRenderer: (renderer, noRedraw) ->
    @_renderer = renderer
    @redraw() if !noRedraw? or !noRedraw
    @

  back: (noRedraw) ->
    if @_tindex?
      if parseInt(@_tindex) > 0
        @setTindex(Math.max(parseInt(@_tindex) - 1, 0), noRedraw)

  forward: (noRedraw) ->
    if @_tindex?
      if parseInt(@_tindex) < @getTindexes().length - 1
        @setTindex(Math.min(parseInt(@_tindex) + 1, @getTindexes().length - 1), noRedraw)

  higher: (noRedraw) ->
    if logging is on
      console.log "Going higher: #{@_level}"
    if parseInt(@_level) > 0
      @setLevel(Math.max(parseInt(@_level) - 1, 0), noRedraw)

  deeper: (noRedraw) ->
    if logging is on
      console.log "Going deeper: #{@_level}"
    if parseInt(@_level) < @getLevels().length - 1
      @setLevel(Math.min(parseInt(@_level) + 1, @getLevels().length - 1), noRedraw)

  getTileUrl: (coords) ->
    # Replace [cloudburst] in the prototype URL with parameters from the config
    L.TileLayer.prototype.getTileUrl
      .call @, coords
      .replace /\[cloudburst\]/,
        "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/#{@_level}"

  getTindexesAsPercetagePositions: ->
    # Takes an array of datetime strings from @getTindexes, and returns an array
    # of the same length where the datetimes are represented as floats
    # indicating their percentage value from 0 to 100, where 0 is the lowest
    # value in the array, and 100 is the highest value.
    # Useful for displaying an array of time values in irregular intervals along
    # a line.
    ts = (moment(t[1], moment.ISO_8601)/1000 for t in @getTindexes())
    min_ts = Math.min.apply(null, ts)
    max_ts = Math.max.apply(null, ts)
    diff = max_ts - min_ts
    return (t / diff * 100 for t in (t - min_ts for t in ts))

L.cloudburstTileLayer = (cloudbursturl, json, options) ->
  new L.CloudburstTileLayer cloudbursturl, json, options

# L.cloudburstInstance = (cloudbursturl, layerid, instanceid, options) ->
#   new L.CloudburstInstance cloudbursturl, layerid, instanceid
