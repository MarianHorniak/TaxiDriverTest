//https://github.com/katzer/cordova-plugin-local-notifications/blob/9a13f4e/README.md

var LocalNotification = {
    allowSedule: false,
    //id:
    //orders Objednavky
    //messages Spravy
    schedule: function (id, text) {
        if (!this.allowSedule)
            return;
        
        if (!app.inBackground)
            return;
        
        this.hasPermission(function () {
            try {
                window.plugin.notification.local.isScheduled(id, function (isScheduled) {
                    if (isScheduled)
                        cordova.plugins.notification.local.cancel(id);
                    cordova.plugins.notification.local.add({ id: id, text: text });
                    app.log("cordova.plugins.notification.local.add id:" + id + " text:" + text);
                });

                /*
                window.plugin.notification.local.add({
                    id:         String,  // A unique id of the notifiction
                    date:       Date,    // This expects a date object
                    message:    String,  // The message that is displayed
                    title:      String,  // The title of the message
                    repeat:     String,  // Either 'secondly', 'minutely', 'hourly', 'daily', 'weekly', 'monthly' or 'yearly'
                    badge:      Number,  // Displays number badge to notification
                    sound:      String,  // A sound to be played
                    json:       String,  // Data to be passed through the notification
                    autoCancel: Boolean, // Setting this flag and the notification is automatically canceled when the user clicks it
                    ongoing:    Boolean, // Prevent clearing of notification (Android only)
                });
                */

            } catch (err) {
                app.log("cordova.plugins.notification.local.isScheduled: " + err);
                return;
            }
        });
    },
    clear: function (id) {
        if (!this.allowSedule)
            return;

        cordova.plugins.notification.local.cancel(id);
    },
    clearAll: function () {
        if (!this.allowSedule)
            return;

        cordova.plugins.notification.local.cancelAll();
    },
    hasPermission: function (callback) {
        
        if (this.allowSedule) {
            if (callback)
                callback();
            return;
        }
        try {
            if (!cordova || !cordova.plugins || !cordova.plugins.notification) {
                this.allowSedule = false;
                return;
            }
        }
        catch (err) {
            this.allowSedule = false;
            app.log("LocalNotification.hasPermission: " + err);
            return;
        }

        cordova.plugins.notification.local.hasPermission(function (granted) {
            if (granted) {
                LocalNotification.allowSedule = true;
                app.log("LocalNotification.hasPermission: True");

                if (callback)
                    callback();
            }
            else {
                app.log("LocalNotification.hasPermission: False");
            }
        });
    },
    registerPermission: function (callback) {
        if (!cordova || !cordova.plugins || !cordova.plugins.notification) {
            LocalNotification.allowSedule = false;
            return;
        }

        cordova.plugins.notification.local.registerPermission(function (granted) {
            LocalNotification.allowSedule = granted;
            app.log(granted ? "Local Notification Granted" : "Local Notification Not Granted");
            if (callback)
                callback(granted);
        });
    }
}
