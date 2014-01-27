var SettingsView = function (messages) {
    this.index = 5;
    this.saveButton = null;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(SettingsView.template());
        $("#settingsSave").click(function () { if (!$(this).hasClass("transparent")) self.save(); });
        $("#appExit").click(function () { app.end(function () { self.loadForm(); }); })
        return this;
    };

    this.onShow = function () {
        $("#settingsForm").hide();
        this.loadForm();
    };
    this.save = function () {
        $("#settingsSave").addClass("transparent");
        $("#settingsForm").hide();
        app.waiting();

        var self = this, d = $("#settingsForm-form").serializeArray(), data = {};
        //serializeObject
        $.each(d, function (i, v) { data[v.name] = v.value; });
        
        Service.saveSettings(data);

        Service.login(function () {
            if (Service.isComplet()) 
               app.home();
            else
                self.loadForm();
        });
    };
    this.loadForm = function () {
        app.waiting();
        var self =this, data = Service.getSettings();
        if (Service.isAuthenticated) 
            Service.getTransporters(function (d) {
                data.transportes = d.Items;
                self.showForm(data);
            });
        else self.showForm(data);
    };
    this.showForm = function (data) {
            data.ErrorMessage = Service.connectionError;
            app.waiting(false);
            $("#settingsForm").html(SettingsView.templateForm(data));

            if(Service.isComplet())
                $("#settingsOrders").removeClass("transparent");
            else
                $("#settingsOrders").addClass("transparent");

            $("#settingsForm").show();
            $("#settingsSave").removeClass("transparent");
    };

    this.initialize();
}

SettingsView.template = Handlebars.compile($("#settings-tpl").html());
SettingsView.templateForm = Handlebars.compile($("#settingsForm-tpl").html());