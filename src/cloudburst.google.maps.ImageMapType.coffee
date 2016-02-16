logging = on

CloudburstMapType = (config, host, map) ->
  @tileSize = new google.maps.Size(256, 256)
  @_config = config
  @_host = host
  @_layers = @getLayers()
  @_map = map
  @opacity = 0.5

  @setLayer(@_layers[3], no)
  @setInstance(@getInstances()[0], no)
  @setTindex(@getTindexes()[0], no)
  @setRenderer('mpl', no) # TODO

  @

CloudburstMapType.prototype.redraw = () ->
  google.maps.event.trigger(@_map, 'resize')

CloudburstMapType.prototype.getConfig = () ->
  @_config

CloudburstMapType.prototype.setOpacity = (opacity) ->
  @opacity = opacity

CloudburstMapType.prototype.getTile = (coord, zoom, ownerDocument) ->
  # Normalizes the coords so that tiles repeat across the x axis (horizontally)
  getNormalizedCoord = (coord, zoom) ->
    if logging is on
      console.log coord, zoom
    y = coord.y
    x = coord.x
    # tile range in one direction range is dependent on zoom level
    # 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    tileRange = 1 << zoom
    # don't repeat across y-axis (vertically)
    if y < 0 or y >= tileRange
      return null
    # repeat across x-axis
    if x < 0 or x >= tileRange
      x = (x % tileRange + tileRange) % tileRange
    return {x: x, y: y}
  normalizedCoord = getNormalizedCoord(coord, zoom)
  if !normalizedCoord
    return null
  bound = Math.pow(2, zoom)
  x = normalizedCoord.x
  # y = (1 << zoom) - coord.y - 1
  y = bound - normalizedCoord.y - 1
  url = "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/#{zoom}/#{x}/#{y}.png"
  if !logging? and logging
    console.log url
  div = ownerDocument.createElement('div')
  img = ownerDocument.createElement('img')
  img.src = url
  img.style.opacity = @opacity
  div.innerHTML = img.outerHTML
  div.style.width = "#{@tileSize.width}px"
  div.style.height = "#{@tileSize.height}px"
  return div

CloudburstMapType.prototype.getLayers = (asObj) ->
  # asObj (bool):
  # - true: returns the layers as an array of tuples: (short name, json)
  # - false: returns the layers as an array of short names
  if @_config?
    if !asObj? or !asObj
      lyrs = Object.keys(@_config.layers)
    else
      lyrs = ([lyr, @_config.layers[lyr]] for lyr in Object.keys(@_config.layers))
    return lyrs

CloudburstMapType.prototype.setLayer = (layer, noRedraw) ->
  if (layer in Object.keys(@_config.layers))
    @_layer = layer
    @redraw() if !noRedraw? or !noRedraw
    if logging is on
      console.log("Layer set to: #{@_layer}")
  @

CloudburstMapType.prototype.getLayer = ->
  @_layer

CloudburstMapType.prototype.getLayerMetadata = ->
  if @_layer?
    @_config.layers[@_layer].meta

CloudburstMapType.prototype.getLayerDescription = ->
  if @_layer?
    @getLayerMetadata().description

CloudburstMapType.prototype.getLayerName = ->
  if @_layer?
    @getLayerMetadata().name

CloudburstMapType.prototype.getLayerUnits = ->
  if @_layer?
    @getLayerMetadata().units

CloudburstMapType.prototype.getLayerPlotDefinitions = ->
  if @_layer
    @_config.layers[@_layer].plot_defs

CloudburstMapType.prototype.getInstances = ->
  if @_layer?
    Object.keys(@_config.layers[@_layer].instances)

CloudburstMapType.prototype.setInstance = (instance, noRedraw) ->
  if instance in @getInstances()
    @_instance = instance
    @redraw() if !noRedraw? or !noRedraw
    if logging is on
      console.log("Instance set to: #{@_instance}")
  @

CloudburstMapType.prototype.getInstance = ->
  @_instance

CloudburstMapType.prototype.getTindexes = (asObj) ->
  # Time-indexes (tindexes)
  # if named? and named: returns the values (e.g. ["2015-09-01T03:00:00Z"]),
  # else returns the index values (e.g [0,1,2])
  if @_instance? and @_layer?
    tindexes = Object.keys(@_config.layers[@_layer].instances[@_instance].indexes)
    if asObj? and asObj
      tindexes = ([i, @_config.layers[@_layer].instances[@_instance].indexes[i]] for i in tindexes)
  return tindexes

CloudburstMapType.prototype.setTindex = (tindex, noRedraw) ->
  if tindex.toString() in @getTindexes()
    @_tindex = tindex.toString()
    @redraw() if !noRedraw? or !noRedraw
    if logging is on
      console.log("Tindex set to: #{@_tindex}")
  @

CloudburstMapType.prototype.getTindex = (as_time_string) ->
  if !as_time_string? then @_tindex else @getTindexes(yes)[@_tindex][1]

CloudburstMapType.prototype.getRenderer = ->
  @_renderer

CloudburstMapType.prototype.setRenderer = (renderer, noRedraw) ->
  @_renderer = renderer
  @redraw() if !noRedraw? or !noRedraw
  @

CloudburstMapType.prototype.back = (noRedraw) ->
  if @_tindex?
    if parseInt(@_tindex) > 0
      @setTindex(Math.max(parseInt(@_tindex) - 1, 0), noRedraw)

CloudburstMapType.prototype.forward = (noRedraw) ->
  if @_tindex?
    if parseInt(@_tindex) < @getTindexes().length-1
      @setTindex(Math.min(parseInt(@_tindex) + 1, @getTindexes().length-1), noRedraw)
