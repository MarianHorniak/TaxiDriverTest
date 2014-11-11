var MapView = function (store) {

    this.index = 4;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        Map.initialize(this.el);
        return this;
    };

    this.onShow = function () {
        Map.getData();
        Map.showPosition();
    }

    this.initialize();
}

var Map = {
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
        Map.mapDiv = $('<div id="mapDiv"/>').appendTo(sc);
        

        Map.mapMessage = $('<div id="mapMessage">Waiting ...</div>').appendTo(sc);
        Map.mapOut = $('<div id="mapOut"/>').appendTo(header);
        Map.mapOut2 = $('<div id="mapOut2"/>').appendTo(header);

        //Service.callService()
        if (Map.mess) {
            Map.message(Map.mess, Map.messError);
        }
        Map.mapDiv.css("display", "block");
        Map.map = new google.maps.Map(Map.mapDiv[0], { zoom: 15, disableDefaultUI: true, mapTypeId: google.maps.MapTypeId.ROADMAP });
        google.maps.event.trigger(Map.map, "resize");
    },
    getData: function () {
        for (var i = 0; i < Map.markers.length; i++) {
            Map.markers[i].setMap(null);
        }
        Map.markers = [];
        console.log("get map view data");
        var self = this;
        var s = Service.getSettings();
        Service.callService("datamobile", { Id: "viewWebClientTransporters" },
            function (result) {
                Map.carCount = result.Items.length;
                //Map.mapOut2.html(Translator.Translate("Počet") + ": " + result.Items.length);
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
                        map: Map.map
                    });

                    //m.setTitle(item.Title);
                    //m.setIcon(app.getIconUrl(item, true));

                    Map.markers.push(m);
                });
            }
         );

    },
    apiOK: function () {
        Map.apiIsOk = true;
        Map.geocoder = new google.maps.Geocoder();
    },
    showPosition: function () {
        Map.message("Hľadám pozíciu ...");
        try {
            navigator.geolocation.getCurrentPosition(Map.success, Map.error, { enableHighAccuracy: true }); //, { frequency: 2000 }
        }
        catch (err) {
            Map.message(err.message, true);
        }
    },
    success: function (position) {
        var self = this;
        Map.date = new Date().toTimeString();
        Map.message("Pozícia " + Map.date);
        var poc = "";
        if (Map.carCount && Map.carCount > 0) poc = Translator.Translate('Počet') + ': ' + Map.carCount;

        var d = Translator.Translate('Lat.')+': ' + position.coords.latitude + '  ' +
        Translator.Translate('Long.')+': ' + position.coords.longitude + '<br />' +
        Translator.Translate('Presnosť') + ': ' + position.coords.accuracy + "m, " +
        poc + 
        '<br />';
        var ddop = "";
        Map.geocode({ 'latLng': new google.maps.LatLng(position.coords.latitude, position.coords.longitude) }, function (a) {
            ddop = Translator.Translate('Adresa')+': ' + a.City + ' ' + a.Address;
            Map.mapOut.html(d + ddop);
            Map.setMap(position);
            PositionService.lat = position.coords.latitude;
            PositionService.lng = position.coords.longitude;

        });
       //'Altitude: ' + position.coords.altitude + '<br />' +
       //'Accuracy: ' + position.coords.accuracy + '<br />' +
       //'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
       //'Heading: ' + position.coords.heading + '<br />' +
       //'Speed: ' + Math.ceil(position.coords.speed * 3.6) + ' km/h<br />';// +
        //'Timestamp: ' + new Date(position.timestamp) + '<br />';
        //Map.mapOut.html(d + ddop);
        //Map.setMap(position);
        //PositionService.lat = position.coords.latitude;
        //PositionService.lng = position.coords.longitude;
    },
    error: function (err) {
        Map.message("Error: " + err.message, true);
    },
    message: function (t, err) {
        if (Map.mapMessage) {
            Map.mapMessage.html(t);
            Map.mapMessage.css("color", err ? "red" : "black");
        }
        else {
            Map.mess = t;
            Map.messError = err;
        }
    },
    setMap: function (position) {
        try {
            if (Map.apiIsOk) {

                console.log("point set");
                Map.point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                if (!Map.marker) {
                    Map.marker = new google.maps.Marker({
                        icon: { url: "img/cabs.png" },
                        clickable: false,
                        map: Map.map
                    });
                }
                Map.map.setCenter(Map.point);
                Map.marker.setPosition(Map.point);
                

            }
            else {
                Map.message("Mapy sú nedostupné", true);
            }
        }
        catch (err) {
            Map.message(err.message, true);
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