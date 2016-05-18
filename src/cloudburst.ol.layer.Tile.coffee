logging = off

class CloudburstOL3

  constructor: (config, host) ->
    @_host = host
    @_config = config
    @_layers = @getLayers()

    @_htmlattr = '&copy;<a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>'

    # Select the first available layer, and first instance, index
    @setLayer(@_layers[0], no)
    @setInstance(@getInstances()[0], no)
    @setTindex(@getTindexes()[0], no)
    @setLevel(@getLevels()[0], no)
    @setRenderer('mpl', no) # TODO

    @tileLayer = undefined
    @

  getAttribution: ->
    attr = new ol.Attribution
      html: @_htmlattr
    return attr

  redraw: ->
    if @tileLayer?
      @tileLayer.getSource().changed()

  tileUrl: (tileCoord, pixelRatio, projection) ->
    z = tileCoord[0]
    x = tileCoord[1]
    y = tileCoord[2] + (1 << z) # Accounting for bottom-left origin
    "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/#{@_level}/#{z}/#{x}/#{y}.png"

  setOL3LayerTile: (options) =>
    # Returns ol.layer.Tile with ol.source.XYZ with custom tileUrlFunction that
    # returns Cloudburst tiles
    options = if !options? then {} else options
    tileLayer = new ol.layer.Tile
      # brightness: if options.brightness? then options.brightness else undefined
      # contrast: if options.contrast? then options.contrast else undefined
      # hue: if options.hue? then options.hue else undefined
      opacity: if options.opacity? then options.opacity else undefined
      preload: if options.preload? then options.preload else undefined
      # saturation: if options.saturation? then options.saturation else undefined
      visible: if options.visible? then options.visible else undefined
      extent: if options.extent? then options.extent else undefined
      minResolution: if options.minResolution? then options.minResolution else undefined
      maxResolution: if options.maxResolution? then options.maxResolution else undefined
      userInterimTilesOnError: if options.userInterimTilesOnError? then options.userInterimTilesOnError else undefined
      extent: if options.extent? then options.extent else @getLayerBounds()
      source: new ol.source.XYZ
        attributions: [@getAttribution()]
        tileUrlFunction: (tileCoord, pixelRatio, projection) =>
          @tileUrl(tileCoord, pixelRatio, projection)
    @tileLayer = tileLayer
    @tileLayer

  getConfig: ->
    @_config

  getLayers: (asObj) ->
    # asObj (bool):
    # - true: returns the layers as an array of tuples: (short name, json)
    # - false: returns the layers as an array of short names
    if @_config?
      if !asObj? or !asObj
        lyrs = Object.keys(@_config)
      else
        lyrs = ([lyr, @_config[lyr]] for lyr in Object.keys(@_config))
      return lyrs

  setLayer: (layer, noRedraw) ->
    if @_layers? and layer in @_layers
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

  getLayerBounds: ->
    # Returns bounds as ol.proj.TransformExtent
    if @_layer? and @_instance?
      bounds = @_config[@_layer]['dataset'][@_instance]['bounds']
      return ol.proj.transformExtent(
        [bounds['west'], bounds['south'], bounds['east'], bounds['north']],
        'EPSG:4326', 'EPSG:3857'
      )

  getLayerMetadata: ->
    if @_layer?
      @_config[@_layer].meta

  getLayerDescription: ->
    if @_layer?
      @getLayerMetadata().description

  getLayerName: ->
    if @_layer?
      @getLayerMetadata().name

  getLayerUnits: ->
    if @_layer?
      @getLayerMetadata().units

  getLayerPlotDefinitions: ->
    if @_layer
      @_config[@_layer].plot_defs

  getInstances: ->
    if @_layer?
      Object.keys(@_config[@_layer]['dataset'])

  setInstance: (instance, noRedraw) ->
    if instance?
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
    # if named? and named: returns the values (e.g. ["2015-09-01T03:00:00Z"]),
    # else returns the index values (e.g [0,1,2])
    if @_instance? and @_layer?
      tindexes = Object.keys(@_config[@_layer]['dataset'][@_instance].times)
      if asObj? and asObj
        tindexes = ([i, @_config[@_layer]['dataset'][@_instance].times[i]] for i in tindexes)
    return tindexes

  setTindex: (tindex, noRedraw) ->
    if tindex.toString() in @getTindexes()
      @_tindex = tindex.toString()
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Tindex set to: #{@_tindex}")
    @

  getTindex: (as_time_string) ->
    if !as_time_string? then @_tindex else @getTindexes(yes)[@_tindex][1]

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
    if @_layer?
      if parseInt(@_layer) < @getLayers().length - 1
        @getLayers(Math.min(parseInt(@_layer) + 1, @getLayers().length - 1), noRedraw)

  deeper: (noRedraw) ->
    if @_layer?
      if parseInt(@_layer) > 0
        @setLayer(Math.max(parseInt(@_layer) - 1, 0), noRedraw)


  getTindexesAsPercetagePositions: ->
    # Takes an array of datetime strings from @getTindexes, and returns an array
    # of the same length where the datetimes are represented as floats
    # indicating their percentage value from 0 to 100, where 0 is the lowest
    # value in the array, and 100 is the highest value.
    # Useful for displaying an array of time values in irregular intervals along
    # a line.
    ts = (Date.parse(t[1])/1000 for t in @getTindexes(yes))
    min_ts = Math.min.apply(null, ts)
    max_ts = Math.max.apply(null, ts)
    diff = max_ts - min_ts
    return (t / diff * 100 for t in (t - min_ts for t in ts))
