var NotificationLocal =
    {
        //notifikacia pre eventy lokalne 
        Notify: function (notificationType, data, successCallback, errorCallback) {
            app.log("Notification:" + notificationType);

            try
            {

                switch (notificationType.toLowerCase())
                {
                    case "changeofferdown":
                        break;

                    case "changeofferup":
                        Stand.LeaveStand();
                        break;

                    case "changeoffer":
                        break;

                    case "autoorder":
                        Stand.LeaveStand();
                        break;

                    case "orderchange":
                        Stand.LeaveStand();
                        break;

                    case "stateschange":
                        Stand.LeaveStand();
                        break;

                    case "logout":
                        Stand.LeaveStand();
                        break;

                    case "login":
                        Stand.LeaveStand();
                        break;

                }
                if(successCallback) successCallback();
            }
            catch (err) {
                app.log(err + "Notifikácia lokal error");
                if (errorCallback) errorCallback();
            }

        }

    }