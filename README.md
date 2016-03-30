JavaScript API for **Cloudburst**, the MetOcean Solutions tile server.

Use of the Leaflet API in particular is recommended and encouraged!

## Sample Leaflet interface

### Simple

`examples1/example.leaflet`

Demonstration of a simple interface, using only some of the capabilities of the API.

![alt text][sample-interface-1]

### Advanced

`examples2/example.leaflet`

Demonstration of a more advanced interface, using more of the API's capabilities, and also of Leaflet's (stacking `L.tileLayer`s).

![alt text][sample-interface-2]

In this case, we have two layers showing pressure, with different instances. The semi-transparent background layer demonstrates an older forecast than the top layer.

Note that these layers do no have the same indexes (time steps). This sample application shows the nearest possible values to the user's selection. Watch what happens for the first six hours, where the newer forecast does not yet exist:

![alt text][sample-interface-2-t1]

---

![alt text][sample-interface-2-t2]

---

![alt text][sample-interface-2-t3]


At the other end of the time range, the same occurs, with the newer forecast extending further into the future than the older one.

Of course, you must define your own behaviour for handling partially- or non-overlapping time indexes; just be aware how indexes and instances are defined and write your application appropriately.

<!-- Add image -->

## Sample OpenLayers3 interface

![alt text][sample-interface-ol3]

## Sample Google Maps interface

To use the Google Maps API, add a new custom OverlayMapType (see example):

![alt text][sample-interface-gm]


[sample-interface-1]: ./examples1/img/example.leaflet.interface.png "Sample Leaflet interface"

[sample-interface-2]: ./examples2/img/example.leaflet.interface.png "Sample advanced Leaflet interface"

[sample-interface-2-t1]: ./examples2/img/example.leaflet.interface.t1.png "Sample advanced Leaflet interface with time step at t1"

[sample-interface-2-t2]: ./examples2/img/example.leaflet.interface.t2.png "Sample advanced Leaflet interface with time step at t2"

[sample-interface-2-t3]: ./examples2/img/example.leaflet.interface.t3.png "Sample advanced Leaflet interface with time step at t3"

[sample-interface-gm]: ./examples1/img/example.gm.interface.png "Sample Google Maps API interface"

[sample-interface-ol3]: ./examples1/img/example.ol3.interface.png "Sample OpenLayers3 interface"

# Legends

Legends for a layer can be retrieved from `{host}/legend/{size}/{orientation}/{layer}.png`.

Note that `size` must be one of "small" or "large", and `orientation` must be one of "horizontal" or "vertical".

Also note that some layers do not have legends, either because they have not been correctly configured, or they have been purposely disabled (e.g. a layer showing labelled isolines of a single colour does not require a legend).

JSON representations of the legends are also available, at `{host}/legend/{size}/{orientation}/{layer}.json`. Because these include the names of continuous colourmaps that are not accessible to clients, they include a discretised version of the colourmap for a layer, using hex values. The `size` and `orientation` parts of the path have no effect, but are still required.

Example:

```json
{
    "wind10": {
        "contour": {
            "cmap": "wind",
            "cmap_discrete": [
                "#000080",
                "#0086c3",
                "#0afff5",
                "#71ff8e",
                "#d8ff27",
                "#ffdb00",
                "#ffa100",
                "#ff6700",
                "#ff2c00",
                "#e80017",
                "#890077",
                "#801e62",
                "#804040"
            ],
            "colors": null,
            "extend": "max",
            "hatches": null,
            "levels": [
                0,
                1,
                3,
                6,
                10,
                16,
                21,
                27,
                33,
                40,
                47,
                55,
                63
            ],
            "linestyles": null,
            "linewidths": null,
            "mplkwargs": {
                "ticks": [
                    1,
                    3,
                    6,
                    10,
                    16,
                    21,
                    27,
                    33,
                    40,
                    47,
                    55,
                    63
                ]
            },
            "unit": "kn (Beaufort scale)"
        },
        "quiver": {}
    }
}
```

The PNG versions of the legends are drawn from these JSON representations.
