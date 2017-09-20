var DetailMap = {
    date: null,
    marker: null,
    tmarker: null,
    map: null,
    mapDiv: null,
    mess: null,
    messError: null,
    apiIsOk: false,
    geocoder: null,
    initialize: function (mapOut) {
        DetailMap.mapDiv = mapOut;
        DetailMap.map = null;
    },
    setMap: function (lat, lng, tlat, tlng) {
        //try {
        if (MapUtility.apiIsOk) {
            DetailMap.point = new google.maps.LatLng(lat, lng);

            //icon: { url: "http://maps.gstatic.com/mapfiles/ms2/micons/man.png" },
            //icon: { url: "http://maps.gstatic.com/mapfiles/ms2/micons/cabs.png" },

            if (!DetailMap.map) {
                DetailMap.mapDiv.css("display", "block");
                DetailMap.map = new google.maps.Map(DetailMap.mapDiv[0], { zoom: 15, disableDefaultUI: true, mapTypeId: google.maps.MapTypeId.ROADMAP });
                DetailMap.map.setCenter(DetailMap.point);
                DetailMap.marker = new google.maps.Marker({
                    clickable: false,
                    icon: { url: "img/man.png" },
                    //shadow: new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/ms2/micons/man.shadow.png",
                    //new google.maps.Size(59.0, 32.0),
                    //new google.maps.Point(0, 0),
                    //new google.maps.Point(16.0, 32.0)
                    //),
                    map: DetailMap.map
                });
                DetailMap.tmarker = new google.maps.Marker({

                    icon: { url: "img/cabs.png" },
                    //shadow: new google.maps.MarkerImage("http://maps.gstatic.com/mapfiles/ms2/micons/cabs.shadow.png",
                    //new google.maps.Size(59.0, 32.0),
                    //new google.maps.Point(0, 0),
                    //new google.maps.Point(16.0, 32.0)
                    //),
                    clickable: false,
                    map: DetailMap.map
                });
            }

            google.maps.event.trigger(DetailMap.map, "resize");
            DetailMap.map.setCenter(DetailMap.point);
            DetailMap.marker.setPosition(DetailMap.point);
            if (tlat && tlng) {
                var tPoint = new google.maps.LatLng(tlat, tlng);
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(DetailMap.point);
                bounds.extend(tPoint);
                DetailMap.tmarker.setPosition(tPoint);
                DetailMap.map.fitBounds(bounds);
            }
        }
        else {
           
        }
    }
};