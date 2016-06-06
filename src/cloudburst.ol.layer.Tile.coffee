class CloudburstOL3

  constructor: (urlTemplate, times, levels, bounds, host) ->

    @_htmlattr = '&copy;<a href="http://www.metocean.co.nz/">MetOcean Solutions Ltd</a>'

    @_times = if times? then times else null
    @_levels = if levels? then levels else null

    @hasTimes = if @_times then true else false
    @hasLevels = if @_levels then true else false

    @setTime(if @_times? then @_times[0] else 0)
    @setLevel(if @_levels? then @_levels[0] else 0)

    @bounds = if bounds? then bounds else null

    @urlTemplate = urlTemplate

    @tileLayer = undefined
    @

  getAttribution: ->
    attr = new ol.Attribution
      html: @_htmlattr
    return attr

  redraw: ->
    if @tileLayer?
      @tileLayer.getSource().changed()

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

  getLayerBounds: ->
    # Returns bounds as ol.proj.TransformExtent
    if @bounds?
      return ol.proj.transformExtent(
        [@bounds['west'], @bounds['south'], @bounds['east'], @bounds['north']],
        'EPSG:4326', 'EPSG:3857'
      )

  getLevels: ->
    # Vertical dimension
    @_levels

  setLevel: (level, noRedraw) ->
    if !@hasLevels
      return @
    if level.toString() in @getLevels()
      @_level = level.toString()
      @redraw() if !noRedraw? or !noRedraw
    @

  getLevel: ->
    @_level

  getTimes: ->
    # Time-indexes (tindexes)
    @_times

  setTime: (time, noRedraw) ->
    if !@hasTimes
      @_time = 0
      return @
    else if time in @getTimes()
      @_time = time.toString()
      @redraw() if !noRedraw? or !noRedraw
    @

  getTime: (as_time_string) ->
    @_time

  back: (noRedraw) ->
    if !@hasTimes
      return
    t = @getTime()
    times = @getTimes()
    if t? and times.indexOf(t) > 0
      @setTime(times[times.indexOf(t)-1], noRedraw)

  forward: (noRedraw) ->
    if !@hasTimes
      return
    t = @getTime()
    times = @getTimes()
    if t? and times.indexOf(t) < times.length - 1
      @setTime(times[times.indexOf(t)+1], noRedraw)

  higher: (noRedraw) ->
    if !@hasLevels
      return
    l = @getLevel()
    levels = @getLevels()
    if l? and levels.indexOf(l) < levels.length - 1
      @setLevel(levels[levels.indexOf(l)+1], noRedraw)

  deeper: (noRedraw) ->
    if !@hasLevels
      return
    l = @getLevel()
    levels = @getLevels()
    if l? and levels.indexOf(l) > 0
      @setLevel(levels[levels.indexOf(l)-1], noRedraw)

  tileUrl: (tileCoord, pixelRatio, projection) ->
      z = tileCoord[0]
      x = tileCoord[1]
      y = tileCoord[2] + (1 << z) # Accounting for bottom-left origin
      @urlTemplate
      .replace('<time>', if !@hasTimes then 0 else @getTimes().indexOf(@getTime()))
      .replace('<level>', if !@hasLevels then 0 else @getLevels().indexOf(@getLevel()))
      .replace('{z}', z)
      .replace('{x}', x)
      .replace('{y}', y)
