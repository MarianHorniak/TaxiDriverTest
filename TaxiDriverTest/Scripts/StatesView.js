var StatesView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(StatesView.template());
        $("#statesSave").click(function () { self.save(); });

        self.iscroll = new IScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        return this;
    };

    this.onShow = function () {
        this.showForm({});
    };

    this.showForm = function (data) {
        var self = this;
        app.waiting(false);
        $("#statesForm").html(StatesView.formTemplate(data));

        if (data.TimeToFree)
            $("#TimeToFree").val(data.TimeToFree);
        if (data.HistoryAction)
            $("#HistoryAction").val(data.HistoryAction);

        $("#statesForm").show();

        self.iscroll.refresh();

        $("#HistoryAction").focus();
    };
            
    this.save = function () {
        var f = $("#statesForm");
        f.hide();
        app.waiting();
        var self = this, d = f.serializeArray(), data = {};
        //serializeObject
        $.each(d, function (i, v) { data[v.name] = v.value; });
        data["GUID_Transporter"] = Service.transporter.GUID;
        data["Latitude"] = PositionService.lat;
        data["Longitude"] = PositionService.lng;
        Service.callService("TransporterBreak", data,
            function () {
                //notify
                NotificationLocal.Notify("stateschange", data, null, null);
                app.home();
            },
            function (d) {
                data.ErrorMessage = d.ErrorMessage;
                self.showForm(data);
                app.waiting(false);
            });
    };
    this.clear = function () {

    };

    this.initialize();
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
StatesView.formTemplate = Handlebars.compile($("#statesForm-template").html());