L.CloudburstTileLayer = L.TileLayer.extend
  options:
    minZoom: 0
    maxZoom: 17
    tms: yes
    zoomOffset: 0
    detectRetina: true

  initialize: (urlTemplate, times, levels, options) ->
    @_times = if times? then times else null
    @_levels = if levels? then levels else null

    @hasTimes = if @_times then true else false
    @hasLevels = if @_levels then true else false

    @setTime(if @_times? then @_times[0] else 0)
    @setLevel(if @_levels? then @_levels[0] else 0)

    L.TileLayer.prototype.initialize.call(@, urlTemplate, options)

  getLevels: () ->
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

  getTimes: () ->
    # Time-indexes (tindexes)
    @_times

  setTime: (time, noRedraw) ->
    if !@hasTimes
      @_time = 0
      return @
    console.log "let's set the time, now is "
    # console.log "and we want ", time
    else if time in @getTimes()
      @_time = time.toString()
      @redraw() if !noRedraw? or !noRedraw
    @

  getTime: () ->
    @_time

  back: (noRedraw) ->
    if !@hasTimes
      return
    t = @getTime()
    if t? and @getTimes().indexOf(t) > 0
      @setTime(t - 1, noRedraw)

  forward: (noRedraw) ->
    if !@hasTimes
      return
    t = @getTime()
    times = @getTimes()
    if t? and times.indexOf(t) < times.length - 1
      console.log 'now is', @getTime()
      @setTime(t + 1, noRedraw)
      console.log 'forward!', @getTime()

  higher: (noRedraw) ->
    if !@hasLevels
      return
    l = @getLevel()
    levels = @getLevels()
    if l? and levels.indexOf(l) < levels.length - 1
      @setLevel(l, noRedraw)

  deeper: (noRedraw) ->
    if !@hasLevels
      return
    l = @getLevel()
    levels = @getLevels()
    if l? and levels.indexOf(l) > 0
      @setLevel(l, noRedraw)

  getTileUrl: (coords) ->
    L.TileLayer.prototype.getTileUrl
      .call @, coords
      .replace '<time>', @getTime()
      .replace '<level>', @getLevel()

L.cloudburstTileLayer = (urlTemplate, options) ->
  new L.CloudburstTileLayer(urlTemplate, options)
