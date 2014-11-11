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


        //scroll divu 
        //var el = $("#orderDetailTabs");
        //if (el.iscroll)
        //    el.iscroll.refresh();
        //else
        //    el.iscroll = new iScroll('orderDetailTabs', {
        //        scrollX: true
        //    });

        $("#orderTimeTab").off(app.clickEvent, function (e) { self.showTime(); });
        $("#orderTimeTab").on(app.clickEvent, function (e) { self.showTime(); });


        $("#orderDetailTab").off(app.clickEvent, function () { self.showDetail(); });
        $("#orderDetailTab").on(app.clickEvent, function () { self.showDetail(); });


        $("#orderPaymentTab").off(app.clickEvent, function () { self.showPayment(); });
        $("#orderPaymentTab").on(app.clickEvent, function () { self.showPayment(); });

        $("#orderMapTab").off(app.clickEvent, function (e) { self.showMap(); });
        $("#orderMapTab").on(app.clickEvent, function (e) { self.showMap(); });

        return this;
    };

    this.onShow = function () {
        this.loadData();
    };
   

    this.removeSelectedClass= function () {
    
        $("#orderMapTab").removeClass("selected");
        $("#orderTimeTab").removeClass("selected");
        $("#orderDetailTab").removeClass("selected");
        $("#orderPaymentTab").removeClass("selected");

        $("#orderDetailForm").hide();
        $("#orderDetailMap").hide();
        $("#orderDetailTime").hide();
        $("#orderDetailPayment").hide();

    };


    this.showTime = function () {
        var self = this;
        this.removeSelectedClass();
        $("#orderDetailTime").show();
        $("#orderTimeTab").addClass("selected");

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
    };

    this.showDetail = function () {
        var self = this;
        this.removeSelectedClass();
        $("#orderDetailForm").show();
        $("#orderDetailTab").addClass("selected");


        $("#btnorderDetailFormChangeEndAddress").off(app.clickEvent, function () { self.changeAddress(); });
        $("#btnorderDetailFormChangeEndAddress").on(app.clickEvent, function () { self.changeAddress(); });



        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
    };


    this.showPayment = function () {
        var self = this;
        this.removeSelectedClass();
        var f = $("#orderDetailPayment");
        f.show();
        $("#orderPaymentTab").addClass("selected");
       
        var btn = $("#btnorderDetailPaymentTotal");
        btn.off(app.clickEvent);
        btn.on(app.clickEvent, function () { self.setPayment(); });

        
        //aka je vyska platby ? nastavime hodnotu
        var pToinput = 0;
        if (this.order.PaymentTotal) pToinput = this.order.PaymentTotal;
        if (pToinput == 0)
        {
            var sp = Globals.GetSetItem("DefaultPaymentValue");
            if (sp && sp != "")
                pToinput = sp;
        }
        $("#orderDetailFormPaymentTotal").val(pToinput);
            

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
    };

    this.showMap = function () {
        this.removeSelectedClass();
        $("#orderDetailMap").show();
        $("#orderMapTab").addClass("selected");
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

        if (this.order.Status == "Offered") {
            $("#OrderTimeToRealize").val(Globals.constants.OrderDetail_Defauls_timeToRealize);

        }
        else
            $("#OrderTimeToRealize").val(this.order.TimeToRealize);

        if (this.order.Status == "Offered" || this.order.Status == "Reserved") {

            //buttony znemoznit
            $('#btnorderDetailPaymentTotal').hide();
            $('#btnorderDetailFormChangeEndAddress').hide();
            $("#orderDetailFormEndCity").prop('disabled', true);
            $("#orderDetailFormEndAddress").prop('disabled', true);
            $("#orderDetailFormPaymentTotal").prop('disabled', true);
        }
        else {
            $('#btnorderDetailPaymentTotal').show();
            $('#btnorderDetailFormChangeEndAddress').show();
            $("#orderDetailFormEndCity").prop('disabled', false);
            $("#orderDetailFormEndAddress").prop('disabled', false);
            $("#orderDetailFormPaymentTotal").prop('disabled', false);
        }

        app.radio($("#OrderTimeToRealizeRadio"), $("#OrderTimeToRealize"));

        if (this.order.Status == "New" || this.order.Status == "Offered")
            $("#orderDetailSave").show().text("Prijať objednávku");
        else
            $("#orderDetailSave").show().text("Zmeniť čas");

        //scroll left ?
        //var divScrolHor = $("#orderDetailTabs");
        //if (divScrolHor.iscroll)
        //    divScrolHor.iscroll.refresh();
        //else
        //    divScrolHor.iscroll = new iScroll( $(".scrollhoriz"), { hScrollbar: true, vScrollbar: true });
        //divScrolHor.off(onscroll);
        //divScrolHor.on(onscroll, function () { divScrolHor.scrollLeft(300); });


    };

    this.loadData = function () {
        this.order = Service.orders.Current;
        if (this.order) {
            //nastavime patbu na 0
            if (!this.order.PaymentTotal)
                this.order.PaymentTotal = 0;

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

    this.changeAddress = function () {

        app.waiting();
        var orderDetailFormEndCity = $("#orderDetailFormEndCity").val();
        var orderDetailFormEndAddress = $("#orderDetailFormEndAddress").val();

        var settings = Service.getSettings(), self = this;

        var data = {
            GUID_Transporter: settings.transporterId,
            GUID_TransporterOrder: this.order.GUID,
            Status_TransporterOrder: this.order.Status,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng,
            EndCity: orderDetailFormEndCity,
            EndAddress: orderDetailFormEndAddress
        };

        Service.callService("OrderChangeEndAddress", data, function () { app.home(); });
    };

    this.setPayment = function () {

        //hodnota platby
        var orderDetailFormPaymentTotal = $("#orderDetailFormPaymentTotal").val();
        //kontrola
        if (isNaN(orderDetailFormPaymentTotal)) {
            app.showAlert("Nesprávna cena", "Chyba");
            return;
        }

        this.order = Service.orders.Current;
        app.waiting();
        var settings = Service.getSettings(), self = this;
       // this.order.PaymentTotal = orderDetailFormPaymentTotal;
        var data = {
            HistoryAction: "Payment",
            HistoryActionDescription : "Total",
            GUID_TransporterOrder: this.order.GUID,
            Payment: orderDetailFormPaymentTotal
        };

       // alert(orderDetailFormPaymentTotal);

        Service.callService("TaxiSetPayment", data, function () { app.home(); });
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
OrderDetail.paymentTemplate = Handlebars.compile($("#orderDetailPayment-tpl").html());


