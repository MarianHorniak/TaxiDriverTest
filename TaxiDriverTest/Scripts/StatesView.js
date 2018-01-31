var StatesView = function (store) {
    this.index = 2;
    
    this.initialize = function() {
        this.el = $('<div/>');
    };

    this.render = function () {
        var self = this;
        this.el.html(StatesView.template());
        $("#statesSave").click(function () { self.save(); });

        self.iscroll = new IScroll($('.scrollBottom', self.el)[0], { hScrollbar: false, vScrollbar: false });

        return this;
    };

    this.onShow = function () {
        this.showForm({});
    };

    this.showForm = function (data) {
        var self = this;
        

        $('#unbreakButton2').hide();
        $('#resttime').hide();
        $("#statesForm").hide();

        app.waiting(false);

        if (!Globals.constants.DisableMenuOnBreak && Service.transporter.Status == "Break") {
            $('#unbreakButton2').show();
            $('#resttime').show();

            //timer na zobrazenie zostavajuceho casu
            if (Globals.BreakStarttimerHandler)
                clearInterval(Globals.BreakStarttimerHandler);
            Globals.BreakStarttimerHandler = setInterval(this.TimerRest, 50000);
            this.TimerRest();

            $('#statesSave').hide();
            app.waiting(false);
        }
        else {

            $("#statesForm").html(StatesView.formTemplate(data));

            if (data.TimeToFree)
                $("#TimeToFree").val(data.TimeToFree);
            if (data.HistoryAction)
                $("#HistoryAction").val(data.HistoryAction);

            $("#statesForm").show();
            $('#statesSave').show();

            self.iscroll.refresh();
            
            $("#HistoryAction").focus();
        }
    };
            
    this.save = function () {
        
        var f = $("#statesForm");
        f.hide();
        app.waiting();
        var self = this, d = f.serializeArray(), data = {};
        //serializeObject
        $.each(d, function (i, v) { data[v.name] = v.value; });
        data["GUID_Transporter"] = Service.transporter.GUID;
        data["Latitude"] = PositionService.lat;
        data["Longitude"] = PositionService.lng;
        Service.callService("TransporterBreak", data,
            function () {
                //notify
                NotificationLocal.Notify("stateschange", data, null, null);
                var d = new Date();
                d.setMinutes(d.getMinutes() + parseInt(data.TimeToFree));
                Globals.BreakStartDate = d;
                
                app.home();
            },
            function (d) {
                data.ErrorMessage = d.ErrorMessage;
                self.showForm(data);
                app.waiting(false);
            });
    };
    this.clear = function () {
        
    };

    this.initialize();

    this.TimerRest = function () {
        if (!Globals.BreakStartDate) {
            $('#resttime').hide();
            return;
        }
        $('#resttime').show();
        var diff = (new Date() - Globals.BreakStartDate);
        var minutes = Math.round(diff / 60000);
        minutes = -minutes;
        $('#resttime').text( Translator.Translate("Do konca")+": " + minutes+" min.");
        console.log("TimerRest tick");
    };
}

StatesView.template = Handlebars.compile($("#states-tpl").html());
StatesView.formTemplate = Handlebars.compile($("#statesForm-template").html());