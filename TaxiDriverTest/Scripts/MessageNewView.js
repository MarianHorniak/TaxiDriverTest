var MessageNewView = function (store) {
    this.index = 2;
    this.dataMessageTypes = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(MessageNewView.template());
        var self = this;
        $("#messagenewSave").off(app.clickEvent);
        $("#messagenewSave").on(app.clickEvent,function () { self.save(); });
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


        //soplnime options
        var cis = Lists.getListItems("sysMessageTemplate");
        console.log("load teplates for new message to dispetcher");
        console.log(cis);
        var el = $("#idselectNewMessToDisp");
        if (el) {
            el.empty(); //clear it !
            var option = document.createElement("option");
            option.text = "";
            option.value = "no";
            el.append(option);
            var myItems = cis.Items.sort();
            for (var i = 0; i < myItems.length; i++) {
                var option1 = document.createElement("option");
                option1.value = cis.Items[i].Title;
                option1.text = cis.Items[i].MessageText;
                el.append(option1);
            }

            Tools.sortSelect(el[0]);
        }


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

        //ak nie je text, moze byt z dropdownu
        if (Text == "" || Text.length == 0)
        {
            var el = $("#idselectNewMessToDisp");
            if (el && el.length > 0)
            {
                Text = el[0].options[el[0].selectedIndex].text;
            }
        }

        //kontrola
        if (Text == "" || Text.length == 0) {
            app.home();
            return;
        }


        console.log("text to send :" + Text);

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
