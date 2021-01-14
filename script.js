var data = {};
var groups = {};
var map;

/*
 * Given a string `str`, replaces whitespaces with dashes,
 * and removes nonalphanumeric characters. Used in URL hash.
 */
var slugify = function(str) {
  return str.replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

/*
 * Resets map view to originally defined `mapCenter` and `mapZoom` in settings.js
 */
var resetView = function() {
  map.flyTo( mapCenter, mapZoom );
  resetSidebar();
}

/*
 * Resets sidebar, clearing out place info and leaving title+footer only
 */
var resetSidebar = function() {
    // Make the map title original color
    $('header').removeClass('black-50');

    // Clear placeInfo containers
    $('#placeInfo').addClass('dn');
    $('#placeInfo h2, #placeInfo h3').html('');
    $('#placeInfo div').html('');
    $('#googleMaps').addClass('dn').removeClass('dt');

    // Reset hash
    location.hash = '';
}

/*
 * Given a `marker` with data bound to it, update text and images in sidebar
 */
var updateSidebar = function(marker) {

  // Get data bound to the marker
  var d = marker.options.placeInfo;

  if (L.DomUtil.hasClass(marker._icon, 'markerActive')) {
    // Deselect current icon
    L.DomUtil.removeClass(marker._icon, 'markerActive');
    resetSidebar();
  } else {
    location.hash = d.slug;

    // Dim map's title
    $('header').addClass('black-50');
    $('#placeInfo').removeClass('dn');

    // Clear out active markers from all markers
    $('.markerActive').removeClass('markerActive');

    // Make clicked marker the new active marker
    L.DomUtil.addClass(marker._icon, 'markerActive');

    // Populate place information into the sidebar
    $('#placeInfo').animate({opacity: 0.5}, 300).promise().done(function() {
      $('#placeInfo h2').html(d.Name);
      $('#placeInfo h3').html(d.Subtitle);
      $('#description').html(d.Description);

      if (d.GoogleMapsLink) {
        $('#googleMaps').removeClass('dn').addClass('dt').attr('href', d.GoogleMapsLink);
      } else {
        $('#googleMaps').addClass('dn').removeClass('dt');
      }

      $('#gallery').html('');
      $('#galleryIcon').hide();

      // Load up to 5 images
      for (var i = 1; i <= 5; i++) {
        var idx = 'Image' + i;

        if (d[idx]) {

          var source = "<em class='normal'>" + d[idx + 'Source'] + '</em>';

          if (source && d[idx + 'SourceLink']) {
            source = "<a href='" + d[idx + 'SourceLink'] + "' target='_blank'>" + source + "</a>";
          }

          var a = $('<a/>', {
            href: d[idx],
            'data-lightbox': 'gallery',
            'data-title': ( d[idx + 'Caption'] + ' ' + source )  || '',
            'data-alt': d.Name,
            'class': i === 1 ? '' : 'dn'
          });

          var img = $('<img/>', { src: d[idx], alt: d.Name, class: 'dim br1' });
          $('#gallery').append( a.append(img) );

          if (i === 1) {
            $('#gallery').append(
              $('<p/>', { class: 'f6 black-50 mt1', html: d[idx + 'Caption'] + ' ' + source })
            );
          }

          if (i === 2) {
            $('#gallery > a:first-child').append('<span class="material-icons arrow arrow-right white-90">navigate_next</span>')
            $('#gallery > a:first-child').append('<span class="material-icons arrow arrow-left white-90">navigate_before</span>')
          }

        } else {
          break;
        }
      }

      $('#placeInfo').animate({ opacity: 1 }, 300);

      // Scroll sidebar to focus on the place's title
      $('#sidebar').animate({
        scrollTop: $('header').height() + 20
      }, 800);
    })
  }
}

/*
 * Main function that generates Leaflet markers from read CSV data
 */
var addMarkers = function(data) {

  var activeMarker;
  var hashName = decodeURIComponent( location.hash.substr(1) );

  for (var i in data) {
    var d = data[i];

    // Create a slug for URL hash, and add to marker data
    d['slug'] = slugify(d.Name);

    // Add an empty group if doesn't yet exist
    if (!groups[d.Group]) { groups[d.Group] = []; }

    // Create a new place marker
    var m = L.marker(
      [d.Latitude, d.Longitude],
      {
        icon: L.icon({
          iconUrl: d.Icon,
          iconSize: [ iconWidth, iconHeight ],
          iconAnchor: [ iconWidth/2, iconHeight/2 ], // middle of icon represents point center
          className: 'br1',
        }),
        // Pass place data
        placeInfo: d
      },
    ).on('click', function(e) {
      map.flyTo(this._latlng, 11);
      updateSidebar(this);
    });

    // Add this new place marker to an appropriate group
    groups[d.Group].push(m);

    if (d.slug === hashName) { activeMarker = m; }
  }

  // Transform each array of markers into layerGroup
  for (var g in groups) {
    groups[g] = L.layerGroup(groups[g]);

    // By default, show all markers
    groups[g].addTo(map);
  }

  L.control.layers({}, groups, {collapsed: false}).addTo(map);
  $('.leaflet-control-layers-overlays').prepend('<h3 class="mt0 mb1 f5 black-30">Themes</h3>');

  // If name in hash, activate it
  if (activeMarker) { activeMarker.fire('click') }

}

/*
 * Loads and parses data from a CSV (either local, or published
 * from Google Sheets) using PapaParse
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
 * Add home button
 */
var addHomeButton = function() {

  var homeControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },

    onAdd: function(map) {
      var container = L.DomUtil.create('span');
      container.className = 'db material-icons home-button black-80';
      container.innerText = 'map';
      container.onclick = function() {
        resetView();
      }

      return container;
    }
  })

  map.addControl(new homeControl);

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

  // Add data & GitHub links
  map.attributionControl.setPrefix('Download <a href="'
    + dataLocation + '" target="_blank">data</a> or \
    view <a href="http://github.com/handsondataviz/leaflet-point-map-sidebar" target="_blank">code on\
    GitHub</a> | created with <a href="http://leafletjs.com" title="A JS library\
    for interactive maps">Leaflet</a>');

  // Add custom `home` control
  addHomeButton();

  $('#closeButton').on('click', resetView);
}

// When DOM is loaded, initialize the map
$('document').ready(initMap);
