
var PositionService = {
    lat:0,
    lng: 0,
    _lat: 0,
    _lng: 0,
    poolID: undefined,
    watchID: undefined,
    
    startPool: function () {
        if (PositionService.poolID)
            clearTimeout(PositionService.poolID);
        PositionService.poolID = setTimeout(PositionService.pool, 6000);
        if (!PositionService.watchID)
            PositionService.startWatch();
    },
    stopPool: function () {
        if (this.poolID)
            clearTimeout(this.poolID);
        this.poolID = undefined;

        this.clearWatch();
    },
    startWatch: function () {
        setTimeout(function () {
            try {

                PositionService.clearWatch();
                PositionService.watchID = navigator.geolocation.watchPosition(function (position) {

                    var accu = position.coords.accuracy.toFixed(2);

                    app.info(Translator.Translate("Presnosť pozície") + ": " + accu + "m");
                    PositionService.lat = position.coords.latitude;
                    PositionService.lng = position.coords.longitude;

                }, function (err) {
                    app.info(err.message);
                    PositionService.clearWatch();
                },
               {
                   enableHighAccuracy: true,
                   maximumAge: 3000,
                   timeout: 27000
               });
            }
            catch (err) {
                app.info(err.message);
                PositionService.clearWatch();
            }
        }
        , 1000);
    },
    clearWatch: function () {
        try {
            if (PositionService.watchID)
                navigator.geolocation.clearWatch(PositionService.watchID);
        }
        catch (err) { }
                
        PositionService.watchID = undefined;
    },
    pool: function () {
        //PositionService.poolID = undefined;
            PositionService.callService();
            //try {
            //    app.geolocation.getCurrentPosition(
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
                
                    //stanoviste - zmena ! moze byt ppri stanovist
                    Stand.CheckStandAvailable();

                    //moze opustat stanoviste a neodhlasil sa
                    Stand.CheckStandLeave();
                } 

                //ktory view sa pouzije? 
                //var DataPackageDriver = "viewDataPackageDriverReservations";
                var DataPackageDriver = "viewDataPackageDriver";
                var snewdata = Globals.GetSetItem("DataPackageDriver");
                if (snewdata && snewdata != "")
                    DataPackageDriver = snewdata;

                Service.callService("MobilePool", {
                    Id: s.transporterId,
                    Lat: posChanged ? PositionService.lat : 0,
                    Lng: posChanged ? PositionService.lng : 0,
                    GUID_sysCompany: s.GUID_sysCompany,
                    DataPackageDriver: DataPackageDriver,
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
        
        //mhp tu bude zmen, priuchadza viacerio checksumov ! 
        var checkSum_Orders = '';
        var checkSum_Reservation = '';
        var checkSum_Messages = '';
        var checkSum_Transporter = '';
        var checkSum_User = '';
        var checkSum_OrderMessages = '';

        var needRefreshMinutes = true;

        app.log("call resfresh version");

        var refreshed = false;

        if (!d.Items)
            return;

        checkSum_Orders = d.Items[0]["Column1"];
        checkSum_Messages = d.Items[1]["Column1"];
        checkSum_Transporter = d.Items[2]["Column1"];

        if (d.Items.length > 3)
            checkSum_OrderMessages = d.Items[3]["Column1"];

        if (d.Items.length > 4)
            checkSum_Reservation = d.Items[4]["Column1"];


        //app.setStatusBar('aa', 'bb', 'mess', 'P');
        
        app.setStatusBarOffer("None");

        //chcek offers
        if ((checkSum_Orders && checkSum_Orders != Service.ordersVer)) {
            var refreshed = true;
            var onlyInit = false; //je to pociatcony stav, ideme z NULL
            if (!Service.ordersVer) onlyInit = true;
            Service.ordersVer = checkSum_Orders;

            if (!onlyInit) {
                app.setStatusBarOffer("New");
                try {
                    var isSpecial = Service.ordersVer.indexOf("BroadCast") > -1
                    //nova objednavka, alebo broadcast ? 
                    if (isSpecial) {
                        MediaInternal.playSoundInMedia("Order_Broadcast", 1, 0);
                    }
                    else {
                        app.playNew();
                    }
                    LocalNotification.schedule("orders", "Zmena v objednávkach");
                }
                catch (err) { //zahrame, aj ak bola chyba !
                    app.playNew();
                }

                //MHP stacia orders a nepotrebujeme transporters ? 
                //app.refreshData(["orders", "transporters"]);
                app.refreshData(["orders"]);
                needRefreshMinutes = false;
            }
        }

        //orders messages = spravy k objednavkam
        if ((checkSum_OrderMessages && checkSum_OrderMessages != Service.ordersmessagesVer)) {
            Service.ordersmessagesVer = checkSum_OrderMessages;
            //app.setStatusBarOffer("New");
            try {
                MediaInternal.playSoundInMedia("Message_New", 1, 0);
                LocalNotification.schedule("orders", "Zmena v objednávkach");
            }
            catch (err) { //zahrame, aj ak bola chyba !
            }

            //co treba refresnut ? 
            if (!refreshed) {
                app.refreshData(["orders"]);
                needRefreshMinutes = false;
            }
        };

        //permamnet sound on messages
        var OrderOfferPermanentSound = 0;
        var set1 = Globals.GetSetItem("OrderOfferPermanentSound");
        if (set1) OrderOfferPermanentSound = set1;
        if (OrderOfferPermanentSound == "1" && Service.orders && Service.orders.Items && Service.orders.Items.length>0) {

            var playperm = false;
            var r = $.grep(Service.orders.Items, function (o) { return o.Status == "Offered"; });
            if (r.length > 0)
                playperm = true;

            if(playperm)
                app.playNew();
        }

        //reservations 
        app.setStatusBarOfferReservation("None");
        if (checkSum_Reservation && checkSum_Reservation!="") {
            Service.ordersReservationVer = checkSum_Reservation;
            var hasNew = false;
            var res = checkSum_Reservation.split(Globals.SplitString);
            if (res && res.length == 2 && res[1] != "0") {
                hasNew = true;
            }
            if(hasNew)
                app.setStatusBarOfferReservation("New");
        }

        //messages 
        if (checkSum_Messages && checkSum_Messages  != Service.messagesVer)
        {
            //pozor, mozu byt aj nulove messages !
            var hasNew = false;
            Service.messagesVer = checkSum_Messages;
            var res = checkSum_Messages.split(Globals.SplitString);
            if (res && res.length == 2 && res[1] != "0") {
                hasNew = true;
            }
            if (hasNew) {
                app.setStatusBarNewMessage();
                MediaInternal.playSoundInMedia("Message_New", 1, 0);
                LocalNotification.schedule("messages", "Nová správa");
            }

        }





        //nieco je s transporterom na servri, napr stanoviste 
        if (checkSum_Transporter && checkSum_Transporter != Service.transporterVer) {
            Transporter.ProcessCheckSum(checkSum_Transporter);
        }


        //poterbujeme zmenit casy na hlavnej obrazovke, tie, ktore robia countDown (MinuteRest ....) AKO ? 
        if (needRefreshMinutes)
        {
            Tools.refreshOrderMinutecntd(true);
        }
    }
}