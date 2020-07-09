var markers = [];
var map;

function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});
	marker.addListener("click", (e) => {
		app.dialog.create({title: place.name, text: place.formatted_address.split(", ").join("</br>"), buttons: [
      { text: 'Cancel' },
      { text: 'Book',
				bold: true,
				onClick: () => {
					app.toast.create({text: 'Bookings coming soon!', closeButton: true}).open();
				}
      }
		]}).open();
	});
	markers.push(marker)
}

function addMarkers(location=false) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];

	location = location == false ? new google.maps.LatLng(map.getCenter().lat(),map.getCenter().lng()) : location
	var request = {
		query: "barber",
		location: location,
		radius: 500
	};
	service = new google.maps.places.PlacesService(map);
	service.textSearch(request, function(
		results,
		status
	) {
		for (var i = 0; i < 20; i++) {
			createMarker(results[i]);
		}
	});
}

function locateNearby() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition((position) => {
			position = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			map.setCenter(position);
			map.setZoom(14);
			addMarkers(position);
		}, (e) => {
			location_permission.open();
		});
	} else {
		app.toast.create({text: 'Geolocation is not supported on this browser.', closeButton: true}).open();
	}
}

function initMaps() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: {
			lat: 51.497810,
			lng: -0.112030
		},
		zoom: 14,
		fullscreenControl: false,
		zoomControl: false,
		mapTypeControl: false,
		streetViewControl: false,
		clickableIcons: false,
	});
	addMarkers();
}