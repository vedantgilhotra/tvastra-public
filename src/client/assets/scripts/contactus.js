function initMap() {
    var location = {lat: 27.1746773, lng: 78.0419656};
    // The map, centered at location
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 15, center: location});
    // The marker, positioned at lcoation
    var marker = new google.maps.Marker({position: location, map: map});
  }  