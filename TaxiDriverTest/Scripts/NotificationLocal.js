var NotificationLocal =
    {
        //notifikacia pre eventy lokalne 
        Notify: function (notificationType, data, successCallback, errorCallback) {
            app.log("Notification:" + notificationType);

            try
            {

                switch (notificationType.toLowerCase())
                {

                    case "autoorder":
                        Stand.LeaveStand();
                        break;

                    case "orderchange":
                        Stand.LeaveStand();
                        break;

                    case "stateschange":
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