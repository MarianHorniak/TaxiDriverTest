var MediaInternal =
    {

        defaultNewsSoundfile:"audio/sound_new.mp3",

        //getNewsSoundFile: function (NewsTitle) {

        //    var soundFile = MediaInternal.defaultNewsSoundfile; // "audio/sound_new.mp3";
        //    var test = "audio/" + Globals.language + "/" + NewsTitle + ".mp3";
        //    var res = $.ajax(test, { async: false });
        //    if (res.statusText == "OK") soundFile = test;
        //    return soundFile;
        //},


        //getSoundFileFromAlias : function (soundFileAlias)
        //{
        //    var realSoundFile = Globals.soundItems[soundFileAlias];
        //    return realSoundFile;
        //},

        ///sounfilealias - alias suboru alebo priamo subor !
        playSoundInMedia: function (soundFile, isAlias, isLocalized)
        {


            //no file ? 
            if (!soundFile) {
                app.log("no file to play");
                return;
            }

            //default zvuk
            var realSoundFile = MediaInternal.defaultNewsSoundfile;

            //ak je to alias, tak ho prekodujeme
            if (isAlias && isAlias == 1)
            {
                realSoundFile = Globals.soundItems[soundFile];
            }
            if (isLocalized && isLocalized == 1) {
                realSoundFile = Globals.language + "/" + realSoundFile;
            }



            //no file ? 
            if (!realSoundFile) {
                app.log("no real file to play : " + soundFileAlias);
                return;
            }

            window.setTimeout(function () {
                if (realSoundFile) {
                    var toplay;
                    if (app.isDevice) {

                        var file = app.getPhoneGapPath() + "audio/" + realSoundFile;
                        toplay = new Media(file);

                    }
                    else {
                        toplay = new Audio("audio/" + realSoundFile);
                    }

                    //toplay sound initialized ? 
                    if (toplay) {

                        if (toplay.setVolume)
                            toplay.setVolume(Globals.Media_Volume);
                        else
                            toplay.volume = Globals.Media_Volume;

                        toplay.play();
                    }
                }
            }, 1);

        }
    }