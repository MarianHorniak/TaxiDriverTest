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
    apiIsOk: false,
    bounds: null,
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
        Map.bounds = new google.maps.LatLngBounds();
        console.log("get map view data");
        var self = Map;
        var s = Service.getSettings();
        Service.callService("datamobile", { Id: "viewWebClientTransporters" },
            function (result) {
                Map.mapOut2.html(Translator.Translate("Počet") + ": " + result.Items.length);
                self.datatransporters = result;
                console.log("get map view data " + result.Items.length);
                $.each(self.datatransporters.Items, function () {
                    var item = this;
                    //var m = new  google.maps.Marker({
                    //    //icon: { url: "img/cabs.png" },
                    //    //labelContent: 'A',
                    //    position: new google.maps.LatLng(item.Latitude, item.Longitude),
                    //    title:item.Title,
                    //    clickable: false,
                    //    map: Map.map
                    //});
                    var pos = new google.maps.LatLng(item.Latitude, item.Longitude);
                    var m = new InfoBubble({
                        map: Map.map,
                        content: '<div style="height:25px;padding:5px;color:#333;">' + item.SPZ + '</div>',
                        position: pos,
                        shadowStyle: 1,
                        padding: 0,
                        //backgroundColor: 'rgb(57,57,57)',
                        borderRadius: 4,
                        arrowSize: 10,
                        borderWidth: 1,
                        borderColor: '#333',
                        disableAutoPan: true,
                        hideCloseButton: true,
                        arrowPosition: 50,
                        //backgroundClassName: 'phoney',
                        arrowStyle: 2
                    });
                    //m.setTitle(item.Title);
                    //m.setIcon(app.getIconUrl(item, true));

                    self.bounds.extend(pos);

                    Map.markers.push(m);
                    m.open();
                });
                self.setBounds();
            }
         );

    },
    setBounds :  function() {
        if (Map.map && Map.bounds && !Map.bounds.isEmpty())
            Map.map.fitBounds(Map.bounds);
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
        var d = Translator.Translate('Lat.')+': ' + position.coords.latitude + '  ' +
        Translator.Translate('Long.')+': ' + position.coords.longitude + '<br />' +
        Translator.Translate('Presnosť')+': ' + position.coords.accuracy + "m" + '<br />';
        var ddop = "";
        Map.geocode({ 'latLng': new google.maps.LatLng(position.coords.latitude, position.coords.longitude) }, function (a) {
            ddop = Translator.Translate('Address')+': ' + a.City + ' ' + a.Address;
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
    }
};