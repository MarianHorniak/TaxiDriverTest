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
                    if (this.Status == 'Cancel')
                        this.StatusCancel = true;
                    if (this.Status == 'Offered')
                        this.StatusOfferGUI = true;

                   
                });



                $('.orders-list').html(OrdersView.liTemplate(orders.Items));
                if (self.iscroll)
                    self.iscroll.refresh();
                else
                    self.iscroll = new iScroll($('.scroll', self.el)[0], { hScrollbar: false, vScrollbar: false });
                app.waiting(false);

                $(".up").off(app.clickEvent, function () { self.changeOffer($(this).parent(), "Up"); });
                $(".up").on(app.clickEvent, function () { self.changeOffer($(this).parent(), "Up"); });

                $(".cancel").off(app.clickEvent, function () { self.changeOffer($(this).parent(), "Down"); });
                $(".cancel").on(app.clickEvent, function () { self.changeOffer($(this).parent(), "Down"); });


                $(".confirmCancel").off(app.clickEvent, function () { self.changeOffer($(this).parent(), "Down"); });
                $(".confirmCancel").on(app.clickEvent, function () { self.changeOffer($(this).parent(), "Down"); });


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
    this.changeOffer = function (btn, action) {

        btn.removeClass().addClass("refWaiting");

        var currentOrder = Service.orders.Current = Service.findOrder(btn.attr("data_Id"));
        

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

OrdersView.template = Handlebars.compile($("#orders-tpl").html());
OrdersView.liTemplate = Handlebars.compile($("#orders-li-tpl").html());
OrdersView.unbreakTemplate = Handlebars.compile($("#orders-unbreak").html());