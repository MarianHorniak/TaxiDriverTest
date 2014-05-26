var StandView = function () {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(StandView.template());

        //close modal New window
        app.hideNews();

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

        //zavreme news okno
        app.hideNews();

        //nastavime stand poslednu ponuku
        Stand.lastOffer = Date.now();

        $('.stand-list').html(StandView.liTemplate(standresult.Items));
        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });


        //klik na join stand
        $(".forstandup").click(function (item) {
            item.stopPropagation();
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
        Diagnostic.log("get data stands");
        var self = this;
        var s = Service.getSettings();

        //set icon on main index
        Stand.setIcon();

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

        //mhp test toto funguje, inak sa zavola alarm ak sa buttony prekryvaju
        //self.joinStandasync(standGUID);

        //window.setTimeout(function () {
        //    self.joinStandasync(standGUID);
        //}, 100);

        window.setTimeout(function () {
            self.joinStandasync(standGUID);
        });

        console.log("joinStand end");

        app.home();
    }

    this.joinStandasync = function (standGUID) {

        //standGUID.stopPropagation();

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
                        //set stand icon On
                        Stand.setIconNotFree();
                        return false;
                    },

        null

        );

        return false;

    }



}

var Stand = {

    //kedy bol naposledy ponuknuty Stand ? 
    lastOffer: Date.now(),


    setIcon: function () {
        if (Globals.GLOB_GUID_Stand) {
            Stand.setIconNotFree();
        }
        else {
            Stand.setIconNotFree();
        }

    },


    setIconFree: function ()
    {
        $("#btnStand").removeClass("standMenuFree");
        $("#btnStand").addClass("standMenuOn");

    },

    setIconNotFree: function ()
    {
        $("#btnStand").removeClass("standMenuFree");
        $("#btnStand").addClass("standMenuOn");

    },


    CheckStandAvailable: function()
    {

        //ak sme na stanovisti, tak prec ! 
        if (Globals.GLOB_GUID_Stand != "") return;


        //od poslenej ponuky neubehlo este dost casu ? 
        var differenceSec = (Date.now() - Stand.lastOffer) / 1000;
        if (differenceSec < Globals.constants.Stand_OfferSec) return;

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
                var content = Translator.Translate("Vo vašej blízkosti sa nachádza stanovište")+" : "+StandNear + "<br/><button id=\"btnStand\"  data-route=\"stand\" style=\"background-color:black;\" class=\"textnoicon\">Stanovištia</button>";
                //app.showNew();
                app.showNewsComplete(Translator.Translate("Stanovište"), MediaInternal.getNewsSoundFile("StandAvailable"), "", 10000, content);
            }
        }
            //je na stanovisku, odosiel ? 
        else {
            if (Distanceminkm > Globals.constants.Stand_Distancekm)
            {
                //MHP - 19.3.2014 nemozeme to spravit, pretoze sa sem-tam strati GPS, vrati 0 a zrazu je sofer mimo stanovista 

                //console.log("Leave stand automat!!");
                //app.playSound(MediaInternal.getNewsSoundFile("StandLeave"));
                //Stand.LeaveStand();
            }
        }

    },

    succesLeaveStand : function ()
    {
        Globals.GLOB_GUID_Stand = "";
        Globals.GLOB_StandPosition = 0;
        Stand.setIconFree();
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


