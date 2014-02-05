﻿var OrdersHistoryView = function() {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(OrdersHistoryView.template());
        var self = this;
        $("#historyBack").click(function () { app.home(); });
        $("#selectHistory").on("change", function (e) { self.selectionChange(e); });
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        $('.ordersHistory-list').hide();
        app.waiting();
        //select !          
        $("#selectHistory").val("2h");
        //default view 
        this.view2h();
    };
        
    this.selectionChange = function (e)
    {
        var self = this;
        $('.ordersHistory-list').hide();
        

        app.waiting();

        var sel = $("#selectHistory").val();
        switch (sel)
        {
            case "2h":
                self.view2h();
                break;
            case "24h":
                self.view24h();
                break;
            case "My24h":
                self.viewMy24h();
                break;
            case "Test":
                self.viewtest();
                break;
            case "MyTodayTab":
                self.view_orders_historyTodaymeStat();
                break;
            case "MyYestTab":
                self.view_orders_historyYestmeStat();
                break;
        }

        app.waiting(false);

    }

    
    this.renderOrders = function(orders)
    {
        var i = 1;
        $.each(orders.Items, function () {
            this.FormatedDate = Service.formatJsonDate(this.OrderToDate);
            this.Status = Service.setOrderDescription(this);
            this.iOrder = i++;
        });

        $('.ordersHistory-list').html(OrdersHistoryView.liTemplate(orders.Items));
        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        app.waiting(false);
        $('.ordersHistory-list').show();
        
    }

    this.renderTab = function (data) {
        var i = 1;

        $.each(data.Items, function () {
            this.FormatedDate = Service.formatJsonDate(this.OrderToDate);
            this.Status = Service.setOrderDescription(this);
            this.iOrder = i++;
        });

        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        app.waiting(false);
        $('.ordersHistory-list').html(OrdersHistoryView.liTemplateTab(data.Items));
        $('.ordersHistory-list').show();

    }


    this.view_orders_historyTodaymeStat = function (e) {

        self = this;
        Service.getHistoryOrders("view_orders_historyTodaymeStat", function (data) {
            self.renderTab(data);
        });
    }

    this.view_orders_historyYestmeStat = function (e) {

        self = this;
        Service.getHistoryOrders("view_orders_historyYestmeStat", function (data) {
            self.renderTab(data);
        });
    }

    this.viewtest = function (e) {

        var testdata = new Array;
        testdata[0] = { freetext: "aaa1", GUID: "1" };
        testdata[1] = { freetext: "aaa2", GUID: "2" };
        $('.ordersHistory-list').html(OrdersHistoryView.liTemplateRaw(testdata));
        $('.ordersHistory-list').show();
    }

    this.view2h = function (e)
    {
        var self = this;
        Service.getHistoryOrders("view_orders_history2h", function (orders) {
            self.renderOrders(orders);
        });
    }

    this.viewMy24h = function (e) {
        self = this;
        Service.getHistoryOrders("view_orders_history24hme", function (orders) {
            self.renderOrders(orders);
        });
    }
    
    this.view24h = function (e) {
        self = this;
        Service.getHistoryOrders("view_orders_history24h", function (orders) {
            self.renderOrders(orders);
        });
    }


    this.initialize();
}

OrdersHistoryView.template = Handlebars.compile($("#ordersHistory-tpl").html());
OrdersHistoryView.liTemplate = Handlebars.compile($("#ordersHistory-li-tpl").html());
OrdersHistoryView.liTemplateRaw = Handlebars.compile($("#ordersHistoryraw-li-tpl").html());
OrdersHistoryView.liTemplateTab = Handlebars.compile($("#ordersHistorytab-li-tpl").html());
