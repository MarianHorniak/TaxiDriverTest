var SettingsAllView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(SettingsAllView.template());
        //$("#settingsallForm").hide();
        //$("#settingsallSave").click(function () { if(!$(this).hasClass("transparent")) self.save(); });
        return this;
    };

    this.onShow = function () {
        this.loadForm();
    };

    this.save = function () {
        //$("#settingsallSave").addClass("transparent");
        $("#settingsallForm").hide();
        app.waiting();
        this.loadForm();
    };

    this.loadForm = function () {
        app.waiting();

        var self = this;
        var s = Service.getSettings();
        var data = new Array();
        
        //Media
        data[data.length] = { isHeader: "Y", Title: "Media" };

        data[data.length] = { Group: "Main", Title: "RefreshSec", value: "7" };
        data[data.length] = { Group: "Local", Title: "inRecall", value: Globals.GLOB_RecallMe.toString() };
        data[data.length] = { Group: "Local", Title: "GUID_Transporter", value: s.transporterId };
        data[data.length] = { Group: "Local", Title: "GUID_sysUser", value: s.userId };
        data[data.length] = { Group: "Stand", Title: "GLOB_GUID_Stand", value: Globals.GLOB_GUID_Stand };
        data[data.length] = { Group: "Stand", Title: "GLOB_StandPosition", value: Globals.GLOB_StandPosition };

        data[data.length] = { Group: "Position", Title: "Position_LatPrev", value: Globals.Position_LatPrev };
        data[data.length] = { Group: "Position", Title: "Position_LngPrev", value: Globals.Position_LngPrev };
        data[data.length] = { Group: "Position", Title: "Position_Lat", value: Globals.Position_Lat };
        data[data.length] = { Group: "Position", Title: "Position_Lng", value: Globals.Position_Lng };

        data[data.length] = { Group: "Locale", Title: "Language", value: Globals.language };

        data[data.length] = { isHeader: "Y", Title: "Log" };
        var logData = Diagnostic.getLog();
        if (logData)
        {
            for (var i = 0, l = logData.length; i < l; i++) {
                data[data.length] = { Group: "Log", Title: logData[i].Date, value: logData[i].Message };
            }
           }
        
        


        self.showForm(data);
    };


    this.showForm = function (data) {
        if (data) data.ErrorMessage = Service.connectionError;

        $("#settingsallForm").html(SettingsAllView.templateForm(data));


        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        

        $("#settingsallForm").show();
           // $("#settingsallSave").removeClass("transparent");
        app.waiting(false);
    };

    this.initialize();
}

SettingsAllView.template = Handlebars.compile($("#settingsall-tpl").html());
SettingsAllView.templateForm = Handlebars.compile($("#settingsallForm-tpl").html());