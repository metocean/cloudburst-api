getNormalizedCoord = (coord, zoom) ->
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

CloudburstMapType = (urlTemplate, times, levels, bounds, map) ->
  @tileSize = new google.maps.Size(256, 256)
  @_map = map
  @opacity = 0.8

  @_times = if times? then times else null
  @_levels = if levels? then levels else null

  @hasTimes = if @_times then true else false
  @hasLevels = if @_levels then true else false

  @setTime(if @_times? then @_times[0] else 0)
  @setLevel(if @_levels? then @_levels[0] else 0)

  @bounds = if bounds? then bounds else null

  @urlTemplate = urlTemplate

  @

CloudburstMapType.prototype.redraw = () ->
  google.maps.event.trigger(@_map, 'resize')

CloudburstMapType.prototype.setOpacity = (opacity) ->
  @opacity = opacity

CloudburstMapType.prototype.getLevels = ->
  @_levels

CloudburstMapType.prototype.setLevel = (level, noRedraw) ->
  if !@hasLevels
    return @
  if level.toString() in @getLevels()
    @_level = level.toString()
    @redraw() if !noRedraw? or !noRedraw
  @

CloudburstMapType.prototype.getLevel = ->
  @_level

CloudburstMapType.prototype.getTimes = (asObj) ->
  @_times

CloudburstMapType.prototype.setTime = (time, noRedraw) ->
  if !@hasTimes
    @_time = 0
    return @
  else if time in @getTimes()
    @_time = time.toString()
    @redraw() if !noRedraw? or !noRedraw

CloudburstMapType.prototype.getTime = ->
  @_time

CloudburstMapType.prototype.back = (noRedraw) ->
  if !@hasTimes
    return
  t = @getTime()
  times = @getTimes()
  if t? and times.indexOf(t) > 0
    @setTime(times[times.indexOf(t)-1], noRedraw)

CloudburstMapType.prototype.forward = (noRedraw) ->
    if !@hasTimes
      return
    t = @getTime()
    times = @getTimes()
    if t? and times.indexOf(t) < times.length - 1
      @setTime(times[times.indexOf(t)+1], noRedraw)

CloudburstMapType.prototype.higher = (noRedraw) ->
  if !@hasLevels
    return
  l = @getLevel()
  levels = @getLevels()
  if l? and levels.indexOf(l) < levels.length - 1
    @setLevel(levels[levels.indexOf(l)+1], noRedraw)

CloudburstMapType.prototype.deeper = (noRedraw) ->
  if !@hasLevels
    return
  l = @getLevel()
  levels = @getLevels()
  if l? and levels.indexOf(l) > 0
    @setLevel(levels[levels.indexOf(l)-1], noRedraw)

CloudburstMapType.prototype.getTile = (coord, zoom, ownerDocument) ->
  # Normalizes the coords so that tiles repeat across the x axis (horizontally)
  normalizedCoord = getNormalizedCoord(coord, zoom)
  if !normalizedCoord
    return null
  bound = Math.pow(2, zoom)
  x = normalizedCoord.x
  # y = (1 << zoom) - coord.y - 1
  y = bound - normalizedCoord.y - 1
  url = @urlTemplate
  .replace('<time>', if !@hasTimes then 0 else @getTimes().indexOf(@getTime()))
  .replace('<level>', if !@hasLevels then 0 else @getLevels().indexOf(@getLevel()))
  .replace('{z}', zoom)
  .replace('{x}', x)
  .replace('{y}', y)
  # url = "#{@_host}/tile/#{@_renderer}/#{@_layer}/#{@_instance}/#{@_tindex}/#{@_level}/#{zoom}/#{x}/#{y}.png"
  div = ownerDocument.createElement('div')
  img = ownerDocument.createElement('img')
  img.src = url
  img.style.opacity = @opacity
  div.innerHTML = img.outerHTML
  div.style.width = "#{@tileSize.width}px"
  div.style.height = "#{@tileSize.height}px"
  return div
