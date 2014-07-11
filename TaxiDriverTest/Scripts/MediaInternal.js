var MediaInternal =
    {
        getNewsSoundFile: function (NewsTitle) {

            var soundFile = "audio/sound_new.mp3";
            var test = "audio/" + Globals.language + "/" + NewsTitle + ".mp3";
            var res = $.ajax(test, { async: false });
            //var soundFile = "audio/sound_new.mp3";
            //var test = "audio/" + Globals.language + "/" + NewsTitle + ".mp3";
            //$.ajax({
            //    url: test,
            //    type: 'HEAD',
            //    error: function () {
            //        console.log("Sound not exist : " + NewsTitle);
            //        return soundFile;
            //    },
            //    success: function () {
            //        soundFile = test;
            //        return soundFile;
            //    }
            //});
            if (res.statusText == "OK") soundFile = test;
            return soundFile;
        },

        playSoundInMedia: function (soundFileAlias)
        {
            //no file ? 
            if (!soundFileAlias) {
                app.log("no file to play");
                return;
            }


            var realSoundFile = Globals.soundItems[soundFileAlias];

            //no file ? 
            if (!realSoundFile) {
                app.log("no real file to play : " + soundFileAlias);
                return;
            }

            window.setTimeout(function () {
                if (realSoundFile) {
                    var toplay;
                    if (app.isDevice)
                        toplay = new Media(app.getPhoneGapPath() + "audio/" + realSoundFile);
                    else
                        toplay = new Audio("audio/" + realSoundFile);

                    //toplay sound initialized ? 
                    if (toplay) {
                        toplay.volume = Globals.Media_Volume;
                        toplay.play();
                    }
                }
            }, 1);

        }
    }