var AutoOrderToDispView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(AutoOrderToDispView.template());
        var self = this;
        $("#autoordertodispSave").off(app.clickEvent, function () { self.save(); });
        $("#autoordertodispSave").on(app.clickEvent, function () { self.save(); });
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
        $("#autoordertodispForm").html(AutoOrderToDispView.formTemplate(data));
        Map.geocode({ 'latLng': new google.maps.LatLng(PositionService.lat, PositionService.lng) }, function (a) {
            $("#AutoOrdertodispStartCity").val(a.City);
            $("#AutoOrdertodispStartAddress").val(a.Address);
            $("#autoordertodispForm").show();
            app.waiting(false);
        });
    };
    
    this.save = function () {
        var f = $("#autoordertodispForm");
        f.hide();
        app.waiting();

        var self = this, d = f.serializeArray(), data = {};
        $.each(d, function (i, v) { data[v.name] = v.value; });

        var StartCity = data["StartCity"];
        var StartAddress = data["StartAddress"];
        var StartName = data["StartName"];
        var StartPhone = data["StartPhone"];

        //call service
        Service.autoOrdertodisp(StartCity, StartAddress, StartName, StartPhone,app.home());


    };
    this.clear = function () {
    };

    this.initialize();
}

AutoOrderToDispView.template = Handlebars.compile($("#autoordertodisp-tpl").html());
AutoOrderToDispView.formTemplate = Handlebars.compile($("#autoordertodispForm-template").html());