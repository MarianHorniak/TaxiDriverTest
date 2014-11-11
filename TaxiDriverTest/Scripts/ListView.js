var ListView = function() {

    this.index = 1;
    this.initialize = function () {
        this.el = $('<div/>');
    };

    this.render = function () {
        this.el.html(ListView.template());
        var self = this;
        $("#listsBack").off(app.clickEvent, function () { app.home(); });
        $("#listsBack").on(app.clickEvent, function () { app.home(); });

        $("#selectList").off("change", function (e) { self.selectionChange(e); });
        $("#selectList").on("change", function (e) { self.selectionChange(e); });
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
        }

        app.waiting(false);

    }

    
    this.renderListItems = function (listitems)
    {
        var i = 1;
        $.each(listitems.Items, function () {
            this.isOddCSS = Tools.isOddCSS(i);
            this.iOrder = i++;
            
        });

        $('.lists-list').html(ListView.liTemplate(listitems.Items));
        if (self.iscroll)
            self.iscroll.refresh();
        else
            self.iscroll = new iScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: true });

        app.waiting(false);
        $('.lists-list').show();
        
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

