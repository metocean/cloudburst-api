L.CloudburstTileLayer = L.TileLayer.extend
  options:
    minZoom: 0
    maxZoom: 17
    tms: yes

    subdomains: 'abc'
    zoomOffset: 0

  setUrl: undefined

  initialize: (config, options) ->
    @_config = config

    # Select the first available layer
    @setLayer @_config.layers[0], no

    @setInstance @_config.layers[0].instances[0], no

    @setIndex @_config.layers[0].instances[0].index[0], no

    L.TileLayer.prototype.initialize.call @, '[cloudburst]/{z}/{x}/{y}.png', options

  getConfig: ->
    @_config

  setLayer: (layer, noRedraw) ->
    @_layer = layer
    @_config.layer = layer
    @redraw() if !noRedraw? or !noRedraw
    @

  getLayer: ->
    @_layer

  setInstance: (instance, noRedraw) ->
    @_instance = instance
    @redraw() if !noRedraw? or !noRedraw
    @

  getInstance: ->
    @_instance

  setTindex: (tindex, noRedraw) ->
    @_tindex = tindex
    @redraw() if !noRedraw? or !noRedraw
    @

  getTindex: ->
    @_tindex

  back: (noRedraw) ->
    index = @_config.layers.indexOf @_instance
    index--
    index %= @_config.layers.length
    @setLayer @_config.layers[index], noRedraw

  forward: (noredraw) ->
    index = @_config.layers.indexOf @_key
    index++
    index %= @_config.layers.length
    @setLayer @_config.layers[index], noRedraw

  getTileUrl: (coords) ->
    L.TileLayer.prototype.getTileUrl
      .call @, coords
      .replace /\[wxtiles\]/,
				"#{@_config.url}/tile/mpl/#{@_layer.layerid}/#{@_instance}/#{@_tindex}"

L.cloudburstTileLayer = (config, options) ->
  new L.CloudburstTileLayer config, options
