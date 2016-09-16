L.CloudburstTileLayer = L.TileLayer.extend


  initialize: (urlTemplate, times, levels, bounds, options) ->
    @_times = if times? and times.length then times else null
    @_levels = if levels? and levels.length > 0 then levels else null

    @hasTimes = if @_times then true else false
    @hasLevels = if @_levels then true else false

    @setTime(if @_times? then @_times[0] else 0)
    @setLevel(if @_levels? then @_levels[0] else 0)

    @bounds = if bounds? then bounds else null
    if !options?
      options = {
        minNativeZoom: 2
        maxNativeZoom: 11
        tms: yes
        zoomOffset: 0
        detectRetina: true
      }

    if @bounds? and !('bounds' in options) and (@bounds['west'] < @bounds['east'])
      # If the bounds includes or passes the antimeridian, leaflet will have a cry,
      # son only limit tile requests for simple bounds
      options.bounds = @getBounds() # Prevents leaflet from requesting tiles outside extent

    L.TileLayer.prototype.initialize.call(@, urlTemplate, options)

  getBounds: ->
    # Returns bounds as L.latLngBounds
    if @bounds?
      return new L.latLngBounds(
        L.latLng(@bounds['south'], @bounds['west']),
        L.latLng(@bounds['north'], @bounds['east'])
      )

  getLevels: ->
    # Vertical dimension
    @_levels

  setLevel: (level, noRedraw) ->
    if !@hasLevels or !level?
      return @
    if level.toString() in @getLevels()
      @_level = level.toString()
      @redraw() if !noRedraw? or !noRedraw
    @

  getLevel: ->
    @_level

  getTimes: ->
    @_times

  setTime: (time, noRedraw) ->
    if !@hasTimes
      @_time = 0
      return @
    else if time in @getTimes()
      @_time = time.toString()
      @redraw() if !noRedraw? or !noRedraw
    @

  getTime: ->
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
    if levels.indexOf(l) > 0
      @setLevel(levels[levels.indexOf(l)-1], noRedraw)

  deeper: (noRedraw) ->
    if !@hasLevels
      return
    l = @getLevel()
    levels = @getLevels()
    if levels.indexOf(l) < levels.length + 1
      @setLevel(levels[levels.indexOf(l)+1], noRedraw)

  getTileUrl: (coords) ->
    L.TileLayer.prototype.getTileUrl
      .call(@, coords)
      .replace('<time>', if !@hasTimes then 0 else @getTime())
      .replace('<level>', if !@hasLevels then 0 else @getLevel())

L.cloudburstTileLayer = (urlTemplate, times, levels, bounds, options) ->
  new L.CloudburstTileLayer(urlTemplate, times, levels, bounds, options)
