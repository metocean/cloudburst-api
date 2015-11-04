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
    # console.log(config)
    @_config = config
    @_host = serverurl
    @_layers = @getLayers()

    # Select the first available layer, and first instance, index
    @setLayer(@_layers[0], no)
    @setInstance(@getInstances()[0], no)
    @setTindex(@getTindexes()[0], no)
    @setRenderer('mpl', no)

    L.TileLayer.prototype.initialize.call @, "[cloudburst]/{z}/{x}/{y}.png", options

  getConfig: ->
    @_config

  getLayers: ->
    if @_config?
      Object.keys(@_config.layers)

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

  getTindexes: (named) ->
    # Time-indexes (tindexes)
    # if named? and named: returns the values (e.g. ["2015-09-01T03:00:00Z"]),
    # else returns the index values (e.g [0,1,2])
    if @_instance? and @_layer?
      tindexes = Object.keys(@_config.layers[@_layer].instances[@_instance].indexes)
    if named? and named
      tindexes = (@_config.layers[@_layer].instances[@_instance].indexes[i] for i in tindexes)
    return tindexes

  setTindex: (tindex, noRedraw) ->
    console.log(noRedraw)
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
      else
        # Reset cycle
        @setTindex(0, noRedraw)

  forward: (noRedraw) ->
    if @_tindex?
      if parseInt(@_tindex) < @getTindexes().length-1
        @setTindex(Math.min(parseInt(@_tindex) + 1, @getTindexes().length-1), noRedraw)
      else
        # Reset cycle
        @setTindex(0, noRedraw)

  getTileUrl: (coords) ->
    # Replace [cloudburst] in the prototype URL with parameters from the config
    L.TileLayer.prototype.getTileUrl
      .call @, coords
      .replace /\[cloudburst\]/,
        "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/"

L.cloudburstTileLayer = (config, options) ->
  new L.CloudburstTileLayer config, options
