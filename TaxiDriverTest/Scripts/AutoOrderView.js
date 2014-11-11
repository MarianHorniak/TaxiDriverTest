var AutoOrderView = function (store) {
    this.index = 2;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(AutoOrderView.template());
        var self = this;
        $("#autoorderSave").off(app.clickEvent, function () { self.save(); });
        $("#autoorderSave").on(app.clickEvent, function () { self.save(); });

        //$("#AutoOrderToReserved").off(app.change, function () { alert('jjj'); });
        //$("#AutoOrderToReserved").on(app.change, function () { alert('jjj'); });
        //$("#AutoOrderToReserved").change(function () { alert('jjj1'); });


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

        $("#autoorderForm").html(AutoOrderView.formTemplate(data));


        $("#AutoOrderToReserved").change(function () {
            self.FromAddress();
        });
        Map.geocode({ 'latLng': new google.maps.LatLng(PositionService.lat, PositionService.lng) }, function (a) {
            $("#AutoOrderTimeToRealize").val(Globals.constants.OrderDetail_Defauls_timeToRealize);
            $("#AutoOrderStartCity").val(a.City);
            $("#AutoOrderStartAddress").val(a.Address);
            $("#AutoOrderEndCity").val(a.City);
            $("#AutoOrderToReserved").val(false);
            $("#autoorderForm").show();
            app.waiting(false);
        });
    };
    
    this.save = function () {
        var f = $("#autoorderForm");
        f.hide();
        app.waiting();

        var self = this, d = f.serializeArray(), data = {};
        $.each(d, function (i, v) { data[v.name] = v.value; });

        var StartCity = data["StartCity"];
        var StartAddress = data["StartAddress"];
        var AutoOrderToReserved = $('#AutoOrderToReserved').prop('checked');// $("#AutoOrderToReserved").val(); //data["isReserved"];

        
        var EndCity = data["EndCity"];
        var EndAddress = data["EndAddress"];
        var TimeToRealize = data["TimeToRealize"];


        //call service with callback
        //alert('autoOrder2');
        Service.autoOrder2(StartCity, StartAddress, EndCity, EndAddress, TimeToRealize,AutoOrderToReserved, app.home());

        ////stop waiting
        //app.waiting(false);
        ////notify
        //NotificationLocal.Notify("autoOrder", data, null, null);
        ////return
        //app.home();
    };

    this.FromAddress = function () {
        var chk = $("#AutoOrderToReserved").prop('checked');

        if (chk == true) {
            $("#divStartAddress").show();
        }
        else {
            $("#divStartAddress").hide();
        }
    };


    this.clear = function () {
    };

    this.initialize();
}


AutoOrderView.template = Handlebars.compile($("#autoorder-tpl").html());
AutoOrderView.formTemplate = Handlebars.compile($("#autoorderForm-template").html());