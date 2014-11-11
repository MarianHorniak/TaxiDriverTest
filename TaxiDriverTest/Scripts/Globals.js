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
        soundItems : {
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
            Orders_List_ShowCustomerPhone: false,
            OrderDetail_Defauls_timeToRealize: 5,
            g_RefreshOrderSeconds: 60,
            Stand_Distancekm: 0.200,
            Stand_OfferSec:180, //180
        },

        GetPhoneSetting: function () {
            var self = this;
            Globals.items = new Array();
            Service.getListItems("view_PhoneSettings", function (listitems) {
                $.each(listitems.Items, function () {
                    Globals.items.push(this);
                });
            });


        },

        //najde hodnotu setting value v zozname settingova
        GetSetItem: function (Title)
        {
            var ret = "";
            if (!Globals.items) return ret;
            for (var i = 0, iLen = Globals.items.length; i < iLen; i++) {

                if (Globals.items[i].Title == Title) return Globals.items[i].SettingValue;
            }

            return ret;
        }
    }




