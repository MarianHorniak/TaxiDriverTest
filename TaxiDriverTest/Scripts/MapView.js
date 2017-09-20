var MapView = function (store) {

    this.index = 4;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        MapUtility.initialize(this.el);
        return this;
    };

    this.onShow = function () {
       if(MapUtility.getData())
           MapUtility.showPosition();
       else
           MapUtility.message("Mapy sa nedajú načítať");
    }

    this.initialize();
}

var MapUtility = {
    date: null,
    marker: null,
    markers: [],
    map: null,
    datatransporters:null,
    mapOut: null,
    mapMessage: null,
    mapDiv: null,
    mapOut2: null,
    mess: null,
    messError: null,
    geocoder: null,
    carCount:0,
    apiIsOk: false,
    initialize: function (el) {
        var header = $('<div class="header"><button data-route="orders" class="icon ico_back">&nbsp;</button></div>').appendTo(el);
        var sc = $('<div class="scrollBottom"/>').appendTo(header);
        MapUtility.mapDiv = $('<div id="mapDiv"/>').appendTo(sc);
        

        MapUtility.mapMessage = $('<div id="mapMessage">Waiting ...</div>').appendTo(sc);
        MapUtility.mapOut = $('<div id="mapOut"/>').appendTo(header);
        MapUtility.mapOut2 = $('<div id="mapOut2"/>').appendTo(header);

        //Service.callService()
        if (MapUtility.mess) {
            MapUtility.message(MapUtility.mess, MapUtility.messError);
        }
        MapUtility.mapDiv.css("display", "block");

        if (MapUtility.apiIsOk) {
            MapUtility.map = new google.maps.Map(MapUtility.mapDiv[0], { zoom: 15, disableDefaultUI: true, mapTypeId: google.maps.MapTypeId.ROADMAP });
            google.maps.event.trigger(MapUtility.map, "resize");
        }
    },
    getData: function () {
        if (!MapUtility.apiIsOk)
            return false;

        for (var i = 0; i < MapUtility.markers.length; i++) {
            MapUtility.markers[i].setMap(null);
        }
        MapUtility.markers = [];
        console.log("get map view data");
        var self = this;
        var s = Service.getSettings();
        Service.callService("datamobile", { Id: "viewWebClientTransporters" },
            function (result) {
                MapUtility.carCount = result.Items.length;
                //MapUtility.mapOut2.html(Translator.Translate("Počet") + ": " + result.Items.length);
                self.datatransporters = result;
                console.log("get map view data " + result.Items.length);
                $.each(self.datatransporters.Items, function () {
                    var item = this;
                    var iconurl = "";
                    if (s) iconurl = s.url + "/resources/icon/Transporter_";
                    if (item && item.Status) iconurl = iconurl + item.Status;
                    if (item && item.DriverTitle) iconurl = iconurl + "_1_" + item.DriverTitle;


                    var m = new  google.maps.Marker({
                        icon: {url:iconurl},
                        position: new google.maps.LatLng(item.Latitude, item.Longitude),
                        title:item.Title,
                        clickable: false,
                        map: MapUtility.map
                    });

                    //m.setTitle(item.Title);
                    //m.setIcon(app.getIconUrl(item, true));

                    MapUtility.markers.push(m);
                });
            }
         );

        return true;

    },
    apiOK: function () {
        MapUtility.apiIsOk = true;
        MapUtility.geocoder = new google.maps.Geocoder();
    },
    showPosition: function () {
        MapUtility.message("Hľadám pozíciu ...");
        try {
            app.geolocation.getCurrentPosition(MapUtility.success, MapUtility.error, { enableHighAccuracy: true }); //, { frequency: 2000 }
        }
        catch (err) {
            MapUtility.message(err.message, true);
        }
    },
    success: function (position) {
        var self = this;
        MapUtility.date = new Date().toTimeString();
        MapUtility.message("Pozícia " + MapUtility.date);
        var poc = "";
        if (MapUtility.carCount && MapUtility.carCount > 0) poc = Translator.Translate('Počet') + ': ' + MapUtility.carCount;
        var lat = position.coords.latitude.toFixed(2);
        var lng = position.coords.longitude.toFixed(2);
        var accu = position.coords.accuracy.toFixed(2);

        var d = Translator.Translate('Lat.')+': ' + lat + '  ' +
        Translator.Translate('Long.')+': ' + lng + '<br />' +
        Translator.Translate('Presnosť') + ': ' + accu + "m, " +
        poc + 
        '<br />';
        var ddop = "";
        MapUtility.geocode({ 'latLng': new google.maps.LatLng(position.coords.latitude, position.coords.longitude) }, function (a) {
            ddop = Translator.Translate('Adresa')+': ' + a.City + ' ' + a.Address;
            MapUtility.mapOut.html(d + ddop);
            MapUtility.setMap(position);
            PositionService.lat = position.coords.latitude;
            PositionService.lng = position.coords.longitude;

        });
       //'Altitude: ' + position.coords.altitude + '<br />' +
       //'Accuracy: ' + position.coords.accuracy + '<br />' +
       //'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
       //'Heading: ' + position.coords.heading + '<br />' +
       //'Speed: ' + Math.ceil(position.coords.speed * 3.6) + ' km/h<br />';// +
        //'Timestamp: ' + new Date(position.timestamp) + '<br />';
        //MapUtility.mapOut.html(d + ddop);
        //MapUtility.setMap(position);
        //PositionService.lat = position.coords.latitude;
        //PositionService.lng = position.coords.longitude;
    },
    error: function (err) {
        MapUtility.message("Error: " + err.message, true);
    },
    message: function (t, err) {
        if (MapUtility.mapMessage) {
            MapUtility.mapMessage.html(t);
            MapUtility.mapMessage.css("color", err ? "red" : "black");
        }
        else {
            MapUtility.mess = t;
            MapUtility.messError = err;
        }
    },
    setMap: function (position) {
        try {
            if (MapUtility.apiIsOk) {

                console.log("point set");
                MapUtility.point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if (!MapUtility.marker) {
                    MapUtility.marker = new google.maps.Marker({
                        icon: { url: "img/cabs.png" },
                        clickable: false,
                        map: MapUtility.map
                    });
                }
                MapUtility.map.setCenter(MapUtility.point);
                MapUtility.marker.setPosition(MapUtility.point);
                

            }
            else {
                MapUtility.message("Mapy sú nedostupné", true);
            }
        }
        catch (err) {
            MapUtility.message(err.message, true);
        }
    },
    geocode: function (props, postback) {
        var self = this, a = {}, lat, lng;
        if (self.geocoder)
            self.geocoder.geocode(props, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        a = self.placeToAddress(results[0]);
                        lat = a.Latitude;
                        lng = a.Longitude;
                    }
                }

                if (postback) {
                    postback({
                        lat: lat, lng: lng,
                        City: a.City,
                        Status: status,
                        Address: (a.Street ? a.Street + " " + (a.StreetNumber ? a.StreetNumber : "") : (a.PointOfInterest ? a.PointOfInterest + " " : ""))
                    });
                }
            });
        else
            postback({});
    },
    placeToAddress: function (place) {
        var address = {};
        if (place.geometry) {
            address.Latitude = place.geometry.location.lat();
            address.Longitude = place.geometry.location.lng();
        }
        $(place.address_components).each(
            function () {
                var a = this;
                if (a.types.length > 0)
                    switch (a.types[0]) {
                        case "country":
                            address.Country = a.long_name;
                            address.CountryShortName = a.short_name;
                            break;
                        case "locality":
                            address.City = a.long_name;
                            break;
                        case "sublocality":
                            address.sublocality = a.long_name;
                            break;
                        case "postal_code":
                            address.PostalCode = a.long_name;
                            break;
                        case "route":
                            address.Street = a.long_name;
                            break;
                        case "street_number":
                            address.StreetNumber = a.long_name;
                            break;
                        case "point_of_interest":
                            address.PointOfInterest = a.long_name;
                            break;
                        case "establishment":
                            address.PointOfInterest = a.long_name;
                            break;
                    }
            }
        );
        return address;
    },
};