﻿var Service = {
    online: false,
    ordersVer: undefined,
    ordersMinuteRefresh: Date.now(),
    ordersReservationVer: undefined,
    messagesVer: undefined,
    ordersmessagesVer: undefined,
    transporterVer: "",
    transporter: null,
    orders: null,
    messages : null,
    isSendloginHistory: false,
    isAuthenticated: false,
    isComplet: function () {
        return this.isAuthenticated
            && this._settings
            && this._settings.transporterId;
    },
    isChanged: function (data) {
        var s = this.getSettings();
        return this.isAuthenticated != data.isAuthenticated
        || this._settings.transporterId != data.TransporterId
        || this._settings.name != data.name
        || this._settings.url != data.url;
    },
    connectionError: undefined,
    _settings: {
        name: undefined,
        password: undefined,
        userId: undefined,
        transporterId: undefined,
        transporterSPZ: undefined,
        url: undefined,
        GUID_sysCompany:undefined,
        sessionId: undefined,
        enableHighAccuracy: true
    },
    initialize: function (callback) {
        app.log("Service.initialize");
        //Cross domain !!!
        $.support.cors = true;
        $.ajaxSetup({
            cache: false,
            timeout: 30000,
            error: function (jqXHR, textStatus, errorThrown) {
                switch (jqXHR.status) {
                    case 403: Service.connectionError = "Chybné prihlásenie"; break;
                    default: Service.connectionError = "Služba sa nenašla (" + jqXHR.status + "):" + this.url; break;
                }
            }
        });
        
        //disable vyber auta pre permanent driver: 
        $("#transporterId").prop("disabled", true); 

        this.login(callback);
        //initialize lists
    },
    login: function (callback) {
        app.log("Service.login");
        this.getSettings();
        Service.isAuthenticated = false;
        if (this._settings.url && this._settings.name && this._settings.password)
            this.callService("login", { UserName: this._settings.name, Password: this._settings.password, RememberMe: true, TransporterId: this._settings.transporterId }, function (d) {
                Service.isAuthenticated = true;
                var s = Service.getSettings();
                s.userId = d.userId;
                s.sessionId = d.sessionId;
                s.bool_DriverPermanent = false;
                //permamnet driver ! 
                if (d.ItemsDictKeys!=null)
                {
                    //GUID_sysCompany 
                    var posGUID_sysCompany = d.ItemsDictKeys.indexOf("GUID_sysCompany");
                    if (posGUID_sysCompany > -1)
                    {
                        var GUID_sysCompany = d.ItemsDictValues[posGUID_sysCompany];
                        if (GUID_sysCompany) s.GUID_sysCompany = GUID_sysCompany;
                    }

                    var pos = d.ItemsDictKeys.indexOf("bool_DriverPermanent");
                    if(pos>-1)
                    {
                        var ispermanent = d.ItemsDictValues[pos];
                        if (ispermanent == true)
                        {
                            pos = d.ItemsDictKeys.indexOf("GUID_Transporter");
                            if (pos > -1)
                            {
                                var guid_transp = d.ItemsDictValues[pos];
                                if (guid_transp) {
                                    s.transporterId = guid_transp;
                                    s.bool_DriverPermanent = true;
                                }
                            }
                        }
                    }
                }


                Service.saveSettings(s);
                if (Service.isComplet()) {
                    Lists.listInitialize();
                    Globals.initialize();
                    PositionService.startPool();
                    Service.loginHistory();
                    app.refreshTransporter(callback);
                }
                else {
                    if (Service.isAuthenticated && s.transporterId==null)
                    {
                        $("#transporterId").prop("disabled", false);
                    }
                    if (callback) callback();
                }

            }, function (d) {

                if (d.ErrorMessage)
                    Service.connectionError = d.ErrorMessage;
                else
                    Service.connectionError = "Chybné prihlásenie";
                Service.isAuthenticated = false;
                if (callback)
                    callback();
            });
        else
            app.settings();
    },
    loginHistory: function (callback) {
        if (!Service.isSendloginHistory) {
            var s = Service.getSettings();
            Service.callService("TaxiSetHistory", {
                GUID_Transporter: s.transporterId,
                GUID_sysUser_Driver: s.userId,
                HistoryAction: "Driver login",
                Latitude: PositionService.lat,
                Longitude: PositionService.lng
            },
            function () {
                Service.isSendloginHistory = true;
                //Notification.initialize();
                if (callback) callback();
            },
            function () { if (callback) callback(); });
        }
    },
    logout: function (callback) {
        if (Service.isAuthenticated) {
            PositionService.stopPool();
            Service.isAuthenticated = false;
            var s = Service.getSettings();
            //notify local 
            NotificationLocal.Notify("logout",s, null, null);
            Service.callService("TaxiSetHistory", {
                GUID_Transporter: s.transporterId,
                GUID_sysUser_Driver: null,
                HistoryAction: "Driver logout",
                Latitude: PositionService.lat,
                Longitude: PositionService.lng
            },
                function () {
                    Service.isSendloginHistory = false;
                    if (callback) callback();
                },
                function () { if (callback) callback(); });
        }
        else
            if (callback) callback();
    },
    findOrder: function (id) {
        if (this.orders && this.orders.Items) {
            var r = $.grep(this.orders.Items, function (o) { return o.GUID == id; });
            if (r.length > 0)
                return r[0];
        }
        return undefined;
    },
    autoOrder: function () {
        app.showConfirm("Prijať objednávku?", "Objednávka", function () {

            var s = Service.getSettings();

            //notify
            NotificationLocal.Notify("autoOrder", s, null, null);

            Service.callService("MobileAutoOrder", { GUID_Transporter: s.transporterId, OrderSource: "Auto", OrderSourceDescription: "autoOrder", Latitude: PositionService.lat, Longitude: PositionService.lng }, function () { app.home(true); }, function () { app.home(true); });
        });
    },
    autoOrder2: function (StartCity, StartAddress, EndCity, EndAddress, TimeToRealize, AutoOrderToReserved, callback) {
            var s = Service.getSettings();
            //notify
            NotificationLocal.Notify("autoOrder", s, null, null);
            Service.callService("MobileAutoOrder", { GUID_Transporter: s.transporterId, OrderSource: "Auto", OrderSourceDescription: "autoOrder", Latitude: PositionService.lat, Longitude: PositionService.lng, EndCity: EndCity, EndAddress: EndAddress, StartCity:StartCity, StartAddress:StartAddress, AutoOrderToReserved:AutoOrderToReserved,  TimeToRealize: TimeToRealize }, function () { app.home(true); }, function () { app.home(true); });
            //if (callback)
            //    callback();
    },
    autoOrdertodisp: function (StartCity, StartAddress, CustomerName, CustomerPhone, callback) {
        var s = Service.getSettings();
        //notify
        NotificationLocal.Notify("autoOrdertodisp", s, null, null);
        Service.callService("MobileAutoOrderToDisp", { GUID_Transporter: s.transporterId, OrderSource: "AutoDisp", OrderSourceDescription: "autoOrdertoDisp", Latitude: PositionService.lat, Longitude: PositionService.lng, StartCity: StartCity, StartAddress: StartAddress,  CustomerName: CustomerName, CustomerPhone:CustomerPhone }, function () { app.home(true); }, function () { app.home(true); });
    },
    getOrders: function (callback) {
        var self = this;
        this.callService("datamobile", { Id: "transporterorders", IdTransporter: this._settings.transporterId }, function (orders) {
            Service.orders = orders;
            if (Service.orders && Service.orders.Items)
                $.each(Service.orders.Items, function () {
                    self.setOrderDescription(this);
                });
            if (callback)
                callback(orders);
        });
    },

    getMessages: function (callback) {
        var self = this;
        this.callService("datamobile", { Id: "transportermessages", IdUser: this._settings.userId }, function (messages) {
            Service.messages = messages;
            if (callback)
                callback(messages);
        });
    },

    getMessagesToOrder: function (GUID_TransporterOrder, callback) {
        var self = this;
        this.callService("datamobile", { Id: "transporterordermessages", GUID_TransporterOrder: GUID_TransporterOrder }, function (messages) {
            if (callback)
                callback(messages);
        });
    },

    setOrderDescription: function (order) {
        if (!order.GUID)
            order.Status = "";
        switch (order.Status) {
            case "New": order.StatusTranslation = "Poslaná"; break;
            case "Offered": order.StatusTranslation = "Ponúknutá"; break;
            case "Reserved": order.StatusTranslation = "Rezervovaná"; break;
            case "Waiting": order.StatusTranslation = "Pristavené"; break;
            case "Cancel": order.StatusTranslation = "Zrušená"; break;
            case "Processing": order.StatusTranslation = "Transport"; break;
            default: order.StatusTranslation = "Vybavená"; break;
        }
        //order.FormatedDate = Service.formatDate(order.OrderToDate);
    },
    getTransporterStatusText: function () {
        switch (Service.transporter.Status) {
            case "Offline": return "Mimo dosahu";
            case "Free": return "Voľný";
            case "Busy": return "Obsadený";
            case "WithCustomer": return "So zákazníkom";
            case "Break": return "Prerušenie";
            default: return Service.transporter.Status;
        }
    },


    getHistoryOrders: function (viewName, callback) {
        this.callService("datamobile", { Id: viewName, IdTransporter: this._settings.transporterId , GUID_sysUser_Driver : this._settings.userId}, callback);
    },

    getListItems: function (viewName, callback) {
        this.callService("datamobile", { Id: viewName, GUID_sysCompany: this._settings.GUID_sysCompany }, callback);
    },
    //getHistoryOrdersMe: function (callback) {
    //    this.callService("datamobile", { Id: "orders_lastforDriverMe", IdTransporter: this._settings.transporterId }, callback);
    //},

    getTransporters: function (callback) {
        var self = this;
        this.callService("datamobile", { Id: "transporterssimple" }, function (d) {
            if (d.Items) {
                $.each(d.Items, function () {
                    if (this.Id == self._settings.transporterId)
                        this.selected = true;
                });
                if (callback)
                    callback(d);
            }
            else
            {
                Service.connectionError = "Zoznam vozidiel je nedostupný";
                callback(d);
            }
        }, function () { callback([]) });
    },
    unBreak : function () {
        app.waiting();
        var s = Service.getSettings();

        if (Globals.BreakStarttimerHandler)
            clearInterval(Globals.BreakStarttimerHandler);

        Service.callService("TransporterUnBreak", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {

                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },

    alarmConfirm: function () {
        var scriptText = "onclick = \"Service.alarm()\"";
        var content = Translator.Translate("Spustiť alarm?") +"<br/><button id=\"btnsetAlarm\" " + scriptText + "  style=\"background-color:black;\" class=\"textnoicon\">" + Translator.Translate("Spustiť") + "</button>";
        app.showNewsComplete(Translator.Translate("Alarm"), null, "", 10000, content);
        return;
    },

    orderBack: function () {
        app.hideNews();
        app.waiting();
        var s = Service.getSettings();
        Service.callService("TransporterOrderGiveBack", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            GUID_TransporterOrder: Service.orders.Current.GUID,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },

    alarm: function () {
        app.hideNews();
        app.waiting();
        var s = Service.getSettings();
        Service.callService("TransporterAlarm", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },
    recallme: function () {
        app.waiting();
        var s = Service.getSettings();
        var cls = "ico_hangup";
        var clsrem = "ico_phone";
        var met = "TransporterRecall";
        if (Globals.GLOB_RecallMe) {
            met = "TransporterUnRecall";
            cls = "ico_phone";
            clsrem = "ico_hangup";
        }
        app.log("recall calling: " + met);

        Service.callService(met, {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                Globals.GLOB_RecallMe = !Globals.GLOB_RecallMe;

                //zmena buttonu 
                $("#btnRecallMe")
                        .removeClass(clsrem)
                        .addClass(cls);

                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },
    unAlarm: function () {
        app.waiting();
        var s = Service.getSettings();
        Service.callService("TransporterUnAlarm", {
            GUID_Transporter: s.transporterId,
            GUID_sysUser_Driver: s.userId,
            Latitude: PositionService.lat,
            Longitude: PositionService.lng
        },
            function () {
                app.home(true);
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home(true);
            });
    },

    sendNewMessage: function (MessageType, MessageText, LifeTimeMinutes, isAnswer, needAnswer, SenderRole, ReceiverRole, GUID_sysUser_Sender, GUID_sysUser_Receiver, Latitude, Longitude, successDelegate, errorDelegate) {
        app.waiting();
        Service.callService("SendMessage", {
            MessageType: MessageType,
            MessageText: MessageText,
            LifeTimeMinutes: LifeTimeMinutes,
            isAnswer: isAnswer,
            needAnswer: needAnswer,
            SenderRole:SenderRole,
            ReceiverRole: ReceiverRole,
            GUID_sysUser_Sender: GUID_sysUser_Sender,
            GUID_sysUser_Receiver:GUID_sysUser_Receiver,
            Latitude: Latitude,
            Longitude: Longitude,

        },
            function () {
                if (!successDelegate)
                    app.route("messages");
                else
                    successDelegate();
            },
            function (d) {
                app.info(d.ErrorMessage);
                if (!errorDelegate)
                    app.home(true);
                else
                    errorDelegate();
            });
    },

    deleteMessage: function (GUID) {
        app.waiting();
        console.log("delete 1 message: " + GUID);
        Service.callService("DeleteMessage", {
            GUID: GUID

        },
            function () {
                app.route("messages");
            },
            function (d) {
                app.info(d.ErrorMessage);
                app.home();
            });
    },

    recallOrder: function (callback) {
        app.waiting();
        var s = Service.getSettings();
        if (Service.orders && Service.orders.Current) {
            Service.callService( Service.orders.Current.RecallNeed ? "OrderUnRecall":"OrderRecall", {
                GUID_Transporter: s.transporterId,
                GUID_sysUser_Driver: s.userId,
                GUID_TransporterOrder: Service.orders.Current.GUID,
                Latitude: PositionService.lat,
                Longitude: PositionService.lng
            },
            function () {
                app.waiting(false);
                Service.orders.Current.RecallNeed = Service.orders.Current.RecallNeed ? false : true;
                
                if (callback)
                    callback();
            }
            );
        }
    },
    getDetail: function (entity, id, callback) {
        this.callService("itemmobile", { Id: entity + "_" + id }, callback, callback);
    },
    getSettings: function () {
        if (!Service._settings || !Service._settings.url) {
            app.log("Service.getSettings");
            var s = window.localStorage.getItem("settings");
            app.log("Service.getSettings : " + s);
            if(s)
                Service._settings = JSON.parse(s);
            else
                Service._settings = {};
        }
        return Service._settings;
    },
    saveSettings: function (data) {

        if (Service.isChanged(data))
            Service.isSendloginHistory = false;

        if(data)
            Service._settings = data;
        window.localStorage.setItem("settings", JSON.stringify(Service._settings));
    },
    callService: function (method, data, successDelegate, errorDelegate) {
        app.log("Service.callService: " + method);
        Service.connectionError = null;
        if (!this._settings.url) {
            Service.connectionError = "Chýba adresa servisu";
            if (errorDelegate)
                errorDelegate(d);
        }
        else {
            if (data) {
                data.UserTicket = this._settings.sessionId;
                data.IsTransporter = true;
                //data.GUID_sysUser_Driver = this._settings.userId;
            }
            $.post(this._settings.url + "/app/" + method, data)
                .done(function (d) {
                    if (d) {
                        app.log(method + ": OK");
                        if (d.Message) {
                            app.info(d.Message);
                        }

                        if (d.ErrorMessage) {
                            app.log("Service.callService - ErrorMessage: " + d.ErrorMessage);
                            Service.connectionError = d.ErrorMessage + " " + this.url;
                            if (errorDelegate)
                                errorDelegate(d);
                            else
                                app.showAlert(d.ErrorMessage + " " + this.url, "Chyba");
                        }
                        else if (d.RefreshDataId) {
                            if (d.oVer)
                                Service.ordersVer = d.oVer;
                            if (d.tVer)
                                Service.transporterVer = d.tVer;
                            app.refreshData(d.RefreshDataId, function () { if (successDelegate) successDelegate(d); });
                        }
                        else if(successDelegate)
                            successDelegate(d);
                    }
                    else if (successDelegate)
                       successDelegate();
                 })
                .fail(function () {
                    app.waiting(false);
                    app.log("Service.callService - " + Service.connectionError + ": " + this.url);
                    if (errorDelegate)
                        errorDelegate({ ErrorMessage: Service.connectionError });
                    else
                        app.showAlert(Service.connectionError + ": " + this.url, "Chyba");
                });
        }
    },
    parseJsonDate: function (jsonDate) {
        try{
            var offset = 0; // new Date().getTimezoneOffset() * 60000;
            var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);

            if (parts[2] == undefined)
                parts[2] = 0;

            if (parts[3] == undefined)
                parts[3] = 0;

            return new Date(+parts[1] + offset + parts[2] * 3600000 + parts[3] * 60000);
        }
        catch (err) {
            return undefined;
        }
    },
    formatJsonDate: function (jsonDate) {

      //  var date = new Date(parseInt(jsonDate.substr(6)));
       // var formattedDate = date.format("dd-MM-yyyy");

        var d = Service.parseJsonDate(jsonDate);
       // var t = jQuery.parseJSON(1386340220807);
      //  var tt = new Date(1386340220807);

        //return d.toLocaleDateString() + " <br/><strong>" + d.toLocaleTimeString().substring(0, 5) + "</strong>"; //
        if (d)
            return d.getDate() + ". " + (d.getMonth()+1) + ". " + d.getFullYear() + " " + d.toTimeString().substring(0, 5);
        return "";
    }
}