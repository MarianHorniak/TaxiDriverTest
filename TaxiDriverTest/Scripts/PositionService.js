
var PositionService = {
    lat:0,
    lng: 0,
    _lat: 0,
    _lng: 0,
    poolID: undefined,
    watchID: undefined,
    startWatch: function () {
        PositionService.startPool();

        setTimeout(function () {
            if (this.watchID)
                navigator.geolocation.clearWatch(this.watchID);

            this.watchID = navigator.geolocation.watchPosition(function (position) {
                app.info(Translator.Translate("Presnosť pozície") + ": " + position.coords.accuracy + "m");
                PositionService.lat = position.coords.latitude;
                PositionService.lng = position.coords.longitude;
            }, function (err) {
                app.info(err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 3000,
                timeout: 27000
            });
        }
        , 1000);
    },
    startPool: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        this.poolID = setTimeout(PositionService.pool, 6000);
    },
    stopWatch: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        if (this.watchID)
            navigator.geolocation.clearWatch(this.watchID);
        this.poolID = undefined;
    },
    pool: function () {
        this.poolID = undefined;
            PositionService.callService();
            //try {
            //    navigator.geolocation.getCurrentPosition(
            //        function (position) {
            //                PositionService.lat = position.coords.latitude;
            //                PositionService.lng = position.coords.longitude;
            //                PositionService.callService();
            //        },
            //        function (err) {
            //            PositionService.callService();
            //            app.info(err.message);
            //        },
            //        {
            //            enableHighAccuracy: Service.getSettings().enableHighAccuracy ? true : false,
            //            maximumAge: 1000
            //        });
            //}
            //catch (err) {
            //    PositionService.callService();
            //    app.info(err.message);
            //}
    },
    callService: function () {
        if (Service.isComplet()) {
            try {
                //app.info("Posielam ...");
                var s = Service.getSettings();

                //store previous position
                Globals.Position_LatPrev = Globals.Position_Lat;
                Globals.Position_LngPrev = Globals.Position_Lng;


                var posChanged = PositionService._lat != PositionService.lat && PositionService._lng != PositionService.lng;



                
                if (posChanged) {
                    PositionService._lat = PositionService.lat;
                    PositionService._lng = PositionService.lng;
                    Globals.Position_Lat = PositionService.lat;
                    Globals.Position_Lng = PositionService.lng;
                
                    //stanoviste - zmena ! 
                    Stand.CheckStandAvailable();

                }

                Service.callService("MobilePool", {
                    Id: s.transporterId,
                    Lat: posChanged ? PositionService.lat : 0,
                    Lng: posChanged ? PositionService.lng : 0,
                },
                function (d) { PositionService.startPool(); app.info(""); PositionService.refreshVersionData(d); },
                function (d) { PositionService.startPool(); if (d.ErrorMessage) app.info(d.ErrorMessage); PositionService.refreshVersionData(d); });
            }
            catch (err) {
                PositionService.startPool();
                app.info(err.message);
            }
        }
        else
            PositionService.startPool();
    },
    refreshVersionData: function (d) {
        
        if ((d.DataCheckSum && d.DataCheckSum != Service.ordersVer)) {
            Service.ordersVer = d.DataCheckSum;
            console.log("app play new call");
            app.log("app play new call");
            app.playNew();
            app.refreshData(["orders", "transporters"]);
        }
        //if (d.tVer && d.tVer != Service.transporterVer) {
        //    Service.transporterVer = d.tVer;
            
        //}
    }
}