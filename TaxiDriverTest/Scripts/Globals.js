var Globals = 
    {
        items: [],
        initialize: function () {
            app.log("Globals initialize");
            Globals.GetPhoneSetting();
        },

        //prezvonenie
        GLOB_RecallMe: false,

        //pozicia na stanovisti 
        GLOB_GUID_Stand: "00000000-0000-0000-0000-000000000000",
        GLOB_StandPosition: 0,

        //array of local lists
        GLOB_LocalLists: new Array("Stand", "sysMessageTemplate"),

        //sounds
        soundItems: {
            "SetPayment": "SetPayment.mp3",
            "StandAvailable": "StandAvailable.mp3",
            "StandLeave": "StandLeave.mp3",
            "Order_Change":"sound_order.mp3",
            "Order_Broadcast":"sound_orderbroadcast2.mp3",
            "Message_New":"sound_message.mp3",
        },

        //last position
        Position_Lat: 0,
        Position_Lng: 0,

        Position_LatPrev: 0,
        Position_LngPrev: 0,

        language: "SK",
        RoleName: "TaxiDriver",

        //Messaging
        HasNewMessasges: false,
        MessageTimeToLiveMin: 30,
        MessageType: "Info",
        ReceiverRole : "TaxiDispatcher",

        //Media
        Media_Volume:0.5,

        //Me
        myGUID : "",
        myTicket : "",

        //LOG + tracer
        traceMessage : "",
        

        GUIDEmpty: "00000000-0000-0000-0000-000000000000",

        SplitString : "||",

        //CONSTANTS
        constants: {
            ShowOrderCustomerPhone: false,
            ShowOrderBack:false,
            ShowOrderEndAddress: true,
            UseVoiceSound: false,
            DisableOrderCancelOnReserved: false,
            OrderDetail_Defauls_timeToRealize: 5,
            g_RefreshOrderSeconds: 60,
            Stand_Distancekm: 0.200,
            Stand_OfferSec: 180, //180
            ordersMinuteRefreshInterval: 60,
        },

        GetPhoneSetting: function () {
            var self = this;
            Globals.items = new Array();
            Service.getListItems("view_PhoneSettings", function (listitems) {
                $.each(listitems.Items, function () {
                    Globals.items.push(this);
                });

                //disable casti menu ! 
                var DisabledMenus = Globals.GetSetItem("DisabledMenus");
                if (DisabledMenus)
                {
                    var resArray = DisabledMenus.split(Globals.SplitString);
                    if (resArray && resArray.length > 0)
                    {
                        for (var i = 0; i < resArray.length; i++) {
                            if (resArray[i]) {
                                try{
                                    var els = $("#" + resArray[i]);
                                    els.attr("disabled", "disabled");
                                    els.hide();
                                }
                                catch (err) { }
                            }
                        }
                    }
                }

                //este do premennych 
                var sVal = Globals.GetSetItem("ShowOrderCustomerPhone");
                if (sVal == "1") Globals.constants.ShowOrderCustomerPhone = true;

                sVal = Globals.GetSetItem("ShowOrderEndAddress");
                if (sVal == "0") Globals.constants.ShowOrderEndAddress = false;

                sVal = Globals.GetSetItem("UseVoiceSound");
                if (sVal == "1") Globals.constants.UseVoiceSound = true;

                sVal = Globals.GetSetItem("ShowOrderBack");
                if (sVal == "1") Globals.constants.ShowOrderBack = true

                sVal = Globals.GetSetItem("DisableOrderCancelOnReserved");
                if (sVal == "1") Globals.constants.DisableOrderCancelOnReserved = true


            });


        },


        HideHistory: function()
        {

            //disable casti menu ! 
            var DisabledMenus = Globals.GetSetItem("DisabledMenus");
            if (DisabledMenus) {
                var resArray = DisabledMenus.split(Globals.SplitString);
                if (resArray && resArray.length > 0) {
                    for (var i = 0; i < resArray.length; i++) {
                        if (resArray[i].indexOf('selectHistory') > -1) {
                            var r = "#" + resArray[i];
                            $(r).attr("disabled", "disabled");
                            $(r).hide();
                            $("#selectHistory option[id='"+resArray[i]+"']").remove();
                        }
                    }
                }

            }
        },

        //najde hodnotu setting value v zozname settingova
        GetSetItem: function (Title)
        {
            var ret = "";
            if (!Globals.items) return ret;
            for (var i = 0, iLen = Globals.items.length; i < iLen; i++) {

                if (Globals.items[i].Title == Title)
                    return Globals.items[i].SettingValue;
            }

            return ret;
        }
    }




