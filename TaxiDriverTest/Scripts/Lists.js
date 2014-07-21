//Lists functions
var Lists = {
    cache: [],
    listInitialize: function () {
        app.log("Lists.initialize");
        for (var i = 0; i < Globals.GLOB_LocalLists.length; i++) {
            Lists.loadListFromServer(Globals.GLOB_LocalLists[i]);
            
        }
    },

    getListItems: function (listName) {
        var c = Lists.cache[listName];
        if (c)
            return c;
        else
            return { Items: {} }

        //var s = window.localStorage.getItem(listName);
        //if (s)
        //    c = JSON.parse(s);
        //else
        //    c = {};
        //return c;
    },

    loadListFromServer: function (listName) {
        var self = this;
        var s = Service.getSettings();
        Service.callService("datamobilelist", { Id: listName, GUID_Transporter: s.transporterId },
            function (data) {
                //storeList(listName, data);
                Lists.cache[listName] = data;
                console.log("startup loading list: " + listName+", items: "+data.Items.length);
            });
    }

    //storeList: function (listName, data) {
    //    window.localStorage.setItem(listName, JSON.stringify(data));
    //}
}
