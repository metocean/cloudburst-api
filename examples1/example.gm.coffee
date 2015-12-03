logging = on

initMap = () ->
  map = new google.maps.Map(document.getElementById('map'),
    center:
      lat: -34.397
      lng: 150.644
    zoom: 8
  )

  cloudburstGM = new google.maps.ImageMapType
    getTileUrl: (coord, zoom) ->
      normalizedCoord = getNormalizedCoord(coord, zoom)
      if !normalizedCoord
        return null
      bound = Math.pow(2, zoom)
      x = normalizedCoord.x
      # y = (1 << zoom) - coord.y - 1
      y = bound - normalizedCoord.y - 1
      url = "http://localhost:6060/tile/mpl/ncep_mslp/20150922_12z/0/#{zoom}/#{x}/#{y}.png"
      if logging is on
        console.log url
      return url
    tileSize: new google.maps.Size(256, 256)

  # Normalizes the coords so that tiles repeat across the x axis (horizontally)
  getNormalizedCoord = (coord, zoom) ->
    y = coord.y;
    x = coord.x;

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

  map.overlayMapTypes.push(cloudburstGM)
