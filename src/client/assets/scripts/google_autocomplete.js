function activateAutoComplete(){
    // var input = document.getElementById("location_search");
    // var autocomplete = new google.maps.places.Autocomplete(input,{types:['geocode']});

    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(23.63936, 68.14712),
        new google.maps.LatLng(28.20453, 97.34466));
      
      var input = document.getElementById('location_search');
      var options = {
        bounds: defaultBounds,
        types: ['geocode']
      };
      
      autocomplete = new google.maps.places.Autocomplete(input, options);
}

