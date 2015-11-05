L.CloudburstTileLayer = L.TileLayer.extend
  options:
    minZoom: 0
    maxZoom: 17
    tms: yes
    zoomOffset: 0
    detectRetina: true

  setUrl: undefined

  initialize: (serverurl, config, options) ->
    if not config.layers
      return
    @_host = serverurl
    @_config = config
    @_layers = @getLayers()

    # Select the first available layer, and first instance, index
    @setLayer(@_layers[0], no)
    @setInstance(@getInstances()[0], no)
    @setTindex(@getTindexes()[0], no)
    @setRenderer('mpl', no) # TODO

    L.TileLayer.prototype.initialize.call @, "[cloudburst]/{z}/{x}/{y}.png", options

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
      console.log("Layer set to: #{@_layer}")
    @

  getLayer: ->
    @_layer

  getInstances: ->
    if @_layer?
      Object.keys(@_config.layers[@_layer].instances)

  setInstance: (instance, noRedraw) ->
    if instance in @getInstances()
      @_instance = instance
      @redraw() if !noRedraw? or !noRedraw
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
      console.log("Tindex set to: #{@_tindex}")
    @

  getTindex: ->
    @_tindex

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

  getTileUrl: (coords) ->
    # Replace [cloudburst] in the prototype URL with parameters from the config
    L.TileLayer.prototype.getTileUrl
      .call @, coords
      .replace /\[cloudburst\]/,
        "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/"

L.cloudburstTileLayer = (config, options) ->
  new L.CloudburstTileLayer config, options
