var Transporter = {




    ProcessCheckSum: function (newCheckSum) {

        //bez zmeny
        if (Service.transporterVer && newCheckSum && Service.transporterVer == newCheckSum)
            return;

        Service.transporterVer = newCheckSum;
        var resArray = newCheckSum.split(Globals.SplitString);
        

        //stanovista 
        if (resArray[4] && resArray[3]) {

            var iStand = parseInt(resArray[4]);
            if (Globals.GLOB_StandPosition != iStand && Globals.GLOB_GUID_Stand != resArray[3]) {

                Globals.GLOB_StandPosition = iStand;
                Globals.GLOB_GUID_Stand = resArray[3];

                //pozor, stanovistia vyhodnotiem, lebo server mohol zmenit !
                Stand.evaluateStand();

            }

        }
         


    },
}
