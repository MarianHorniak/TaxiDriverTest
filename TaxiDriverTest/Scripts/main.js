var app = {
    currentPage: null,
    currentPageName: null,
    isDevice: false,
    geolocation: null,
    userAgent:"",
    platform: "",
    clickEvent: "click",
    mediaNew : null,
    mediaAlert: null,
    inBackground: false,
    pages: {},
    showAlert: function (message, title) {

        var ierr = ErrorStorage.hasError(message);


        if (navigator.notification) {
            if (ierr == 0) {
                ErrorStorage.addError(message);
                navigator.notification.alert(message, alertDismissed(message), title, 'OK');
            }
        }
        else {
            
            if (ierr == 0) {
                ErrorStorage.addError(message);
                alert(title ? (title + ": " + message) : message);
                ErrorStorage.removeError(message);
            }
        }
    },
    alertDismissed: function(message) {
        ErrorStorage.removeError(message);
    },

    showNews: function (content) {
        var soundFile = MediaInternal.defaultNewsSoundfile; // "audio/sound_new.mp3";
        app.showNewsComplete(Translator.Translate("Warning"), soundFile, "", 10000, content)
    },

    showNewsComplete: function (title, soundFile, color, hideinmilisec, content) {
        if (!soundFile || soundFile == "") soundFile = MediaInternal.defaultNewsSoundfile; //"audio/sound_new.mp3";
        $("#taxiNewsContent").html(content);
        $("#taxiNewsTitle").html(title);
        $("#taxiNewFull").show(200);
        //app.playSound(soundFile);
        MediaInternal.playSoundInMedia(soundFile,1,1);
        window.setTimeout(function () { app.hideNews(); }, hideinmilisec);
    },

    hideNews: function () {
        $("#taxiNewFull").hide(100);
    },
    tabSelector: function (tabName, pageName) {
        var tabCtrl = document.getElementById(tabName);
        var pageToActivate = document.getElementById(pageName);
        for (var i = 0; i < tabCtrl.childNodes.length; i++) {
            var node = tabCtrl.childNodes[i];
            if (node.nodeType == 1) { /* Element */
                node.style.display = (node == pageToActivate) ? 'block' : 'none';
            }
        }
    },

    showNew: function (title, content, timeout, okCallback, cancelCallback) {

       
    },

    showConfirm: function (message, title, okCallback, cancelCallback) {
        if (navigator.notification) {
            var _callback = function (btn) {
                if (btn === 1) {
                    if (okCallback) okCallback();
                }
                else {
                    if (cancelCallback) cancelCallback();
                }
            }
            navigator.notification.confirm(message, _callback, title, 'OK,Cancel');
        } else {
            if (confirm(title ? (title + ": " + message) : message)) {
                if (okCallback) okCallback();
            }
            else {
                if (cancelCallback) cancelCallback();
            }
        }
    },
    playNew: function(){
        if (app.mediaNew) {
            if (app.mediaNew.setVolume)
                app.mediaNew.setVolume(Globals.Media_Volume);
            else
                app.mediaNew.volume = Globals.Media_Volume;

            app.mediaNew.play();
        }
    },
    playSound: function (soundFile) {
        window.setTimeout(function () {
            if (soundFile) {
                var toplay;
                if (app.isDevice)
                    toplay = new Media(soundFile);
                else
                    toplay = new Audio(soundFile);

                //toplay sound initialized ? 
                if (toplay) {

                    if (toplay.setVolume)
                        toplay.setVolume(Globals.Media_Volume);
                    else
                        toplay.volume = Globals.Media_Volume;
                    
                    toplay.play();
                }
            }
        }, 1);
    },

    info: function(t){
        $("#taxiInfo").html(t);
    },
    waiting: function (show) {
        if (show == false)
            $(".waitingDiv").empty().hide();
        else
            $(".waitingDiv").show();
    },
    log: function (t) {
        if ($(".waitingDiv").is(":visible"))
            $(".waitingDiv").html(t);
    },
    end: function (callback) {
        if (Service.isAuthenticated) {
            if (navigator.app) {
                app.showConfirm("Odhlásiť sa z vozidla?", "Ukončenie aplikácie", function () {
                    Service.logout(function () {
                        app.showConfirm("Ukončiť aplikáciu?", "Ukončenie aplikácie", function () {
                            app.log("app.exitApp");
                            navigator.app.exitApp();
                        }, callback);
                    });
                });
            }
            else {
                app.showConfirm("Odhlásiť sa z vozidla?", "Ukončenie aplikácie", function () {
                    Service.logout(function () {
                        app.showAlert("Boli ste odhlásení z vozidla");
                        callback();
                    });
                }, callback);
            }
        }
        else if (navigator.app) {
            app.showConfirm("Ukončiť aplikáciu?", "Ukončenie aplikácie", function () {
                app.log("app.exitApp");
                navigator.app.exitApp();
            }, callback);
        }
        else callback();
    },
    submenu: function()
    {
        var el = $('#divsubmenu');
        el.toggle(100);
        var elvis = $(el).is(":visible")
        if (elvis)
            window.setTimeout(function () {
                app.submenuHide();
            }, 5000);
    },

    submenuHide: function () {
        $('#divsubmenu').hide(100);
    },


    registerEvents: function () {
        app.log("app.registerEvents");
        var self = this;
        $('body').on('touchmove', function (event) { event.preventDefault(); });
        $('body').on(app.clickEvent, '[data-route]', function (event) { app.route($(this).attr("data-route")); });
        //$('body').on('app.clickEvent, '#newOrder', function (event) { Service.autoOrder(); });
        $('body').on(app.clickEvent, '#unbreakButton', function (event) { $("#unbreakButton").hide(); Service.unBreak(); });
        $('body').on(app.clickEvent, '#unbreakButton2', function (event) { $("#unbreakButton2").hide(); Service.unBreak(); });
        $('body').on(app.clickEvent, '#unalarmButton', function (event) { $("#unalarmButton").hide(); Service.unAlarm(); });
        $('body').on(app.clickEvent, '#taxiAlarm', function (event) { Service.alarmConfirm(); });
        $('body').on(app.clickEvent, '#btnRecallMe', function (event) { Service.recallme(); });
        $('body').on(app.clickEvent, '#btnSubmenu', function (event) { app.submenu(); });
        $('body').on(app.clickEvent, '#btnNewsClose', function (event) { app.hideNews(); });
                        
        $('#unbreakButton').hide();
        $('#unalarmButton').hide();

        try {
            document.addEventListener('pause', function () { app.info("Pause"); self.inBackground = true; }, false);
            //document.addEventListener('resume', function () { app.info("Resume"); self.inBackground = false; app.fullScreen(); }, false);

            //document.addEventListener("showkeyboard", function () { alert("Keyboard is ON"); app.fullScreen(); }, false);
            //document.addEventListener("hidekeyboard", function () { alert("Keyboard is OFF"); app.fullScreen(); }, false);

            document.addEventListener("offline", function () { app.info("Offline"); }, false);
            document.addEventListener("online", function () { app.info("Online"); }, false);
            document.addEventListener("unload", function () {
                app.info("Unload");
                cordova.require('cordova/plugin/powermanagement').release(
                            function () { app.info("powermanagement Release"); },
                            function () { app.info("powermanagement Error Release"); }
                    );
                LocalNotification.clearAll();
            }, false);
            document.addEventListener("menubutton", function () { e.preventDefault(); app.settings(); }, false);
            document.addEventListener("backbutton", function (e) {
                if (app.currentPageName != "orders") {
                    e.preventDefault();
                    app.home();
                }
            }, false);

        } catch (err) {
            app.log(err);
        }
        //app.fullScreen();
        try {
            LocalNotification.registerPermission();
            LocalNotification.hasPermission(function() {

                cordova.plugins.notification.local.setDefaults({
                    title: "Taxi driver",
                    //icon: app.getAndroidPath() + 'img/cabs.png',
                    //smallIcon: app.getAndroidPath() + 'img/cabs.png',
                    //smallIcon: 'res://cordova',
                    //sound: null, //ticha ...
                });

                cordova.plugins.notification.local.on("click", function (notification) {
                    window.setTimeout(
                        function () {
                            switch (notification.id) {
                                case "orders": app.route("orders"); break;
                                case "messages": app.route("messages"); break;
                                default: app.home(); break;
                            }
                        }, 100
                    );
                });
            });
        }
        catch (err) {
            app.log("Local Notification: " + err);
        }

        try {
            if (app.isDevice)
                self.mediaNew = new Media(app.getPhoneGapPath() + "audio/sound_order.mp3");
            else
                self.mediaNew = new Audio("audio/sound_order.mp3");
        }
        catch (err) {
            app.log("Media: " + err);
        }
    },
    fullScreen: function()
    {
        /*
            
        */
        //try {
        //    if (AndroidFullScreen) {
        //        // Extend your app underneath the status bar (Android 4.4+ only)
        //        //AndroidFullScreen.showUnderStatusBar();

        //        // Extend your app underneath the system UI (Android 4.4+ only)
        //        //AndroidFullScreen.showUnderSystemUI();

        //        // Hide system UI and keep it hidden (Android 4.4+ only)
        //        AndroidFullScreen.immersiveMode();
        //    }
        //}
        //catch (err) {
        //    app.log("AndroidFullScreen: " + err);
        //}

        //try {
        //    if (StatusBar) {
        //        StatusBar.hide();
        //    }
        //}
        //catch (err) {
        //    app.log("StatusBar: " + err);
        //}

    },
    home: function (refresh) {
        app.route("orders");
        if (refresh && app.currentPage && app.currentPage.loadData)
            app.currentPage.loadData();
    },
    settings: function () {
        if (this.currentPageName != "settings")
            this.route("settings");
    },
    route: function (p) {
        app.log("app.route: " + p);
        if (!Service.isComplet() && p != "settings")
            p = "settings";
        var self = this;
        var page = this.pages[p];
        if (!page) {
            switch (p) {
                case "orders": page = new OrdersView(); this.homePage = page; break;
                case "messages": page = new MessageView(); break;
                case "history": page = new OrdersHistoryView(); break;
                case "stand": page = new StandView(); break;
                case "historyme": page = new OrdersHistoryView(); break;
                case "states": page = new StatesView(); break;
                case "map": page = new MapView(); break;
                case "allsettings": page = new SettingsAllView(); break;
                case "settings": page = new SettingsView(); break;
                case "detail": page = new OrderDetail(); break;
                case "lists": page = new ListView(); break;
                case "autoorder": page = new AutoOrderView(); break;
                case "autoorderdisp": page = new AutoOrderToDispView(); break;
                case "messagenew": page = new MessageNewView(); break;
                default: this.showAlert("Undefined page:" + p, "ERROR"); return;
            }
            this.pages[p] = page;
            $('body').append(page.el);
            page.render();
            Globals.DisableMenus();
        }
        this.currentPageName = p;
        this.slidePage(page);
    },
    slidePage: function (page) {
        var currentPageDest, self = this;

        if (!this.currentPage) {
            this.currentPage = page;
            setTimeout(function () {
                if (page.onShow) 
                    page.onShow();
                else
                    app.waiting(false);
            });
            return;
        }

        if (this.currentPage === page)
            return;

        setTimeout(function () {
            $(self.currentPage.el).hide();
            $(page.el).show();
            if (page.onShow)
                page.onShow();
            else
                self.waiting(true);
            self.currentPage = page;
        });
    },
    refreshData: function (dataIds, callback) {
        var isCallback = false;
        if (dataIds) {
            $.each(dataIds, function () {
                if(this == "orders"){
                    if (app.currentPageName == "orders") {
                        app.currentPage.loadData();
                    }
                }
                else if (this == "transporters") {
                    isCallback = true;
                    app.refreshTransporter(callback);
                }
            });
        }
        if (!isCallback && callback)
            callback();
    },
    refreshTransporter: function (callback)
    {
        var settings = Service.getSettings();
        if (settings.transporterId) {
            app.log("app.refreshTransporter");
            Service.getDetail("Transporter", settings.transporterId, function (d) {
                Service.transporter = d;
                app.setHeader();
                if (callback) callback(d);
            });
        }
    },
    setHeader: function(){
        var settings = Service.getSettings();
        $("#taxiHeader")
                   .removeClass()
                   .addClass(Service.transporter.Status);

        if (Service.transporter.Status == "Break")
            app.setStatusBarInfo("Break", "A")
        else
            app.setStatusBarInfo("None", "A")

        //$("#taxiText")
        //    .empty()
        //    .html(settings.name + " " + Service.transporter.SPZ + " [" + Service.getTransporterStatusText()+"]");

        $("#taxiText")
            .empty()
            .html(settings.name + " " + Service.transporter.SPZ);
    },

    setStatusBar: function (info,offer, messages, park) {
        //$("#taxiStatusInfo").html(status);
        //$("#taxiStatusOffers").html(offer);
        //$("#taxiStatusMessages").html(messages);
        //$("#taxiStatusPark").html(park);
        $("#taxiStatus").html(status+' '+offer+' '+messages+' '+park);
    },
    setStatusBarInfo: function (infoClass, infoText) {

        if ((!infoClass || infoClass == "None") && $("#taxiStatusInfo").text() != infoText)
            return;

        $("#taxiStatusInfo").removeClass();
        if(infoClass)
            $("#taxiStatusInfo").addClass(infoClass);

        if (infoText)
            $("#taxiStatusInfo").text(infoText);
        else
            $("#taxiStatusInfo").text("I");
    },

    setStatusBarOffer: function (offerClass) {
        $("#taxiStatusOffers").removeClass();
        $("#taxiStatusOffers").addClass(offerClass);
    },

    setStatusBarOfferReservation: function (offerClass) {
        $("#taxiStatusOffersReservation").removeClass();
        $("#taxiStatusOffersReservation").addClass(offerClass);
    },

    setStatusBarNewMessage: function () {
        $("#taxiStatusMessages").removeClass("None");
        $("#taxiStatusMessages").addClass("New");
        //$("#taxiStatusMessages").addClass("icon");
        //$("#taxiStatusMessages").addClass("message");



    },

    setStatusBarNoneMessage: function () {
        $("#taxiStatusMessages").removeClass("New");
        $("#taxiStatusMessages").addClass("None");

    },


    setStatusBarNonePark: function (parkClass) {
        $("#taxiStatusPark").removeClass("New");
        $("#taxiStatusPark").addClass("None");
    },

    setStatusBarNewPark: function (parkClass) {
        $("#taxiStatusPark").removeClass("None");
        $("#taxiStatusPark").addClass("New");
    },


    getPhoneGapPath: function () {
        if (app.isDevice) {
            var path = window.location.pathname;
            path = path.substr(path, path.length - 10);
            return 'file://' + path;
        }
        else return "";
    },

    getAndroidPath: function () {
        if (app.isDevice) {
            var path = window.location.href.substring(0, window.location.href.lastIndexOf('/')) + "/";
            return path;
        }
        else return "";
    },

    initialize: function () {
        app.log("app.initialize");
        
        var self = this;
        this.pages = {};

        if (!app.geolocation) {
            app.geolocation = navigator.geolocation; // cordova geolocation plugin
        }

        this.registerEvents();

        Service.initialize(function () {
            self.home();
        });
    },
    radio: function (el, input) {
        var v = input.val();
        $.each(el.children('[data_value]'), function () {
            var $this = $(this);
            if ($this.attr('data_value') === v)
                $this.addClass("selected");
            else
                $this.removeClass("selected");
            $this.off(app.clickEvent);
            $this.on(app.clickEvent, function () {
                $this.siblings().removeClass("selected");
                $this.addClass("selected");
                input.val($this.attr("data_value"));
            });
        });
    }
};

function onLoad() {
    app.log("onLoad");
    app.geolocation = false;

    if (navigator.geolocation) {
        app.geolocation = navigator.geolocation;
    }

    app.userAgent = navigator.userAgent;
    app.isDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
    app.platform = navigator.platform;

    app.log("app.isDevice: " + app.isDevice);

    if (app.isDevice) {
        app.clickEvent = "tap";
        document.addEventListener("deviceready", function () { app.log("event: deviceready"); app.initialize(); }, false);
        app.log("document.addEventListener(deviceready)");
    } else {
        app.clickEvent = "click";
        app.initialize();
    }
}

function showMenu() {
    document.getElementById("submenu").style.display = "block";
}
function hideMenu() {
    document.getElementById("submenu").style.display = "none";
}

$.event.special.tap = {
    // Abort tap if touch moves further than 10 pixels in any direction
    distanceThreshold: 10,
    // Abort tap if touch lasts longer than half a second
    timeThreshold: 500,
    setup: function () {
        var self = this,
          $self = $(self);

        // Bind touch start
        $self.on('touchstart', function (startEvent) {
            // Save the target element of the start event
            var target = startEvent.target,
              touchStart = startEvent.originalEvent.touches[0],
              startX = touchStart.pageX,
              startY = touchStart.pageY,
              threshold = $.event.special.tap.distanceThreshold,
              timeout;

            function removeTapHandler() {
                clearTimeout(timeout);
                $self.off('touchmove', moveHandler).off('touchend', tapHandler);
            };

            function tapHandler(endEvent) {
                removeTapHandler();

                // When the touch end event fires, check if the target of the
                // touch end is the same as the target of the start, and if
                // so, fire a click.
                if (target == endEvent.target) {
                    $.event.simulate('tap', self, endEvent);
                }
            };

            // Remove tap and move handlers if the touch moves too far
            function moveHandler(moveEvent) {
                var touchMove = moveEvent.originalEvent.touches[0],
                  moveX = touchMove.pageX,
                  moveY = touchMove.pageY;

                if (Math.abs(moveX - startX) > threshold ||
                    Math.abs(moveY - startY) > threshold) {
                    removeTapHandler();
                }
            };

            // Remove the tap and move handlers if the timeout expires
            timeout = setTimeout(removeTapHandler, $.event.special.tap.timeThreshold);

            // When a touch starts, bind a touch end and touch move handler
            $self.on('touchmove', moveHandler).on('touchend', tapHandler);
        });
    }
};


