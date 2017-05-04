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

        $("#orderDetailSave").off(app.clickEvent);
        $("#orderDetailSave").on(app.clickEvent, function () { self.save(); });

        $("#orderDetailBack").off(app.clickEvent);
        $("#orderDetailBack").on(app.clickEvent, app.home);

        $("#orderCall").off(app.clickEvent);
        $("#orderCall").on(app.clickEvent, function () { self.recallOrder(); });

        $("#orderTimeTab").off(app.clickEvent);
        $("#orderTimeTab").on(app.clickEvent, function () { self.showTime(); });


        $("#orderDetailTab").off(app.clickEvent);
        $("#orderDetailTab").on(app.clickEvent, function () { self.showDetail(); });


        $("#orderPaymentTab").off(app.clickEvent);
        $("#orderPaymentTab").on(app.clickEvent, function () { self.showPayment(); });

        //orderMessagesTab
        $("#orderMessagesTab").off(app.clickEvent);
        $("#orderMessagesTab").on(app.clickEvent, function () { self.showMessages(); });

        $("#orderMapTab").off(app.clickEvent);
        $("#orderMapTab").on(app.clickEvent, function () { self.showMap(); });

        $("#btnorderDetailPaymentTotal").off(app.clickEvent);
        $("#btnorderDetailPaymentTotal").on(app.clickEvent, function () { self.setPayment(); });

        $("#btnorderDetailMessageNew").off(app.clickEvent);
        $("#btnorderDetailMessageNew").on(app.clickEvent, function () { self.setMessage(); });

        self.iscroll = new IScroll($('#orderDetailContent', self.el)[0], { hScrollbar: false, vScrollbar: false });

        return this;
    };

    this.onShow = function () {
        this.loadData();
    };
   
    this.recallOrder = function () {
        var self = this;
        Service.recallOrder(function () {
            self.setButtons();
        });
    };
    
    this.removeSelectedClass= function () {
    
        $("#orderMapTab").removeClass("selected");
        $("#orderTimeTab").removeClass("selected");
        $("#orderDetailTab").removeClass("selected");
        $("#orderPaymentTab").removeClass("selected");
        $("#orderMessagesTab").removeClass("selected");

        $("#orderDetailForm").hide();
        $("#orderDetailMap").hide();
        $("#orderDetailTime").hide();
        $("#orderDetailPayment").hide();
        $("#orderDetailMessages").hide();
    };

    this.showTime = function () {
        var self = this;
        this.removeSelectedClass();
        $("#orderDetailTime").show();
        $("#orderTimeTab").addClass("selected");

        this.iscroll.refresh();
    };

    this.showDetail = function () {
        var self = this;
        this.removeSelectedClass();
        $("#orderDetailForm").show();
        $("#orderDetailTab").addClass("selected");

        this.iscroll.refresh();
    };

    this.showPayment = function () {
        var self = this;
        this.removeSelectedClass();
        var f = $("#orderDetailPayment");
        f.show();
        $("#orderPaymentTab").addClass("selected");
        
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
            
        self.iscroll.refresh();
    };

    this.showMessages = function () {
        var self = this;
        this.removeSelectedClass();
        var f = $("#orderDetailMessages");
        f.show();

        $("#orderMessagesTab").addClass("selected");

        //soplnime options
        var cis = Lists.getListItems("sysMessageTemplate");
        console.log(cis);
        var el = $("#selectMessageType");
        if (el)
        {
            el.empty(); //clear it !
            var option = document.createElement("option");
            option.text = "";
            option.value = "no";
            el.append(option);
            var myItems = cis.Items.sort();
            for (var i = 0; i < myItems.length; i++)
            {
                var option1 = document.createElement("option");
                option1.value = cis.Items[i].Title;
                option1.text = cis.Items[i].MessageText;
                el.append(option1);
            }
            Tools.sortSelect(el[0]);
        }

        self.iscroll.refresh();
        
        this.fillMessages();
    };

    this.fillMessages = function () {
        var self = this;
        var masterdiv = $("#orderDetailMessagesList");
        masterdiv.empty();
        //tereaz nacitame spravy : komunikaciu
        Service.getMessagesToOrder(Service.orders.Current.GUID,
            function (messages) {
                if (messages && masterdiv) {
                    console.log(messages);
                    masterdiv.empty();
                    for (var i = 0; i < messages.Items.length; i++) {
                        //SenderRole, ActiveFrom
                        if (messages.Items[i].SenderRole == "TaxiCustomer") //toto je nasa mesage
                            masterdiv.append("<div class='content' style='background-color:black'>" + messages.Items[i].MessageText + " </div>");
                        else
                            masterdiv.append("<div class='content' style='padding-left:50px;'>" + messages.Items[i].MessageText + " </div>");
                    }
                }
                self.iscroll.refresh();
            });
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

        if (this.order.Status == "Offered")
            $("#OrderTimeToRealize").val(Globals.constants.OrderDetail_Defauls_timeToRealize);
        else
            $("#OrderTimeToRealize").val(this.order.TimeToRealize);

        if (this.order.Status == "Offered" || this.order.Status == "Reserved") {
            //buttony znemoznit
            $('#btnorderDetailPaymentTotal').hide();
            $('#btnorderDetailFormChangeEndAddress').hide();
            $('#orderPaymentTab').hide();
            $('#orderMessagesTab').hide();
            $("#orderDetailFormEndCity").prop('disabled', true);
            $("#orderDetailFormEndAddress").prop('disabled', true);
            $("#orderDetailFormPaymentTotal").prop('disabled', true);
        }
        else {
            $('#btnorderDetailPaymentTotal').show();
            $('#btnorderDetailFormChangeEndAddress').show();
            $('#orderPaymentTab').show();
            if(Globals.GetSetItem("EnableOrderDriverChat")=="1")
                $('#orderMessagesTab').show();
            $("#orderDetailFormEndCity").prop('disabled', false);
            $("#orderDetailFormEndAddress").prop('disabled', false);
            $("#orderDetailFormPaymentTotal").prop('disabled', false);
        }

        //specialita pre reserved
        if (this.order.Status == "Reserved") {
            if (Globals.GetSetItem("EnableOrderDriverChat") == "1")
                $('#orderMessagesTab').show();
        }

        app.radio($("#OrderTimeToRealizeRadio"), $("#OrderTimeToRealize"));

        if (this.order.Status == "New" || this.order.Status == "Offered")
            $("#orderDetailSave").show().text("Prijať objednávku");
        else
            $("#orderDetailSave").show().text("Zmeniť čas");
    };

    this.loadData = function () {
        this.order = Service.orders.Current;
        var self = this;
        if (this.order) {
            //nastavime patbu na 0
            if (!this.order.PaymentTotal)
                this.order.PaymentTotal = 0;

            //nastavime premenne
            this.order.ShowOrderCustomerPhone = Globals.constants.ShowOrderCustomerPhone;
            this.order.ShowOrderEndAddress = Globals.constants.ShowOrderEndAddress;

            $("#orderDetailForm").html(OrderDetail.detailTemplate(this.order));

            $("#btnorderDetailFormChangeEndAddress").off(app.clickEvent);
            $("#btnorderDetailFormChangeEndAddress").on(app.clickEvent, function () { self.changeAddress(); });

            $("#orderDetailNavigteStart").off(app.clickEvent);
            $("#orderDetailNavigteStart").on(app.clickEvent, function () { Navigator.navigateStart(self.order); });

            $("#orderDetailNavigteEnd").off(app.clickEvent);
            $("#orderDetailNavigteEnd").on(app.clickEvent, function () { Navigator.navigateEnd(self.order); });

            $("#btnorderDetailFormGiveBack").off(app.clickEvent);
            $("#btnorderDetailFormGiveBack").on(app.clickEvent, function () { self.giveBack(); });

            $("#btnorderDetailFormGiveBack").off(app.clickEvent);
            $("#btnorderDetailFormGiveBack").on(app.clickEvent, function () { self.giveBack(); });


            $("#detailCustomerPhone").off(app.clickEvent);
            $("#detailCustomerPhone").on(app.clickEvent, function () { Tools.placeCall(self.order.CustomerPhone); });

            this.setButtons();
            
            

            //zobrazit rozbaleny cas, ak sa jedna o ponuku
            //if (this.order.Status == "Offered") {
            //    var el = $("#OrderTimeToRealize");
            //    if (el != null) {
            //        //var length = $('#OrderTimeToRealize > option').length;
            //        //el.attr('size', length);
            //        //el.removeAttr('height'); 
            //    }
            //}
        }
        this.showTime();
    };

    this.giveBack = function () {

        app.waiting();

        var settings = Service.getSettings(), self = this;

        var data = {
            GUID_Transporter: settings.transporterId,
            GUID_TransporterOrder: this.order.GUID,
            Status_TransporterOrder: this.order.Status,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        };
        //Service.callService("orderBack", data, function () { app.home(); });
        Service.callService("TransporterOrderGiveBack", data, function () { app.home(); });
        
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

    this.setMessage = function () {

        var self = this;

        //hodnota platby
        var messtext = $("#txtOrderMessageText").val();
        if (!messtext || messtext == "")
        {
            messtext = $("#selectMessageType option:selected").text();
            if (messtext == "no") messtext = "";
        }

        if (!messtext || messtext == "") {

            app.showAlert("Zadajte text správy", "Chyba");
            return;
        }

        console.log("Send message: " + messtext);

        //alert("Send message: " + messtext);
        
        //posleme



        app.waiting(true);
        this.order = Service.orders.Current;
        var s = Service.getSettings();
        console.log(s);
        Service.sendNewMessage("Info", messtext, 5000, false, false, Globals.RoleName, "TaxiCustomer", s.userId, this.order.GUID, PositionService.lat, PositionService.lng,
            function ()
            {
                //vymazeme 
                $("#txtOrderMessageText").val("");
                //nastavime selected na "no"
                $("#selectMessageType").val("no");
                //spat refresh messages
                console.log('message send OK');
                self.fillMessages();
                app.waiting(false);

            }, function () { app.waiting(false); })
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


