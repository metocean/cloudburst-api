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
    "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/#{z}/#{x}/#{y}.png"

  setOL3LayerTile: (options) =>
    # Returns ol.layer.Tile with ol.source.XYZ with custom tileUrlFunction that
    # returns Cloudburst tiles
    options = if !options? then {} else options
    tileLayer = new ol.layer.Tile
      brightness: if options.brightness? then options.brightness else undefined
      contrast: if options.contrast? then options.contrast else undefined
      hue: if options.hue? then options.hue else undefined
      opacity: if options.opacity? then options.opacity else undefined
      preload: if options.preload? then options.preload else undefined
      saturation: if options.saturation? then options.saturation else undefined
      visible: if options.visible? then options.visible else undefined
      extent: if options.extent? then options.extent else undefined
      minResolution: if options.minResolution? then options.minResolution else undefined
      maxResolution: if options.maxResolution? then options.maxResolution else undefined
      userInterimTilesOnError: if options.userInterimTilesOnError? then options.userInterimTilesOnError else undefined
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
        lyrs = Object.keys(@_config.layers)
      else
        lyrs = ([lyr, @_config.layers[lyr]] for lyr in Object.keys(@_config.layers))
      return lyrs

  setLayer: (layer, noRedraw) ->
    if (layer in Object.keys(@_config.layers))
      @_layer = layer
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Layer set to: #{@_layer}")
    @

  getLayer: ->
    @_layer

  getLayerMetadata: ->
    if @_layer?
      @_config.layers[@_layer].meta

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
      @_config.layers[@_layer].plot_defs

  getInstances: ->
    if @_layer?
      Object.keys(@_config.layers[@_layer].instances)

  setInstance: (instance, noRedraw) ->
    if instance in @getInstances()
      @_instance = instance
      @redraw() if !noRedraw? or !noRedraw
      if logging is on
        console.log("Instance set to: #{@_instance}")
    @

  getInstance: ->
    @_instance

  getTindexes: (asObj) ->
    # Time-indexes (tindexes)
    # if named? and named: returns the values (e.g. ["2015-09-01T03:00:00Z"]),
    # else returns the index values (e.g [0,1,2])
    if @_instance? and @_layer?
      tindexes = Object.keys(@_config.layers[@_layer].instances[@_instance].indexes)
      if asObj? and asObj
        tindexes = ([i, @_config.layers[@_layer].instances[@_instance].indexes[i]] for i in tindexes)
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
      if parseInt(@_tindex) < @getTindexes().length-1
        @setTindex(Math.min(parseInt(@_tindex) + 1, @getTindexes().length-1), noRedraw)

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
