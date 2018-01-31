var Tools =
    {


        //je to parne ? 
        isOdd: function (n) {

            return Tools.isNumber(n) && (Math.abs(n) % 2 == 1);
        },

        isOddCSS: function (n) {

            var ret = "even";
            var iso = Tools.isNumber(n) && (Math.abs(n) % 2 == 1);
            if (iso == 1) ret = "odd";
            return ret;
        },

        //je cialo ? 
        isNumber: function (n) {

            return n == parseFloat(n);
        },

        //prejdeme objednavky a zmniem cas countdown v minutach
        refreshOrderMinutecntd : function(replaceLabels)
        {
            //od poslenej ponuky neubehlo este dost casu ? 
            var differenceSec = (Date.now() - Service.ordersMinuteRefresh) / 1000;
            if (differenceSec < Globals.constants.ordersMinuteRefreshInterval) return;

            if(!Service.orders) return;

            //prejdeme objednavky a nastavime casy
            

            $.each(Service.orders.Items, function () {

                this.ShowMinuteRest = false;

                this.MinuteRest = Tools.minuteDiffOrder(this);
                this.MinuteRestGui = "";

                if (this.MinuteRest < 180 && this.MinuteRest > -180) {
                    this.MinuteRestGui = this.MinuteRest.toString() + " min";
                    this.ShowMinuteRest = true;
                };

                if (replaceLabels)
                {
                    var sID = "#mes_" + this.GUID;
                    var el = $(sID);
                    if (el) el.text(this.MinuteRestGui);


                }


            }
            );

            Service.ordersMinuteRefresh = Date.now();
        },

        //rozdiel v minutach od aktualneho datumu
        minuteDiff: function (dateRelated) {

            var d = Service.parseJsonDate(dateRelated);
            var diff = (new Date() - d);
            //console.log(diff);
            var minutes = Math.round(diff / 60000 );

            return minutes;
        },


        getOrderSourceIcon: function(orderSource)
        {
            var ic = "";
            if (!orderSource) return ic;
            if (orderSource == "") return ic;
            if (orderSource == "Phone") ic = "☎";
            else if (orderSource == "Web") ic = "w";
            else if (orderSource == "Auto") ic = "￭";
            else if (orderSource == "AutoDisp") ic = "♦";
            else if (orderSource == "Web") ic = "w";
            else ic = "৹";
                    //case "Phone": = "☎";
                    //case "Web": = "w";
                    //case "Auto":= "￭";
                    //case "AutoDisp": = "♦";
                    //default:  "৹"; //"࿁";


            return ic;
        },

        //rozdiel v minutach od aktualneho datumu pre konkretnu objednavku. 
        minuteDiffOrder: function (order) {


            if (!order) return 0;

            var minutes = 0;
            var dateRelated = Service.parseJsonDate(order.Date);
            var diff = (new Date() - dateRelated);
            minutes = Math.round(diff / 60000);




            //ak je zadana diferencia soferom, tak sa pocita z nej !
            if (order.TimeToRealize && order.TimeToRealizeFrom) {
                dateRelated = Service.parseJsonDate(order.TimeToRealizeFrom);
                dateRelated = new Date(dateRelated.getTime() + order.TimeToRealize * 60000);
                diff = (new Date() - dateRelated);
                minutes = Math.round(diff / 60000);
            }

            //prehodnie znemienka  ? 
            minutes = -minutes;

            return minutes;
        },

        addSpace: function (origString, fulllength) {
            var newString = origString;
            if (origString && origString.length < fulllength) {
                for (var i = origString.length, l = fulllength; i < l; i++) {
                    newString = newString + " ";
                }
            }

            return newString;
        },

        sortSelect: function (selElem) {
            var tmpAry = new Array();
            for (var i = 0; i < selElem.options.length; i++) {
                tmpAry[i] = new Array();
                tmpAry[i][0] = selElem.options[i].text;
                tmpAry[i][1] = selElem.options[i].value;
            }
            tmpAry.sort();
            while (selElem.options.length > 0) {
                selElem.options[0] = null;
            }
            for (var i = 0; i < tmpAry.length; i++) {
                var op = new Option(tmpAry[i][0], tmpAry[i][1]);
                selElem.options[i] = op;
            }
            return;
        },
        placeCall: function (num) {
            if (!num)
                return;

            if (window.cordova && cordova.InAppBrowser) {
                cordova.InAppBrowser.open('tel:' + num.replace(/\s/g, ''), '_system');
            }
            //else
            //{
            //    app.info("Unsupported call");
            //}
        }
    }




