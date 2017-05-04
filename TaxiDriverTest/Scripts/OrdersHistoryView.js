var OrdersHistoryView = function() {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(OrdersHistoryView.template());
        var self = this;
        $("#historyBack").off(app.clickEvent);
        $("#historyBack").on(app.clickEvent, function () { app.home(); });

        $("#selectHistory").off("change");
        $("#selectHistory").on("change", function (e) { self.selectionChange(e); });

        Globals.HideHistory();

        self.iscroll = new IScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        $('.ordersHistory-list').hide();
        app.waiting();
        var self = this;
        //select !          
        $("#selectHistory").val("My24h");
        //default view 
        self.getViewCommon("view_orders_history24hme");
    };
        
    this.selectionChange = function (e)
    {
        var self = this;
        $('.ordersHistory-list').hide();
        

        app.waiting();

        var sel = $("#selectHistory").val();
        //view_orders_history1h||view_orders_history1monthme||view_orders_historyreservations
        switch (sel)
        {
            case "1h":
                self.getViewCommon("view_orders_history1h");
                //self.view1h(); //view_orders_history1h
                break;
            case "2h":
                self.getViewCommon("view_orders_history2h");
                //self.view2h();
                break;
            case "24h":
                self.getViewCommon("view_orders_history24h");
                //self.view24h();
                break;
            case "My24h":
                self.getViewCommon("view_orders_history24hme");
                //self.viewMy24h();
                break;
            case "My1Month":
                self.getViewCommonTab("view_orders_history1monthme");
                //self.viewMymonth();   //view_orders_history1monthme
                break;
            case "Reservations":
                self.getViewCommon("view_orders_historyreservations");
                //self.viewReservations(); //view_orders_historyreservations
                break;
            case "Disp24":
                self.getViewCommon("view_orders_disp24Hour");
                break;

            case "MySum24":
                self.getViewCommonTabSum("view_orders_MySum24");
                break;

            case "MySum16":
                self.getViewCommonTabSum("view_orders_MySum16");
                break;

            case "MySum12":
                self.getViewCommonTabSum("view_orders_MySum12");
                break;

            case "MySum8":
                self.getViewCommonTabSum("view_orders_MySum8");
                break;
        }

        app.waiting(false);

    }

    
    this.renderOrders = function(orders)
    {
        var i = 1;
        $('#ordersHistory-listnoData').html("");
        //mame nieco ? 
        if (orders && orders.Items && orders.Items.length>0) {
            $.each(orders.Items, function () {
                this.FormatedDate = Service.formatJsonDate(this.OrderToDate);
                this.SpecialConditionsRender = '';
                if (this.SpecialConditions) this.SpecialConditionsRender = this.SpecialConditions;
                this.Status = Service.setOrderDescription(this);
                this.isOddCSS = Tools.isOddCSS(i);
                this.iOrder = i++;
            });
        }
        else { //neme nic 
            $('#ordersHistory-listnoData').text(Translator.Translate("no data"));
        }

        $('.ordersHistory-list').html(OrdersHistoryView.liTemplate(orders.Items));
        
        app.waiting(false);
        $('.ordersHistory-list').show();
        
        this.iscroll.refresh();
    }

    this.renderTab = function (data) {
        var i = 1;
        console.log(data);
        $('#ordersHistory-listnoData').html("");
        if (data && data.Items && data.Items.length > 0) {
            $.each(data.Items, function () {
                this.FormatedDate = Service.formatJsonDate(this.OrderToDate);
                //fake guid :
                this.GUID = "aaa";
                this.Status = Service.setOrderDescription(this);
                this.isOddCSS = Tools.isOddCSS(i);
                this.iOrder = i++;
            });
        }
        else {
            $('#ordersHistory-listnoData').text(Translator.Translate("no data"));
        }

        app.waiting(false);
        $('.ordersHistory-list').html(OrdersHistoryView.liTemplateTab(data.Items));
        $('.ordersHistory-list').show();

        this.iscroll.refresh();
    }

    this.renderTabSum = function (data) {
        var i = 1;
        
        $('#ordersHistory-listnoData').html("");
        var pocet = 0;
        var suma = 0;
        if (data && data.Items && data.Items.length > 0) {
            $.each(data.Items, function () {
                this.FormatedDate = Service.formatJsonDate(this.OrderToDate);
                //fake guid :
                this.GUID = "aaa";
                this.Status = Service.setOrderDescription(this);
                this.StatusTranslation = Tools.addSpace(this.StatusTranslation, 15);
                this.isOddCSS = Tools.isOddCSS(i);
                this.iOrder = i++;
                this.isData = true;
                pocet = pocet + this.Pocet;
                suma = suma + this.Suma;
            });
        }
        else {
            $('#ordersHistory-listnoData').text(Translator.Translate("no data"));
        }

        //dplnit pocty 
        if (data) {
            data.CelkPocet = pocet;
            data.CelkSuma = suma;
            var newItem = { StatusTranslation: "CELKOVO", Suma: suma, Pocet: pocet, isData: false };
            data.Items.push(newItem);
        }

        console.log(data);

        app.waiting(false);
        $('.ordersHistory-list').html(OrdersHistoryView.liTemplateTabSum(data.Items));
        $('.ordersHistory-list').show();
        
        this.iscroll.refresh();
    }

    this.getViewCommon = function (viewName,e) {
        var self = this;
        Service.getHistoryOrders(viewName, function (orders) {
            self.renderOrders(orders);
        });
    }

    this.getViewCommonTab = function (viewName, e) {
        var self = this;
        Service.getHistoryOrders(viewName, function (orders) {
            self.renderTab(orders);
        });
    }


    this.getViewCommonTabSum = function (viewName, e) {
        var self = this;
        Service.getHistoryOrders(viewName, function (orders) {
            self.renderTabSum(orders);
        });
    }


    //this.view1h = function (e) {
    //    var self = this;
    //    Service.getHistoryOrders("view_orders_history1h", function (orders) {
    //        self.renderOrders(orders);
    //    });
    //}

    //this.view2h = function (e)
    //{
    //    var self = this;
    //    Service.getHistoryOrders("view_orders_history2h", function (orders) {
    //        self.renderOrders(orders);
    //    });
    //}

    //this.viewMy24h = function (e) {
    //    self = this;
    //    Service.getHistoryOrders("view_orders_history24hme", function (orders) {
    //        self.renderOrders(orders);
    //    });
    //}

    //this.viewMymonth = function (e) {
    //    self = this;
    //    Service.getHistoryOrders("view_orders_history1monthme", function (orders) {
    //        self.renderOrders(orders);
    //    });
    //}

    //this.viewReservations = function (e) {
    //    self = this;
    //    Service.getHistoryOrders("view_orders_historyreservations", function (orders) {
    //        self.renderOrders(orders);
    //    });
    //}
    
    //this.view24h = function (e) {
    //    self = this;
    //    Service.getHistoryOrders("view_orders_history24h", function (orders) {
    //        self.renderOrders(orders);
    //    });
    //}


    this.initialize();
}

OrdersHistoryView.template = Handlebars.compile($("#ordersHistory-tpl").html());
OrdersHistoryView.liTemplate = Handlebars.compile($("#ordersHistory-li-tpl").html());
OrdersHistoryView.liTemplateRaw = Handlebars.compile($("#ordersHistoryraw-li-tpl").html());
OrdersHistoryView.liTemplateTab = Handlebars.compile($("#ordersHistorytab-li-tpl").html());
OrdersHistoryView.liTemplateTabSum = Handlebars.compile($("#ordersHistorytabSum-li-tpl").html());

