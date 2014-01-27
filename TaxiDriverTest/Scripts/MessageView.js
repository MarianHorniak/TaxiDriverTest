var MessageView = function (messages) {

    this.index = 3;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(MessageView.template(Service.messages));
        $("#taxiHeader").click(function () { app.refreshData(["messages"]); });
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };


    this.loadData = function () {
        var self = this;
        app.log("loading messages...")
        app.waiting();
        app.setHeader();

            $('#menu').show();
            Service.getMessages(function (messages) {
                $.each(messages.Items, function () {
                    this.FormatedDate = Service.formatJsonDate(this.Created);
                });
                Service.messagesVer = messages.DataCheckSum;
                Service.messages = messages;
                app.waiting(false);

            });

            this.render();
    };

    this.initialize();
}

MessageView.template = Handlebars.compile($("#message-tpl").html());