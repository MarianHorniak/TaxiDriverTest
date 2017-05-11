var ListView = function() {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(ListView.template());
        var self = this;
        $("#listsBack").off(app.clickEvent);
        $("#listsBack").on(app.clickEvent, function () { app.home(); });

        $("#selectList").off("change");
        $("#selectList").on("change", function (e) { self.selectionChange(e); });

        self.iscroll = new IScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });
        return this;
    };

    this.onShow = function () {
        this.loadData();
    };

    this.loadData = function () {
        $('.lists-list').hide();
        //app.waiting();
        var self = this;
        //select !          
        $("#selectList").val("noselect");
        //default view 
        //self.getListCommon("empty");
    };
        
    this.selectionChange = function (e)
    {
        var self = this;
        $('.lists-list').hide();
        
//        <option value="listRestrictedStreet">Zak. ulice</option>
//<option value="listRestrictedPolygons">Zak. polygóny</option>
//<option value="listNastBody">Nástupištia</option>

        app.waiting();

        var sel = $("#selectList").val();
        switch (sel)
        {
            case "noselect":
                
                break;
            case "empty":
                self.getListCommon("empty");
                break;
            case "listPlace":
                self.getListCommon("viewDriver_List_Place");
                break;
            case "listMessageTemplate":
                self.getListCommon("viewDriver_MessageTemplate");
                break;

            case "listRestrictedStreet":
                self.getListCommon("viewDriver_List_RestStreet");
                break;

            case "listRestrictedPolygons":
                self.getListCommon("viewDriver_List_RestPoly");
                break;

            case "listNastBody":
                self.getListCommon("viewDriver_List_StopPoint");
                break;

        }

        app.waiting(false);

    }

    
    this.renderListItems = function (listitems)
    {
        var i = 1;
        console.log(listitems);
        $.each(listitems.Items, function () {
            this.isOddCSS = Tools.isOddCSS(i);
            this.iOrder = i++;
            
        });

        $('.lists-list').html(ListView.liTemplate(listitems.Items));

        app.waiting(false);
        $('.lists-list').show();

        this.iscroll.refresh();
    }

    this.getListCommon = function (listName,e) {
        var self = this;

        if (listName == "empty")
            self.renderListItems(null);

        else {
            Service.getListItems(listName, function (listitems) {
                self.renderListItems(listitems);
            });
        }

    }

    this.initialize();
}

ListView.template = Handlebars.compile($("#lists-tpl").html());
ListView.liTemplate = Handlebars.compile($("#lists-li-tpl").html());

