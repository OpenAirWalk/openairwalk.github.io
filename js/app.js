$(document).ready(function(){
  
  //Set Layer ID
  var layerId = 'Routes';
  
  //Mapbox token
  mapboxgl.accessToken = 'pk.eyJ1IjoibGlhbWJvbHRvbnVrIiwiYSI6IjJyeWxEMzgifQ.OROtY7TDOwNOmAOfCZeo4w';
  
  //Map zoom off
  var map_zoom = L.mapbox.map('map');
  map_zoom.removeControl(map_zoom.zoomControl);
  
  //Map layer
  var map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/liamboltonuk/cjfykyscf6i272snyorquvam6',
      attributionControl: true,
      minZoom: 12,
      center: [-0.039258, 51.515705],
  });
  
  //Load health routes layer and hover
  map.on('load', function () {
    
    var filterLength = ['==', ['number',['get', 'Length_km']], 7];

    map.getCanvas().style.cursor = 'default';
    
    map.addSource('Routes', {
          type: 'vector',
          url: 'mapbox://liamboltonuk.3j44u8tc'
    });
    //Load hover
    map.addLayer({
      "id": "routes-hover",
      "type": "line",
      "source": "Routes",
      "filter": ["==", "Length_km", ""],
      "layout": {},
      "paint": {
          "line-color": "#00441b",
          'line-width': 6
      },
    'source-layer': 'Master_Routes_Main-71th70',
    });
    //Load routes
    map.addLayer({
          'id': 'Routes',
          'type': 'line',
          "filter": ["==", "Length_km", ""],
          'source': 'Routes',
          'layout': 
          {
          'visibility': 'visible'
          },
          'filter': ['all', filterLength],
          'paint': {
              'line-width': 4,
              'line-color': '#2ca25f'
          },
          'source-layer': 'Master_Routes_Main-71th70'
    });
    
    //Slider
    document.getElementById('slider').addEventListener('input', function(e) {
      
      var l = parseInt(e.target.value, {
        layers: ['Routes']
      });
      
      //Filter by length km
      filterLength = ['==', ['number', ['get', 'Length_km']], l];

      var l_km = l + 'km';
      
      //Set map filter
      map.setFilter('Routes', ['all', filterLength]);
      
      //Update UI in slider
      document.getElementById('active-id').innerText = l_km;

    });
  });

  //Load Tower Hamlets borough outline
  map.on('load', function () {
    map.addSource('Tower_Hamlets', {
          type: 'vector',
          url: 'mapbox://liamboltonuk.9svaauej'
      });
    map.addLayer({
        'id': 'Tower_Hamlets',
        'type': 'fill',
        'source': 'Tower_Hamlets',
        'layout': 
        {
        'visibility': 'visible'
        },
        'paint': {
          'fill-color': '#99d8c9',
          'fill-outline-color': '#ffffff',
          'fill-opacity': 0.29,
        },
        'source-layer': 'Tower_Hamlets_Boundary-5bpuho'
    });
  });
  
  //Load pollution point layer (normalised, scaled and multipled by 100,000 due to Mapbox error in visualising -0.0000 numbers)
  map.on('load', function () {
    map.addSource('pollution', {
          type: 'vector',
          url: 'mapbox://liamboltonuk.bjmwrj1d'
      });
    map.addLayer({
          'id': 'pollution',
          'type': 'circle',
          'source': 'pollution',
          'layout': 
          {
          'visibility': 'none'
          },
          'paint': {
              'circle-radius': 4,
              'circle-color': {
                property: 'Vm',
                type: 'interval',
                stops: [
                  [-79487, '#542788'],
                  [-56847, '#998ec3'],
                  [-43750, '#d8daeb'],
                  [-32386, '#f7f7f7'],
                  [-19786, '#fee0b6'],
                  [-1368, '#f1a340'],
                  [38822, '#b35806']
                ]
              },
          'circle-opacity': {
                stops: [
                  [12, 1],
                  [13, 0.75]
                ] 
          },
        },
          'source-layer': 'air_scale-4zn072'
    });
  });
  
  //Mapbox GL JS Zoom controls
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'bottom-right');
  
  //Geocoder, local proximity
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
  });
  
  map.addControl(geocoder);
  
  map.on('load', updateGeocoderProximity); 
  map.on('moveend', updateGeocoderProximity); 
  
  //Set geocoder proxity
  function updateGeocoderProximity() {
    if (map.getZoom() > 10) {
        var center = map.getCenter().wrap(); 
        geocoder.setProximity({ longitude: center.lng, latitude: center.lat });
    } else {
        geocoder.setProximity(null);
    }
  }

  //Toggle layers and legend in console
  $('#toggle').on('change',function(e){
     map.setLayoutProperty(layerId, 'visibility', 'none');
     layerId = e.target.id;
     map.setLayoutProperty(layerId, 'visibility', 'visible');

     if (layerId === 'pollution') {
      map.setLayoutProperty('Routes', 'visibility', 'none');
      $("#slider_container").hide();
      $("#legend_pollution").show();
      $("#legend_routes").hide();
     }
     else {
       $("#slider_container").show();
       $("#legend_routes").show();
       $("#legend_pollution").hide();
     }
  });
  
  //Update console height
  $('#console').on('change',function(e){
    layerId = e.target.id;
    if (layerId === 'pollution') {
      $("#console").height(100);
    }
    else {
      $("#console").height(132);
    }
  });
  
  //Hover on routes
  map.on("mousemove", "Routes", function(e) {
    map.setFilter("routes-hover", ["==", "Length", e.features[0].properties.Length]);
  });
  
  //Hover off routes
  map.on("mouseleave", "Routes", function() {
    map.setFilter("routes-hover", ["==", "Length", ""]);
  });
  
});
  
