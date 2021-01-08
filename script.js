var data = {};
var groups = {};
var map;

var addMarkers = function(data) {

  for (var i in data) {
    var d = data[i];

    // Add an empty group if doesn't yet exist
    if (!groups[d.Group]) { groups[d.Group] = []; }

    // Create a new place marker
    var m = L.marker(
      [d.Latitude, d.Longitude],
      {
        icon: L.icon({
          iconUrl: d.Icon,
          iconSize: [ iconWidth, iconHeight ],
          iconAnchor: [ iconWidth/2, iconHeight/2 ] // middle of icon represents point center
        })
      }
    ).on('click', function(d) {
      console.log(d) // !!!!!!!!!!!!!!!!!!!!!!!!!! need to pass current marker's data?
      $('#placeName').html(d.Place)
    });
    
    // Add this new place marker to an appropriate group
    groups[d.Group].push(m);

  }

  for (var g in groups) {
    groups[g] = L.layerGroup(groups[g]);
  }

  L.control.layers({}, groups, {collapsed: false}).addTo(map);

}

/*
 * Loads and parses data from CSV or Google Sheets using PapaParse
 */
var loadData = function(loc) {

  Papa.parse(loc, {
    header: true,
    download: true,
    complete: function(results) {
      addMarkers(results.data);
    }
  });

}

/*
 * Main function to initialize the map, add baselayer, and add markers
 */
var initMap = function() {

  map = L.map('map', {
    center: mapCenter,
    zoom: mapZoom,
    tap: false, // to avoid issues in Safari, disable tap
    zoomControl: false,
  });

  // Add zoom control to the bottom-right corner
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  loadData(dataLocation);

}

$('document').ready(initMap);