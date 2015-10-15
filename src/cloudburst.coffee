class cloudburst
  do_log: (url) ->
    console.log url
  # loadConfiguration: (url, cb) =>
  #   host = url.replace /{s}/, '' # Could replace with 'a', 'b', 'c', etc.
  #   $.ajax "#{url}/layers.jsonp?callback=read_layers_callback", (data) =>
  #     console.log data
  #     result =
  #       url: url
  #       # domain: domain
  #       # layers: for layer of data.layers
  #       #   layerid: layer # TODO?
  #       #   units: layer.meta.units
  #       #   name: layer.meta.name
  #       #   description: layer.meta.description
  #       #   # renderer: layer.meta.renderer
  #       #   instances: for instance of layer.instances
  #       #     tindexes: for index, time of layer.indexes
  #       #       tindex: index
  #       #       time: time
  #     console.log result
  #     cb result if cb?

# Export this class as a global, amd module or commonjs module
if typeof module is 'object' and typeof module.exports is 'object'
	module.exports = new cloudburst()
else if typeof define is 'function' and define.amd
	define new cloudburst()
else if window?
	window.wxtiles = new cloudburst()
