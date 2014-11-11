//var g_OrdersCheckSum = '';
//var g_OrdersLastRefresh = null;

var OrdersView = function () {
    this.index = 1;
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(OrdersView.template());
        $("#taxiHeader").off(app.clickEvent, function () { app.refreshData(["orders", "transporters"]); });
        $("#taxiHeader").on(app.clickEvent, function () { app.refreshData(["orders", "transporters"]); });


        //if (app.isDevice) {
        //    $(window).unload(function () {
        //        app.log("powermanagement.release");
        //        try {
        //            cordova.require('cordova/plugin/powermanagement').release(
        //                    function () { app.info("powermanagement OK"); },
        //                    function () { app.info("powermanagement Error"); }
        //            );
        //        }
        //        catch (err) {
        //            app.info("powermanagement Error: " + err)
        //        }
        //    });
            
        //    try {
        //        app.log("powermanagement.acquire");
        //        cordova.require('cordova/plugin/powermanagement').acquire(
        //                       function () { app.info("powermanagement OK"); },
        //                       function () { app.info("powermanagement Error"); }
        //                       );
        //    }
        //    catch (err) {
        //        app.info("powermanagement Error: " + err)
        //    }
        //}
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        var self = this;
        $('#unbreakButton').hide();
        $('#unalarmButton').hide();

        if (!Service.transporter) {
            $('.orders-list').html("");
            app.waiting(false);
            return;
        }

        $('.orders-list').hide();
        app.waiting();
        app.setHeader();

        if (Service.transporter.inAlarm) {
            $('#unalarmButton').show();
            $('#menu').hide();
            app.waiting(false);
        }
        else  if (Service.transporter.Status == "Break") {
            $('#unbreakButton').show();
            $('#menu').hide();
            app.waiting(false);
        }
        else {
            //$('#divsubmenu').show();
            $('#menu').show();
            Service.getOrders(function (orders) {


                $.each(orders.Items, function () {
                    this.FormatedDate = Service.formatJsonDate(this.Date);
                    this.ShowCancelbtn = true;
                    if (this.Status == 'Cancel') {
                        this.StatusCancel = true;
                        this.ShowCancelbtn = false;
                    }
                    if (this.Status == 'Offered')
                        this.StatusOfferGUI = true;

                    if(this.Status=="Processing")
                        this.ShowCancelbtn = false;
                });



                $('.orders-list').html(OrdersView.liTemplate(orders.Items));
                if (self.iscroll)
                    self.iscroll.refresh();
                else
                    self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
                app.waiting(false);

                $(".up").off(app.clickEvent, function () { self.changeOfferComplex($(this).parent(), "Up"); });
                $(".up").on(app.clickEvent, function () { self.changeOfferComplex($(this).parent(), "Up"); });

                $(".cancel").off(app.clickEvent, function () { self.changeOfferComplex($(this).parent(), "Down"); });
                $(".cancel").on(app.clickEvent, function () { self.changeOfferComplex($(this).parent(), "Down"); });


                $(".confirmCancel").off(app.clickEvent, function () { self.changeOfferComplex($(this).parent(), "Down"); });
                $(".confirmCancel").on(app.clickEvent, function () { self.changeOfferComplex($(this).parent(), "Down"); });


                $(".content").off(app.clickEvent, function () { self.detail($(this).parent()); });
                $(".content").on(app.clickEvent, function () { self.detail($(this).parent()); });

                $('.orders-list').show();
            });
        }
    };
    this.detail = function (btn) {
        var self = this;
        Service.orders.Current = Service.findOrder(btn.attr("data_Id"));
        if (Service.orders.Current)
            app.route("detail");
    };


    ///musi nastavit platbu 
    this.MustSetPayment = function (currentOrder)
    {
        if (!currentOrder) return;
        var scriptText = "onclick = \"OrdersActions.setPaymentDialog('"+currentOrder.GUID+"')\"";
        //aka je vyska platby ? nastavime hodnotu
        var pToinput = 0;
        if (pToinput == 0)
        {
            var sp = Globals.GetSetItem("DefaultPaymentValue");
            if (sp && sp != "")
                pToinput = sp;
        }
        var content1 = "<input type=\"text\" placeholder=\"Payment\" name=\"PaymentTotal\" id=\"orderNewsDetailFormPaymentTotal\" value=\""+pToinput+"\"/><br/>";
        var content = Translator.Translate("Cena celkovo:") + content1 + "<br/><button id=\"btnsetPayment\" " + scriptText + "  style=\"background-color:black;\" class=\"textnoicon\">" + Translator.Translate("Zadať") + "</button>";
        app.showNewsComplete(Translator.Translate("Platba"), null, "", 100000, content);
        return;
    }


    this.beforechangeOffer = function (btn, action, currentOrder) {

        var iOK = true;

        //switch podla typov
        if (currentOrder && currentOrder.Status == "Processing") {
            //platba
            var mustset = Globals.GetSetItem("RequirePaymentScreen");
            if (mustset == 1 && !currentOrder.PaymentTotal || currentOrder.PaymentTotal == 0) {

                this.MustSetPayment(currentOrder);
                if (!currentOrder.PaymentTotal) iOK = false;
                if (currentOrder.PaymentTotal > 0) iOK = false;
            }
        }

        return iOK;
    }

    this.afterchangeOffer = function (btn, action, currentOrder) {

        var iOK = true;
        return iOK;
    }

    this.changeOfferComplex = function (btn, action) {

        var canContinue = true;
        var currentOrder = Service.orders.Current = Service.findOrder(btn.attr("data_Id"));

        //preprocess
        canContinue = this.beforechangeOffer(btn, action, currentOrder);

        //process
        //if (canContinue)
        //    canContinue = this.changeOffer(btn, action, currentOrder);
        this.changeOffer(btn, action, currentOrder);

        //posprocess
        if (canContinue)
            canContinue = this.afterchangeOffer(btn, action, currentOrder);
    }

    this.changeOffer = function (btn, action, currentOrder) {

        btn.removeClass().addClass("refWaiting");


        var settings = Service.getSettings(), self = this;
        var data = {
            Action: action,
            GUID_Transporter: settings.transporterId,
            Status_Transporter: settings.transporterState,
            GUID: btn.attr("data_GUID_Offer"),
            Status: btn.attr("data_StatusOffer"),
            GUID_TransporterOrder: btn.attr("data_Id"),
            Status_TransporterOrder: btn.attr("data_Status"),
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        };

        ////dame defaultny cas na vybavenie 
        //data.TimeToRealize = Globals.constants.OrderDetail_Defauls_timeToRealize;
        //if (currentOrder) //alebo ten, co uz mame !
        //    data.TimeToRealize = currentOrder.TimeToRealize;

        //data.TimeToRealizeFrom = Date.UTC;

        //notify
        NotificationLocal.Notify("changeOffer", data, null, null);
        NotificationLocal.Notify("changeOffer"+action, data, null, null);


        //pre ponuku sa povodne islo do detailu, ale to zmenime. 
        //if(action == "Up" && (data.Status == "New" || data.Status == "Offered"))
        //{
        //    Service.orders.Current = Service.findOrder(data.GUID_TransporterOrder);
        //    if (Service.orders.Current)
        //        app.route("detail");
        //    return;
        //}

        Service.callService("transporteroffer", data);
    };
    this.initialize();
}

var OrdersActions = {

    setPaymentDialog: function (GUID_TransporterOrder) {

        var currentOrder = Service.orders.Current = Service.findOrder(GUID_TransporterOrder);

        var orderDetailFormPaymentTotal = $("#orderNewsDetailFormPaymentTotal").val();
        //kontrola
        if (isNaN(orderDetailFormPaymentTotal)) {
            app.showAlert("Nesprávna cena", "Chyba");
            return;
        }

        app.hideNews();
        var data = {
            HistoryAction: "Payment",
            HistoryActionDescription: "Total",
            GUID_TransporterOrder: GUID_TransporterOrder,
            Payment: orderDetailFormPaymentTotal
        };

        Service.callService("TaxiSetPayment", data);
        if(currentOrder)
            currentOrder.PaymentTotal = orderDetailFormPaymentTotal;

    }


}

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());
OrdersView.unbreakTemplate = Handlebars.compile($("#orders-unbreak").html());