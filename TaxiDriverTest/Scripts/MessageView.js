var MessageView = function () {

    this.index = 3;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(MessageView.template());
        
        $("#messageHeader").off(app.clickEvent);
        $("#messageHeader").on(app.clickEvent, function () { self.loadData(); });

        $("#messDelete").off(app.clickEvent);
        $("#messDelete").on(app.clickEvent, function () { self.deleteAllMess(); });

        // $("#messNew").click(function () { self.sendNew(); });
        Globals.HasNewMessasges = false;

        self.iscroll = new IScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
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
        //Service.messages
        app.waiting(false);
        this.loadData();
    }


    this.renderItems = function () {
        var self = this;
        var data = null;
        if (Service.messages)
            if (Service.messages.Items) {
                data = Service.messages.Items;
                $("#messageList").html(MessageView.liTemplate(data));

                //original
                $(".cancel").off(app.clickEvent);
                $(".cancel").on(app.clickEvent, function () { self.delete1Mess($(this).parent()); });

                if (data)
                    $("#messNumber").text = " [" + data.length+"]";
            }
        this.iscroll.refresh();
        return this;
    };

    this.onShow = function () {
        this.loadData();
        LocalNotification.clear("messages");
    };

    this.loadData = function () {
        var self = this;
        var s = Service.getSettings();
        app.log("loading messages...")
        app.waiting();
        app.setHeader();

        //vymazeme new messages
        app.setStatusBarNoneMessage();
        this.iscroll.refresh();

            $('#menu').show();
            Service.getMessages(function (messages) {
                $.each(messages.Items, function () {
                    this.FormatedDate = Service.formatJsonDate(this.Created);
                    if (this.GUID_sysUser_Sender == s.userId)
                        this.FromMe = true;
                });
                //if (messages)
                //    Service.messagesVer = messages.DataCheckSum;
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