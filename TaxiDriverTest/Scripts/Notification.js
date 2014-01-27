Notification =
       {
           isInitialized: false,
           initialize: function () {
               if (!this.isInitialized) {
                   try {
                       Notification.hubLoad();
                   }
                   catch (err) {
                       this.isInitialized = false;
                       app.showAlert(err, "Notifikácia");
                   }
               }
           },
           hubLoad: function () {
               if (!this.isInitialized) {
                   this.isInitialized = true;
                   try {
                       var s = Service.getSettings();
                       $.connection.hub.url = s.url + "/signalr";
                       var h = $.connection.mobileHub, self = this;
                       h.client.notifi = function (data) {
                           if (data) {
                               if (data.Message) {
                                   app.showAlert(data.Message, "Notifikácia");
                               }
                               if (data.RefreshDataId) {
                                   app.refreshData(data.RefreshDataId);
                               }
                           }
                       };
                       //$.connection.hub.stateChanged(function (change) {
                       //    if (change.newState === $.signalR.connectionState.reconnecting) {
                       //        app.info("Notification is reconnecting!");
                       //    }
                       //    else if (change.newState === $.signalR.connectionState.connected) {
                       //        app.info("Notification is connected!");
                       //    }
                       //    else
                       //        app.info("Notification is " + change.newState);
                       //});
                       this.connect();
                   }
                   catch (err) {
                       this.isInitialized = false;
                       app.showAlert(err, "Notifikácia");
                   }
               }
           },
           connect: function(){
               $.connection.hub.start() //{jsonp: true}{ transport: ['webSockets', 'serverSentEvents', 'longPolling'] }
                           .done(function () {
                               self.isInitialized = true;
                           })
                           .fail(function (err) {
                               self.isInitialized = false;
                               app.showAlert(err, "Notifikácia");
                           });
           },
           reconnect: function () {
               $.connection.hub.stop();
               this.connect();
           }
       }