var SettingsAllView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(SettingsAllView.template());
        self.iscroll = new IScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
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
        
        //Device navigator
        data[data.length] = { isHeader: "Y", Title: "Device" };
        data[data.length] = { Group: "Device", Title: "userAgent", value: navigator.userAgent };
        data[data.length] = { Group: "Device", Title: "platform", value: navigator.platform };

        //Media
        data[data.length] = { isHeader: "Y", Title: "Media" };
        data[data.length] = { Group: "Media", Title: "Volume", value: Globals.Media_Volume };
        data[data.length] = { Group: "Media", Title: "Speak", value: false };

        data[data.length] = { isHeader: "Y", Title: "Main" };
        data[data.length] = { Group: "Main", Title: "RefreshSec", value: "7" };

        data[data.length] = { isHeader: "Y", Title: "Local" };
        data[data.length] = { Group: "Local", Title: "inRecall", value: Globals.GLOB_RecallMe.toString() };
        data[data.length] = { Group: "Local", Title: "GUID_Transporter", value: s.transporterId };
        data[data.length] = { Group: "Local", Title: "GUID_sysUser", value: s.userId };

        data[data.length] = { isHeader: "Y", Title: "Stand" };
        data[data.length] = { Group: "Stand", Title: "GLOB_GUID_Stand", value: Globals.GLOB_GUID_Stand };
        data[data.length] = { Group: "Stand", Title: "GLOB_StandPosition", value: Globals.GLOB_StandPosition };

        data[data.length] = { isHeader: "Y", Title: "Position" };
        data[data.length] = { Group: "Position", Title: "Position_LatPrev", value: Globals.Position_LatPrev };
        data[data.length] = { Group: "Position", Title: "Position_LngPrev", value: Globals.Position_LngPrev };
        data[data.length] = { Group: "Position", Title: "Position_Lat", value: Globals.Position_Lat };
        data[data.length] = { Group: "Position", Title: "Position_Lng", value: Globals.Position_Lng };
        data[data.length] = { Group: "Position", Title: "Current Address", value: "" };

        data[data.length] = { isHeader: "Y", Title: "Locale" };
        data[data.length] = { Group: "Locale", Title: "Language", value: Globals.language };


        //other 
        data[data.length] = { isHeader: "Y", Title: "Other" };
        if (Globals.items) {
            for (var i = 0, l = Globals.items.length; i < l; i++) {
                data[data.length] = { Group: "Other", Title: Globals.items[i].Title, value: Globals.items[i].SettingValue };
            }
        }


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
        $("#settingsallForm").show();
           // $("#settingsallSave").removeClass("transparent");
        app.waiting(false);
        this.iscroll.refresh();
    };

    this.initialize();
}

SettingsAllView.template = Handlebars.compile($("#settingsall-tpl").html());
SettingsAllView.templateForm = Handlebars.compile($("#settingsallForm-tpl").html());