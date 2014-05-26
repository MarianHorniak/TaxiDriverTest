var Globals = 
    {


       

        //prezvonenie
        GLOB_RecallMe: false,

        //pozicia na stanovisti 
        GLOB_GUID_Stand: "",
        GLOB_StandPosition: 0,

        //array of local lists
        GLOB_LocalLists: new Array("Stand", "sysMessageTemplate"),

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
        

        //CONSTANTS
        constants: {
            Orders_List_ShowCustomerPhone: false,
            OrderDetail_Defauls_timeToRealize: 5,
            g_RefreshOrderSeconds: 60,
            Stand_Distancekm: 0.200,
            Stand_OfferSec:180, //180
        },
    }




