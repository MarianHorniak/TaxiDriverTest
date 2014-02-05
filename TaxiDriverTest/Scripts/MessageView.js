var MessageView = function () {

    this.index = 3;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(MessageView.template());
        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
        $("#messageHeader").click(function () { self.loadData(); });
        $("#messDelete").click(function () { self.deleteAllMess(); });
        // $("#messNew").click(function () { self.sendNew(); });
        Globals.HasNewMessasges = false;
    };

    this.deleteAllMess= function ()
    {
        alert("moment, na funkcii deleteAllMess() sa pracuje...");
    }

    this.delete1Mess = function(item)
    {
        var guid = item.attr("id");
        app.waiting();
        Service.deleteMessage(guid);
        app.waiting(false);
    }


    this.renderItems = function () {
        var self = this;
        var data = null;
        if (Service.messages)
            if (Service.messages.Items) {
                data = Service.messages.Items;
                $("#messageList").html(MessageView.liTemplate(data));

                //original
                $(".cancel").click(function () { self.delete1Mess($(this).parent()); });
                //$(".cancel").click(function () { self.delete1Mess(this); });


                //zo servra stands
                //.dblclick(function (item) { return function (ev) { self.removeCarfromStand(item.GUID, item.GUID_Transporter, item.StandTitle, item.TaxiTitle); } } (item));

                //skuska
                //for (var i = 0, l = data.length; i < l; i++) {
                //    var item = data[i];
                //    $(".cancel").click(function (item) { return function (ev) { self.delete1Mess(item); } } (item));
                //}

                if (data)
                    $("#messNumber").text = " [" + data.length+"]";
            }
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };




    this.loadData = function () {
        var self = this;
        var s = Service.getSettings();
        app.log("loading messages...")
        app.waiting();
        app.setHeader();

            $('#menu').show();
            Service.getMessages(function (messages) {
                $.each(messages.Items, function () {
                    this.FormatedDate = Service.formatJsonDate(this.Created);
                    if (this.GUID_sysUser_Sender == s.userId)
                        this.FromMe = true;
                });
                if (messages)
                    Service.messagesVer = messages.DataCheckSum;
                Service.messages = messages;
                app.waiting(false);
                if (messages && messages.Items)
                    console.log("loaded messages: " + messages.Items.length);
                else
                    console.log("loaded messages: no messages ");
                self.renderItems();

            });
    };

    this.initialize();
}

MessageView.template = Handlebars.compile($("#message-tpl").html());
MessageView.liTemplate = Handlebars.compile($("#message-li-tpl").html());