var OrderDetail = function () {

    //var activeTabIndex = -1;
    //var tabNames = ["detail", "map"];

    this.index = 4;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(OrderDetail.template());
        DetailMap.initialize($("#orderDetailMap"));
        $("#orderDetailSave").off(app.clickEvent, function () { self.save(); });
        $("#orderDetailSave").on(app.clickEvent, function () { self.save(); });

        $("#orderDetailBack").off(app.clickEvent, function () { app.home(); });
        $("#orderDetailBack").on(app.clickEvent, function () { app.home(); });


        $("#orderCall").off(app.clickEvent,function () {
            Service.recallOrder(function () {
                self.setButtons();
            });
        });

        $("#orderCall").on(app.clickEvent, function () {
            Service.recallOrder(function () {
                self.setButtons();
            });
        });



        $("#orderTimeTab").off(app.clickEvent, function (e) { self.showTime(); });
        $("#orderTimeTab").on(app.clickEvent, function (e) { self.showTime(); });


        $("#orderDetailTab").off(app.clickEvent, function () { self.showDetail(); });
        $("#orderDetailTab").on(app.clickEvent, function () { self.showDetail(); });


        $("#orderMapTab").off(app.clickEvent, function (e) { self.showMap(); });
        $("#orderMapTab").on(app.clickEvent, function (e) { self.showMap(); });

        return this;
    };

    this.onShow = function () {
        this.loadData();
    };
   
    this.showTime = function () {
        $("#orderDetailTime").show();
        $("#orderDetailForm").hide();
        $("#orderDetailMap").hide();
        $("#orderDetailTab").removeClass("selected");
        $("#orderMapTab").removeClass("selected");
        $("#orderTimeTab").addClass("selected");

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
    };

    this.showDetail = function () {
        $("#orderDetailTime").hide();
        $("#orderDetailForm").show();
        $("#orderDetailMap").hide();
        $("#orderDetailTab").addClass("selected");
        $("#orderMapTab").removeClass("selected");
        $("#orderTimeTab").removeClass("selected");

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
    };

    this.showMap = function () {
        $("#orderDetailTime").hide();
        $("#orderDetailForm").hide();
        $("#orderDetailMap").show();
        $("#orderDetailTab").removeClass("selected");
        $("#orderMapTab").addClass("selected");
        $("#orderTimeTab").removeClass("selected");
        if (this.order && this.order.StartLatitude) {
            DetailMap.setMap(this.order.StartLatitude, this.order.StartLongitude, PositionService.lat, PositionService.lng);
        }
    };


    this.setButtons = function () {

        var self = this;
        
        if (this.order.Status != "Waiting")
            $("#orderCall").hide();
        else if (this.order.RecallNeed) 
            $("#orderCall").removeClass("ico_phone").addClass("ico_hangup").show();
        else
            $("#orderCall").removeClass("ico_hangup").addClass("ico_phone").show();

        if (this.order.Status == "Offered")
            $("#OrderTimeToRealize").val(Globals.constants.OrderDetail_Defauls_timeToRealize);
        else
            $("#OrderTimeToRealize").val(this.order.TimeToRealize);

        app.radio($("#OrderTimeToRealizeRadio"), $("#OrderTimeToRealize"));

        if (this.order.Status == "New" || this.order.Status == "Offered")
            $("#orderDetailSave").show().text("Prijať objednávku");
        else
            $("#orderDetailSave").show().text("Zmeniť čas");
    };

    this.loadData = function () {
        this.order = Service.orders.Current;
        if (this.order) {
            $("#orderDetailForm").html(OrderDetail.detailTemplate(this.order));
            this.setButtons();
            //if (this.order.StartLatitude) {
            //   // $("#orderDetailMap").height($(window).height() - $("#orderDetailForm").outerHeight() - 66);
            //    DetailMap.setMap(this.order.StartLatitude, this.order.StartLongitude, PositionService.lat, PositionService.lng);
            //}

            //zobrazit rozbaleny cas, ak sa jedna o ponuku
            if (this.order.Status == "Offered") {
                var el = $("#OrderTimeToRealize");
                if (el != null) {
                    //var length = $('#OrderTimeToRealize > option').length;
                    //el.attr('size', length);
                    //el.removeAttr('height'); 
                }
            }
        }
        this.showTime();
    };

    this.save = function () {

        //select
        var tr = parseInt($("#OrderTimeToRealize").val(), 10);

        //radio
        //var tr = $('input[name=TimeToRealizeMin]:checked', '#orderDetailForm').val()
        if (isNaN(tr))
        {
            app.showAlert("Vyberte čas", "Chyba");
            return;
        }

        var settings = Service.getSettings(), self = this;

        app.waiting();
        
        var data = {
            Action: "Up",
            GUID_Transporter: settings.transporterId,
            Status_Transporter: settings.transporterState,
            GUID: this.order.GUID_Offer,
            Status: this.order.StatusOffer,
            GUID_TransporterOrder: this.order.GUID,
            Status_TransporterOrder: this.order.Status,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng,
            TimeToRealize: tr
        };

        if (this.order && (this.order.Status == "New" || this.order.Status == "Offered")) {
            //Up
            Service.callService("transporteroffer", data, function () { app.home(); });
        }
        else {
            Service.callService("OrderTimeToRealize", data, function () { app.home(); });
        }
    };

    this.initialize();
}

OrderDetail.template = Handlebars.compile($("#orderDetail-tpl").html());
OrderDetail.detailTemplate = Handlebars.compile($("#orderDetailForm-tpl").html());