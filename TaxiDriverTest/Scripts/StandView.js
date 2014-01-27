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
            //console.log("header click");
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

        //uprava dat
        for (var i = 0; i < standresult.Items.length; i++) {
            standresult.Items[i].Status = "StandFree";
            standresult.Items[i].CanStand = true;
            standresult.Items[i].CanLeave = false;
            if (standresult.Items[i].StandPosition && standresult.Items[i].StandPosition > 0) Globals.GLOB_StandPosition = standresult.Items[i].StandPosition;
            if (standresult.Items[i].FreePlaces < 1) standresult.Items[i].Status = "StandNotFree";
            if (Globals.GLOB_GUID_Stand != "" || standresult.Items[i].FreePlaces < 1) standresult.Items[i].CanStand = false;
            if (Globals.GLOB_GUID_Stand == standresult.Items[i].GUID) standresult.Items[i].CanLeave = true;
            
        }
    }

    this.getData = function (e)
    {
        console.log("get data");
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
        });
        Globals.GLOB_GUID_Stand = standGUID;
        Globals.GLOB_StandPosition = 100;

    }

}

var Stand = {

    LeaveStand : function (callback)
    {
        app.log("Leave stand:" + Globals.GLOB_GUID_Stand);
        //app.showNews("Leave stand:" + Globals.GLOB_GUID_Stand);
        var s = Service.getSettings();
        Service.callService("TransporterLeaveStand", {
            GUID_Transporter: s.transporterId,
            GUID_Stand: Globals.GLOB_GUID_Stand,
            GUID_sysUser_Driver: null,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        });

        Globals.GLOB_GUID_Stand = "";
        Globals.GLOB_StandPosition = 0;

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


