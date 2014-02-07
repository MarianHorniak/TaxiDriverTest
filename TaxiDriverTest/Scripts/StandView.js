var StandView = function () {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(StandView.template());
        $("#standBack").click(function () { app.home(); });
        //klik na header
        $("#standHeader").click(function () {
            self.getData();
        });
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        $('.stand-list').hide();
        app.waiting();

        //default view - stand from service : 
        this.getData();

        //hide waiting cursor
        app.waiting(false);
    };
    
    this.renderStands = function (standresult)
    {
        var self = this;

        $('.stand-list').html(StandView.liTemplate(standresult.Items));
        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });


        //klik na join stand
        $(".forstandup").click(function (item) {
            
            var data_id = item.currentTarget.getAttribute("data_id");
            self.joinStand(data_id);
        });

        //klik na down
        $(".forstanddown").click(function () { Stand.LeaveStand(Stand.ToHomeScreen()); });

        app.waiting(false);
        $('.stand-list').show();
    }

    this.upravData = function (standresult) {
        var self = this;

        var iposFromServer = 0;

        //uprava dat
        for (var i = 0; i < standresult.Items.length; i++) {
            standresult.Items[i].Status = "StandFree";
            standresult.Items[i].CanStand = true;
            standresult.Items[i].CanLeave = false;
            var lat = standresult.Items[i].Latitude;
            var lon = standresult.Items[i].Longitude;

            //var myposition = standresult.Items[i].StandPosition;

            standresult.Items[i].Distancekm = Geo.getDistanceFromLatLonInKm(lat, lon, Globals.Position_Lat, Globals.Position_Lng);

            //zapisme poziciu - pretoze sme tu !
            if (standresult.Items[i].StandPosition && standresult.Items[i].StandPosition > 0) {
                Globals.GLOB_StandPosition = standresult.Items[i].StandPosition;
                Globals.GLOB_GUID_Stand = standresult.Items[i].GUID;
                standresult.Items[i].CanLeave = true;
                standresult.Items[i].CanStand = false;

            }

            //malo miestya, nemoze stat
            if (standresult.Items[i].FreePlaces < 1) {
                standresult.Items[i].Status = "StandNotFree";
                standresult.Items[i].CanStand = false;
            }

            //uz sme prihlaseni, nemozme nastupit na stanoviste
            if (Globals.GLOB_GUID_Stand != "" || standresult.Items[i].FreePlaces < 1) standresult.Items[i].CanStand = false;

            
            //nemoze sa prihlasit pre vzdialenost!!!
            if (standresult.Items[i].Distancekm > Globals.constants.Stand_Distancekm) standresult.Items[i].CanStand = false;
        }


    }

    this.getData = function (e)
    {
        console.log("get data stands");
        var self = this;
        var s = Service.getSettings();
        Service.callService("datamobile", { Id: "viewStandsForDriver", GUID_Transporter : s.transporterId },
            function (standresult) {
                self.upravData(standresult);
                self.renderStands(standresult);
            }
            );
        
    }



    this.initialize();

    this.joinStand = function (standGUID) {
        var self = this;
        app.log("Join stand:" + standGUID);

        window.setTimeout(function () {
            self.joinStandasync(standGUID);
        }, 100);

        console.log("joinStand end");

        app.home();
    }

    this.joinStandasync = function (standGUID) {
        var self = this;
        app.log("Join stand:" + standGUID);

        var s = Service.getSettings();
        Service.callService("TransporterJoinStand", {
            GUID_Transporter: s.transporterId,
            GUID_Stand: standGUID,
            GUID_sysUser_Driver: null,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },

                    function (standresult) {
                        console.log("Join stand OK delegate : " + standGUID);
                        Globals.GLOB_GUID_Stand = standGUID;
                        Globals.GLOB_StandPosition = 100;
                    },

        null

        );


    }

    //this.joinstandOK(data, standGUID)
    //{

    //}

}

var Stand = {

    //kedy bol naposledy ponuknuty Stand ? 
    lastOffer : Date.now(),

    CheckStandAvailable: function()
    {
        console.log("CheckStandAvailable starts...");
        var Distanceminkm = 100000;
        var StandNear = "";

        var standresult = Lists.getListItems("Stand");
        for (var i = 0; i < standresult.Items.length; i++) {
            var lat = standresult.Items[i].Latitude;
            var lon = standresult.Items[i].Longitude;
            var Distancekm0 = Geo.getDistanceFromLatLonInKm(lat, lon, Globals.Position_Lat, Globals.Position_Lng);
            if (Distancekm0 < Distanceminkm) {
                Distanceminkm = Distancekm0;
                StandNear = standresult.Items[i].Title;
            }
        }

        //nie je na stanovisku
        if (Globals.GLOB_GUID_Stand == "") {

            //od poslenej ponuky neubehlo este dost casu ? 
            var differenceSec = (Date.now() - Stand.lastOffer) / 1000;
            if (differenceSec < Globals.constants.Stand_OfferSec) return;

            var availbale = false;
            //vyberiem z chache listu: 

            if (Distanceminkm <= Globals.constants.Stand_Distancekm) availbale = true;

            if (availbale) {
                console.log("CheckStandAvailable show News!!");
                Stand.lastOffer = Date.now();
                var content = Translator.Translate("Vo vašej blízkosti sa nachádza stanovište")+" : "+StandNear + "<br/><button id=\"btnStand\"  data-route=\"stand\" class=\"textnoicon\">Stanovištia</button>";
                //app.showNew();
                app.showNewsComplete(Translator.Translate("Stanovište v blízkosti"), MediaInternal.getNewsSoundFile("StandAvailable"), "", 10000, content);
            }
        }
            //je na stanovisku, odosiel ? 
        else {
            if (Distanceminkm > Globals.constants.Stand_Distancekm)
            {
                console.log("Leave stand automat!!");
                app.playSound(MediaInternal.getNewsSoundFile("StandLeave"));
                Stand.LeaveStand();
            }
        }

    },

    succesLeaveStand : function ()
    {
        Globals.GLOB_GUID_Stand = "";
        Globals.GLOB_StandPosition = 0;
    },

    LeaveStand : function (callback)
    {

        if (Globals.GLOB_GUID_Stand == "")
        {
            app.log("Leave stand not need");
            return;
        }

        app.log("Leave stand:" + Globals.GLOB_GUID_Stand);
        console.log("Leave stand:" + Globals.GLOB_GUID_Stand);

        //app.showNews("Leave stand:" + Globals.GLOB_GUID_Stand);
        var s = Service.getSettings();
        Service.callService("TransporterLeaveStand", {
            GUID_Transporter: s.transporterId,
            GUID_Stand: Globals.GLOB_GUID_Stand,
            GUID_sysUser_Driver: null,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        }, Stand.succesLeaveStand());



        if (callback)
        {
            callback;
        }
    },

    ToHomeScreen: function () {

        app.home();
    }

}

StandView.template = Handlebars.compile($("#stand-tpl").html());
StandView.liTemplate = Handlebars.compile($("#stand-li-tpl").html());


