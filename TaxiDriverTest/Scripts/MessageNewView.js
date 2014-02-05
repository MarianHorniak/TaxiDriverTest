var MessageNewView = function (store) {
    this.index = 2;
    this.dataMessageTypes = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(MessageNewView.template());
        var self = this;
        //if (self.iscroll)
        //    self.iscroll.refresh();
        //else
        //    self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        $("#messagenewSave").click(function () { self.save(); });
        return this;
    };

    this.onShow = function () {
        this.showForm({});
    };

    this.loadData = function () {
        this.showForm({});
    };

    this.showForm = function (data) {
        var self = this;
        app.waiting();

        //for (var i = 0, l = dataMessageTypes.Items.length; i < l; i++) {
        //    var item = dataMessageTypes.Items[i];
        //    $("#messagetemplateIdID").append('<option value=' + item.GUID + '>' + item.Title + '<option>');
        //}


        $("#messagenewForm").html(MessageNewView.formTemplate(data));

        //bind data
        this.dataMessageTypes = Lists.getListItems("sysMessageTemplate");
        //$("#messagenewType").text = Globals.MessageType;
        //$("#messagenewTimeToLive").text = Globals.MessageTimeToLiveMin;

        app.waiting(false);
    };
    
    this.save = function () {
        var f = $("#messagenewForm");
        //f.hide();
        app.waiting();

        var self = this, d = f.serializeArray(), data = {};
        $.each(d, function (i, v) { data[v.name] = v.value; });

        var Text = data["Text"];
        var Typ = Globals.MessageType; //data["Typ"];
        var LifeTimeMinutes = Globals.MessageTimeToLiveMin; //data["LifeTimeMinutes"];

        //kontrola
        if(Text=="" || Text.length==0) app.home();

        var s = Service.getSettings();

        //call service with callback
        Service.sendNewMessage(Typ, Text, LifeTimeMinutes, false, false, Globals.RoleName, Globals.ReceiverRole, s.userId, null, PositionService.lat, PositionService.lng);

        //visible form
        //f.();

        //stop waiting
        app.waiting(false);

        //notify
        NotificationLocal.Notify("sendnewmessage", data, null, null);

    };
    this.clear = function () {
    };

    this.initialize();
}

MessageNewView.template = Handlebars.compile($("#messagenew-tpl").html());
MessageNewView.formTemplate = Handlebars.compile($("#messagenewForm-template").html());
