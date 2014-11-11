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


    }




